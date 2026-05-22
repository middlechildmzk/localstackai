import datetime as dt
import hashlib
import logging
import re
import uuid
from dataclasses import dataclass
from typing import Any, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.importers import import_text_to_record
from app.services.resume_parser import ResumeParser
from app.tasks.worker import orchestrate_ingestion_pipeline

logger = logging.getLogger('sourcing.growth')


@dataclass
class CandidateUploadResult:
    upload_id: str
    queued: bool
    task_id: Optional[str]
    message: str


class CandidateGrowthService:
    def __init__(self, db: Session):
        self.db = db
        self.resume_parser = ResumeParser()

    @staticmethod
    def _hash_optional(value: Optional[str]) -> Optional[str]:
        if not value:
            return None
        return hashlib.sha256(value.strip().lower().encode('utf-8')).hexdigest()

    @staticmethod
    def _normalize_linkedin_url(url: str) -> str:
        cleaned = url.strip()
        if not cleaned:
            raise ValueError('LinkedIn URL cannot be blank.')
        if not re.match(r'^https://(www\.)?linkedin\.com/in/[A-Za-z0-9_%\-/.]+/?$', cleaned):
            raise ValueError('Only manually provided LinkedIn profile URLs in the format https://www.linkedin.com/in/... are accepted.')
        return cleaned.rstrip('/')

    def submit_candidate_upload(
        self,
        *,
        resume_text: str,
        full_name: Optional[str],
        email: Optional[str],
        linkedin_url: Optional[str],
        github_url: Optional[str],
        personal_site_url: Optional[str],
        location: Optional[str],
        desired_roles: list[str],
        consent_to_store: bool,
        consent_to_contact: bool,
        source_ip: Optional[str],
        user_agent: Optional[str],
        queue: bool = True,
    ) -> CandidateUploadResult:
        if not consent_to_store:
            raise ValueError('Consent to store is required before accepting candidate-uploaded resume/profile data.')
        if len(resume_text.strip()) < 50:
            raise ValueError('Resume/profile text is too short to process.')
        normalized_linkedin = self._normalize_linkedin_url(linkedin_url) if linkedin_url else None
        upload_id = str(uuid.uuid4())
        self.db.execute(
            text(
                '''
                INSERT INTO candidate_uploads (
                    id, full_name, email, linkedin_url, github_url, personal_site_url, location,
                    desired_roles, resume_text, consent_to_store, consent_to_contact,
                    source_ip_hash, user_agent_hash, status
                ) VALUES (
                    :id, :full_name, :email, :linkedin_url, :github_url, :personal_site_url, :location,
                    :desired_roles, :resume_text, :consent_to_store, :consent_to_contact,
                    :source_ip_hash, :user_agent_hash, 'received'
                )
                '''
            ),
            {
                'id': upload_id,
                'full_name': full_name,
                'email': email.strip().lower() if email else None,
                'linkedin_url': normalized_linkedin,
                'github_url': github_url,
                'personal_site_url': personal_site_url,
                'location': location,
                'desired_roles': desired_roles,
                'resume_text': resume_text,
                'consent_to_store': consent_to_store,
                'consent_to_contact': consent_to_contact,
                'source_ip_hash': self._hash_optional(source_ip),
                'user_agent_hash': self._hash_optional(user_agent),
            },
        )
        self.db.commit()

        task_id = None
        if queue:
            record = import_text_to_record(
                resume_text,
                source_name='candidate_upload',
                source_user_id=upload_id,
            )
            if full_name:
                record['full_name'] = full_name
            if email:
                record['primary_email'] = email.strip().lower()
            if location:
                record['location'] = location
            record.setdefault('raw_payload', {})['candidate_upload'] = {
                'upload_id': upload_id,
                'linkedin_url': normalized_linkedin,
                'github_url': github_url,
                'personal_site_url': personal_site_url,
                'desired_roles': desired_roles,
                'consent_to_contact': consent_to_contact,
            }
            task = orchestrate_ingestion_pipeline.delay(record)
            task_id = task.id
            self.db.execute(text("UPDATE candidate_uploads SET status = 'queued' WHERE id = :id"), {'id': upload_id})
            self.db.commit()
        return CandidateUploadResult(upload_id=upload_id, queued=bool(task_id), task_id=task_id, message='Candidate upload accepted and queued for normalization.' if task_id else 'Candidate upload accepted for review.')

    def attach_linked_profile(self, *, candidate_id: str, profile_type: str, profile_url: str, added_by: str = 'manual_or_candidate', consent_basis: str = 'manual_or_candidate_provided') -> dict[str, Any]:
        if profile_type.lower() == 'linkedin':
            profile_url = self._normalize_linkedin_url(profile_url)
        row_id = str(uuid.uuid4())
        self.db.execute(
            text(
                '''
                INSERT INTO candidate_linked_profiles(id, candidate_id, profile_type, profile_url, added_by, consent_basis)
                VALUES (:id, :candidate_id, :profile_type, :profile_url, :added_by, :consent_basis)
                ON CONFLICT (candidate_id, profile_type, profile_url) DO NOTHING
                '''
            ),
            {
                'id': row_id,
                'candidate_id': candidate_id,
                'profile_type': profile_type.lower(),
                'profile_url': profile_url,
                'added_by': added_by,
                'consent_basis': consent_basis,
            },
        )
        self.db.commit()
        return {'status': 'saved', 'candidate_id': candidate_id, 'profile_type': profile_type.lower(), 'profile_url': profile_url}

    def queue_refresh_due_candidates(self, *, max_jobs: int = 250, stale_days: int = 60) -> dict[str, Any]:
        rows = self.db.execute(
            text(
                '''
                SELECT c.id
                FROM candidates c
                WHERE c.deleted_at IS NULL
                  AND c.is_active = TRUE
                  AND c.updated_at < NOW() - (:stale_days || ' days')::INTERVAL
                  AND NOT EXISTS (
                    SELECT 1 FROM candidate_refresh_jobs j
                    WHERE j.candidate_id = c.id AND j.status IN ('queued', 'running')
                  )
                ORDER BY c.updated_at ASC
                LIMIT :max_jobs
                '''
            ),
            {'max_jobs': max_jobs, 'stale_days': stale_days},
        ).fetchall()
        job_ids: list[str] = []
        for row in rows:
            job_id = str(uuid.uuid4())
            self.db.execute(
                text(
                    '''
                    INSERT INTO candidate_refresh_jobs(id, candidate_id, reason, status, priority)
                    VALUES (:id, :candidate_id, 'stale_profile_refresh', 'queued', 5)
                    '''
                ),
                {'id': job_id, 'candidate_id': str(row[0])},
            )
            job_ids.append(job_id)
        self.db.commit()
        return {'status': 'queued', 'queued': len(job_ids), 'job_ids': job_ids}

    def create_outreach_draft(self, *, candidate_id: str, role_title: str, recruiter_name: str = '[Your name]') -> dict[str, Any]:
        candidate = self.db.execute(
            text(
                '''
                SELECT c.canonical_name, c.headline, c.current_role, c.current_company, c.primary_location,
                       COALESCE(array_agg(DISTINCT s.skill_name) FILTER (WHERE s.skill_name IS NOT NULL), '{}') AS skills
                FROM candidates c
                LEFT JOIN candidate_skills s ON s.candidate_id = c.id
                WHERE c.id = :candidate_id AND c.deleted_at IS NULL
                GROUP BY c.id
                '''
            ),
            {'candidate_id': candidate_id},
        ).mappings().first()
        if not candidate:
            raise ValueError('Candidate not found.')
        skills = list(candidate['skills'] or [])[:4]
        skill_text = ', '.join(skills) if skills else 'your technical background'
        subject = f'Possible {role_title} fit'
        first_name = candidate['canonical_name'].split()[0] if candidate['canonical_name'] else '[Name]'
        body = (
            f"Hi {first_name},\n\n"
            f"I came across your public/approved profile information and noticed experience around {skill_text}. "
            f"I am supporting a {role_title} role and thought it may be worth comparing against your interests.\n\n"
            "I do not want to assume fit from keywords alone. If you are open to it, I can send over the high-level details and you can tell me whether it is relevant.\n\n"
            "If any security-clearance language appears in your public profile, I treat that as an unverified breadcrumb only and would only discuss verification through the approved hiring process.\n\n"
            f"Best,\n{recruiter_name}\n\n"
            "---\nDraft only. Human review required before sending. Include opt-out language where required."
        )
        draft_id = str(uuid.uuid4())
        self.db.execute(
            text(
                '''
                INSERT INTO outreach_drafts(id, candidate_id, channel, subject, body, status)
                VALUES (:id, :candidate_id, 'email', :subject, :body, 'draft')
                '''
            ),
            {'id': draft_id, 'candidate_id': candidate_id, 'subject': subject, 'body': body},
        )
        self.db.commit()
        return {'status': 'draft_created', 'draft_id': draft_id, 'candidate_id': candidate_id, 'subject': subject, 'body': body, 'compliance_note': 'Draft only. Human review required. Do not auto-send.'}

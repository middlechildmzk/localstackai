import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field, HttpUrl
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db import get_db
from app.services.growth_services import CandidateGrowthService

logger = logging.getLogger('sourcing.growth_api')
router = APIRouter(prefix='/growth', tags=['Growth'])


class CandidateUploadRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    personal_site_url: Optional[str] = None
    location: Optional[str] = None
    desired_roles: list[str] = Field(default_factory=list)
    resume_text: str = Field(..., min_length=50, max_length=50000)
    consent_to_store: bool = Field(..., description='Required. Candidate or authorized user consents to storing this profile data.')
    consent_to_contact: bool = Field(False, description='Whether candidate opted into recruiting contact.')
    queue: bool = True


class LinkedProfileRequest(BaseModel):
    candidate_id: str
    profile_type: str = Field('linkedin', pattern='^(linkedin|github|portfolio|personal_site|orcid|other)$')
    profile_url: str
    added_by: str = 'manual_or_candidate'
    consent_basis: str = 'manual_or_candidate_provided'


class RefreshRequest(BaseModel):
    max_jobs: int = Field(250, ge=1, le=1000)
    stale_days: int = Field(60, ge=1, le=365)


class OutreachDraftRequest(BaseModel):
    candidate_id: str
    role_title: str = 'Senior Technical Role'
    recruiter_name: str = '[Your name]'


@router.post('/candidate-upload', status_code=status.HTTP_202_ACCEPTED)
async def candidate_upload(body: CandidateUploadRequest, request: Request, db: Session = Depends(get_db)) -> dict[str, Any]:
    service = CandidateGrowthService(db)
    try:
        result = service.submit_candidate_upload(
            resume_text=body.resume_text,
            full_name=body.full_name,
            email=str(body.email) if body.email else None,
            linkedin_url=body.linkedin_url,
            github_url=body.github_url,
            personal_site_url=body.personal_site_url,
            location=body.location,
            desired_roles=body.desired_roles,
            consent_to_store=body.consent_to_store,
            consent_to_contact=body.consent_to_contact,
            source_ip=request.client.host if request.client else None,
            user_agent=request.headers.get('user-agent'),
            queue=body.queue,
        )
        return result.__dict__
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error('Candidate upload failed: %s', exc, exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Candidate upload failed. Review server logs.')


@router.post('/linked-profile')
async def attach_linked_profile(body: LinkedProfileRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    service = CandidateGrowthService(db)
    try:
        return service.attach_linked_profile(
            candidate_id=body.candidate_id,
            profile_type=body.profile_type,
            profile_url=body.profile_url,
            added_by=body.added_by,
            consent_basis=body.consent_basis,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post('/refresh/due')
async def queue_due_refreshes(body: RefreshRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    service = CandidateGrowthService(db)
    return service.queue_refresh_due_candidates(max_jobs=body.max_jobs, stale_days=body.stale_days)


@router.get('/refresh/jobs')
async def list_refresh_jobs(size: int = 100, db: Session = Depends(get_db)) -> dict[str, Any]:
    rows = db.execute(
        text(
            '''
            SELECT j.id, j.candidate_id, c.canonical_name, j.reason, j.status, j.priority,
                   j.scheduled_for, j.created_at, j.error_message
            FROM candidate_refresh_jobs j
            JOIN candidates c ON c.id = j.candidate_id
            ORDER BY j.created_at DESC
            LIMIT :size
            '''
        ),
        {'size': min(max(size, 1), 250)},
    ).mappings().all()
    return {'count': len(rows), 'jobs': [dict(r) for r in rows]}


@router.post('/outreach/draft')
async def create_outreach_draft(body: OutreachDraftRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    service = CandidateGrowthService(db)
    try:
        return service.create_outreach_draft(candidate_id=body.candidate_id, role_title=body.role_title, recruiter_name=body.recruiter_name)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get('/outreach/drafts')
async def list_outreach_drafts(size: int = 100, db: Session = Depends(get_db)) -> dict[str, Any]:
    rows = db.execute(
        text(
            '''
            SELECT d.id, d.candidate_id, c.canonical_name, d.channel, d.subject, d.body,
                   d.status, d.compliance_note, d.created_at
            FROM outreach_drafts d
            JOIN candidates c ON c.id = d.candidate_id
            ORDER BY d.created_at DESC
            LIMIT :size
            '''
        ),
        {'size': min(max(size, 1), 250)},
    ).mappings().all()
    return {'count': len(rows), 'drafts': [dict(r) for r in rows]}


@router.get('/stats')
async def growth_stats(db: Session = Depends(get_db)) -> dict[str, Any]:
    row = db.execute(
        text(
            '''
            SELECT
              (SELECT COUNT(*) FROM candidates WHERE deleted_at IS NULL) AS candidates,
              (SELECT COUNT(*) FROM candidate_uploads) AS uploads,
              (SELECT COUNT(*) FROM candidate_refresh_jobs WHERE status = 'queued') AS queued_refreshes,
              (SELECT COUNT(*) FROM outreach_drafts WHERE status = 'draft') AS draft_outreach,
              (SELECT COUNT(*) FROM candidate_linked_profiles WHERE profile_type = 'linkedin') AS linkedins
            '''
        )
    ).mappings().first()
    return dict(row or {})

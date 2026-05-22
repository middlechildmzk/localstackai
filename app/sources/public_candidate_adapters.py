import asyncio
import hashlib
import logging
import urllib.parse
from dataclasses import dataclass, field
from typing import Any

import aiohttp

from ..services.resume_parser import ResumeParser
from ..source_contract import SourceIngestionRecord

logger = logging.getLogger('sourcing.public_candidate_adapters')

TARGET_SKILLS = ['kubernetes', 'terraform', 'aws', 'govcloud', 'ci/cd', 'devsecops', 'linux', 'docker']
DMV_TERMS = ['washington dc', 'district of columbia', 'dc metro', 'dmv', 'arlington', 'alexandria', 'reston', 'herndon', 'chantilly', 'mclean', 'fairfax', 'fort meade', 'annapolis junction', 'bethesda', 'rockville']


@dataclass
class EvidenceItem:
    result_class: str
    source_name: str
    source_record_id: str
    title: str
    url: str | None = None
    snippet: str | None = None
    matched_terms: list[str] = field(default_factory=list)
    raw_payload: dict[str, Any] = field(default_factory=dict)

    def to_signal(self) -> dict[str, str]:
        return {
            'signal_type': self.result_class,
            'signal_value': self.title,
            'signal_source': self.source_name,
        }


@dataclass
class CandidateSweepResult:
    candidate_records: list[dict[str, Any]] = field(default_factory=list)
    evidence_items: list[EvidenceItem] = field(default_factory=list)
    skipped_items: list[dict[str, Any]] = field(default_factory=list)


class SkillMatcher:
    def match(self, *texts: str | None) -> list[str]:
        lower = ' '.join(t or '' for t in texts).lower()
        return sorted({skill for skill in TARGET_SKILLS if skill in lower})

    def dmv_match(self, *texts: str | None) -> str | None:
        lower = ' '.join(t or '' for t in texts).lower()
        for term in DMV_TERMS:
            if term in lower:
                return term
        return None


class GitHubUserAdapter:
    """Person-first GitHub adapter.

    This adapter searches users, hydrates public user profiles, and attaches top
    repository evidence. Repositories remain evidence items and do not become
    candidate records without a hydrated user profile.
    """

    source_name = 'github'

    def __init__(self, token: str | None = None, timeout_seconds: int = 15) -> None:
        self.token = token
        self.timeout_seconds = timeout_seconds
        self.matcher = SkillMatcher()

    def _headers(self) -> dict[str, str]:
        headers = {'Accept': 'application/vnd.github+json', 'User-Agent': 'SourcingOS-SIW/1.0'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        return headers

    async def search_people(self, query: str, limit: int = 25) -> CandidateSweepResult:
        params = urllib.parse.urlencode({'q': query, 'per_page': min(limit, 100)})
        url = f'https://api.github.com/search/users?{params}'
        async with aiohttp.ClientSession(headers=self._headers(), timeout=aiohttp.ClientTimeout(total=self.timeout_seconds)) as session:
            try:
                async with session.get(url) as resp:
                    if resp.status != 200:
                        logger.warning('GitHub user search failed status=%s query=%s', resp.status, query)
                        return CandidateSweepResult(skipped_items=[{'source': self.source_name, 'reason': f'http_{resp.status}', 'query': query}])
                    payload = await resp.json()
            except Exception as exc:
                logger.warning('GitHub user search exception: %s', exc)
                return CandidateSweepResult(skipped_items=[{'source': self.source_name, 'reason': str(exc), 'query': query}])

            users = payload.get('items', [])[:limit]
            result = CandidateSweepResult()
            hydrated = await asyncio.gather(*(self._hydrate_user(session, u.get('login')) for u in users if u.get('login')), return_exceptions=True)
            for item in hydrated:
                if isinstance(item, Exception) or item is None:
                    continue
                record, evidence = item
                if record:
                    result.candidate_records.append(record.to_payload())
                result.evidence_items.extend(evidence)
            return result

    async def _hydrate_user(self, session: aiohttp.ClientSession, login: str) -> tuple[SourceIngestionRecord | None, list[EvidenceItem]] | None:
        async with session.get(f'https://api.github.com/users/{urllib.parse.quote(login)}') as resp:
            if resp.status != 200:
                return None
            user = await resp.json()
        repos = await self._fetch_repos(session, login)
        repo_text = ' '.join([f"{r.get('name','')} {r.get('description','')} {' '.join(r.get('topics') or [])}" for r in repos])
        skills = self.matcher.match(user.get('bio'), user.get('company'), repo_text)
        dmv = self.matcher.dmv_match(user.get('location'), user.get('bio'), user.get('company'))
        evidence_items = [
            EvidenceItem(
                result_class='repo_project',
                source_name='github',
                source_record_id=str(repo.get('id') or repo.get('full_name')),
                title=repo.get('full_name') or repo.get('name') or 'GitHub repo',
                url=repo.get('html_url'),
                snippet=repo.get('description'),
                matched_terms=self.matcher.match(repo.get('name'), repo.get('description'), ' '.join(repo.get('topics') or [])),
                raw_payload=repo,
            )
            for repo in repos[:10]
        ]
        confidence_signals = []
        if dmv:
            confidence_signals.append({'signal_type': 'geo_dmv_breadcrumb', 'signal_value': dmv, 'signal_source': 'github'})
        if skills:
            confidence_signals.append({'signal_type': 'matched_skill_count', 'signal_value': str(len(skills)), 'signal_source': 'github'})
        confidence_signals.extend([
            {'signal_type': 'github_public_repo_count', 'signal_value': str(user.get('public_repos') or 0), 'signal_source': 'github'},
            {'signal_type': 'github_followers', 'signal_value': str(user.get('followers') or 0), 'signal_source': 'github'},
        ])

        # Conservative candidate creation rule: person profile exists + skill or geo evidence.
        if not user.get('login') or (len(skills) < 2 and not dmv):
            return None, evidence_items

        record = SourceIngestionRecord(
            source_name='github',
            source_user_id=str(user.get('id') or user.get('login')),
            full_name=user.get('name') or user.get('login'),
            profile_url=user.get('html_url'),
            username_handle=user.get('login'),
            location=user.get('location') or dmv,
            headline=user.get('bio') or 'Public GitHub user profile',
            bio_summary=user.get('bio') or '',
            extracted_skills=skills,
            signals=confidence_signals + [e.to_signal() for e in evidence_items if e.matched_terms],
            raw_payload={'raw_user': user, 'repo_evidence': [e.raw_payload for e in evidence_items], 'candidate_creation_rule': 'person_profile_plus_skill_or_geo_evidence'},
        )
        return record, evidence_items

    async def _fetch_repos(self, session: aiohttp.ClientSession, login: str) -> list[dict[str, Any]]:
        params = urllib.parse.urlencode({'sort': 'updated', 'per_page': 20})
        url = f'https://api.github.com/users/{urllib.parse.quote(login)}/repos?{params}'
        try:
            async with session.get(url) as resp:
                if resp.status != 200:
                    return []
                repos = await resp.json()
                return repos if isinstance(repos, list) else []
        except Exception:
            return []


class PublicResumeTextAdapter:
    """Adapter for explicitly approved public resume/profile text or URLs.

    It parses provided text and returns normalized ingestion records. It does not
    discover or crawl arbitrary web pages by itself.
    """

    source_name = 'public_resume_text'

    def __init__(self) -> None:
        self.parser = ResumeParser()

    def from_text(self, text: str, source_url: str | None = None, source_record_id: str | None = None) -> SourceIngestionRecord:
        parsed = self.parser.parse(text, source_url=source_url)
        record_id = source_record_id or hashlib.sha256((source_url or text[:500]).encode('utf-8')).hexdigest()[:24]
        signals = [
            {'signal_type': 'resume_seniority', 'signal_value': parsed.seniority_label or 'unknown', 'signal_source': self.source_name},
            {'signal_type': 'resume_seniority_confidence', 'signal_value': str(parsed.seniority_confidence), 'signal_source': self.source_name},
            {'signal_type': 'clearance_breadcrumb_level', 'signal_value': parsed.clearance_breadcrumb_level, 'signal_source': self.source_name},
        ]
        if parsed.clearance_payload:
            signals.append({'signal_type': 'clearance_breadcrumb_payload', 'signal_value': str(parsed.clearance_payload), 'signal_source': self.source_name})
        return SourceIngestionRecord(
            source_name=self.source_name,
            source_user_id=record_id,
            full_name=parsed.name or 'Imported Public Resume/Profile',
            profile_url=parsed.profile_url,
            username_handle=None,
            location=parsed.location,
            headline=parsed.headline,
            bio_summary=parsed.raw_text_excerpt,
            extracted_skills=parsed.skills,
            signals=signals,
            raw_payload={'parsed_resume': parsed.to_dict(), 'source_url': source_url},
        )

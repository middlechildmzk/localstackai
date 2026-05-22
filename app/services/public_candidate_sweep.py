import asyncio
import logging
from dataclasses import asdict, dataclass, field
from typing import Any

from ..sources.public_candidate_adapters import CandidateSweepResult, GitHubUserAdapter, PublicResumeTextAdapter

logger = logging.getLogger('sourcing.public_candidate_sweep')


@dataclass
class SweepRequest:
    role: str
    location_cluster: list[str] = field(default_factory=list)
    skills: list[str] = field(default_factory=list)
    clearance_target: str | None = None
    max_per_source: int = 25
    include_github: bool = True
    include_resume_text_blocks: bool = False
    resume_text_blocks: list[str] = field(default_factory=list)


@dataclass
class SweepSummary:
    candidate_count: int
    evidence_count: int
    skipped_count: int
    sources_used: list[str]
    guardrail: str = 'Candidate leads require person-profile evidence. Clearance language is stored only as an unverified breadcrumb.'


class PublicCandidateSweepRunner:
    """Runs compliant public candidate sweeps.

    The runner is intentionally person-first. Repositories, documents, and company
    records remain evidence unless a hydrated person profile exists.
    """

    def __init__(self, github_token: str | None = None) -> None:
        self.github = GitHubUserAdapter(token=github_token) if github_token is not None else GitHubUserAdapter()
        self.resume_adapter = PublicResumeTextAdapter()

    async def run(self, request: SweepRequest) -> dict[str, Any]:
        results: list[CandidateSweepResult] = []
        sources_used: list[str] = []

        if request.include_github:
            queries = self._build_github_queries(request)
            sources_used.append('github')
            github_results = await asyncio.gather(
                *(self.github.search_people(query=q, limit=request.max_per_source) for q in queries),
                return_exceptions=True,
            )
            for item in github_results:
                if isinstance(item, Exception):
                    logger.warning('GitHub sweep query failed: %s', item)
                    continue
                results.append(item)

        if request.include_resume_text_blocks and request.resume_text_blocks:
            sources_used.append('public_resume_text')
            resume_result = CandidateSweepResult()
            for block in request.resume_text_blocks[: request.max_per_source]:
                try:
                    record = self.resume_adapter.from_text(block).to_payload()
                    # Resume records are person-like only if they expose skills or a location/name clue.
                    if record.get('full_name') and (record.get('extracted_skills') or record.get('location')):
                        resume_result.candidate_records.append(record)
                    else:
                        resume_result.skipped_items.append({'source': 'public_resume_text', 'reason': 'insufficient_person_context'})
                except Exception as exc:
                    resume_result.skipped_items.append({'source': 'public_resume_text', 'reason': str(exc)})
            results.append(resume_result)

        merged = self._merge_results(results)
        return {
            'summary': asdict(SweepSummary(
                candidate_count=len(merged['candidate_records']),
                evidence_count=len(merged['evidence_items']),
                skipped_count=len(merged['skipped_items']),
                sources_used=sources_used,
            )),
            **merged,
        }

    def _build_github_queries(self, request: SweepRequest) -> list[str]:
        role_terms = [request.role] if request.role else ['devops engineer']
        if 'devops' in request.role.lower():
            role_terms.extend(['sre', 'platform engineer', 'devsecops'])
        skill_terms = [s for s in request.skills if s][:5]
        geo_terms = request.location_cluster or []
        queries: list[str] = []

        # GitHub user search supports location and terms, but not reliable exact Boolean.
        for geo in geo_terms[:6] or ['United States']:
            base_terms = ' '.join(role_terms[:2] + skill_terms[:3])
            queries.append(f'{base_terms} location:"{geo}"')
        if skill_terms:
            queries.append(' '.join(skill_terms[:5] + ['devops']))
        return list(dict.fromkeys(q.strip() for q in queries if q.strip()))[:8]

    def _merge_results(self, results: list[CandidateSweepResult]) -> dict[str, Any]:
        seen_records: set[tuple[str, str]] = set()
        candidate_records: list[dict[str, Any]] = []
        evidence_items: list[dict[str, Any]] = []
        skipped_items: list[dict[str, Any]] = []

        for result in results:
            for record in result.candidate_records:
                key = (str(record.get('source_name')), str(record.get('source_user_id')))
                if key in seen_records:
                    continue
                seen_records.add(key)
                candidate_records.append(record)
            evidence_items.extend([asdict(item) for item in result.evidence_items])
            skipped_items.extend(result.skipped_items)

        return {
            'candidate_records': candidate_records,
            'evidence_items': evidence_items,
            'skipped_items': skipped_items,
        }


def default_dc_devops_request(max_per_source: int = 25) -> SweepRequest:
    return SweepRequest(
        role='Senior DevOps Engineer',
        location_cluster=['Washington DC', 'Arlington VA', 'Alexandria VA', 'Reston VA', 'Chantilly VA', 'Fort Meade MD', 'Annapolis Junction MD'],
        skills=['kubernetes', 'terraform', 'aws', 'govcloud', 'ci/cd', 'devsecops'],
        clearance_target='TS/SCI',
        max_per_source=max_per_source,
    )

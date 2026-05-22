import asyncio
import hashlib
import json
import logging
from typing import Any

from celery import Celery
from sqlalchemy.exc import IntegrityError, OperationalError

from ..config import settings

logger = logging.getLogger('sourcing.worker')

celery_app = Celery(
    'sourcing_intelligence',
    broker=settings.REDIS_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    enable_utc=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_track_started=True,
    result_expires=86400,
)


def _run_async(coro: Any) -> Any:
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


def _stable_payload_hash(payload: dict[str, Any]) -> str:
    return hashlib.sha256(json.dumps(payload, sort_keys=True, default=str).encode('utf-8')).hexdigest()


def _is_generic_source_record(payload: dict[str, Any]) -> bool:
    return bool(payload.get('source_name') and payload.get('source_user_id') and payload.get('full_name'))


def _profile_from_generic_record(payload: dict[str, Any]):
    from ..ingestion import NormalizedProfile

    return NormalizedProfile(
        source_name=str(payload['source_name']),
        source_user_id=str(payload['source_user_id']),
        full_name=str(payload['full_name']),
        location=payload.get('location'),
        profile_url=payload.get('profile_url'),
        username_handle=payload.get('username_handle'),
        bio_summary=payload.get('bio_summary') or payload.get('headline'),
        extracted_skills=[str(s).strip().lower() for s in payload.get('extracted_skills', []) if str(s).strip()],
        raw_payload=payload.get('raw_payload') if isinstance(payload.get('raw_payload'), dict) else payload,
    )


def _apply_source_handles(candidate: Any, profile: Any) -> None:
    handle = profile.username_handle
    if not handle:
        return
    mapping = {
        'github': 'github_handle',
        'gitlab': 'gitlab_handle',
        'kaggle': 'kaggle_handle',
        'codeforces': 'codeforces_handle',
        'mastodon': 'mastodon_handle',
        'devto': 'devto_handle',
        'orcid': 'orcid_id',
        'semanticscholar': 'scholar_id',
    }
    field = mapping.get(profile.source_name)
    if field and hasattr(candidate, field):
        setattr(candidate, field, handle)


def _write_optional_enrichment_tables(db: Any, models: Any, candidate_id: Any, payload: dict[str, Any], source_name: str) -> None:
    for signal in payload.get('signals', []) if isinstance(payload.get('signals'), list) else []:
        signal_type = str(signal.get('signal_type') or signal.get('type') or '').strip()
        signal_value = str(signal.get('signal_value') or signal.get('value') or '').strip()
        if signal_type and signal_value and hasattr(models, 'CandidateSignal'):
            db.add(models.CandidateSignal(candidate_id=candidate_id, signal_type=signal_type, signal_value=signal_value, signal_source=source_name))

    for pub in payload.get('publications', []) if isinstance(payload.get('publications'), list) else []:
        title = str(pub.get('title') or '').strip()
        if title and hasattr(models, 'CandidatePublication'):
            db.add(models.CandidatePublication(
                candidate_id=candidate_id,
                title=title,
                doi=pub.get('doi'),
                publication_year=pub.get('publication_year'),
                citation_count=pub.get('citation_count') or 0,
                source_name=pub.get('source_name') or source_name,
                source_url=pub.get('source_url'),
                co_authors=pub.get('co_authors') or [],
                topics=pub.get('topics') or [],
            ))


@celery_app.task(
    bind=True,
    name='sourcing.tasks.orchestrate_ingestion_pipeline',
    max_retries=3,
    default_retry_delay=60,
    queue='ingestion',
)
def orchestrate_ingestion_pipeline(self, raw_payload_dict: dict[str, Any]) -> str:  # type: ignore[no-untyped-def]
    task_id = self.request.id or 'local'
    source_user_id = str(raw_payload_dict.get('source_user_id') or raw_payload_dict.get('login') or raw_payload_dict.get('id') or 'unknown')
    logger.info('[%s] Ingestion pipeline starting for source_user_id=%s', task_id, source_user_id)

    from .. import models
    from ..db import SessionFactory
    from ..identity import TieredDeduplicationEngine
    from ..ingestion import GitHubSourceNormalizer, LocalInferenceEnricher
    from ..search import indexer

    db = SessionFactory()
    try:
        if _is_generic_source_record(raw_payload_dict):
            profile = _profile_from_generic_record(raw_payload_dict)
        else:
            enricher = LocalInferenceEnricher(ollama_endpoint=settings.OLLAMA_ENDPOINT)
            profile = _run_async(GitHubSourceNormalizer.process_transform(raw_payload_dict, enricher))

        payload_hash = _stable_payload_hash(raw_payload_dict)
        existing_source = (
            db.query(models.CandidateSource)
            .filter(
                models.CandidateSource.source_name == profile.source_name,
                models.CandidateSource.source_user_id == profile.source_user_id,
            )
            .first()
        )

        if existing_source:
            if existing_source.payload_hash == payload_hash:
                logger.info('[%s] Unchanged payload, skipping source_user_id=%s', task_id, source_user_id)
                return f'skipped:unchanged:{source_user_id}'
            existing_source.raw_payload = raw_payload_dict
            existing_source.payload_hash = payload_hash
            existing_source.profile_url = str(profile.profile_url) if profile.profile_url else existing_source.profile_url
            existing_source.username_handle = profile.username_handle or existing_source.username_handle
            candidate_id = existing_source.candidate_id
            candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
            if candidate:
                candidate.canonical_name = profile.full_name or candidate.canonical_name
                candidate.primary_location = profile.location or candidate.primary_location
                candidate.summary_bio = profile.bio_summary or candidate.summary_bio
                candidate.headline = profile.bio_summary[:250] if profile.bio_summary else candidate.headline
                _apply_source_handles(candidate, profile)
        else:
            candidate = models.Candidate(
                canonical_name=profile.full_name,
                primary_location=profile.location,
                summary_bio=profile.bio_summary,
                headline=profile.bio_summary[:250] if profile.bio_summary else None,
            )
            _apply_source_handles(candidate, profile)
            db.add(candidate)
            db.flush()
            db.add(models.CandidateSource(
                candidate_id=candidate.id,
                source_name=profile.source_name,
                source_user_id=profile.source_user_id,
                profile_url=str(profile.profile_url) if profile.profile_url else None,
                username_handle=profile.username_handle,
                raw_payload=raw_payload_dict,
                payload_hash=payload_hash,
            ))
            candidate_id = candidate.id

        for raw_skill in profile.extracted_skills:
            skill_tag = raw_skill.strip().lower()
            if not skill_tag:
                continue
            exists = (
                db.query(models.CandidateSkill)
                .filter(
                    models.CandidateSkill.candidate_id == candidate_id,
                    models.CandidateSkill.skill_name == skill_tag,
                    models.CandidateSkill.source_name == profile.source_name,
                )
                .first()
            )
            if not exists:
                db.add(models.CandidateSkill(candidate_id=candidate_id, skill_name=skill_tag, source_name=profile.source_name, confidence_score=0.85, extracted_by='source_record' if _is_generic_source_record(raw_payload_dict) else 'llm_inference'))

        _write_optional_enrichment_tables(db, models, candidate_id, raw_payload_dict, profile.source_name)
        db.commit()

        candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
        resolved_id = candidate_id
        if candidate:
            dedup = TieredDeduplicationEngine()
            best_match = dedup.find_best_existing_match(db, candidate, threshold=settings.IDENTITY_MATCH_THRESHOLD)
            if best_match:
                dedup.resolve_and_merge_profiles(db, str(best_match.id), str(candidate_id))
                resolved_id = best_match.id

        indexer.index_candidate_profile(db, str(resolved_id))
        logger.info('[%s] Pipeline complete. Canonical candidate=%s', task_id, resolved_id)
        return f'success:{resolved_id}'
    except (IntegrityError, OperationalError) as exc:
        db.rollback()
        logger.error('[%s] Database failure: %s', task_id, exc, exc_info=True)
        raise self.retry(exc=exc)
    except Exception as exc:
        db.rollback()
        logger.error('[%s] Pipeline failure: %s', task_id, exc, exc_info=True)
        raise self.retry(exc=exc)
    finally:
        db.close()

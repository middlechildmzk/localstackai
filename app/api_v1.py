import hashlib
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models
from .db import get_db
from .services.role_scoring import available_role_profiles, score_candidate_for_role
from .sources.registry import registry_as_dicts

router = APIRouter(prefix='/api/v1', tags=['API v1'])


class FeedbackRequest(BaseModel):
    candidate_id: str | None = None
    feedback_type: str = Field(..., examples=['fit_correct', 'fit_wrong', 'source_useful', 'source_noise'])
    feedback_value: str = Field(..., examples=['positive', 'negative', 'neutral'])
    role_key: str | None = None
    notes: str | None = None


class ProvenanceRequest(BaseModel):
    candidate_id: str | None = None
    source_name: str
    event_type: str
    evidence_url: str | None = None
    license_label: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


@router.get('/identities')
def list_identities(size: int = Query(50, ge=1, le=250), db: Session = Depends(get_db)) -> dict[str, Any]:
    rows = db.query(models.Candidate).filter(models.Candidate.deleted_at.is_(None)).order_by(models.Candidate.created_at.desc()).limit(size).all()
    return {
        'count': len(rows),
        'identities': [
            {
                'id': str(c.id),
                'canonical_name': c.canonical_name,
                'location': c.primary_location,
                'headline': c.headline,
                'sources': [{'source': s.source_name, 'handle': s.username_handle, 'url': s.profile_url} for s in c.sources],
                'skills': [skill.skill_name for skill in c.skills],
            }
            for c in rows
        ],
    }


@router.get('/identities/{candidate_id}')
def get_identity(candidate_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    c = db.query(models.Candidate).filter(models.Candidate.id == candidate_id, models.Candidate.deleted_at.is_(None)).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Identity not found')
    return {
        'id': str(c.id),
        'canonical_name': c.canonical_name,
        'primary_location': c.primary_location,
        'headline': c.headline,
        'current_role': c.current_role,
        'current_company': c.current_company,
        'summary_bio': c.summary_bio,
        'handles': {
            'github': c.github_handle,
            'gitlab': c.gitlab_handle,
            'orcid': c.orcid_id,
            'kaggle': c.kaggle_handle,
            'codeforces': c.codeforces_handle,
            'devto': c.devto_handle,
            'mastodon': c.mastodon_handle,
            'semantic_scholar': c.scholar_id,
            'arxiv_ids': c.arxiv_ids or [],
        },
        'sources': [{'source': s.source_name, 'source_user_id': s.source_user_id, 'handle': s.username_handle, 'url': s.profile_url, 'last_seen_at': s.last_seen_at.isoformat() if s.last_seen_at else None} for s in c.sources],
        'skills': [{'skill': s.skill_name, 'source': s.source_name, 'confidence': float(s.confidence_score)} for s in c.skills],
        'signals': [{'type': s.signal_type, 'value': s.signal_value, 'source': s.signal_source} for s in getattr(c, 'signals', [])],
        'publications': [{'title': p.title, 'year': p.publication_year, 'citations': p.citation_count, 'source': p.source_name, 'url': p.source_url, 'topics': p.topics or []} for p in getattr(c, 'publications', [])],
        'role_scores': [{'role_key': r.role_key, 'score': float(r.score), 'explanation': r.explanation} for r in getattr(c, 'role_scores', [])],
    }


@router.get('/sources')
def get_sources() -> dict[str, Any]:
    sources = registry_as_dicts()
    return {'count': len(sources), 'sources': sources}


@router.get('/scores/roles')
def get_role_profiles() -> dict[str, Any]:
    roles = available_role_profiles()
    return {'count': len(roles), 'roles': roles}


@router.get('/scores/{candidate_id}')
def get_or_compute_score(candidate_id: str, role: str = Query(...), db: Session = Depends(get_db)) -> dict[str, Any]:
    try:
        return score_candidate_for_role(db, candidate_id=candidate_id, role_key=role)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post('/feedback')
def write_feedback(body: FeedbackRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    feedback = models.ReviewerFeedback(
        candidate_id=body.candidate_id,
        feedback_type=body.feedback_type,
        feedback_value=body.feedback_value,
        role_key=body.role_key,
        notes=body.notes,
    )
    db.add(feedback)
    db.commit()
    return {'status': 'saved', 'feedback_id': str(feedback.id)}


@router.post('/provenance')
def write_provenance(body: ProvenanceRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    payload_hash = hashlib.sha256(str(body.payload).encode('utf-8')).hexdigest() if body.payload else None
    event = models.ProvenanceEvent(
        candidate_id=body.candidate_id,
        source_name=body.source_name,
        event_type=body.event_type,
        evidence_url=body.evidence_url,
        evidence_hash=payload_hash,
        license_label=body.license_label,
        payload=body.payload,
    )
    db.add(event)
    db.commit()
    return {'status': 'saved', 'provenance_event_id': str(event.id)}


@router.get('/research/summary')
def research_summary(db: Session = Depends(get_db)) -> dict[str, Any]:
    candidate_count = db.query(func.count(models.Candidate.id)).filter(models.Candidate.deleted_at.is_(None)).scalar() or 0
    source_count = db.query(func.count(models.CandidateSource.id)).scalar() or 0
    skill_count = db.query(func.count(models.CandidateSkill.id)).scalar() or 0
    publication_count = db.query(func.count(models.CandidatePublication.id)).scalar() if hasattr(models, 'CandidatePublication') else 0
    signal_count = db.query(func.count(models.CandidateSignal.id)).scalar() if hasattr(models, 'CandidateSignal') else 0
    feedback_count = db.query(func.count(models.ReviewerFeedback.id)).scalar() if hasattr(models, 'ReviewerFeedback') else 0
    return {
        'candidate_count': candidate_count,
        'source_profile_count': source_count,
        'skill_count': skill_count,
        'publication_count': publication_count,
        'signal_count': signal_count,
        'feedback_count': feedback_count,
        'guardrail': 'Research summaries are based on public or user-approved records only.',
    }


@router.get('/research/skill-graph/query')
def skill_graph_query(skill: str = Query(...), db: Session = Depends(get_db)) -> dict[str, Any]:
    matched = db.query(models.CandidateSkill).filter(models.CandidateSkill.skill_name.ilike(f'%{skill}%')).limit(200).all()
    related = {}
    for row in matched:
        candidate = db.query(models.Candidate).filter(models.Candidate.id == row.candidate_id).first()
        if not candidate:
            continue
        for s in candidate.skills:
            related[s.skill_name] = related.get(s.skill_name, 0) + 1
    return {'query': skill, 'matched_candidates': len({str(m.candidate_id) for m in matched}), 'related_skills': sorted(related.items(), key=lambda x: x[1], reverse=True)[:25]}


@router.get('/observability/summary')
def observability_summary(db: Session = Depends(get_db)) -> dict[str, Any]:
    return {
        'adapter_health_events': db.query(func.count(models.AdapterHealthEvent.id)).scalar() if hasattr(models, 'AdapterHealthEvent') else 0,
        'embedding_jobs': db.query(func.count(models.EmbeddingJob.id)).scalar() if hasattr(models, 'EmbeddingJob') else 0,
        'provenance_events': db.query(func.count(models.ProvenanceEvent.id)).scalar() if hasattr(models, 'ProvenanceEvent') else 0,
        'identity_edges': db.query(func.count(models.IdentityEdge.id)).scalar() if hasattr(models, 'IdentityEdge') else 0,
        'role_scores': db.query(func.count(models.RoleScore.id)).scalar() if hasattr(models, 'RoleScore') else 0,
    }

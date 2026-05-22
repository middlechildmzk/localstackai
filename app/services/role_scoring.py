from dataclasses import dataclass
from typing import Any

from sqlalchemy.orm import Session

from .. import models


@dataclass(frozen=True)
class RoleScoringProfile:
    key: str
    skill_weights: dict[str, float]
    source_weights: dict[str, float]
    signal_weights: dict[str, float]
    publication_weight: float = 0.0


ROLE_PROFILES: dict[str, RoleScoringProfile] = {
    'ai_researcher': RoleScoringProfile(
        key='ai_researcher',
        skill_weights={'machine learning': 18, 'python': 8, 'pytorch': 12, 'tensorflow': 10, 'llm': 12, 'research': 10},
        source_weights={'orcid': 15, 'openalex': 14, 'semanticscholar': 14, 'arxiv': 12, 'github': 8, 'huggingface': 10},
        signal_weights={'h_index': 8, 'citation_count': 6, 'orcid_works_count': 6, 'model_downloads': 6},
        publication_weight=2.0,
    ),
    'systems_engineer': RoleScoringProfile(
        key='systems_engineer',
        skill_weights={'linux': 12, 'rust': 14, 'c++': 12, 'go': 10, 'kubernetes': 8, 'distributed systems': 14},
        source_weights={'github': 16, 'gitlab': 12, 'crates': 8, 'hackernews': 5},
        signal_weights={'public_repo_count': 4, 'package_downloads': 6, 'commit_velocity': 8},
        publication_weight=0.5,
    ),
    'security_engineer': RoleScoringProfile(
        key='security_engineer',
        skill_weights={'security': 12, 'nist': 8, 'rmf': 10, 'fedramp': 10, 'python': 6, 'linux': 8, 'reverse engineering': 12},
        source_weights={'github': 10, 'gitlab': 8, 'orcid': 4, 'hackernews': 5},
        signal_weights={'cve_count': 10, 'ctf_rating': 8, 'security_publication_count': 7},
        publication_weight=1.0,
    ),
    'data_engineer': RoleScoringProfile(
        key='data_engineer',
        skill_weights={'python': 8, 'sql': 12, 'postgresql': 8, 'spark': 12, 'airflow': 12, 'dbt': 10, 'snowflake': 10},
        source_weights={'github': 10, 'gitlab': 8, 'pypi': 8, 'kaggle': 6},
        signal_weights={'package_downloads': 5, 'dataset_count': 5},
        publication_weight=0.25,
    ),
    'devops_engineer': RoleScoringProfile(
        key='devops_engineer',
        skill_weights={'kubernetes': 14, 'terraform': 14, 'aws': 10, 'azure': 8, 'docker': 10, 'linux': 8, 'ci/cd': 8},
        source_weights={'github': 12, 'gitlab': 12, 'npm': 3, 'pypi': 3},
        signal_weights={'public_repo_count': 3, 'package_downloads': 4},
        publication_weight=0.0,
    ),
    'fullstack_engineer': RoleScoringProfile(
        key='fullstack_engineer',
        skill_weights={'javascript': 10, 'typescript': 12, 'react': 12, 'node': 10, 'python': 5, 'postgresql': 6, 'api design': 8},
        source_weights={'github': 12, 'gitlab': 8, 'npm': 10, 'devto': 4, 'hashnode': 4},
        signal_weights={'package_downloads': 5, 'article_count': 3},
        publication_weight=0.0,
    ),
}


def _normalize_score(raw: float) -> float:
    return round(max(0.0, min(100.0, raw)), 2)


def score_candidate_for_role(db: Session, candidate_id: str, role_key: str) -> dict[str, Any]:
    profile = ROLE_PROFILES.get(role_key)
    if not profile:
        raise ValueError(f'Unknown role_key: {role_key}')

    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id, models.Candidate.deleted_at.is_(None)).first()
    if not candidate:
        raise ValueError(f'Candidate not found: {candidate_id}')

    skills = {skill.skill_name.lower() for skill in candidate.skills}
    sources = {source.source_name.lower() for source in candidate.sources}
    signals = getattr(candidate, 'signals', []) or []
    publications = getattr(candidate, 'publications', []) or []

    skill_points = {skill: weight for skill, weight in profile.skill_weights.items() if skill in skills}
    source_points = {source: weight for source, weight in profile.source_weights.items() if source in sources}
    signal_points: dict[str, float] = {}
    for signal in signals:
        weight = profile.signal_weights.get(signal.signal_type)
        if weight:
            signal_points[signal.signal_type] = signal_points.get(signal.signal_type, 0.0) + weight

    publication_points = min(20.0, len(publications) * profile.publication_weight)
    raw_score = sum(skill_points.values()) + sum(source_points.values()) + sum(signal_points.values()) + publication_points
    final_score = _normalize_score(raw_score)

    explanation = {
        'role_key': role_key,
        'candidate_id': str(candidate.id),
        'score': final_score,
        'matched_skills': skill_points,
        'matched_sources': source_points,
        'matched_signals': signal_points,
        'publication_points': publication_points,
        'missing_high_value_skills': [skill for skill in profile.skill_weights.keys() if skill not in skills][:10],
        'caveat': 'Score is an explainable sourcing signal, not a hiring decision.',
    }

    existing = db.query(models.RoleScore).filter(models.RoleScore.candidate_id == candidate.id, models.RoleScore.role_key == role_key).first() if hasattr(models, 'RoleScore') else None
    if existing:
        existing.score = final_score
        existing.explanation = explanation
    elif hasattr(models, 'RoleScore'):
        db.add(models.RoleScore(candidate_id=candidate.id, role_key=role_key, score=final_score, explanation=explanation))
    db.commit()
    return explanation


def available_role_profiles() -> list[dict[str, Any]]:
    return [{'role_key': key, 'skills': list(profile.skill_weights.keys()), 'sources': list(profile.source_weights.keys()), 'signals': list(profile.signal_weights.keys())} for key, profile in ROLE_PROFILES.items()]

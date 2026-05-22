import logging
from typing import Any, Optional
from uuid import UUID

from opensearchpy import NotFoundError, OpenSearch, OpenSearchException, RequestsHttpConnection
from sqlalchemy.orm import Session

from . import models
from .config import settings

logger = logging.getLogger('sourcing.search')
INDEX_NAME = settings.OPENSEARCH_INDEX

INDEX_CONFIG: dict[str, Any] = {
    'settings': {
        'number_of_shards': settings.OPENSEARCH_SHARDS,
        'number_of_replicas': settings.OPENSEARCH_REPLICAS,
        'analysis': {
            'analyzer': {
                'english_stemming': {
                    'type': 'custom',
                    'tokenizer': 'standard',
                    'filter': ['lowercase', 'english_stemmer', 'english_stop'],
                }
            },
            'filter': {
                'english_stemmer': {'type': 'stemmer', 'language': 'english'},
                'english_stop': {'type': 'stop', 'stopwords': '_english_'},
            },
        },
    },
    'mappings': {
        'properties': {
            'candidate_id': {'type': 'keyword'},
            'canonical_name': {'type': 'text', 'analyzer': 'english_stemming', 'fields': {'keyword': {'type': 'keyword', 'ignore_above': 256}}},
            'location': {'type': 'text', 'analyzer': 'english_stemming', 'fields': {'keyword': {'type': 'keyword', 'ignore_above': 128}}},
            'headline': {'type': 'text', 'analyzer': 'english_stemming'},
            'current_role': {'type': 'text', 'analyzer': 'english_stemming'},
            'current_company': {'type': 'text', 'fields': {'keyword': {'type': 'keyword', 'ignore_above': 256}}},
            'skills': {'type': 'keyword'},
            'sources': {'type': 'keyword'},
            'combined_bio_skills': {'type': 'text', 'analyzer': 'english_stemming'},
            'is_active': {'type': 'boolean'},
            'updated_at': {'type': 'date'},
        }
    },
}


class OpenSearchIndexer:
    def __init__(self) -> None:
        self.index_name = INDEX_NAME
        self.client = OpenSearch(
            hosts=[settings.OPENSEARCH_URL],
            connection_class=RequestsHttpConnection,
            use_ssl=False,
            verify_certs=False,
            timeout=30,
            max_retries=3,
            retry_on_timeout=True,
        )

    def ensure_index_exists(self) -> None:
        try:
            if self.client.indices.exists(index=self.index_name):
                logger.info("OpenSearch index '%s' already exists.", self.index_name)
                return
            self.client.indices.create(index=self.index_name, body=INDEX_CONFIG)
            logger.info("Created OpenSearch index '%s'.", self.index_name)
        except Exception as exc:
            logger.error("Failed to initialize OpenSearch index '%s': %s", self.index_name, exc, exc_info=True)
            raise

    def build_document(self, candidate: models.Candidate) -> dict[str, Any]:
        skills = sorted({skill.skill_name for skill in candidate.skills})
        sources = sorted({source.source_name for source in candidate.sources})
        combined = ' '.join(filter(None, [
            candidate.summary_bio,
            candidate.headline,
            candidate.current_role,
            candidate.current_company,
            ' '.join(skills),
        ])).strip()
        return {
            'candidate_id': str(candidate.id),
            'canonical_name': candidate.canonical_name,
            'location': candidate.primary_location or '',
            'headline': candidate.headline or '',
            'current_role': candidate.current_role or '',
            'current_company': candidate.current_company or '',
            'skills': skills,
            'sources': sources,
            'combined_bio_skills': combined,
            'is_active': bool(candidate.is_active and candidate.deleted_at is None),
            'updated_at': candidate.updated_at.isoformat() if candidate.updated_at else None,
        }

    def index_candidate_profile(self, db_session: Session, candidate_id: UUID | str) -> None:
        try:
            candidate = (
                db_session.query(models.Candidate)
                .filter(models.Candidate.id == candidate_id, models.Candidate.deleted_at.is_(None))
                .first()
            )
            if not candidate:
                logger.warning("Candidate '%s' not found or soft-deleted. Skipping index.", candidate_id)
                return
            self.client.index(index=self.index_name, id=str(candidate.id), body=self.build_document(candidate), refresh='wait_for')
            logger.info("Candidate '%s' indexed.", candidate.id)
        except Exception as exc:
            logger.error("Failed to index candidate '%s': %s", candidate_id, exc, exc_info=True)
            raise

    def delete_candidate_profile(self, candidate_id: UUID | str) -> None:
        try:
            self.client.delete(index=self.index_name, id=str(candidate_id), refresh='wait_for')
            logger.info("Candidate search document '%s' deleted.", candidate_id)
        except NotFoundError:
            logger.warning("Candidate search document '%s' was already absent.", candidate_id)
        except OpenSearchException as exc:
            logger.warning("Failed to delete candidate search document '%s': %s", candidate_id, exc)

    def delete_candidate_document(self, candidate_id: UUID | str) -> None:
        self.delete_candidate_profile(candidate_id)

    def search_candidates(self, skills: Optional[list[str]] = None, location: Optional[str] = None, q: Optional[str] = None, size: int = 20, from_offset: int = 0) -> dict[str, Any]:
        must_clauses: list[dict[str, Any]] = []
        should_clauses: list[dict[str, Any]] = []

        if q and q.strip():
            must_clauses.append({'multi_match': {'query': q.strip(), 'fields': ['canonical_name^3', 'headline^2', 'current_role^2', 'combined_bio_skills']}})

        for skill in skills or []:
            normalized = skill.strip().lower()
            if normalized:
                must_clauses.append({'term': {'skills': normalized}})

        if location and location.strip():
            should_clauses.append({'match': {'location': {'query': location.strip(), 'boost': 2.0}}})
            should_clauses.append({'match': {'combined_bio_skills': {'query': location.strip(), 'boost': 0.25}}})

        query_body: dict[str, Any] = {
            'query': {
                'bool': {
                    'must': must_clauses if must_clauses else [{'match_all': {}}],
                    'should': should_clauses,
                    'filter': [{'term': {'is_active': True}}],
                    'minimum_should_match': 0,
                }
            },
            'size': min(max(size, 1), 100),
            'from': max(from_offset, 0),
            '_source': ['candidate_id', 'canonical_name', 'location', 'headline', 'current_role', 'current_company', 'skills', 'sources'],
            'sort': [{'_score': {'order': 'desc'}}, {'updated_at': {'order': 'desc'}}],
        }
        try:
            response = self.client.search(index=self.index_name, body=query_body)
            logger.info('Search completed. skills=%s location=%s hits=%s', skills, location, response.get('hits', {}).get('total', {}).get('value', 0))
            return response
        except Exception as exc:
            logger.error('OpenSearch query failed: %s', exc, exc_info=True)
            raise

    def search(self, skills: Optional[list[str]] = None, location: Optional[str] = None, q: Optional[str] = None, size: int = 25) -> dict[str, Any]:
        return self.search_candidates(skills=skills, location=location, q=q, size=size, from_offset=0)

    def ping(self) -> bool:
        try:
            return bool(self.client.ping())
        except Exception:
            return False


indexer = OpenSearchIndexer()

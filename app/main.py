import hashlib
import logging
from contextlib import asynccontextmanager
from typing import Annotated, Any, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from .config import settings
from .db import get_db, verify_database_connection
from .search import indexer
from .tasks.compliance import execute_hard_erasure_workflow
from .tasks.worker import orchestrate_ingestion_pipeline

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format='%(asctime)s | %(name)s | %(levelname)s | %(message)s',
)
logger = logging.getLogger('sourcing.api')


@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[type-arg]
    logger.info('Sourcing Intelligence Workspace starting up.')
    try:
        indexer.ensure_index_exists()
    except Exception as exc:
        logger.error('OpenSearch initialization failed at startup: %s', exc, exc_info=True)
    if not verify_database_connection():
        logger.error('Database connectivity check failed at startup.')
    yield
    logger.info('Sourcing Intelligence Workspace shutting down.')


app = FastAPI(
    title='Sourcing Intelligence Workspace',
    description='Public profile aggregation, normalization, tiered identity resolution, OpenSearch indexing, and compliance erasure.',
    version='1.0.0',
    lifespan=lifespan,
    docs_url='/docs',
    redoc_url='/redoc',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
)


class CandidateHit(BaseModel):
    candidate_id: str
    canonical_name: str
    location: Optional[str] = None
    headline: Optional[str] = None
    current_role: Optional[str] = None
    current_company: Optional[str] = None
    skills: list[str] = Field(default_factory=list)
    sources: list[str] = Field(default_factory=list)
    relevance_score: float = Field(alias='_score', default=0.0)

    model_config = {'populate_by_name': True}


class SearchResponse(BaseModel):
    total_hits: int
    returned: int
    results: list[CandidateHit]


class SyncResponse(BaseModel):
    status: str
    task_id: str
    message: str


class EraseRequest(BaseModel):
    email: EmailStr = Field(..., description='Target email address for GDPR hard erasure.')


class EraseResponse(BaseModel):
    status: str
    message: str
    anonymized_email_hash: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class ReadinessResponse(BaseModel):
    status: str
    database: str
    opensearch: str


@app.get('/search', response_model=SearchResponse, summary='Search the candidate index', tags=['Search'])
async def search_candidates(
    skills: Annotated[Optional[str], Query(description="Comma-separated skill tags, for example 'python,kubernetes,terraform'")] = None,
    location: Annotated[Optional[str], Query(description="Location string used as a scoring boost, for example 'Austin TX'")] = None,
    q: Annotated[Optional[str], Query(description='Optional free-text query against name, headline, role, and bio fields.')] = None,
    size: Annotated[int, Query(ge=1, le=100)] = 20,
    page: Annotated[int, Query(ge=0)] = 0,
) -> SearchResponse:
    skill_list = [s.strip().lower() for s in skills.split(',') if s.strip()] if skills else []
    from_offset = page * size
    logger.info('Search request: skills=%s location=%r q=%r size=%s page=%s', skill_list, location, q, size, page)
    try:
        response = indexer.search_candidates(skills=skill_list, location=location, q=q, size=size, from_offset=from_offset)
        raw_hits: list[dict[str, Any]] = response.get('hits', {}).get('hits', [])
        total = response.get('hits', {}).get('total', {}).get('value', 0)
        results = [
            CandidateHit(
                candidate_id=hit.get('_source', {}).get('candidate_id', ''),
                canonical_name=hit.get('_source', {}).get('canonical_name', ''),
                location=hit.get('_source', {}).get('location') or None,
                headline=hit.get('_source', {}).get('headline') or None,
                current_role=hit.get('_source', {}).get('current_role') or None,
                current_company=hit.get('_source', {}).get('current_company') or None,
                skills=hit.get('_source', {}).get('skills', []),
                sources=hit.get('_source', {}).get('sources', []),
                _score=round(hit.get('_score') or 0.0, 4),
            )
            for hit in raw_hits
        ]
        return SearchResponse(total_hits=total, returned=len(results), results=results)
    except Exception as exc:
        logger.error('Search endpoint failure: %s', exc, exc_info=True)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Search cluster is temporarily unavailable. Please retry shortly.')


@app.post('/tasks/sync/github', response_model=SyncResponse, status_code=status.HTTP_202_ACCEPTED, summary='Trigger GitHub profile ingestion', tags=['Ingestion'])
async def sync_github(request: Request) -> SyncResponse:
    try:
        payload: dict[str, Any] = await request.json()
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Request body must be valid JSON.')

    source_identifier = str(payload.get('login') or payload.get('id') or 'unknown')
    logger.info('GitHub sync request received. identifier=%s payload_keys=%s', source_identifier, list(payload.keys()))
    try:
        task = orchestrate_ingestion_pipeline.delay(payload)
        return SyncResponse(status='queued', task_id=task.id, message=f"Ingestion task for source identifier '{source_identifier}' has been dispatched.")
    except Exception as exc:
        logger.error('Failed to dispatch ingestion task: %s', exc, exc_info=True)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Worker queue is temporarily unavailable. Please retry shortly.')


@app.post('/compliance/erase', response_model=EraseResponse, summary='GDPR Article 17 erasure', tags=['Compliance'])
async def erase_candidate(body: EraseRequest, db: Session = Depends(get_db)) -> EraseResponse:
    clean_email = body.email.strip().lower()
    email_hash = hashlib.sha256(clean_email.encode('utf-8')).hexdigest()
    logger.info('GDPR erasure request received. anonymized_hash=%s', email_hash)
    try:
        execute_hard_erasure_workflow(target_email=clean_email)
        return EraseResponse(
            status='completed',
            message='Candidate profile data has been permanently erased across relational storage and search index layers. An audit record has been written.',
            anonymized_email_hash=email_hash,
        )
    except Exception as exc:
        logger.error('GDPR erasure workflow failed for hash=%s: %s', email_hash, exc, exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='The erasure workflow encountered a critical error. Review logs using the anonymized hash.')


@app.get('/health', response_model=HealthResponse, summary='Liveness probe', tags=['Operations'])
async def health_check() -> HealthResponse:
    return HealthResponse(status='healthy', service='Sourcing Intelligence Workspace', version='1.0.0')


@app.get('/ready', response_model=ReadinessResponse, summary='Readiness probe', tags=['Operations'])
async def readiness_check() -> ReadinessResponse | JSONResponse:
    db_ok = verify_database_connection()
    os_ok = indexer.ping()
    if not db_ok or not os_ok:
        logger.warning('Readiness degraded: database=%s opensearch=%s', db_ok, os_ok)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=ReadinessResponse(
                status='degraded',
                database='ok' if db_ok else 'unavailable',
                opensearch='ok' if os_ok else 'unavailable',
            ).model_dump(),
        )
    return ReadinessResponse(status='ready', database='ok', opensearch='ok')


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error('Unhandled exception on %s %s: %s', request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={'detail': 'An unexpected internal error occurred. See server logs for details.'})

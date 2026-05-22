import hashlib
import logging
from contextlib import asynccontextmanager
from typing import Annotated, Any, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from . import models
from .config import settings
from .db import get_db, verify_database_connection
from .search import indexer
from .sources.registry import registry_as_dicts
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


class BatchSyncResponse(BaseModel):
    status: str
    queued: int
    task_ids: list[str]


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
    try:
        response = indexer.search_candidates(skills=skill_list, location=location, q=q, size=size, from_offset=from_offset)
        raw_hits: list[dict[str, Any]] = response.get('hits', {}).get('hits', [])
        total = response.get('hits', {}).get('total', {}).get('value', 0)
        results = [CandidateHit(candidate_id=hit.get('_source', {}).get('candidate_id', ''), canonical_name=hit.get('_source', {}).get('canonical_name', ''), location=hit.get('_source', {}).get('location') or None, headline=hit.get('_source', {}).get('headline') or None, current_role=hit.get('_source', {}).get('current_role') or None, current_company=hit.get('_source', {}).get('current_company') or None, skills=hit.get('_source', {}).get('skills', []), sources=hit.get('_source', {}).get('sources', []), _score=round(hit.get('_score') or 0.0, 4)) for hit in raw_hits]
        return SearchResponse(total_hits=total, returned=len(results), results=results)
    except Exception as exc:
        logger.error('Search endpoint failure: %s', exc, exc_info=True)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Search cluster is temporarily unavailable. Please retry shortly.')


@app.get('/sources', tags=['Sources'])
async def list_sources() -> dict[str, Any]:
    return {'count': len(registry_as_dicts()), 'sources': registry_as_dicts()}


@app.post('/tasks/sync/github', response_model=SyncResponse, status_code=status.HTTP_202_ACCEPTED, tags=['Ingestion'])
async def sync_github(request: Request) -> SyncResponse:
    try:
        payload: dict[str, Any] = await request.json()
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Request body must be valid JSON.')
    source_identifier = str(payload.get('login') or payload.get('id') or 'unknown')
    try:
        task = orchestrate_ingestion_pipeline.delay(payload)
        return SyncResponse(status='queued', task_id=task.id, message=f"Ingestion task for source identifier '{source_identifier}' has been dispatched.")
    except Exception as exc:
        logger.error('Failed to dispatch ingestion task: %s', exc, exc_info=True)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Worker queue is temporarily unavailable. Please retry shortly.')


@app.post('/tasks/sync/batch', response_model=BatchSyncResponse, status_code=status.HTTP_202_ACCEPTED, tags=['Ingestion'])
async def sync_batch(request: Request) -> BatchSyncResponse:
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Request body must be valid JSON.')
    records = payload if isinstance(payload, list) else payload.get('records', []) if isinstance(payload, dict) else []
    if not isinstance(records, list) or not records:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Provide a JSON list or {"records": [...]} payload.')
    task_ids: list[str] = []
    for record in records[:250]:
        if isinstance(record, dict):
            task = orchestrate_ingestion_pipeline.delay(record)
            task_ids.append(task.id)
    return BatchSyncResponse(status='queued', queued=len(task_ids), task_ids=task_ids)


@app.get('/db/candidates', tags=['Database'])
async def list_database_candidates(size: int = Query(50, ge=1, le=250), db: Session = Depends(get_db)) -> dict[str, Any]:
    rows = db.query(models.Candidate).filter(models.Candidate.deleted_at.is_(None)).order_by(models.Candidate.created_at.desc()).limit(size).all()
    return {'count': len(rows), 'candidates': [{'id': str(c.id), 'name': c.canonical_name, 'location': c.primary_location, 'headline': c.headline, 'current_role': c.current_role, 'current_company': c.current_company, 'skills': [s.skill_name for s in c.skills], 'sources': [{'source': src.source_name, 'handle': src.username_handle, 'url': src.profile_url} for src in c.sources]} for c in rows]}


@app.get('/db/view', response_class=HTMLResponse, tags=['Database'])
async def database_viewer() -> str:
    return """
<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>SIW Database Viewer</title><style>body{font-family:Inter,system-ui,sans-serif;background:#07111f;color:#eaf3ff;margin:0;padding:24px}.wrap{max-width:1150px;margin:auto}.top{display:flex;justify-content:space-between;gap:12px;align-items:center}.card{border:1px solid rgba(255,255,255,.12);background:#0d1a2e;border-radius:16px;padding:16px;margin:12px 0}input,button{border-radius:10px;border:1px solid rgba(255,255,255,.16);padding:10px;background:#101d31;color:#fff}button{cursor:pointer;background:#245cff}a{color:#9fd0ff}.meta{color:#9aa8bc;font-size:13px}.tag{display:inline-block;border:1px solid rgba(159,208,255,.25);border-radius:999px;padding:3px 7px;margin:3px;font-size:12px}</style></head><body><div class='wrap'><div class='top'><div><h1>Sourcing Intelligence Workspace</h1><p class='meta'>Local database viewer. API docs: <a href='/docs'>/docs</a>. Sources: <a href='/sources'>/sources</a>.</p></div><button onclick='load()'>Refresh</button></div><input id='q' placeholder='Search text, skill, source, location' oninput='render()' style='width:100%;box-sizing:border-box'><div id='stats' class='meta'></div><div id='rows'></div></div><script>let data=[];async function load(){const r=await fetch('/db/candidates?size=250');const j=await r.json();data=j.candidates||[];render()}function render(){const q=(document.getElementById('q').value||'').toLowerCase();const rows=data.filter(c=>JSON.stringify(c).toLowerCase().includes(q));document.getElementById('stats').textContent=rows.length+' candidates shown';document.getElementById('rows').innerHTML=rows.map(c=>`<div class='card'><h3>${c.name||'Unnamed'}</h3><p class='meta'>${c.current_role||''} ${c.current_company?'· '+c.current_company:''} ${c.location?'· '+c.location:''}</p><p>${c.headline||''}</p><div>${(c.skills||[]).map(s=>`<span class='tag'>${s}</span>`).join('')}</div><div>${(c.sources||[]).map(s=>`<p class='meta'>${s.source}: ${s.url?`<a href='${s.url}' target='_blank'>${s.handle||s.url}</a>`:(s.handle||'')}</p>`).join('')}</div></div>`).join('')||'<div class=card>No candidates yet. Queue ingestion first.</div>'}load()</script></body></html>
"""


@app.post('/compliance/erase', response_model=EraseResponse, tags=['Compliance'])
async def erase_candidate(body: EraseRequest, db: Session = Depends(get_db)) -> EraseResponse:
    clean_email = body.email.strip().lower()
    email_hash = hashlib.sha256(clean_email.encode('utf-8')).hexdigest()
    try:
        execute_hard_erasure_workflow(target_email=clean_email)
        return EraseResponse(status='completed', message='Candidate profile data has been permanently erased across relational storage and search index layers. An audit record has been written.', anonymized_email_hash=email_hash)
    except Exception as exc:
        logger.error('GDPR erasure workflow failed for hash=%s: %s', email_hash, exc, exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='The erasure workflow encountered a critical error. Review logs using the anonymized hash.')


@app.get('/health', response_model=HealthResponse, tags=['Operations'])
async def health_check() -> HealthResponse:
    return HealthResponse(status='healthy', service='Sourcing Intelligence Workspace', version='1.0.0')


@app.get('/ready', response_model=ReadinessResponse, tags=['Operations'])
async def readiness_check() -> ReadinessResponse | JSONResponse:
    db_ok = verify_database_connection()
    os_ok = indexer.ping()
    if not db_ok or not os_ok:
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=ReadinessResponse(status='degraded', database='ok' if db_ok else 'unavailable', opensearch='ok' if os_ok else 'unavailable').model_dump())
    return ReadinessResponse(status='ready', database='ok', opensearch='ok')


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error('Unhandled exception on %s %s: %s', request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={'detail': 'An unexpected internal error occurred. See server logs for details.'})

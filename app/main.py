import hashlib
import logging
from contextlib import asynccontextmanager
from typing import Annotated, Any, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from . import models
from .api_v1 import router as api_v1_router
from .config import settings
from .db import get_db, verify_database_connection
from .growth_api import router as growth_router
from .importers import import_records_from_text_blocks, import_text_to_record
from .search import indexer
from .services.public_candidate_sweep import PublicCandidateSweepRunner, SweepRequest, default_dc_devops_request
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
app.include_router(api_v1_router)
app.include_router(growth_router)


def _table_exists(db: Session, table_name: str) -> bool:
    row = db.execute(text('SELECT to_regclass(:table_name) AS rel'), {'table_name': f'public.{table_name}'}).mappings().first()
    return bool(row and row.get('rel'))


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


class ImportTextRequest(BaseModel):
    text: str = Field(..., min_length=10)
    source_name: str = 'manual_import'
    source_user_id: Optional[str] = None
    queue: bool = True


class ImportBlocksRequest(BaseModel):
    blocks: list[str] = Field(..., min_length=1, max_length=100)
    source_name: str = 'manual_import'
    queue: bool = True


class PublicSweepRequest(BaseModel):
    role: str = 'Senior DevOps Engineer'
    location_cluster: list[str] = Field(default_factory=lambda: ['Washington DC', 'Arlington VA', 'Alexandria VA', 'Reston VA', 'Chantilly VA', 'Fort Meade MD'])
    skills: list[str] = Field(default_factory=lambda: ['kubernetes', 'terraform', 'aws', 'govcloud', 'ci/cd', 'devsecops'])
    clearance_target: Optional[str] = 'TS/SCI'
    max_per_source: int = Field(10, ge=1, le=50)
    dry_run: bool = True
    include_github: bool = True
    include_resume_text_blocks: bool = False
    resume_text_blocks: list[str] = Field(default_factory=list)


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


@app.post('/tasks/sweep/public-candidates', tags=['Ingestion'])
async def sweep_public_candidates(body: PublicSweepRequest) -> dict[str, Any]:
    runner = PublicCandidateSweepRunner()
    request = SweepRequest(
        role=body.role,
        location_cluster=body.location_cluster,
        skills=body.skills,
        clearance_target=body.clearance_target,
        max_per_source=body.max_per_source,
        include_github=body.include_github,
        include_resume_text_blocks=body.include_resume_text_blocks,
        resume_text_blocks=body.resume_text_blocks,
    )
    result = await runner.run(request)
    if body.dry_run:
        result['status'] = 'dry_run'
        return result
    task_ids = [orchestrate_ingestion_pipeline.delay(record).id for record in result.get('candidate_records', [])[:250]]
    return {'status': 'queued', 'queued': len(task_ids), 'task_ids': task_ids, 'summary': result.get('summary'), 'evidence_items': result.get('evidence_items', [])[:100], 'skipped_items': result.get('skipped_items', [])[:100]}


@app.post('/tasks/sweep/dc-devops', tags=['Ingestion'])
async def sweep_dc_devops(dry_run: bool = True, max_per_source: int = Query(10, ge=1, le=50)) -> dict[str, Any]:
    runner = PublicCandidateSweepRunner()
    result = await runner.run(default_dc_devops_request(max_per_source=max_per_source))
    if dry_run:
        result['status'] = 'dry_run'
        return result
    task_ids = [orchestrate_ingestion_pipeline.delay(record).id for record in result.get('candidate_records', [])[:250]]
    return {'status': 'queued', 'queued': len(task_ids), 'task_ids': task_ids, 'summary': result.get('summary'), 'guardrail': 'Clearance remains unverified. Review all records before sourcing outreach.'}


@app.post('/tasks/import/text', tags=['Ingestion'])
async def import_approved_text(body: ImportTextRequest) -> dict[str, Any]:
    try:
        record = import_text_to_record(body.text, source_name=body.source_name, source_user_id=body.source_user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    if not body.queue:
        return {'status': 'parsed', 'record': record}
    task = orchestrate_ingestion_pipeline.delay(record)
    return {'status': 'queued', 'queued': 1, 'task_ids': [task.id], 'record_preview': {k: record.get(k) for k in ['source_name', 'source_user_id', 'full_name', 'location', 'extracted_skills']}}


@app.post('/tasks/import/text-blocks', tags=['Ingestion'])
async def import_approved_text_blocks(body: ImportBlocksRequest) -> dict[str, Any]:
    records = import_records_from_text_blocks(body.blocks, source_name=body.source_name)
    if not body.queue:
        return {'status': 'parsed', 'records': records}
    task_ids = [orchestrate_ingestion_pipeline.delay(record).id for record in records]
    return {'status': 'queued', 'queued': len(task_ids), 'task_ids': task_ids}


@app.get('/db/candidates', tags=['Database'])
async def list_database_candidates(size: int = Query(50, ge=1, le=250), db: Session = Depends(get_db)) -> dict[str, Any]:
    if not _table_exists(db, 'candidates'):
        return {'count': 0, 'candidates': [], 'status': 'degraded_missing_candidates_table'}
    try:
        rows = db.execute(
            text(
                '''
                SELECT c.id, c.canonical_name, c.primary_location, c.headline, c.current_role, c.current_company, c.created_at
                FROM candidates c
                WHERE c.deleted_at IS NULL
                ORDER BY c.created_at DESC
                LIMIT :size
                '''
            ),
            {'size': min(max(size, 1), 250)},
        ).mappings().all()
        candidate_ids = [str(r['id']) for r in rows]
        skills_by_candidate: dict[str, list[str]] = {cid: [] for cid in candidate_ids}
        sources_by_candidate: dict[str, list[dict[str, Any]]] = {cid: [] for cid in candidate_ids}
        if candidate_ids and _table_exists(db, 'candidate_skills'):
            skill_rows = db.execute(
                text('SELECT candidate_id, skill_name FROM candidate_skills WHERE candidate_id = ANY(:candidate_ids)'),
                {'candidate_ids': candidate_ids},
            ).mappings().all()
            for row in skill_rows:
                skills_by_candidate.setdefault(str(row['candidate_id']), []).append(row['skill_name'])
        if candidate_ids and _table_exists(db, 'candidate_sources'):
            source_rows = db.execute(
                text('SELECT candidate_id, source_name, username_handle, profile_url FROM candidate_sources WHERE candidate_id = ANY(:candidate_ids)'),
                {'candidate_ids': candidate_ids},
            ).mappings().all()
            for row in source_rows:
                sources_by_candidate.setdefault(str(row['candidate_id']), []).append({'source': row['source_name'], 'handle': row['username_handle'], 'url': row['profile_url']})
        candidates = []
        for row in rows:
            cid = str(row['id'])
            candidates.append({
                'id': cid,
                'candidate_id': cid,
                'name': row['canonical_name'],
                'canonical_name': row['canonical_name'],
                'location': row['primary_location'],
                'primary_location': row['primary_location'],
                'headline': row['headline'],
                'current_role': row['current_role'],
                'current_company': row['current_company'],
                'skills': skills_by_candidate.get(cid, []),
                'sources': sources_by_candidate.get(cid, []),
            })
        return {'count': len(candidates), 'candidates': candidates, 'status': 'ok'}
    except Exception as exc:
        logger.error('Database candidate list failed: %s', exc, exc_info=True)
        return {'count': 0, 'candidates': [], 'status': 'degraded_query_failed', 'error': str(exc)[:500]}


@app.get('/db/view', response_class=HTMLResponse, tags=['Database'])
async def database_viewer() -> str:
    return """
<!doctype html>
<html>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <title>SIW Database Viewer</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #0f172a; color: #e5e7eb; }
    header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,.12); }
    main { padding: 20px; display: grid; gap: 14px; }
    .card { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 16px; padding: 16px; }
    pre { white-space: pre-wrap; word-break: break-word; background: rgba(0,0,0,.25); padding: 12px; border-radius: 12px; }
    button { border: 0; border-radius: 999px; padding: 10px 14px; font-weight: 700; cursor: pointer; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
    input { width: 100%; box-sizing: border-box; border-radius: 12px; padding: 10px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.08); color: white; }
    a { color: #93c5fd; }
  </style>
</head>
<body>
<header><h1>SIW Database Viewer</h1><p>Local browser view over the backend candidate database.</p></header>
<main>
  <div class='card'><button onclick='loadCandidates()'>Load candidates</button> <button onclick='loadStats()'>Growth stats</button> <a href='/docs' target='_blank'>API docs</a></div>
  <div class='grid' id='stats'></div>
  <div id='out' class='card'>Click Load candidates.</div>
</main>
<script>
async function j(url, options){ const r=await fetch(url, options); if(!r.ok) throw new Error(await r.text()); return r.json(); }
async function loadStats(){ const d=await j('/growth/stats'); document.getElementById('stats').innerHTML=Object.entries(d).map(([k,v])=>`<div class='card'><strong>${k}</strong><pre>${JSON.stringify(v,null,2)}</pre></div>`).join(''); }
async function loadCandidates(){ const d=await j('/db/candidates?size=100'); document.getElementById('out').innerHTML = '<pre>'+JSON.stringify(d,null,2)+'</pre>'; }
loadStats().catch(e=>document.getElementById('out').textContent=e.message);
</script>
</body>
</html>
"""
# Sourcing Intelligence Workspace Architecture

## Current implemented system

The current branch implements a local-first backend MVP for public-source talent intelligence.

```text
Public or user-approved records
        |
        v
FastAPI ingestion endpoints
        |
        v
Celery worker + Redis queue
        |
        v
Normalization + enrichment contract
        |
        v
PostgreSQL canonical candidate store
        |
        +--> OpenSearch candidate search index
        |
        +--> Role scoring, provenance, feedback, source coverage, research summaries
```

## Implemented storage layers

### PostgreSQL source of truth

Implemented tables include:

- candidates
- candidate_sources
- candidate_skills
- candidate_experiences
- candidate_signals
- candidate_publications
- provenance_events
- identity_edges
- role_scores
- embedding_jobs
- adapter_health_events
- reviewer_feedback
- compliance_audit_log

### OpenSearch retrieval layer

Implemented search index:

- candidate identity fields
- skills
- sources
- combined bio and skill text
- active candidate filtering

### Future vector and graph layers

Not implemented as hard dependencies yet:

- pgvector, Milvus, or Pinecone for embeddings
- Neo4j or Apache AGE for graph queries
- Kafka/PubSub streaming adapters

The schema now includes bridge tables, such as identity_edges and embedding_jobs, so those systems can be added without rewriting the core candidate model.

## Implemented API surface

Local viewer and docs:

- GET /db/view
- GET /docs
- GET /sources
- GET /db/candidates

Core API:

- GET /search
- POST /tasks/sync/github
- POST /tasks/sync/batch
- POST /compliance/erase
- GET /health
- GET /ready

API v1:

- GET /api/v1/identities
- GET /api/v1/identities/{candidate_id}
- GET /api/v1/sources
- GET /api/v1/scores/roles
- GET /api/v1/scores/{candidate_id}?role=ai_researcher
- POST /api/v1/feedback
- POST /api/v1/provenance
- GET /api/v1/research/summary
- GET /api/v1/research/skill-graph/query?skill=python
- GET /api/v1/observability/summary

## Implemented role scoring models

The first explainable scoring models are implemented in `app/services/role_scoring.py`.

Current roles:

- ai_researcher
- systems_engineer
- security_engineer
- data_engineer
- devops_engineer
- fullstack_engineer

Important: these are sourcing signals, not hiring decisions. Scores are transparent and explainable by skills, sources, signals, and publications.

## Source strategy

Current branch supports generic normalized public-source records through:

- POST /tasks/sync/batch
- app/source_contract.py
- examples/seed_public_records.json

This means any safe public-source adapter can output a normalized record and feed the same database/indexing pipeline.

Live adapter modules for every source were not added in this final pass because the connector blocked external profile-fetching modules. The implemented backend still supports those adapters through the batch/source contract.

## Compliance boundaries

This system must not become an uncontrolled crawler.

Operational rules:

- Use public data only.
- Use API-safe adapters only.
- Keep restricted platforms manual.
- Do not infer protected traits.
- Do not rank on protected traits.
- Do not claim verified clearance from public data.
- Preserve evidence URLs and provenance.
- Honor hard erasure requests.

## Local openable links

After running the stack, open:

- http://localhost:8000/db/view
- http://localhost:8000/docs
- http://localhost:8000/api/v1/research/summary
- http://localhost:8000/api/v1/sources
- http://localhost:8000/api/v1/scores/roles

## Quick run

```bash
docker compose up -d postgres redis opensearch ollama
docker compose up -d api worker
python scripts/seed_public_records.py
```

Then open:

```text
http://localhost:8000/db/view
```

## Next build recommendation

The next safe build should focus on:

1. Add Alembic migrations.
2. Add pytest coverage for ingestion, scoring, and API v1.
3. Add 2 to 3 live source adapters only after testing the normalized record path.
4. Add SourcingOS frontend connection to `/search`, `/db/candidates`, and `/api/v1/identities`.
5. Add authentication before exposing any endpoint beyond localhost.

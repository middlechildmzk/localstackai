# Sourcing Intelligence Workspace Backend QA Checklist

## Static checks

Run locally after installing dependencies:

```bash
python -m compileall app
python -m pip check
```

## Local service boot

```bash
docker compose up -d postgres redis opensearch ollama
docker compose up -d api worker
```

Expected:

- Postgres healthy
- Redis healthy
- OpenSearch reachable on port 9200
- FastAPI reachable on port 8000
- Worker connected to Redis queue `ingestion`

## API checks

```bash
curl http://localhost:8000/health
curl http://localhost:8000/ready
```

Expected `/health`:

```json
{"status":"healthy","service":"Sourcing Intelligence Workspace","version":"1.0.0"}
```

Expected `/ready`:

- 200 when database and OpenSearch are both available
- 503 with structured JSON if either dependency is down

## Ingestion smoke test

```bash
curl -X POST http://localhost:8000/tasks/sync/github \
  -H "Content-Type: application/json" \
  -d '{"id":123,"login":"sampledev","name":"Sample Dev","bio":"Python FastAPI Redis PostgreSQL engineer","html_url":"https://github.com/sampledev","location":"Remote"}'
```

Expected:

- HTTP 202
- JSON includes `status: queued` and a Celery `task_id`
- Worker logs show normalization, DB upsert, optional dedupe, OpenSearch index refresh

## Search smoke test

After the worker processes the sample payload:

```bash
curl "http://localhost:8000/search?skills=python,redis&location=remote"
```

Expected:

- JSON includes `total_hits`
- Result includes Sample Dev if indexing completed
- Skills are exact keyword filters
- Location is a scoring boost, not a hard exclusion

## Compliance erasure test

```bash
curl -X POST http://localhost:8000/compliance/erase \
  -H "Content-Type: application/json" \
  -d '{"email":"person@example.com"}'
```

Expected:

- JSON includes `status: completed`
- Response returns only `anonymized_email_hash`, no raw PII
- Audit table receives a hash-only record
- If a matching candidate exists, relational records cascade delete and OpenSearch document is removed

## Guardrail checks

- No restricted platform scraping
- No autonomous outreach
- No verified-clearance claims from public data
- No raw email returned in compliance response
- GitHub ingestion handles unchanged payloads with hash-based skip
- Identity merge threshold remains configurable via `IDENTITY_MATCH_THRESHOLD`

## Known next hardening

- Add Alembic migration revision files
- Add pytest with mocked Postgres/OpenSearch/Redis
- Add source adapters beyond GitHub after the contract stabilizes
- Add API authentication before any public deployment
- Add request tracing and structured JSON logs

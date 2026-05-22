# Sourcing Intelligence Workspace Backend MVP

This branch adds a separate backend foundation for the Sourcing Intelligence Workspace. It does not replace or modify the frontend SourcingOS prototype branch.

## What is included

- FastAPI gateway in `app/main.py`
- SQLAlchemy models in `app/models.py`
- Pooled database lifecycle in `app/db.py`
- Pydantic settings in `app/config.py`
- GitHub profile normalization and skill extraction in `app/ingestion.py`
- Tiered identity resolution in `app/identity.py`
- OpenSearch index lifecycle and bool search in `app/search.py`
- Celery ingestion worker in `app/tasks/worker.py`
- GDPR-style hard erasure workflow in `app/tasks/compliance.py`
- PostgreSQL schema in `schema.sql`
- Local service stack in `docker-compose.yml`
- Runtime dependencies in `requirements.txt`

## Local start

```bash
docker compose up -d postgres redis opensearch ollama
# optional local model pull once Ollama is healthy:
docker exec siw_ollama ollama pull llama3
# then start API and worker:
docker compose up -d api worker
```

If running without Docker:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
celery -A app.tasks.worker.celery_app worker --loglevel=info --queues=ingestion
```

## Dockerfile note

The GitHub connector blocked writing the Dockerfile from ChatGPT. Use this as the local Dockerfile content:

```Dockerfile
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev gcc curl && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Smoke tests

```bash
curl http://localhost:8000/health
curl http://localhost:8000/ready
curl "http://localhost:8000/search?skills=python,redis&location=remote"
```

Queue a GitHub profile payload:

```bash
curl -X POST http://localhost:8000/tasks/sync/github \
  -H "Content-Type: application/json" \
  -d '{"id":123,"login":"sampledev","name":"Sample Dev","bio":"Python FastAPI Redis PostgreSQL engineer","html_url":"https://github.com/sampledev","location":"Remote"}'
```

Compliance erasure smoke test:

```bash
curl -X POST http://localhost:8000/compliance/erase \
  -H "Content-Type: application/json" \
  -d '{"email":"person@example.com"}'
```

## Guardrails

- Public APIs only.
- No restricted platform scraping.
- No autonomous outreach.
- No verified-clearance claims from public data.
- Hard erasure deletes relational records and search index documents, while audit logs store only SHA-256 hashes.

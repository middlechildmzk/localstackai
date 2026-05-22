# SIW Approved Profile and Resume Import Workflow

This workflow lets SourcingOS ingest approved public profiles, pasted resumes, or candidate notes into the Sourcing Intelligence Workspace backend.

## Safety rules

- Use public, user-provided, or approved records only.
- Do not scrape restricted platforms.
- Do not upload sensitive background-check data.
- Do not treat clearance language as verified.
- Any TS/SCI, Secret, Polygraph, or Public Trust phrase is stored only as an unverified breadcrumb.
- Always verify identity, contactability, work authorization, and clearance status through approved employer processes.

## Frontend workflow

1. Run the backend locally.

```bash
docker compose up -d postgres redis opensearch ollama
docker compose up -d api worker
```

2. Open SourcingOS.
3. Go to the `SIW Backend Data` panel.
4. Confirm the API URL is:

```text
http://localhost:8000
```

5. Click `Connect`.
6. Paste approved profile/resume text into the command box.
7. Click `Import Text`.
8. After the worker finishes, click `Load DB`.
9. Use `Search Role` to search backend records against the active role context.
10. Use `Import` on a backend result to bring it into local SourcingOS candidate cards.

## API workflow

Parse and queue one approved text block:

```bash
curl -X POST http://localhost:8000/tasks/import/text \
  -H "Content-Type: application/json" \
  -d '{
    "source_name": "manual_import",
    "queue": true,
    "text": "Candidate Name\nSenior DevOps Engineer\nWashington DC\nKubernetes Terraform AWS TS/SCI"
  }'
```

Parse only, without queueing:

```bash
curl -X POST http://localhost:8000/tasks/import/text \
  -H "Content-Type: application/json" \
  -d '{"queue": false, "text": "Candidate Name\nPython Kubernetes Terraform"}'
```

Queue multiple text blocks:

```bash
curl -X POST http://localhost:8000/tasks/import/text-blocks \
  -H "Content-Type: application/json" \
  -d '{
    "source_name": "manual_import",
    "queue": true,
    "blocks": [
      "Candidate One\nKubernetes Terraform AWS\nWashington DC",
      "Candidate Two\nPython Airflow dbt Snowflake\nRemote US"
    ]
  }'
```

## Search after import

```bash
curl "http://localhost:8000/search?skills=kubernetes,terraform,aws&location=Washington%20DC&q=DevOps&size=25"
```

## View locally

```text
http://localhost:8000/db/view
```

## Notes

The importer is intentionally conservative. It extracts skill hints, location hints, public URLs, and clearance breadcrumbs from approved text. It does not make claims about verified clearance, seniority, or availability unless those are verified in an approved workflow outside the public signal layer.

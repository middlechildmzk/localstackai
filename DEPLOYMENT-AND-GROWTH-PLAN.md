# SIW Deployment and Compliant Growth Plan

## Deployment reality

The frontend can deploy to Vercel as a static SourcingOS UI. The backend cannot fully run on the current Vercel static preview because it depends on:

- FastAPI
- PostgreSQL
- Redis
- OpenSearch
- Celery worker
- optional Ollama local enrichment

Use Vercel for the browser UI and a container/database host for the backend API.

## Recommended production stack

### Option A: Render or Railway MVP

Use this for the fastest hosted test.

Services:

1. Web service: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
2. Worker service: `celery -A app.tasks.worker.celery_app worker --loglevel=info --queues=ingestion --concurrency=2`
3. Managed Postgres
4. Managed Redis
5. Hosted OpenSearch-compatible provider, or temporarily disable OpenSearch and use Postgres search for MVP

Required environment variables:

```text
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
CELERY_BROKER_URL=redis://...
CELERY_RESULT_BACKEND=redis://...
OPENSEARCH_URL=https://...
LOG_LEVEL=INFO
```

### Option B: Fly.io single-machine Docker Compose style

Use this if you want to keep the stack closer to local Docker. Still requires careful volume management and backups.

### Option C: AWS production

Use this when the database becomes important.

- ECS/Fargate or App Runner for API and workers
- RDS Postgres
- ElastiCache Redis
- OpenSearch Service
- S3 for uploaded resumes and evidence snapshots
- CloudWatch logs
- Secrets Manager

## Immediate local deployment commands

```bash
docker compose up -d postgres redis opensearch ollama
docker compose up -d api worker
python scripts/seed_public_records.py
```

Open:

```text
http://localhost:8000/db/view
http://localhost:8000/docs
```

## Public link strategy

1. Deploy frontend to Vercel.
2. Deploy backend API to Render/Railway/Fly/AWS.
3. In SourcingOS frontend, set SIW Backend API base URL to the hosted backend URL.
4. Use the backend panel buttons: Connect, Load DB, Search Role, Import Text, Open DB.

## Data growth policy

Do not build a hidden resume dump crawler or uncontrolled people harvester. The system should grow using lawful, auditable, source-respecting channels.

Allowed channels:

- Candidate-uploaded profile/resume through an opt-in portal
- Recruiter-approved manual imports
- Public API-safe profile sources with rate limits and attribution
- Public conference/speaker pages where indexing is allowed
- Public GitHub user profiles and repos via API
- ORCID/OpenAlex/Semantic Scholar/PubMed-style public research APIs
- Job board applicants who consent to storage and contact
- User-provided resume files or ATS exports that the employer is authorized to process

Blocked channels:

- Hidden resume dumps
- Leaked data
- Credential-protected databases
- Scraping LinkedIn, ClearanceJobs, Indeed, Avature, or other restricted platforms
- Inferring verified clearance from public text
- Mass emailing without opt-out and review
- Protected-class inference or ranking

## Candidate database growth ladder

### Phase 1: 0 to 1,000 records

- Manual approved import
- Candidate upload portal
- GitHub user API sweeps
- Public resume/profile text parser
- Role-specific sweeps with dry-run review

### Phase 2: 1,000 to 10,000 records

- Add ORCID/OpenAlex/PubMed/Semantic Scholar source lanes
- Add conference/speaker list import, manual or API-safe only
- Add job board landing pages and candidate opt-in forms
- Add dedupe review queue
- Add provenance and deletion workflows

### Phase 3: 10,000 to 100,000 records

- Add bulk open-data imports only where licenses allow
- Add source health and refresh scheduler
- Add staleness decay
- Add candidate self-update links
- Add employer/job-board funnel
- Add audit logs and opt-out portal

### Phase 4: 100,000+ records

- Move to managed cloud infrastructure
- Add data governance review
- Add DPA/privacy policy/retention policy
- Add email compliance controls
- Add candidate consent and preference center

## Clearance handling

The database must store these fields separately:

```text
clearance_breadcrumb_level = none | weak | medium | strong
clearance_verified = false by default
clearance_evidence_url = public source URL
clearance_verification_note = manual-only approved process
```

Never label a candidate as verified TS/SCI from public sources alone.

## LinkedIn profile linking

Allowed:

- User manually pastes LinkedIn URL
- Candidate provides LinkedIn URL through opt-in form
- Recruiter imports a LinkedIn URL from an approved internal workflow

Not allowed:

- LinkedIn scraping
- Automated profile extraction
- Browser automation against LinkedIn

## Email engagement

Start with draft-only engagement.

Allowed:

- Draft email from candidate evidence
- Human review before send
- Opt-out language
- Log outreach event manually
- Gmail/SendGrid integration only after compliance review

Not allowed:

- Auto-send at scale
- Emailing scraped addresses without lawful basis
- No unsubscribe mechanism

## Refresh triggers

Refresh candidate profiles when:

- Profile has not been refreshed in 30, 60, or 90 days
- Role search requires updated evidence
- Candidate uploads a new resume
- Recruiter flags stale data
- Source API indicates updated timestamp

Each refresh must preserve provenance, last seen timestamp, and source terms.

## Near-term build recommendation

1. Deploy backend to Render/Railway/Fly.
2. Point Vercel frontend to hosted API.
3. Add candidate upload portal.
4. Add opt-out/delete request page.
5. Add GitHub user sweep dry-run UI.
6. Add Postgres fallback search so OpenSearch is optional for smaller deployments.
7. Add job board landing page and applicant intake forms.

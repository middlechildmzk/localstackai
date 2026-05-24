# StackBuilder AI — V21

> **The AI stack graph for real workflows.** Not another AI tools directory.

Build the right AI stack for your workflow in minutes. Find, compare, save, fork, and share AI tool stacks.

---

## What is StackBuilder AI?

StackBuilder AI answers a different question than every other AI tools site:

> "Which tools should I use **together** for this workflow, what replaces what, what is fresh, what is trusted, and what stack can I ship today?"

The primary product object is the **stack**, not the tool. The relationship data between tools (alternatives, complements, integrations, replacements) is the moat.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Email | Resend |
| Analytics | PostHog (or Plausible) |
| Deployment | Vercel |
| Background Jobs | Vercel Cron |

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo>
cd stackbuilder-v21
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=hello@stackbuilder.ai

NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your-random-secret
```

### 3. Set up Supabase

**Option A: Supabase CLI (recommended)**
```bash
# Install Supabase CLI if needed
brew install supabase/tap/supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

**Option B: Supabase Dashboard**
- Copy the contents of `supabase/migrations/001_initial_schema.sql`
- Paste into the SQL editor in your Supabase dashboard and run

### 4. Seed the database

```bash
npm run db:seed
```

This seeds:
- 10 categories
- 12 tools (ChatGPT, Claude, Runway, Midjourney, Suno, ElevenLabs, Cursor, Zapier, Make, Perplexity, Pika, Notion AI)
- 13 tool relationships (alternatives, complements, integrations)
- 3 workflows (Faceless YouTube, Solopreneur Content Machine, Podcast Production)
- 2 featured stacks

### 5. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage
│   ├── tools/              # Tools directory + detail pages
│   ├── workflows/          # Workflow pages
│   ├── stacks/             # Stack pages + builder
│   ├── compare/            # Comparison pages
│   ├── alternatives/       # Alternatives pages
│   ├── trending/           # Trending launchboard
│   ├── submit/             # Submit tool form
│   ├── claim/              # Claim tool profile
│   ├── newsletter/         # Newsletter signup
│   ├── admin/              # Admin dashboard
│   └── api/                # API routes
│       ├── stacks/         # Stack CRUD + fork
│       ├── newsletter/     # Subscribe
│       ├── submit/         # Tool submission
│       ├── claim/          # Tool claim
│       ├── admin/          # Admin actions (approve/reject)
│       ├── analytics/      # Event logging
│       └── cron/           # Background jobs
├── components/
│   ├── layout/             # Header, Footer, PostHogProvider
│   ├── tools/              # ToolCard, HeroStackSearch
│   ├── stacks/             # StackBuilder, PublicStackCard, ForkButton
│   ├── workflows/          # WorkflowCard
│   ├── admin/              # SubmissionReviewTable, ClaimReviewTable
│   └── ui/                 # NewsletterForm
├── lib/
│   ├── supabase.ts         # Supabase clients
│   ├── analytics.ts        # Event tracking
│   ├── seo.ts              # Metadata + JSON-LD helpers
│   └── utils.ts            # cn, slugify, formatPrice, etc.
├── types/
│   └── index.ts            # All TypeScript types
scripts/
└── seed.ts                 # Database seed script
supabase/
└── migrations/
    └── 001_initial_schema.sql  # Full schema + RLS
```

---

## Database Schema

### Core tables
- `tools` — the tool records with scoring fields
- `categories`, `tags` — taxonomy
- `tool_categories`, `tool_tags` — junction tables
- `tool_relationships` — **the graph**: alternative, complement, replaces, integrates_with, used_with
- `workflows`, `workflow_steps`, `workflow_tools` — workflow pages
- `stacks`, `stack_tools` — user stacks with role_in_stack, data_flow_type
- `profiles` — user profiles

### Moderation
- `submissions` — tool submissions (pending → approved/rejected)
- `claims` — maker claims (pending → approved/rejected)
- `moderation_flags` — community flags
- `admin_audit_log` — every admin action logged

### Freshness
- `source_checks` — link/pricing checks queue
- `freshness_events` — history of changes

### Analytics
- `analytics_events` — all events (tool_view, search, save, stack_create, stack_fork, compare_click, outbound_click, etc.)
- `trending_scores` — denormalized trending scores, computed hourly

### Monetization-ready
- `affiliate_links` — per-tool affiliate URLs
- `sponsorships` — time-boxed sponsored placements
- `newsletter_subscribers` — with source + interests

---

## Scoring Model

**Tool score:**
```
tool_score =
  0.20 × editor_fit
+ 0.15 × verification_score
+ 0.15 × freshness_score
+ 0.15 × stack_usage_score
+ 0.10 × save_velocity
+ 0.08 × click_quality
+ 0.07 × trend_velocity
+ 0.05 × pricing_transparency
+ 0.03 × claim_confidence
+ 0.02 × category_relevance
- spam_risk_penalty
```

**Trending score (recomputed hourly via cron):**
```
trending_score =
  (0.30 × saves_7d
+ 0.25 × clicks_7d
+ 0.20 × stack_adds_7d
+ maker_claim_boost
+ freshness_update_boost
+ new_submission_boost)
× time_decay
- spam_penalty
```

Rule: **votes never drive ranking by themselves.**

---

## API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/stacks/create` | Create a new stack (auth required) |
| `POST` | `/api/stacks/[slug]/fork` | Fork a public stack (auth required) |
| `POST` | `/api/newsletter/subscribe` | Subscribe to newsletter |
| `POST` | `/api/submit` | Submit a new tool |
| `POST` | `/api/claim` | Claim a tool profile (auth required) |
| `PATCH` | `/api/admin/submissions/[id]` | Approve/reject submission (admin) |
| `PATCH` | `/api/admin/claims/[id]` | Approve/reject claim (admin) |
| `POST` | `/api/analytics/event` | Log analytics event |
| `GET` | `/api/cron/trending` | Recompute trending scores (cron) |
| `GET` | `/api/tools/by-slug` | Look up tool by slug |

---

## Analytics Events Logged

| Event | Trigger |
|---|---|
| `tool_view` | Tool detail page load |
| `search` | Search query submitted |
| `save` | Tool/stack saved |
| `stack_create` | Stack saved |
| `stack_fork` | Stack forked |
| `stack_view` | Stack detail page load |
| `compare_click` | Compare page load |
| `outbound_click` | "Visit Site" clicked |
| `submit_tool` | Tool submission sent |
| `claim_tool` | Claim submitted |
| `newsletter_signup` | Newsletter subscribed |
| `workflow_view` | Workflow page load |

---

## Freshness Engine V1

**Allowed sources:**
- Maker submissions
- Official tool websites / pricing pages / changelogs
- Product Hunt API (where allowed)
- GitHub public API
- Affiliate network feeds
- Admin manual updates
- User correction submissions

**Not allowed:**
- Scraping competitor directories
- Copying competitor listings
- Bypassing robots.txt
- Auto-publishing AI-enriched data without human review

**Cron schedule (Vercel Cron):**
- Hourly: recompute trending scores
- Daily: broken link checks (top tools), analytics rollup
- Weekly: pricing checks, freshness checks

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# or via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... etc
```

The `vercel.json` configures the hourly cron job for trending score recomputation.

---

## SEO/GEO Priority Pages

V21 targets high-intent, low-competition pages first:

**Priority 1 — Workflow pages:**
- `/workflows/faceless-youtube-channel`
- `/workflows/solopreneur-content-machine`
- `/workflows/podcast-production-stack`

**Priority 2 — Alternatives pages:**
- `/alternatives/chatgpt`
- `/alternatives/runway`
- `/alternatives/claude`

**Priority 3 — Comparison pages:**
- `/compare/chatgpt-vs-claude`
- `/compare/runway-vs-pika`
- `/compare/zapier-vs-make`

**Priority 4 — Stack pages:**
- `/stacks/faceless-youtube-production-stack`
- `/stacks/solo-founder-marketing-stack`

All pages include JSON-LD structured data and full OpenGraph metadata.

---

## What's Deferred (Not in V21)

- Full autonomous crawler
- Semantic/vector search (Meilisearch/Typesense)
- API/data product
- Buyer intent lead marketplace
- Maker analytics subscription
- Community forum / job board
- User reviews at scale (anti-spam not ready)
- Complex AI recommendation agent

---

## What's Killed

- Generic "browse all AI tools" homepage
- Anonymous upvote-only ranking
- Pay-to-rank systems
- Copied competitor listings
- Massive category bloat
- Auto-publishing pricing changes without review

---

## Monetization Roadmap

**Phase 1 (V21 launch):** Affiliate links, newsletter capture, maker claims  
**Phase 2 (after trust):** Sponsored launchboard slots, verified maker profiles  
**Phase 3 (after data):** Premium stack builder, maker analytics, API access

Sponsored listings are **always labeled**. Rankings are **never for sale**.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Run `npm run lint` before submitting
4. Open a PR

---

## License

MIT

---

## V21.0.1 Patch Notes

This package includes a preview-friendly patch on top of the V21 Claude base.

Added:
- Demo fallback mode when Supabase env vars are missing
- `/compare` hub page
- `/alternatives` hub page
- `/workflows` hub page
- `/stacks` public gallery page
- `/admin/tools` admin overview
- `/admin/analytics` admin overview
- `/api/cron/freshness`
- `/api/cron/recompute-scores`
- `/api/cron/broken-links`
- Expanded `vercel.json` cron schedule

### Preview without Supabase

You can now run the app locally without Supabase credentials. It will use demo seed data for public pages, admin pages, tools, workflows, stacks, alternatives, comparisons, and freshness queues.

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

### Production mode

To use real database data, add these env vars locally and in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
CRON_SECRET=
```

Then run the Supabase migration and seed script:

```bash
npm run db:migrate
npm run db:seed
npm run build
```

### V21.0.1 Architecture Decision

Claude's V21 build remains the primary base. This patch adds preview friendliness and missing hub/admin/cron coverage without replacing Claude's core app structure, schema, stack builder, or API routes.

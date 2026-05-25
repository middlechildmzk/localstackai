# StackBuilder AI V21.6 — Competitor-Ready Build Plan

## Objective
Move StackBuilder AI from a working beta into a competitor-ready workflow-first AI stack platform. The goal is not to become another AI tools directory. The goal is to make StackBuilder feel like Product Hunt energy + G2/Capterra trust + AlternativeTo alternatives + workflow-builder utility.

## Current baseline
- GitHub repo: middlechildmzk/localstackai
- Vercel project: stackbuilder-ai
- Supabase connected and seeded
- Current seed baseline: 12 tools, 3 workflows, 2 stacks, 13 relationships
- Production deploy now reaches READY after public npm lockfile fix
- Existing schema supports tools, categories, tags, relationships, workflows, workflow_steps, workflow_tools, stacks, stack_tools, submissions, claims, analytics, and freshness events

## North star
A visitor should be able to land on the homepage, choose a role or workflow, compare tools, build a stack, save/share it, and trust that listings are fresh and transparent.

## P0: Stability and trust
1. Confirm production deploy is green after every push.
2. Rotate Supabase service role/JWT secret because a key appeared in terminal logs.
3. Update Vercel env vars and local .env.local after rotation.
4. Keep .env.local, node_modules, .next, .vercel, and tsconfig.tsbuildinfo ignored.
5. Keep .npmrc forcing public npm registry.
6. Add a visible demo/admin warning until auth/RLS is fully protected.
7. Confirm submit, claim, newsletter, and admin queue writes hit Supabase.

## P1: Data depth
Target data milestones:
- V21.6a: 25 verified tools, 10 workflows, 10 stacks, 50 relationships
- V21.6b: 50 verified tools, 20 workflows, 25 stacks, 125 relationships
- V21.6c: 100 tools, 50 workflows, 50 stacks, 250 relationships

Priority categories:
- AI chat assistants
- AI writing/content
- AI image generation
- AI video generation
- AI audio/music/voice
- AI automation
- AI research/search
- AI coding/app builders
- AI design/presentation
- AI marketing/social
- AI sales/outreach
- AI recruiting/HR
- AI productivity/meetings

## P2: Product surfaces that make it competitor-ready
### Homepage
- Add role selector: Creator, Solopreneur, Marketer, Agency, Recruiter, Operator
- Add live numbers from Supabase: tools, workflows, stacks, verified updates
- Add "Build a stack in 3 steps" section
- Add "Featured workflow stacks" with visible tool chain chips
- Add "Recently verified" strip

### Tools page
- Add role filter, workflow filter, pricing filter, verified filter
- Add sort options: Best fit, Trending, Recently verified, Most used in stacks
- Add stronger empty states
- Add compare drawer / sticky compare bar
- Add "Add to stack" from every card

### Tool detail page
- Add verdict block: best for / not ideal for / pricing / last verified
- Add workflows using this tool
- Add stacks using this tool
- Add alternatives and complements
- Add claim/correction CTA
- Add JSON-LD SoftwareApplication

### Compare pages
- Add compare picker for any two tools
- Add "winner by workflow" rather than one universal winner
- Add pricing, use case, learning curve, stack fit, alternatives, integrations
- Add FAQ JSON-LD

### Alternatives pages
- Add replacement context: cheaper, easier, open-source, creator-focused, enterprise, automation-friendly
- Add migration notes and "use instead when..."
- Add ItemList JSON-LD

### Workflow pages
- Step-by-step workflow timeline
- Budget/recommended/pro tool options per step
- Estimated monthly cost
- Complexity score
- Output checklist
- "Fork this workflow into a stack"

### Stack builder
- Starter templates by role
- Add/remove/reorder tools
- Monthly cost estimate
- Alternative suggestions per step
- Shareable public stack URL
- OG image later

### Admin/freshness
- Submission queue
- Claim queue
- Freshness queue
- Broken link queue
- Correction queue
- Admin audit log visible

## P3: SEO/GEO clusters
Highest priority page clusters:
1. /for/creators
2. /for/solopreneurs
3. /for/marketers
4. /for/agencies
5. /for/recruiters
6. /workflows/youtube-shorts
7. /workflows/faceless-youtube
8. /workflows/content-repurposing
9. /workflows/ai-music-release
10. /workflows/recruiting-sourcing
11. /alternatives/chatgpt
12. /alternatives/claude
13. /alternatives/runway
14. /alternatives/suno
15. /compare/chatgpt-vs-claude
16. /compare/runway-vs-pika
17. /compare/suno-vs-udio
18. /compare/zapier-vs-make

## P4: Monetization readiness
Do not turn on paid ranking. Monetization should be trust-safe:
1. Affiliate links on outbound CTAs
2. Clearly labeled sponsored nodes
3. Paid launch feature after trust is stable
4. Verified maker profile later
5. Newsletter sponsorship later
6. Maker analytics later

## Acceptance criteria for V21.6
- npm install passes
- npm run build passes
- Vercel deploys READY
- Supabase has at least 25 tools and 10 workflows
- /tools supports usable filters
- /workflows has clear tool chains
- /stacks shows role/cost/tool chain
- /compare and /alternatives pages work for seeded tools
- Admin/submission/newsletter flows write to Supabase
- Core pages have metadata and JSON-LD
- No service keys committed

## Build order
1. Lock deploy stability
2. Rotate Supabase keys
3. Apply 25-tool expansion
4. Improve tool/workflow/stack UI
5. Add role pages
6. Add compare picker and richer compare pages
7. Add alternatives context
8. Apply 50-tool expansion
9. QA competitor benchmark
10. Launch private beta

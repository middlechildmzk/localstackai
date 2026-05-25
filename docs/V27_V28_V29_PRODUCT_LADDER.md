# StackBuilder AI V27–V29 Product Ladder

This document defines the next major build sequence after V21.6. The goal is to turn StackBuilder AI from a working workflow-first beta into a competitor-ready AI tools platform with a defensible stack graph moat.

## Current source of truth
- Repo: middlechildmzk/localstackai
- App: Next.js App Router, TypeScript, Tailwind
- Backend: Supabase/Postgres
- Deploy: Vercel connected to GitHub main
- Current product direction: workflow-first AI tools discovery, comparison, stack-builder, and freshness engine

## V27 — Directory Scale Build

### Goal
Compete with Futurepedia, Toolify, TAAFT, and FutureTools on browse/search experience while keeping StackBuilder differentiated through workflows and stack fit.

### Build priorities
1. Expand Supabase to 100+ high-quality tools.
2. Add category landing pages: /categories/[slug].
3. Add stronger tool cards with pricing, verified status, stack count, fit labels, save/compare/add-to-stack actions.
4. Add search API with q, category, pricing, role, freshness, and sort params.
5. Add role landing pages to main nav and internal links.
6. Add recently verified and trending sections.
7. Add submit/correction CTA on empty states.
8. Add sitemap coverage for tool/category/role/workflow pages.

### Acceptance criteria
- /tools feels like a full AI tools directory, not a simple grid.
- At least 100 tools are visible in Supabase and browseable on /tools.
- Users can filter by category, role, pricing, and sort order.
- Every tool card points toward stack-building utility.

## V28 — Comparison + Alternatives Engine

### Goal
Compete with AlternativeTo, G2, Capterra, SaaSworthy, and high-intent SEO comparison pages.

### Build priorities
1. Build /compare as a hub with picker for any two tools.
2. Build /compare/[tool-a]-vs-[tool-b] pages with workflow-specific verdicts.
3. Build /alternatives/[slug] with replacement contexts:
   - cheaper
   - easier
   - open-source
   - creator-focused
   - enterprise
   - automation-friendly
4. Add comparison matrix fields:
   - pricing
   - free plan
   - best for
   - not ideal for
   - learning curve
   - stack fit
   - integrations
   - freshness
   - claim status
5. Add FAQ JSON-LD and SoftwareApplication JSON-LD.
6. Add migration notes: when to switch, when not to switch, what stack changes.

### Acceptance criteria
- /compare/chatgpt-vs-claude works.
- /compare/runway-vs-pika works.
- /compare/suno-vs-udio works.
- /compare/zapier-vs-make works.
- /alternatives/chatgpt, /alternatives/runway, /alternatives/suno, /alternatives/zapier have useful decision content.

## V29 — Stack Builder Moat Build

### Goal
Make StackBuilder clearly different from generic directories by turning tool discovery into shareable, forkable AI operating systems.

### Build priorities
1. Improve /stacks/new with role templates.
2. Add drag/reorder tool steps.
3. Add monthly cost estimate.
4. Add role-in-stack labels.
5. Add alternative suggestions for each step.
6. Add stack score based on completeness, affordability, freshness, and redundancy.
7. Add fork workflow into stack.
8. Add public stack share pages with OG metadata.
9. Add export/share card.
10. Add stack analytics events.

### Acceptance criteria
- A visitor can build a stack in under 3 minutes.
- Public stack pages explain tool roles, order, cost, and alternatives.
- Stack pages become the product moat and sharing loop.

## Build order
1. Finish V21.6 surface polish.
2. Apply 100-tool SQL expansion.
3. Build V27 directory scale.
4. Build V28 comparison and alternatives engine.
5. Build V29 stack builder moat.
6. Only then consider monetization upgrades.

## Do not build yet
- Scraping competitors
- Unverified review spam
- Pay-to-rank placements
- Autonomous crawler publishing without human review
- Team workspaces
- Paid API access
- Complex personalization

## Strategic reminder
StackBuilder should not win by having the biggest list. It should win because every page answers:
1. What does this tool do?
2. What stack does it belong in?
3. What does it replace or complement?
4. How fresh and trustworthy is the information?
5. Can I fork this into my own workflow?

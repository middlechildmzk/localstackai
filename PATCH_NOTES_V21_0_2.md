# StackBuilder AI V21.0.2 Patch Notes

This patch merges the AI-team QA findings into the V21 clean build.

## Fixed
- Added missing `/admin/moderation` page to resolve admin nav 404.
- Added `/categories/[slug]` redirect and changed tools category filters to `/tools?category=slug`.
- Added demo-mode localStorage/friendly fallback for stack save.
- Added demo-mode messaging for submit, claim, and newsletter flows.
- Added missing demo tools for Pika, Suno, Udio, Flux, Zapier, Make, Notion AI, and Jasper so sitemap/footer comparison and alternatives routes resolve.
- Added admin demo warning banner.
- Added `robots.ts` disallowing `/admin` and `/api` from indexing.
- Removed false “200+ verified AI tools” metadata claim.
- Added `/methodology`, `/privacy`, `/terms`, `/about`, `/contact`, `/claim`, and `/maker` pages.
- Added homepage WebSite/SearchAction JSON-LD.
- Added Compare FAQ JSON-LD and visible FAQ block.
- Added Alternatives ItemList JSON-LD and freshness timestamp.
- Added claim/correction/trust links on tool pages.
- Ensured `ToolCard` is a client component and shows stronger stack/freshness context.

## Still recommended next
- Replace deprecated auth-helper usage fully with `@supabase/ssr` in all authenticated route handlers.
- Add real middleware auth before exposing `/admin` publicly.
- Add dynamic OG images for tools, stacks, comparisons, and workflows.
- Seed to at least 20 tools, 10 workflows, and 10 stack templates before broad launch.
- Add role-to-workflow onboarding and a mobile menu.

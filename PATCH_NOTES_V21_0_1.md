# StackBuilder AI V21.0.1 Patch Notes

This patch keeps Claude's V21 build as the primary base and merges in the missing preview, hub, admin, and cron coverage.

## Added

- Demo fallback data mode when Supabase env vars are missing
- `/compare` hub page
- `/alternatives` hub page
- `/workflows` hub page
- `/stacks` public gallery page
- `/admin/tools` overview
- `/admin/analytics` overview
- `/api/cron/freshness`
- `/api/cron/recompute-scores`
- `/api/cron/broken-links`
- Expanded `vercel.json` cron schedule
- `src/lib/demo-data.ts`
- Safer Supabase client helper that returns demo data when env vars are missing

## Why

Claude's V21 build was the stronger production base. This patch makes it easier to preview immediately while preserving the production Supabase architecture.

## Preview mode

Run without Supabase:

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Production mode

Add env vars:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
CRON_SECRET=
```

Then run:

```bash
npm run db:migrate
npm run db:seed
npm run build
```

## Verification note

TypeScript validation passed with:

```bash
npx tsc --noEmit
```

In the sandbox, `next build` completed compile and type-check stages, then timed out during Next.js page-data collection. The patch itself has no TypeScript errors. Re-run `npm run build` locally or in Vercel after installing dependencies.

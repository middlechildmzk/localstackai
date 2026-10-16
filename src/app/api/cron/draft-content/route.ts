import { NextResponse } from "next/server";
import { createServerClient, hasSupabaseServiceConfig } from "@/lib/supabase";
import { generateContentDrafts } from "../../../../../scripts/content/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Loop 4 — Content agent (daily).
 *
 * Builds draft articles FROM graph data only (tools, tool_relationships,
 * categories, workflows) and inserts them into `content_drafts` with
 * status 'draft'. A human reviews in /admin/drafts — nothing publishes
 * autonomously.
 *
 * Cap: 3 drafts per run. Slug-deduped against existing drafts.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      message: "Content-draft cron skipped because Supabase env vars are not configured.",
    });
  }

  const supabase = createServerClient();
  try {
    const summary = await generateContentDrafts(supabase, 3);
    return NextResponse.json({
      ok: true,
      loop: "content-agent",
      created: summary.created,
      skipped: summary.skipped,
      errors: summary.errors,
      ran_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[cron/draft-content]", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createServerClient, hasSupabaseServiceConfig } from "@/lib/supabase";
import {
  composeDigest,
  composeSocialDrafts,
  type DigestTool,
} from "@/lib/email/digest";

/**
 * Loop 5 — Distribution agent (daily, 6:30 AM CT).
 *
 * Compiles the "5 fresh tools" email from trending + newly verified tools
 * and queues 3 social post drafts. DRAFTS ONLY — nothing sends, nothing
 * posts. A human approves in /admin/digests.
 *
 * Rank pipeline is blind to money by construction: the queries below never
 * read `is_sponsored` or `sponsorships`.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  // Auth: accept either header style used by the other cron routes.
  const bearer = req.headers.get("authorization");
  const legacy = req.headers.get("x-cron-secret");
  if (
    process.env.CRON_SECRET &&
    bearer !== `Bearer ${process.env.CRON_SECRET}` &&
    legacy !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      message:
        "Digest skipped because Supabase env vars are not configured. Drafts are not generated in demo mode.",
    });
  }

  const supabase = createServerClient();

  // ── Trending tools (joined to tools, published only) ──────────────────
  // Note: no reference to is_sponsored / sponsorships anywhere here.
  const { data: trendingRows, error: trendErr } = await supabase
    .from("trending_scores")
    .select(
      `tool_id, saves_7d, clicks_7d, stack_adds_7d, trending_score,
       tools!inner(id, slug, name, tagline, pricing_model, freshness, last_verified_at, created_at)`
    )
    .order("trending_score", { ascending: false })
    .limit(10);

  if (trendErr) {
    console.error("[cron/digest] trending query failed", trendErr);
    return NextResponse.json({ error: "Trending query failed" }, { status: 500 });
  }

  const trendingTools: DigestTool[] = ((trendingRows ?? []) as any[])
    .filter((r) => r.tools)
    .map((r) => ({
      id: r.tools.id,
      slug: r.tools.slug,
      name: r.tools.name,
      tagline: r.tools.tagline,
      pricing_model: r.tools.pricing_model,
      freshness: r.tools.freshness,
      last_verified_at: r.tools.last_verified_at,
      created_at: r.tools.created_at,
      saves_7d: Number(r.saves_7d ?? 0),
      clicks_7d: Number(r.clicks_7d ?? 0),
      stack_adds_7d: Number(r.stack_adds_7d ?? 0),
    }));

  // ── Newly verified tools (verified in the last 7 days, published) ────
  const since = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();
  const { data: verifiedRows } = await supabase
    .from("tools")
    .select(
      "id, slug, name, tagline, pricing_model, freshness, last_verified_at, created_at"
    )
    .eq("is_published", true)
    .gte("last_verified_at", since)
    .order("last_verified_at", { ascending: false })
    .limit(10);

  const verifiedTools: DigestTool[] = ((verifiedRows ?? []) as any[]).map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    pricing_model: t.pricing_model,
    freshness: t.freshness,
    last_verified_at: t.last_verified_at,
    created_at: t.created_at,
    saves_7d: 0,
    clicks_7d: 0,
    stack_adds_7d: 0,
  }));

  // ── Merge: trending first, fill with newly verified, dedupe ───────────
  const seen = new Set<string>();
  const picks: DigestTool[] = [];
  for (const t of [...trendingTools, ...verifiedTools]) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    picks.push(t);
    if (picks.length >= 5) break;
  }

  if (picks.length === 0) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      message: "No trending or newly verified tools this run — no draft created.",
    });
  }

  // ── Compose + store the digest draft ──────────────────────────────────
  const draft = composeDigest(picks);
  if (!draft) {
    return NextResponse.json({ ok: true, skipped: true, message: "Nothing to say." });
  }

  const { data: digestRow, error: digestErr } = await supabase
    .from("digest_drafts")
    .insert({ subject: draft.subject, body_html: draft.body_html, tool_ids: draft.tool_ids })
    .select("id")
    .single();

  if (digestErr) {
    console.error("[cron/digest] digest insert failed", digestErr);
    return NextResponse.json({ error: "Digest draft insert failed" }, { status: 500 });
  }

  // ── Social drafts (3 max): launch, spotlight, comparison teaser ───────
  const topTool = picks[0] ?? null;

  // Spotlight: most-saved public stack, with its tools (real data only).
  let spotlightStack: {
    title: string;
    slug: string;
    toolNames: string[];
  } | null = null;
  const { data: stackRows } = await supabase
    .from("stacks")
    .select("id, title, slug")
    .eq("visibility", "public")
    .order("save_count", { ascending: false })
    .limit(1);
  const topStack = (stackRows ?? [])[0];
  if (topStack) {
    const { data: stackTools } = await supabase
      .from("stack_tools")
      .select("tool_id, tools!inner(name)")
      .eq("stack_id", topStack.id)
      .limit(5);
    spotlightStack = {
      title: topStack.title,
      slug: topStack.slug,
      toolNames: ((stackTools ?? []) as any[])
        .map((st) => st.tools?.name)
        .filter(Boolean),
    };
  }

  // Comparison teaser: a real 'alternative' relationship off the top tool.
  let comparePair: {
    aName: string;
    aSlug: string;
    bName: string;
    bSlug: string;
  } | null = null;
  if (topTool) {
    const { data: relRows } = await supabase
      .from("tool_relationships")
      .select("target_tool_id, tools!tool_relationships_target_tool_id_fkey(name, slug)")
      .eq("source_tool_id", topTool.id)
      .eq("relationship_type", "alternative")
      .limit(1);
    const rel = (relRows ?? [])[0] as any;
    if (rel?.tools) {
      comparePair = {
        aName: topTool.name,
        aSlug: topTool.slug,
        bName: rel.tools.name,
        bSlug: rel.tools.slug,
      };
    }
  }

  const socialDrafts = composeSocialDrafts({ topTool, spotlightStack, comparePair });

  const socialIds: string[] = [];
  for (const d of socialDrafts) {
    const { data, error } = await supabase
      .from("social_drafts")
      .insert({ platform: d.platform, body: d.body, tool_id: d.tool_id })
      .select("id")
      .single();
    if (error) {
      console.error("[cron/digest] social draft insert failed", error);
      continue;
    }
    socialIds.push(data.id);
  }

  return NextResponse.json({
    ok: true,
    mode: "draft-only",
    digest_id: digestRow.id,
    digest_subject: draft.subject,
    tool_ids: draft.tool_ids,
    social_draft_ids: socialIds,
    note: "Drafts created. Nothing sent, nothing posted. Approve in /admin/digests.",
  });
}

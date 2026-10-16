import { NextResponse } from "next/server";
import { createServerClient, hasSupabaseServiceConfig } from "@/lib/supabase";
import { runDiscovery } from "../../../../../scripts/discovery/discover";
import { dedupeCandidates } from "../../../../../scripts/discovery/dedupe";
import type { ToolCandidate } from "../../../../../scripts/discovery/types";

/**
 * Loop 1 — Discovery agent cron (daily, 6:00 AM CT).
 *
 * Runs the discovery sources, dedupes against the tools table (name trigram +
 * domain match), and queues NEW tools as `submissions` rows with
 * status='pending' for human review in /admin.
 *
 * HARD BOUNDARIES enforced here:
 *  - NEVER inserts into `tools` and NEVER sets `is_published`. This route only
 *    SELECTs from `tools` and INSERTs into `submissions` (status pending).
 *  - NEVER reads or writes `is_sponsored` / `sponsorships`. The dedupe code
 *    only looks at id/name/website_url.
 *  - Kill rule: if duplicates are >30% of candidates, ALL inserts are skipped
 *    and the run reports { killed: true } so sources get retuned instead of
 *    spamming the review queue.
 */

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const DISCOVERY_SUBMITTER_EMAIL = "discovery-agent@stackbuilder";
/** Fraction of candidates that are duplicates above which the run is killed. */
const KILL_THRESHOLD = 0.3;
/** Cap on submissions inserted per run — queue hygiene. */
const MAX_INSERTS_PER_RUN = 25;

function buildSubmissionDescription(c: ToolCandidate): string {
  const lines: string[] = [];
  if (c.description) lines.push(c.description.trim().slice(0, 800));
  else if (c.tagline) lines.push(c.tagline.trim().slice(0, 300));
  lines.push("");
  lines.push("—");
  lines.push(`Discovered by the StackBuilder discovery agent via ${c.source}.`);
  lines.push(`Evidence (source listing): ${c.sourceUrl}`);
  lines.push(`Tool URL as seen at source: ${c.url}`);
  lines.push("Status: unverified sighting — human review required before this becomes a tool.");
  return lines.join("\n");
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const demoMode = !hasSupabaseServiceConfig();

  // 1. Run sources (public endpoints only; each source degrades independently).
  const batch = await runDiscovery();
  const totalCandidates = batch.candidates.length + batch.intraBatchDuplicates.length;

  if (demoMode) {
    // Demo-mode fallback: run discovery + dedupe against nothing, insert nothing.
    // Mirrors the sibling cron routes' "skip without Supabase" contract while
    // still proving the sources work.
    const { duplicates } = dedupeCandidates(batch.candidates, []);
    return NextResponse.json({
      ok: true,
      mode: "demo",
      message: "Discovery ran in demo mode: sources fetched, no DB dedupe or inserts performed.",
      candidates: totalCandidates,
      unique: batch.candidates.length - duplicates.length,
      duplicates: duplicates.length,
      sources: batch.sourceResults.map((s) => ({
        source: s.source,
        candidates: s.candidates.length,
        degraded: s.degraded ?? null,
      })),
    });
  }

  const supabase = createServerClient();

  // 2. Load existing tools for dedupe (id/name/website_url ONLY — never
  //    is_sponsored or sponsorships; the rank pipeline stays blind to money).
  const { data: tools, error: toolsError } = await supabase
    .from("tools")
    .select("id,name,website_url")
    .limit(5000);
  if (toolsError) return NextResponse.json({ error: toolsError.message }, { status: 500 });

  // 3. Also dedupe against already-pending submissions so reruns don't pile up
  //    the same sighting in the review queue.
  const { data: pending, error: pendingError } = await supabase
    .from("submissions")
    .select("tool_name,tool_url")
    .eq("status", "pending")
    .limit(2000);
  if (pendingError) return NextResponse.json({ error: pendingError.message }, { status: 500 });

  const { unique, duplicates } = dedupeCandidates(batch.candidates, [
    ...(tools ?? []).map((t: any) => ({ id: t.id, name: t.name, website_url: t.website_url ?? null })),
    ...(pending ?? []).map((p: any, i: number) => ({
      id: `pending-${i}`,
      name: p.tool_name,
      website_url: p.tool_url ?? null,
    })),
  ]);
  const duplicateCount = duplicates.length + batch.intraBatchDuplicates.length;

  // 4. Kill rule: >30% duplicates => skip ALL inserts, report, retune sources.
  if (totalCandidates > 0 && duplicateCount / totalCandidates > KILL_THRESHOLD) {
    return NextResponse.json({
      ok: true,
      killed: true,
      reason:
        `Duplicate rate ${(100 * duplicateCount / totalCandidates).toFixed(1)}% exceeded ` +
        `30% threshold — no submissions queued. Retune sources instead of spamming the review queue.`,
      candidates: totalCandidates,
      duplicates: duplicateCount,
      duplicateRate: duplicateCount / totalCandidates,
      sources: batch.sourceResults.map((s) => ({
        source: s.source,
        candidates: s.candidates.length,
        degraded: s.degraded ?? null,
      })),
    });
  }

  // 5. Queue new tools as pending submissions. NEVER touches the tools table.
  const toInsert = unique.slice(0, MAX_INSERTS_PER_RUN);
  const rows = toInsert.map((c) => ({
    submitter_email: DISCOVERY_SUBMITTER_EMAIL,
    tool_name: c.name.slice(0, 200),
    tool_url: c.url.slice(0, 2000),
    tagline: c.tagline?.slice(0, 300) ?? null,
    description: buildSubmissionDescription(c),
    status: "pending" as const,
  }));

  let inserted = 0;
  let insertError: string | null = null;
  if (rows.length > 0) {
    const { data, error } = await supabase.from("submissions").insert(rows).select("id");
    if (error) insertError = error.message;
    else inserted = data?.length ?? 0;
  }

  if (insertError) return NextResponse.json({ error: insertError }, { status: 500 });

  return NextResponse.json({
    ok: true,
    killed: false,
    candidates: totalCandidates,
    duplicates: duplicateCount,
    queued: inserted,
    skippedOverCap: unique.length - toInsert.length,
    sources: batch.sourceResults.map((s) => ({
      source: s.source,
      candidates: s.candidates.length,
      tookMs: s.tookMs,
      degraded: s.degraded ?? null,
    })),
  });
}

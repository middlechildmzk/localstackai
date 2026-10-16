import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createServerClient, hasSupabaseServiceConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// 25 pages × 10s timeout worst case, concurrency 5 → ~50s fetch worst case.
export const maxDuration = 300;

const FETCH_TIMEOUT_MS = 10_000;
const BATCH_SIZE = 25;
const CONCURRENCY = 5;
const BATCH_DELAY_MS = 300;
const MAX_BODY_BYTES = 1_000_000;
// Length delta above this counts as a material page change.
const MATERIAL_LENGTH_DELTA = 0.25;

const USER_AGENT = "StackBuilderAI/1.0 (automated freshness-checker)";

/** Pricing signals we scan a page for; stored as a set so we can diff runs. */
const PRICING_KEYWORDS = [
  "free plan",
  "free trial",
  "freemium",
  "pricing",
  "per month",
  "/month",
  "/mo",
  "per user",
  "per seat",
  "annual",
  "lifetime deal",
  "contact sales",
  "enterprise",
  "open source",
];

interface PageSnapshot {
  hash: string;
  length: number;
  pricingKeywords: string[];
}

interface FreshnessResult {
  checkType: "pricing" | "general";
  status: "ok" | "changed" | "error";
  notes: string;
  snapshot?: PageSnapshot;
  eventType?: string;
  eventOld?: string;
  eventNew?: string;
  markStale?: boolean;
  markVerified?: boolean;
}

/** Encode a snapshot in source_checks.notes so the next run can diff it. */
function encodeSnapshot(s: PageSnapshot): string {
  return `hash=${s.hash} len=${s.length} pricing=[${s.pricingKeywords.join(",")}]`;
}

/** Parse a snapshot back out of notes written by encodeSnapshot(). */
function decodeSnapshot(notes: string | null | undefined): PageSnapshot | null {
  if (!notes) return null;
  const m = /hash=([0-9a-f]{16}) len=(\d+) pricing=\[(.*?)\]/.exec(notes);
  if (!m) return null;
  return {
    hash: m[1],
    length: Number(m[2]),
    pricingKeywords: m[3] ? m[3].split(",").filter(Boolean) : [],
  };
}

async function fetchPageText(url: string): Promise<{ html: string; finalUrl: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,*/*",
        "Accept-Language": "en-US,en;q=0.8",
      },
    });
    if (res.status >= 400) {
      throw new Error(`HTTP ${res.status}`);
    }
    const reader = res.body?.getReader();
    if (!reader) {
      const buf = await res.arrayBuffer();
      return { html: Buffer.from(buf.slice(0, MAX_BODY_BYTES)).toString("utf8"), finalUrl: res.url };
    }
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      received += value.byteLength;
      if (received >= MAX_BODY_BYTES) break;
    }
    reader.releaseLock();
    await res.body?.cancel().catch(() => {});
    const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    return { html: buf.toString("utf8"), finalUrl: res.url };
  } finally {
    clearTimeout(timer);
  }
}

/** Strip scripts/styles/tags, collapse whitespace — stable text for hashing. */
function normalizeText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function snapshotPage(html: string): PageSnapshot {
  const text = normalizeText(html);
  const lower = text; // normalizeText already lowercases
  const keywords = PRICING_KEYWORDS.filter((k) => lower.includes(k));
  return {
    hash: createHash("sha256").update(text).digest("hex").slice(0, 16),
    length: text.length,
    pricingKeywords: keywords,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Run `fn` over `items` with bounded concurrency; one failure never kills the run. */
async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    for (;;) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );
  return results;
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((x) => set.has(x));
}

export async function GET(req: Request) {
  const startedAt = Date.now();
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      message: "Freshness cron skipped because Supabase env vars are not configured.",
    });
  }

  const supabase = createServerClient();

  // 1) Least-recently-verified published tools first.
  const { data: tools, error } = await supabase
    .from("tools")
    .select("id,slug,name,website_url,freshness,last_verified_at")
    .eq("is_published", true)
    .order("last_verified_at", { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE + 50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const queue = (tools ?? [])
    .filter((t: any) => typeof t.website_url === "string" && t.website_url.startsWith("http"))
    .slice(0, BATCH_SIZE);
  const skipped = (tools ?? []).length - queue.length;

  // 2) Load the most recent snapshot per tool (from our own notes column).
  let prevByTool = new Map<string, PageSnapshot>();
  try {
    const { data: prev } = await supabase
      .from("source_checks")
      .select("tool_id,notes,checked_at")
      .in("tool_id", queue.map((t: any) => t.id))
      .in("check_type", ["general", "pricing"])
      .order("checked_at", { ascending: false })
      .limit(queue.length * 4);
    for (const row of prev ?? []) {
      if (!prevByTool.has(row.tool_id)) {
        const snap = decodeSnapshot(row.notes);
        if (snap) prevByTool.set(row.tool_id, snap);
      }
    }
  } catch (err) {
    console.error("[freshness] previous-snapshot lookup failed; using baselines", err);
  }

  let checked = 0;
  let changed = 0;
  let errors = 0;

  const processTool = async (tool: any) => {
    const url: string = tool.website_url;
    const now = new Date().toISOString();
    let result: FreshnessResult;

    try {
      const { html, finalUrl } = await fetchPageText(url);
      const snap = snapshotPage(html);
      const prev = prevByTool.get(tool.id);

      if (!prev) {
        // First observed snapshot — record the baseline, nothing to diff.
        result = {
          checkType: snap.pricingKeywords.length > 0 ? "pricing" : "general",
          status: "ok",
          notes: `baseline recorded. ${encodeSnapshot(snap)}`,
          snapshot: snap,
          markVerified: true,
        };
      } else {
        const pricingChanged = !sameSet(prev.pricingKeywords, snap.pricingKeywords);
        const lenDelta =
          prev.length > 0 ? Math.abs(snap.length - prev.length) / prev.length : 0;
        const material =
          pricingChanged || (snap.hash !== prev.hash && lenDelta > MATERIAL_LENGTH_DELTA);

        if (material) {
          const kind = pricingChanged ? "pricing" : "general";
          result = {
            checkType: kind,
            status: "changed",
            notes: `page changed (${kind}). ${encodeSnapshot(snap)}`,
            snapshot: snap,
            eventType: pricingChanged ? "pricing_change_suspected" : "content_changed",
            eventOld: encodeSnapshot(prev),
            eventNew: encodeSnapshot(snap),
            markStale: true,
          };
        } else {
          result = {
            checkType: "general",
            status: "ok",
            notes: snap.hash === prev.hash
              ? `no change. ${encodeSnapshot(snap)}`
              : `minor change (len delta ${(lenDelta * 100).toFixed(1)}%), hash refreshed. ${encodeSnapshot(snap)}`,
            snapshot: snap,
            markVerified: true,
          };
        }
      }
      if (finalUrl !== url) {
        result.notes += ` final_url=${finalUrl.slice(0, 200)}`;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result = {
        checkType: "general",
        status: "error",
        notes: `fetch failed: ${msg.slice(0, 500)}`,
        markStale: true,
      };
    }

    // 3) Write the evidence: source_checks row (always), freshness_events on
    //    change/error, tool row update for the freshness enum + verified stamp.
    try {
      const { error: insertErr } = await supabase.from("source_checks").insert({
        tool_id: tool.id,
        check_type: result.checkType,
        source_url: url,
        status: result.status,
        notes: result.notes.slice(0, 1000),
        checked_at: now,
      });
      if (insertErr) console.error("[freshness] source_checks insert failed", insertErr);
    } catch (err) {
      console.error("[freshness] source_checks insert threw", err);
    }

    if (result.status !== "ok" && result.eventType) {
      try {
        const { error: eventErr } = await supabase.from("freshness_events").insert({
          tool_id: tool.id,
          event_type: result.eventType,
          old_value: result.eventOld?.slice(0, 1000) ?? null,
          new_value: result.eventNew?.slice(0, 1000) ?? null,
          source: "freshness_cron",
        });
        if (eventErr) console.error("[freshness] freshness_events insert failed", eventErr);
      } catch (err) {
        console.error("[freshness] freshness_events insert threw", err);
      }
    }

    if (result.status === "error") {
      // Even a fetch failure is evidence worth recording for the admin queue.
      try {
        const { error: eventErr } = await supabase.from("freshness_events").insert({
          tool_id: tool.id,
          event_type: "verification_failed",
          old_value: url,
          new_value: result.notes.slice(0, 1000),
          source: "freshness_cron",
        });
        if (eventErr) console.error("[freshness] freshness_events insert failed", eventErr);
      } catch (err) {
        console.error("[freshness] freshness_events insert threw", err);
      }
    }

    try {
      const update: Record<string, unknown> = {};
      if (result.markStale) update.freshness = "stale";
      if (result.markVerified) {
        update.freshness = "verified";
        update.last_verified_at = now;
      }
      if (Object.keys(update).length > 0) {
        const { error: updErr } = await supabase.from("tools").update(update).eq("id", tool.id);
        if (updErr) console.error("[freshness] tools update failed", updErr);
      }
    } catch (err) {
      console.error("[freshness] tools update threw", err);
    }

    if (result.status === "ok") checked += 1;
    else if (result.status === "changed") changed += 1;
    else errors += 1;
  };

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const batch = queue.slice(i, i + CONCURRENCY);
    await mapPool(batch, CONCURRENCY, processTool);
    if (i + CONCURRENCY < queue.length) await sleep(BATCH_DELAY_MS);
  }

  return NextResponse.json({
    ok: true,
    checked,
    changed,
    errors,
    broken: 0, // link-dead detection is the broken-links cron's job
    skipped,
    duration_ms: Date.now() - startedAt,
  });
}

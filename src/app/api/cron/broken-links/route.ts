import { NextResponse } from "next/server";
import { createServerClient, hasSupabaseServiceConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Allow the run to take a while: 50 sites × 10s timeout worst case, run in
// batches of 5 → ~100s worst case. Vercel plan limits apply at deploy time.
export const maxDuration = 300;

const FETCH_TIMEOUT_MS = 10_000;
const BATCH_SIZE = 50;
const CONCURRENCY = 5;
const BATCH_DELAY_MS = 300;
// Don't re-check links we checked recently — oldest-checked first.
const RECHECK_WINDOW_DAYS = 7;
// Cap how much of a page we download; a link check only needs status + a
// small sniff of the body.
const MAX_BODY_BYTES = 1_000_000;

const USER_AGENT = "StackBuilderAI/1.0 (automated link-checker)";

type LinkStatus = "ok" | "broken" | "error";

interface LinkCheckResult {
  status: LinkStatus;
  detail: string;
}

/**
 * HEAD requests are frequently blocked or lie; a bounded GET gives a true
 * status. Body is capped to MAX_BODY_BYTES and then discarded.
 */
async function checkLink(url: string): Promise<LinkCheckResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,*/*",
        "Accept-Language": "en-US,en;q=0.8",
      },
    });

    // Drain (bounded) so connections are reused; content is irrelevant here.
    try {
      const reader = res.body?.getReader();
      if (reader) {
        let received = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done || !value) break;
          received += value.byteLength;
          if (received >= MAX_BODY_BYTES) break;
        }
        reader.releaseLock();
        await res.body?.cancel().catch(() => {});
      } else {
        await res.arrayBuffer().catch(() => {});
      }
    } catch {
      // Body drain failure after headers is non-fatal; status is what matters.
    }

    const code = res.status;
    if (code >= 200 && code < 400) {
      return { status: "ok", detail: `HTTP ${code} (final URL: ${res.url.slice(0, 200)})` };
    }
    // 403/429/5xx against bots and transient 5xx are "error" (retry next run),
    // not proof the link is dead.
    if (code === 403 || code === 429 || code >= 500) {
      return { status: "error", detail: `HTTP ${code} — inconclusive, will retry` };
    }
    // 404/410 and other 4xx mean the page is gone or refuses the resource.
    return { status: "broken", detail: `HTTP ${code}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (controller.signal.aborted) {
      return { status: "error", detail: `timeout after ${FETCH_TIMEOUT_MS / 1000}s` };
    }
    return { status: "error", detail: `fetch failed: ${msg.slice(0, 200)}` };
  } finally {
    clearTimeout(timer);
  }
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
      message: "Broken-link cron skipped because Supabase env vars are not configured.",
    });
  }

  const supabase = createServerClient();

  // 1) Skip tools whose links were checked within the recency window.
  let recentlyChecked = new Set<string>();
  try {
    const since = new Date(Date.now() - RECHECK_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("source_checks")
      .select("tool_id")
      .eq("check_type", "link")
      .gte("checked_at", since)
      .limit(1000);
    recentlyChecked = new Set((recent ?? []).map((r: any) => r.tool_id));
  } catch (err) {
    console.error("[broken-links] recent-checks lookup failed; proceeding without it", err);
  }

  // 2) Oldest-verified published tools with a website_url first.
  const { data: tools, error } = await supabase
    .from("tools")
    .select("id,slug,name,website_url,last_verified_at")
    .eq("is_published", true)
    .not("website_url", "is", null)
    .order("last_verified_at", { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE + 100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const withUrl = (tools ?? []).filter(
    (t: any) => typeof t.website_url === "string" && t.website_url.startsWith("http")
  );
  const queue = withUrl
    .filter((t: any) => !recentlyChecked.has(t.id))
    .slice(0, BATCH_SIZE);
  const skipped = withUrl.length - queue.length;

  let checked = 0;
  let broken = 0;
  let errors = 0;

  const processTool = async (tool: any) => {
    const url: string = tool.website_url;
    let result: LinkCheckResult;
    try {
      result = await checkLink(url);
    } catch (err) {
      // Belt-and-braces: checkLink already catches internally, but never let
      // one URL kill the run.
      result = {
        status: "error",
        detail: `unexpected: ${(err instanceof Error ? err.message : String(err)).slice(0, 200)}`,
      };
    }

    const now = new Date().toISOString();
    try {
      const { error: insertErr } = await supabase.from("source_checks").insert({
        tool_id: tool.id,
        check_type: "link",
        source_url: url,
        status: result.status,
        notes: `[link-check] ${result.detail}`.slice(0, 1000),
        checked_at: now,
      });
      if (insertErr) console.error("[broken-links] source_checks insert failed", insertErr);
    } catch (err) {
      console.error("[broken-links] source_checks insert threw", err);
    }

    if (result.status !== "ok") {
      // A broken or erroring link is a freshness signal for the admin queue.
      try {
        const { error: eventErr } = await supabase.from("freshness_events").insert({
          tool_id: tool.id,
          event_type: result.status === "broken" ? "link_broken" : "link_check_failed",
          old_value: url,
          new_value: result.detail.slice(0, 1000),
          source: "broken_links_cron",
        });
        if (eventErr) console.error("[broken-links] freshness_events insert failed", eventErr);
      } catch (err) {
        console.error("[broken-links] freshness_events insert threw", err);
      }
    }

    if (result.status === "ok") checked += 1;
    else if (result.status === "broken") broken += 1;
    else errors += 1;
  };

  // Process in batches with a short polite gap between batches so shared
  // hosts (and our egress) aren't hammered.
  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const batch = queue.slice(i, i + CONCURRENCY);
    await mapPool(batch, CONCURRENCY, processTool);
    if (i + CONCURRENCY < queue.length) await sleep(BATCH_DELAY_MS);
  }

  // `checked` counts clean links; `broken` definite dead links; `errors`
  // inconclusive (timeout / bot-block / 5xx) — retried on a later run.

  return NextResponse.json({
    ok: true,
    checked,
    broken,
    errors,
    skipped,
    duration_ms: Date.now() - startedAt,
  });
}

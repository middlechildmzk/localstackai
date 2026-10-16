/**
 * StackBuilder AI — Discovery source: Product Hunt (public, unauthenticated).
 *
 * STATUS — DEGRADED BY DESIGN (verified 2026-10-15):
 * Product Hunt exposes no unauthenticated feed. Their GraphQL endpoint
 * rejects requests without a session token ("This request could not be
 * processed"), and the topics/leaderboard pages are fully client-rendered —
 * the served HTML contains zero embedded post data (no __NEXT_DATA__, no
 * /posts/ anchors). There is no public sitemap.xml or Atom feed.
 *
 * This module therefore:
 *  1. Attempts the public topic/leaderboard pages and extracts embedded post
 *     JSON if Product Hunt ever server-renders it again (future-proof, cheap).
 *  2. Otherwise returns [] with a `degraded` note, so the cron keeps working
 *     and the admin sees exactly why this lane is quiet.
 *
 * Retune options if this lane matters: an official PH API token (Dan's call —
 * needs a Product Hunt developer account), or replacing this source with a
 * public launch aggregator that offers an unauthenticated feed.
 */

import { fetchText, politeDelay } from "../http.ts";
import type { SourceResult, ToolCandidate } from "../types.ts";

const PAGES = [
  "https://www.producthunt.com/topics/artificial-intelligence",
  "https://www.producthunt.com/topics/ai-agents",
  "https://www.producthunt.com/leaderboard",
];

/**
 * Best-effort extraction of embedded post objects. Matches JSON blobs like
 * {"name":"...","tagline":"..."} that appear near a producthunt.com/posts/ URL.
 * Returns [] when the page carries no such data (the current steady state).
 */
function extractEmbeddedPosts(html: string): ToolCandidate[] {
  const out: ToolCandidate[] = [];
  const seen = new Set<string>();

  // Pattern A: post objects with an explicit posts/ URL nearby.
  const withUrl = /https?:\/\/(?:www\.)?producthunt\.com\/posts\/([a-z0-9\-]+)[\s\S]{0,400\}?"name"\s*:\s*"([^"\\]{2,80})"\s*,\s*"tagline"\s*:\s*"([^"\\]{0,200})"/gi;
  let m: RegExpExecArray | null;
  while ((m = withUrl.exec(html)) !== null) {
    const slug = m[1];
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push({
      name: m[2],
      url: `https://www.producthunt.com/posts/${slug}`,
      tagline: m[3] || undefined,
      source: "producthunt",
      sourceUrl: `https://www.producthunt.com/posts/${slug}`,
    });
  }

  // Pattern B: bare /posts/<slug> anchors paired with link text (server-rendered cards).
  const anchors = /<a[^>]+href="(\/posts\/[a-z0-9\-]+)"[^>]*>([^<]{2,80})<\/a>/gi;
  while ((m = anchors.exec(html)) !== null) {
    const slug = m[1].replace("/posts/", "");
    if (seen.has(slug)) continue;
    const name = m[2].trim();
    if (!name || /^(launches|topics|leaderboard|more)$/i.test(name)) continue;
    seen.add(slug);
    out.push({
      name,
      url: `https://www.producthunt.com/posts/${slug}`,
      source: "producthunt",
      sourceUrl: `https://www.producthunt.com/posts/${slug}`,
    });
  }

  return out;
}

export async function fetchProductHuntCandidates(): Promise<SourceResult> {
  const started = Date.now();
  const candidates: ToolCandidate[] = [];
  let degraded: string | undefined;

  for (const page of PAGES) {
    try {
      const html = await fetchText(page);
      for (const c of extractEmbeddedPosts(html)) {
        if (!candidates.some((k) => k.url === c.url)) candidates.push(c);
      }
    } catch (err) {
      degraded = `Product Hunt page fetch failed (${err instanceof Error ? err.message : String(err)}); tried remaining pages.`;
      continue;
    }
    await politeDelay(1500);
  }

  if (candidates.length === 0 && !degraded) {
    degraded =
      "Product Hunt serves no unauthenticated post feed (GraphQL requires a session token; " +
      "topic/leaderboard HTML is client-rendered with no embedded post data). " +
      "Lane is wired but yields nothing — retune or add an API token before expecting results.";
  }

  return { source: "producthunt", candidates, degraded, tookMs: Date.now() - started };
}

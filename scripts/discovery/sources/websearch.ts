/**
 * StackBuilder AI — Discovery source: web search result pages (public, unauthenticated).
 *
 * Uses the DuckDuckGo HTML endpoint — no API key exists for it. Result links
 * are encoded in the `uddg` query param of duckduckgo.com/l/ redirect URLs;
 * we decode that param to get the real destination (we never follow the
 * redirect, and we never fetch the destination pages here — this source only
 * harvests what the results page itself shows: title, snippet, URL).
 *
 * Filtering is conservative: aggregators, social, docs, and binary files are
 * dropped. What remains is queued for human review — the admin decides what
 * is a real tool, not this module.
 *
 * Verified 2026-10-15: html.duckduckgo.com/html/?q=... returns result cards
 * with class="result__a" and uddg-encoded destinations.
 */

import { fetchText, politeDelay } from "../http.ts";
import type { SourceResult, ToolCandidate } from "../types.ts";

const SEARCH_URL = "https://html.duckduckgo.com/html/?q=";

const QUERIES = [
  "new AI agent tool launched",
  "AI productivity tool launch 2026",
];

/** Hosts that are never tools themselves. */
const BLOCKED_HOSTS = new Set([
  "wikipedia.org",
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "reddit.com",
  "www.reddit.com",
  "x.com",
  "twitter.com",
  "facebook.com",
  "www.facebook.com",
  "linkedin.com",
  "www.linkedin.com",
  "instagram.com",
  "tiktok.com",
  "amazon.com",
  "www.amazon.com",
  "github.com", // repos come from the GitHub source instead
  "www.github.com",
  "duckduckgo.com",
  "google.com",
  "www.google.com",
  "bing.com",
  "producthunt.com",
  "www.producthunt.com", // PH lane is its own source
]);

const BLOCKED_PATH_SUFFIXES = [".pdf", ".ppt", ".pptx", ".doc", ".docx", ".zip"];

function decodeDestination(href: string): string | null {
  // href looks like //duckduckgo.com/l/?uddg=<urlencoded>&rut=...
  const m = href.match(/[?&]uddg=([^&]+)/);
  if (!m) return null;
  try {
    const url = decodeURIComponent(m[1]);
    if (!/^https?:\/\//i.test(url)) return null;
    return url;
  } catch {
    return null;
  }
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** "Acme — AI writing assistant | Acme.com" -> "Acme". */
function deriveName(title: string): string {
  const cut = title.split(/\s[-—–|:]\s/)[0].trim();
  return cut.slice(0, 80);
}

function parseResultsPage(html: string, query: string): ToolCandidate[] {
  const out: ToolCandidate[] = [];
  const seen = new Set<string>();
  // Each result: <a ... class="result__a" href="...">Title</a> ... <a class="result__snippet" ...>Snippet</a>
  const re = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const dest = decodeDestination(m[1]);
    if (!dest) continue;
    const host = hostOf(dest);
    if (!host || BLOCKED_HOSTS.has(host)) continue;
    const lower = dest.toLowerCase();
    if (BLOCKED_PATH_SUFFIXES.some((s) => lower.split("?")[0].endsWith(s))) continue;
    if (seen.has(dest)) continue;
    seen.add(dest);

    const title = cleanTitle(m[2]);
    if (!title || title.length < 3) continue;

    // Snippet: the result__snippet anchor that follows this result link.
    const rest = html.slice(m.index, m.index + 4000);
    const sm = rest.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i);
    const snippet = sm ? cleanTitle(sm[1]).slice(0, 300) : undefined;

    out.push({
      name: deriveName(title),
      url: dest,
      tagline: snippet && snippet.length > 12 ? snippet : undefined,
      source: "websearch",
      sourceUrl: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
    });
    if (out.length >= 15) break; // cap per query — politeness + queue hygiene
  }
  return out;
}

export async function fetchWebSearchCandidates(): Promise<SourceResult> {
  const started = Date.now();
  const candidates: ToolCandidate[] = [];
  let degraded: string | undefined;

  for (const q of QUERIES) {
    try {
      const html = await fetchText(SEARCH_URL + encodeURIComponent(q));
      for (const c of parseResultsPage(html, q)) {
        if (!candidates.some((k) => k.url === c.url)) candidates.push(c);
      }
    } catch (err) {
      degraded = `Web search query failed (${err instanceof Error ? err.message : String(err)}); tried remaining queries.`;
      continue;
    }
    await politeDelay(2000);
  }

  return { source: "websearch", candidates, degraded, tookMs: Date.now() - started };
}

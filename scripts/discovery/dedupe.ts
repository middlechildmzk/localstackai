/**
 * StackBuilder AI — Discovery agent (Loop 1) dedupe.
 *
 * A candidate is a duplicate of an existing tool when ANY of these hold:
 *  1. exact-url            — canonicalized tool_url matches exactly
 *  2. same-host            — normalized hostname matches (www stripped)
 *  3. same-registrable-domain (+ name evidence) — e.g. app.foo.com vs foo.com,
 *     but NOT foo.github.io vs bar.github.io (shared suffix, different names)
 *  4. similar-name         — pg_trgm-compatible trigram similarity on the
 *     normalized name >= NAME_SIMILARITY_THRESHOLD (catches "Lumina" on
 *     lumina.com vs "Lumina" on lumina.io)
 *
 * This module is pure (no DB). The cron route supplies the existing-tool rows.
 * It never reads `is_sponsored` / `sponsorships` — it doesn't need to.
 */

import type { DedupeDuplicate, DedupeResult, ExistingTool, IntraBatchDuplicate, ToolCandidate } from "./types.ts";

/** Trigram name-similarity at or above this => duplicate. Tunable. */
export const NAME_SIMILARITY_THRESHOLD = 0.6;

/** Name similarity floor used together with a registrable-domain match. */
const DOMAIN_PLUS_NAME_THRESHOLD = 0.4;

// ─── URL helpers ─────────────────────────────────────────────────────────────

export function extractHostname(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }
}

/** Strip a single leading "www.". (NOT full subdomain stripping — see registrableDomain.) */
export function normalizeHost(host: string): string {
  return host.startsWith("www.") ? host.slice(4) : host;
}

/** Canonical URL for exact-match comparison. */
export function normalizeUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    u.hostname = normalizeHost(u.hostname.toLowerCase().replace(/\.$/, ""));
    // Drop trailing slash, fragment, and common tracking params.
    u.hash = "";
    for (const p of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "fbclid", "gclid"]) {
      u.searchParams.delete(p);
    }
    let s = u.toString();
    if (s.endsWith("/") && u.pathname === "/") s = s.slice(0, -1);
    return s;
  } catch {
    return null;
  }
}

/**
 * Minimal public-suffix handling so that foo.github.io and bar.github.io are
 * NOT treated as the same domain, while app.example.com and example.com are.
 * Covers the suffixes a discovery feed realistically hits; not a full PSL.
 */
const MULTI_PART_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "gov.uk", "me.uk", "net.uk",
  "co.jp", "ne.jp", "or.jp", "go.jp",
  "com.au", "net.au", "org.au",
  "co.nz", "co.in", "co.za", "com.br", "com.mx", "co.kr",
  "github.io", "vercel.app", "netlify.app", "pages.dev",
  "webflow.io", "wordpress.com", "notion.site", "framer.website",
  "herokuapp.com", "azurewebsites.net", "onrender.com", "fly.dev",
  "substack.com", "medium.com", "squarespace.com",
]);

export function registrableDomain(host: string): string {
  const h = normalizeHost(host);
  const parts = h.split(".");
  if (parts.length <= 2) return h;
  const lastTwo = parts.slice(-2).join(".");
  if (MULTI_PART_SUFFIXES.has(lastTwo)) {
    return parts.length > 2 ? parts.slice(-3).join(".") : h;
  }
  return lastTwo;
}

// ─── Name helpers ────────────────────────────────────────────────────────────

/** Lowercase, strip punctuation/extra whitespace — mirrors the DB trigram index input. */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * pg_trgm-compatible trigram similarity.
 * pg_trgm pads with two leading spaces and one trailing space, lowercases,
 * then computes |A ∩ B| / |A ∪ B| over trigram multisets.
 */
export function trigramSimilarity(a: string, b: string): number {
  const trigrams = (s: string): string[] => {
    const padded = `  ${s} `;
    const out: string[] = [];
    for (let i = 0; i < padded.length - 2; i++) out.push(padded.slice(i, i + 3));
    return out;
  };
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (ta.length === 0 || tb.length === 0) return a === b ? 1 : 0;

  const counts = new Map<string, number>();
  for (const t of ta) counts.set(t, (counts.get(t) ?? 0) + 1);
  let intersection = 0;
  for (const t of tb) {
    const c = counts.get(t) ?? 0;
    if (c > 0) {
      intersection++;
      counts.set(t, c - 1);
    }
  }
  const union = ta.length + tb.length - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ─── Dedupe ──────────────────────────────────────────────────────────────────

interface NormalizedExisting extends ExistingTool {
  normUrl: string | null;
  host: string | null;
  regDomain: string | null;
  normName: string;
}

function normalizeExisting(tools: ExistingTool[]): NormalizedExisting[] {
  return tools.map((t) => {
    const host = t.website_url ? extractHostname(t.website_url) : null;
    return {
      ...t,
      normUrl: t.website_url ? normalizeUrl(t.website_url) : null,
      host: host ? normalizeHost(host) : null,
      regDomain: host ? registrableDomain(host) : null,
      normName: normalizeName(t.name),
    };
  });
}

/**
 * Dedupe candidates against known tools (or pending submissions — caller
 * decides what "existing" means; the match reasons are reported honestly).
 */
export function dedupeCandidates(
  candidates: ToolCandidate[],
  existing: ExistingTool[],
  nameThreshold: number = NAME_SIMILARITY_THRESHOLD
): DedupeResult {
  const known = normalizeExisting(existing);
  const unique: ToolCandidate[] = [];
  const duplicates: DedupeDuplicate[] = [];

  for (const c of candidates) {
    const cUrl = normalizeUrl(c.url);
    const cHostRaw = extractHostname(c.url);
    const cHost = cHostRaw ? normalizeHost(cHostRaw) : null;
    const cReg = cHostRaw ? registrableDomain(cHostRaw) : null;
    const cName = normalizeName(c.name);

    let match: DedupeDuplicate | null = null;

    for (const k of known) {
      // 1. Exact URL match.
      if (cUrl && k.normUrl && cUrl === k.normUrl) {
        match = { candidate: c, matchedName: k.name, matchedUrl: k.website_url, reason: "exact-url" };
        break;
      }
      // 2. Same normalized host.
      if (cHost && k.host && cHost === k.host) {
        match = { candidate: c, matchedName: k.name, matchedUrl: k.website_url, reason: "same-host" };
        break;
      }
      // 3. Same registrable domain + name evidence (handles app.foo.com vs foo.com,
      //    but not foo.github.io vs bar.github.io).
      if (cReg && k.regDomain && cReg === k.regDomain && cHost !== k.host) {
        const sim = trigramSimilarity(cName, k.normName);
        const nameContains = cName.length > 2 && k.normName.length > 2 &&
          (cName.includes(k.normName) || k.normName.includes(cName));
        if (sim >= DOMAIN_PLUS_NAME_THRESHOLD || nameContains) {
          match = { candidate: c, matchedName: k.name, matchedUrl: k.website_url, reason: "same-registrable-domain" };
          break;
        }
      }
      // 4. Similar name (catches same name, different TLD).
      if (cName.length >= 3 && k.normName.length >= 3) {
        const sim = trigramSimilarity(cName, k.normName);
        if (sim >= nameThreshold) {
          match = { candidate: c, matchedName: k.name, matchedUrl: k.website_url, reason: "similar-name" };
          break;
        }
      }
    }

    if (match) duplicates.push(match);
    else unique.push(c);
  }

  return { unique, duplicates };
}

/**
 * Intra-batch dedupe: two candidates from different sources pointing at the
 * same host. Keeps the first-seen candidate (sources are aggregated in
 * priority order by the caller).
 */
export function dedupeIntraBatch(candidates: ToolCandidate[]): {
  unique: ToolCandidate[];
  duplicates: IntraBatchDuplicate[];
} {
  const seen = new Map<string, ToolCandidate>();
  const unique: ToolCandidate[] = [];
  const duplicates: IntraBatchDuplicate[] = [];

  for (const c of candidates) {
    const hostRaw = extractHostname(c.url);
    const key = hostRaw ? normalizeHost(hostRaw) : normalizeUrl(c.url) ?? c.url.toLowerCase();
    const kept = seen.get(key);
    if (kept) {
      duplicates.push({ candidate: c, keptInstead: kept, reason: `same host already covered by ${kept.source}` });
    } else {
      seen.set(key, c);
      unique.push(c);
    }
  }

  return { unique, duplicates };
}

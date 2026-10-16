/**
 * StackBuilder AI — Discovery source: GitHub (public, unauthenticated).
 *
 * Uses the public GitHub REST search API — no token. Unauthenticated rate
 * limit is 60 requests/hour; this module makes exactly 2 per run, well under
 * the budget. If the limit is hit (HTTP 403 + rate-limit headers), it degrades
 * gracefully and the run continues with the other sources.
 *
 * Verified 2026-10-15: api.github.com/search/repositories responds
 * unauthenticated with repo name/description/homepage/html_url.
 */

import { fetchJson, politeDelay } from "../http.ts";
import type { SourceResult, ToolCandidate } from "../types.ts";

interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  homepage: string | null;
  description: string | null;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  language: string | null;
}

interface GitHubSearchResponse {
  total_count: number;
  items: GitHubRepo[];
}

/** Two narrow queries keep the result set fresh and the request count at 2. */
const QUERIES = [
  // AI-agent repos created in the last ~45 days with some traction.
  "topic:ai-agent created:>2026-09-01 stars:>10",
  // AI tooling generally, recent and starred, excluding forks via filter below.
  "ai tool stars:>50 pushed:>2026-09-15",
];

const PER_PAGE = 20;

function humanizeRepoName(name: string): string {
  return name.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function toCandidate(repo: GitHubRepo): ToolCandidate | null {
  if (repo.fork || repo.archived) return null;
  if (!repo.description || repo.description.trim().length < 10) return null;
  // Skip personal dotfiles / configs masquerading as tools.
  if (/dotfiles|config|awesome-|leetcode/i.test(repo.name)) return null;

  const url = repo.homepage && /^https?:\/\//i.test(repo.homepage.trim())
    ? repo.homepage.trim()
    : repo.html_url;

  return {
    name: humanizeRepoName(repo.name),
    url,
    tagline: repo.description.trim().slice(0, 160),
    description: repo.language
      ? `${repo.description.trim()} (Built with ${repo.language}; ★${repo.stargazers_count} on GitHub.)`
      : `${repo.description.trim()} (★${repo.stargazers_count} on GitHub.)`,
    source: "github",
    sourceUrl: repo.html_url,
  };
}

export async function fetchGitHubCandidates(): Promise<SourceResult> {
  const started = Date.now();
  const candidates: ToolCandidate[] = [];
  let degraded: string | undefined;

  for (const q of QUERIES) {
    try {
      const data = await fetchJson<GitHubSearchResponse>(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${PER_PAGE}`,
        { headers: { Accept: "application/vnd.github+json" } }
      );
      for (const repo of data.items ?? []) {
        const c = toCandidate(repo);
        if (c) candidates.push(c);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // 403 here almost always means the unauthenticated rate limit tripped.
      degraded = `GitHub search query failed (${msg}); continuing with other sources.`;
      break; // Don't burn the second query if we're rate-limited.
    }
    await politeDelay(1200);
  }

  return { source: "github", candidates, degraded, tookMs: Date.now() - started };
}

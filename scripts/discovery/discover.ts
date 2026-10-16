/**
 * StackBuilder AI — Discovery agent (Loop 1) orchestration.
 *
 * runDiscovery() fans out to the source modules (each wrapped so one failing
 * source never kills the run), then dedupes candidates against each other
 * (intra-batch) in source-priority order: github > producthunt > websearch.
 *
 * Pure apart from network calls: no DB access here. The cron route does the
 * DB dedupe + queue inserts. Nothing in this module publishes anything.
 */

import { dedupeIntraBatch } from "./dedupe.ts";
import { fetchGitHubCandidates } from "./sources/github.ts";
import { fetchProductHuntCandidates } from "./sources/producthunt.ts";
import { fetchWebSearchCandidates } from "./sources/websearch.ts";
import type { DiscoveryBatch, SourceResult, ToolCandidate } from "./types.ts";

/** Source priority: earlier wins intra-batch dedupe ties. */
const SOURCE_RUNNERS: Array<() => Promise<SourceResult>> = [
  fetchGitHubCandidates,
  fetchProductHuntCandidates,
  fetchWebSearchCandidates,
];

export async function runDiscovery(): Promise<DiscoveryBatch> {
  const settled = await Promise.allSettled(SOURCE_RUNNERS.map((run) => run()));

  const sourceResults: SourceResult[] = [];
  const all: ToolCandidate[] = [];

  for (let i = 0; i < settled.length; i++) {
    const s = settled[i];
    if (s.status === "fulfilled") {
      sourceResults.push(s.value);
      all.push(...s.value.candidates);
    } else {
      sourceResults.push({
        source: `source-${i}`,
        candidates: [],
        degraded: `Source module threw: ${s.reason instanceof Error ? s.reason.message : String(s.reason)}`,
        tookMs: 0,
      });
    }
  }

  // Sources are already appended in priority order, so first-seen wins.
  const { unique, duplicates } = dedupeIntraBatch(all);

  return {
    candidates: unique,
    intraBatchDuplicates: duplicates,
    sourceResults,
  };
}

export type { DiscoveryBatch, SourceResult, ToolCandidate };

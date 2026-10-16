#!/usr/bin/env tsx
/**
 * Discovery dry-run CLI — no DB access, no inserts, ever.
 *
 * Usage: npx tsx scripts/discovery/run.ts
 *
 * Runs all sources, intra-batch dedupes, and prints the batch as JSON.
 * Safe to run anywhere; useful for retuning source queries.
 */

import { runDiscovery } from "./discover.ts";

async function main() {
  const batch = await runDiscovery();
  const summary = {
    candidates: batch.candidates.length,
    intraBatchDuplicates: batch.intraBatchDuplicates.length,
    sources: batch.sourceResults.map((s) => ({
      source: s.source,
      candidates: s.candidates.length,
      tookMs: s.tookMs,
      degraded: s.degraded ?? null,
    })),
  };
  console.log(JSON.stringify({ summary, candidates: batch.candidates }, null, 2));
}

main().catch((err) => {
  console.error("discovery dry-run failed:", err);
  process.exit(1);
});

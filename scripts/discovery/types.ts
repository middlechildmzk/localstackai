/**
 * StackBuilder AI — Discovery agent (Loop 1) shared types.
 *
 * Boundary reminders (non-negotiable):
 *  - Discovery NEVER publishes. It produces candidates that are deduped and
 *    queued as `submissions` rows with status='pending' for human review.
 *  - Discovery NEVER reads or writes `is_sponsored` / `sponsorships`.
 *    Rank pipeline blindness is enforced by simply never touching those tables.
 *  - No fabricated metrics: every candidate carries its evidence URL
 *    (sourceUrl). Numbers shown to admins must trace to a real check.
 */

/** One tool sighting from a public source. */
export interface ToolCandidate {
  /** Human-readable tool name, as seen at the source. */
  name: string;
  /** Best-known website URL for the tool (may be a repo page if no site listed). */
  url: string;
  /** Short tagline from the source, if any. */
  tagline?: string;
  /** Longer description from the source, if any. */
  description?: string;
  /** Which source module produced this candidate. */
  source: string;
  /** URL of the source page/listing where this tool was seen (evidence). */
  sourceUrl: string;
}

/** Result of running one source module. */
export interface SourceResult {
  source: string;
  candidates: ToolCandidate[];
  /** Set when the source could not be fully read; the run continues anyway. */
  degraded?: string;
  /** Milliseconds the source took. */
  tookMs: number;
}

/** Aggregated discovery run before DB dedupe. */
export interface DiscoveryBatch {
  candidates: ToolCandidate[];
  /** Candidates dropped because another candidate already covered the same host. */
  intraBatchDuplicates: IntraBatchDuplicate[];
  sourceResults: SourceResult[];
}

export interface IntraBatchDuplicate {
  candidate: ToolCandidate;
  keptInstead: ToolCandidate;
  reason: string;
}

/** Minimal shape of an existing tool row used for dedupe. */
export interface ExistingTool {
  id: string;
  name: string;
  website_url: string | null;
}

/** A candidate that matched something already known. */
export interface DedupeDuplicate {
  candidate: ToolCandidate;
  matchedName: string;
  matchedUrl: string | null;
  reason: "exact-url" | "same-host" | "same-registrable-domain" | "similar-name" | "pending-submission";
}

export interface DedupeResult {
  unique: ToolCandidate[];
  duplicates: DedupeDuplicate[];
}

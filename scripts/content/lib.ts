/**
 * ClaimTracer — the honesty mechanism for Loop 4 drafts.
 *
 * Rule: EVERY factual claim in a generated draft must come from a real
 * database field, and that field must be recorded in the draft's
 * `source_data.facts`. If the data is missing, the generator writes that it
 * is missing (or omits the section) — it never invents specs, prices,
 * or features.
 *
 * How it works:
 *  1. Generators may only touch tool/workflow/category rows they were
 *     handed from the DB (never `is_sponsored` / `sponsorships` — those
 *     columns are never selected, so the rank/money blindness holds).
 *  2. Whenever a template sentence uses a DB value, it must be routed
 *     through `trace(...)`, which records {source, field, value}.
 *  3. After the body is built, `guardUntracedClaims` throws if the body
 *     contains a specific numeric claim ($ price, % number) whose value was
 *     not recorded. That throws before insert, so an untraceable draft can
 *     never reach the `content_drafts` table.
 */

// ─── Minimal row shapes (any extra DB columns are ignored) ──────────────────

export interface ToolRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  pricing_model: string | null;
  has_free_plan: boolean | null;
  starting_price: number | string | null;
  pricing_notes: string | null;
  best_for: string[] | null;
  not_ideal_for: string[] | null;
  website_url: string | null;
  freshness: string | null;
  last_verified_at: string | null;
  is_claimed: boolean | null;
  tool_score: number | string | null;
  save_count: number | null;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
}

export interface RelationshipRow {
  id: string;
  source_tool_id: string;
  target_tool_id: string;
  relationship_type: string;
  workflow_context: string | null;
  confidence: number | string | null;
}

export interface WorkflowRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  outcome: string | null;
  target_role: string | null;
}

export interface WorkflowStepRow {
  step_number: number;
  title: string;
  description: string | null;
}

export interface WorkflowToolRow {
  tier: string;
  notes: string | null;
  tool: ToolRow;
}

// ─── The tracer ──────────────────────────────────────────────────────────────

export interface FactRef {
  /** e.g. "tools:nimbus-ai" or "workflows:video-pipeline" */
  source: string;
  /** DB column name, e.g. "starting_price" */
  field: string;
  /** The exact value rendered (arrays joined in the draft as shown). */
  value: string | number | boolean | null;
}

export class ClaimTracer {
  private facts: FactRef[] = [];

  /** Record a DB field the draft is about to use. Must be called whenever
   *  a template sentence renders a database value. */
  use(source: string, field: string, value: string | number | boolean | null): void {
    this.facts.push({ source, field, value: value ?? null });
  }

  /** Record a structured/boolean claim without a numeric value. */
  flag(source: string, field: string, value: boolean): void {
    this.use(source, field, value);
  }

  list(): FactRef[] {
    return [...this.facts];
  }
}

// ─── Guard: no specific numeric claim without a recorded fact ────────────────

const norm = (s: string) => s.replace(/[$,%\s]/g, "").toLowerCase();

function valueStrings(value: string | number | boolean | null): string[] {
  if (value === null || value === undefined) return [];
  if (typeof value === "boolean") return [];
  return [String(value)];
}

/**
 * Scans the finished body for specific numeric claims ($ prices, % figures)
 * and throws unless each one matches a recorded fact value. Generators route
 * every rendered number through `tracer.use(...)`; this is the second line
 * of defense that fails the generation before anything is inserted.
 */
export function guardUntracedClaims(
  body: string,
  tracer: ClaimTracer,
  context: string
): void {
  const recorded = new Set<string>();
  for (const f of tracer.list()) {
    for (const s of valueStrings(f.value)) recorded.add(norm(s));
  }

  const candidates = new Set<string>();
  for (const m of body.matchAll(/\$\s?[\d,]+(?:\.\d{1,2})?/g)) candidates.add(m[0]);
  for (const m of body.matchAll(/\b\d{1,3}(?:\.\d+)?%/g)) candidates.add(m[0]);

  const untraced: string[] = [];
  for (const c of candidates) {
    const n = norm(c);
    if (n === "") continue;
    let found = false;
    for (const r of recorded) {
      if (r === "" ) continue;
      // A candidate is traced if a recorded value equals it (both directions,
      // so "$12" traces against recorded "12" and vice versa).
      if (r === n || n.includes(r) || r.includes(n)) { found = true; break; }
    }
    if (!found) untraced.push(c);
  }

  if (untraced.length > 0) {
    throw new Error(
      `[content-agent:${context}] untraced numeric claim(s) in body — ` +
      `refusing to insert: ${untraced.join(", ")}`
    );
  }
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

/** Fit renders as a label with reason chips — never the raw tool_score. */
export function fitLabel(toolScore: number | string | null): string {
  const s = toolScore === null ? 0 : Number(toolScore);
  if (s >= 0.66) return "Strong fit";
  if (s >= 0.33) return "Worth a look";
  return "Long shot";
}

/**
 * Reason chips, each tied to a real DB field. Every chip returned here is
 * registered on the tracer by the caller.
 */
export function reasonChips(
  tool: ToolRow,
  toolRef: string,
  tracer: ClaimTracer
): string[] {
  const chips: string[] = [];
  if (tool.has_free_plan === true) {
    tracer.flag(toolRef, "has_free_plan", true);
    chips.push("Free plan available");
  }
  if (tool.freshness === "verified" || tool.freshness === "fresh") {
    tracer.use(toolRef, "freshness", tool.freshness);
    chips.push("Recently verified");
  }
  if (tool.is_claimed === true) {
    tracer.flag(toolRef, "is_claimed", true);
    chips.push("Maker-claimed");
  }
  const saves = Number(tool.save_count ?? 0);
  if (saves >= 5) {
    tracer.use(toolRef, "save_count", saves);
    chips.push("Saved by the community");
  }
  return chips;
}

/** Human-readable pricing line built only from DB pricing fields. */
export function pricingLine(
  tool: ToolRow,
  toolRef: string,
  tracer: ClaimTracer
): string {
  const parts: string[] = [];
  if (tool.pricing_model) {
    tracer.use(toolRef, "pricing_model", tool.pricing_model);
    parts.push(`Pricing model: ${tool.pricing_model}`);
  }
  if (tool.has_free_plan === true) {
    tracer.flag(toolRef, "has_free_plan", true);
    parts.push("includes a free plan");
  }
  if (tool.starting_price !== null && tool.starting_price !== undefined) {
    tracer.use(toolRef, "starting_price", Number(tool.starting_price));
    parts.push(`starts at $${Number(tool.starting_price)}`);
  }
  if (tool.pricing_notes) {
    tracer.use(toolRef, "pricing_notes", tool.pricing_notes);
    parts.push(`— ${tool.pricing_notes}`);
  }
  if (parts.length === 0) {
    return "Pricing details weren't in our database for this tool.";
  }
  return parts.join(" · ") + ".";
}

export function listOrOmit(items: string[] | null | undefined): string {
  if (!items || items.length === 0) return "";
  return items.map((i) => `- ${i}`).join("\n");
}

/** Escape for slug building. */
export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

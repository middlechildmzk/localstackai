/**
 * Loop 4 — Content agent orchestrator.
 *
 * Runs the three draft generators against live graph data (tools,
 * tool_relationships, categories, workflows) and inserts results into
 * `content_drafts` with status 'draft'.
 *
 * Money-blindness: every query below selects an explicit column list that
 * NEVER includes `is_sponsored` (or the `sponsorships` table). Sponsored
 * status cannot influence which drafts get built.
 *
 * No publish path: rows are inserted as 'draft' only. A human approves in
 * /admin/drafts; rendering approved drafts as live pages is a follow-up.
 */
import { generateCompareDraft } from "./compare";
import { generateAlternativesDraft } from "./alternatives";
import { generateLearnDraft } from "./learn";
import type { ToolRow, RelationshipRow, CategoryRow, WorkflowRow, WorkflowStepRow, WorkflowToolRow } from "./lib";

const TOOL_COLS =
  "id,slug,name,tagline,description,pricing_model,has_free_plan,starting_price," +
  "pricing_notes,best_for,not_ideal_for,website_url,freshness,last_verified_at," +
  "is_claimed,tool_score,save_count";
// NOTE: is_sponsored intentionally absent — the rank pipeline is blind to money.

export interface RunSummary {
  created: string[];
  skipped: string[];
  errors: string[];
}

export async function generateContentDrafts(supabase: any, cap = 3): Promise<RunSummary> {
  const summary: RunSummary = { created: [], skipped: [], errors: [] };

  const { data: existing } = await supabase
    .from("content_drafts")
    .select("slug");
  const existingSlugs = new Set<string>((existing ?? []).map((r: any) => r.slug));

  const jobs: Array<{ key: string; run: () => Promise<any> }> = [
    { key: "compare", run: () => buildCompareDraft(supabase, existingSlugs) },
    { key: "alternatives", run: () => buildAlternativesDraft(supabase, existingSlugs) },
    { key: "learn", run: () => buildLearnDraft(supabase, existingSlugs) },
  ];

  for (const job of jobs) {
    if (summary.created.length >= cap) break;
    try {
      const draft = await job.run();
      if (!draft) {
        summary.skipped.push(`${job.key}: no eligible data`);
        continue;
      }
      if (existingSlugs.has(draft.slug)) {
        summary.skipped.push(`${job.key}: draft "${draft.slug}" already exists`);
        continue;
      }
      const { error } = await supabase.from("content_drafts").insert({
        kind: draft.kind,
        slug: draft.slug,
        title: draft.title,
        body_markdown: draft.body_markdown,
        source_data: draft.source_data,
        status: "draft",
      });
      if (error) {
        summary.errors.push(`${job.key}: insert failed — ${error.message}`);
      } else {
        summary.created.push(draft.slug);
        existingSlugs.add(draft.slug);
      }
    } catch (err: any) {
      // A guardUntracedClaims failure lands here — draft never inserted.
      summary.errors.push(`${job.key}: ${err?.message ?? String(err)}`);
    }
  }

  return summary;
}

// ─── Compare candidate ────────────────────────────────────────────────────────
// Two published tools sharing a category, with a relationship row between them.

async function buildCompareDraft(supabase: any, existingSlugs: Set<string>) {
  const { data: rels } = await supabase
    .from("tool_relationships")
    .select("id,source_tool_id,target_tool_id,relationship_type,workflow_context,confidence")
    .order("created_at", { ascending: false })
    .limit(30);
  if (!rels || rels.length === 0) return null;

  const toolIds = [...new Set(rels.flatMap((r: any) => [r.source_tool_id, r.target_tool_id]))];
  const { data: tools } = await supabase
    .from("tools")
    .select(TOOL_COLS)
    .in("id", toolIds)
    .eq("is_published", true);
  const toolById = new Map<string, ToolRow>((tools ?? []).map((t: ToolRow) => [t.id, t]));

  const { data: tc } = await supabase
    .from("tool_categories")
    .select("tool_id,category_id")
    .in("tool_id", toolIds);
  const { data: cats } = await supabase
    .from("categories")
    .select("id,name,slug")
    .in("id", (tc ?? []).map((r: any) => r.category_id));
  const catById = new Map<string, CategoryRow>((cats ?? []).map((c: CategoryRow) => [c.id, c]));
  const catsByTool = new Map<string, string[]>();
  for (const r of tc ?? []) {
    const list = catsByTool.get(r.tool_id) ?? [];
    list.push(r.category_id);
    catsByTool.set(r.tool_id, list);
  }

  for (const rel of rels as RelationshipRow[]) {
    const a = toolById.get(rel.source_tool_id);
    const b = toolById.get(rel.target_tool_id);
    if (!a || !b || a.id === b.id) continue;
    const shared = (catsByTool.get(a.id) ?? []).filter((c) =>
      (catsByTool.get(b.id) ?? []).includes(c)
    );
    const category = shared.length > 0 ? catById.get(shared[0]) ?? null : null;
    // Spec: "two tools sharing a category with a relationship row".
    if (!category) continue;
    const slug = `${a.slug}-vs-${b.slug}`;
    if (existingSlugs.has(slug)) continue;
    return generateCompareDraft({ toolA: a, toolB: b, relationship: rel, sharedCategory: category });
  }
  return null;
}

// ─── Alternatives candidate ─────────────────────────────────────────────────
// A published tool with 'alternative' / 'replaces' relationship rows.

async function buildAlternativesDraft(supabase: any, existingSlugs: Set<string>) {
  const { data: rels } = await supabase
    .from("tool_relationships")
    .select("id,source_tool_id,target_tool_id,relationship_type,workflow_context,confidence")
    .in("relationship_type", ["alternative", "replaces"])
    .order("confidence", { ascending: false })
    .limit(50);
  if (!rels || rels.length === 0) return null;

  // Group by source tool; prefer the tool with the most alternatives.
  const bySource = new Map<string, RelationshipRow[]>();
  for (const r of rels as RelationshipRow[]) {
    const list = bySource.get(r.source_tool_id) ?? [];
    list.push(r);
    bySource.set(r.source_tool_id, list);
  }
  const ordered = [...bySource.entries()].sort((x, y) => y[1].length - x[1].length);

  for (const [sourceId, relList] of ordered) {
    const toolIds = [sourceId, ...relList.map((r) => r.target_tool_id)];
    const { data: tools } = await supabase
      .from("tools")
      .select(TOOL_COLS)
      .in("id", toolIds)
      .eq("is_published", true);
    const toolById = new Map<string, ToolRow>((tools ?? []).map((t: ToolRow) => [t.id, t]));
    const tool = toolById.get(sourceId);
    if (!tool) continue;
    const entries = relList
      .map((r) => ({ tool: toolById.get(r.target_tool_id), relationship: r }))
      .filter((e) => e.tool && e.tool.id !== tool.id)
      .map((e) => ({ tool: e.tool as ToolRow, relationship: e.relationship }))
      .slice(0, 6);
    if (entries.length === 0) continue;
    const slug = `${tool.slug}-alternatives`;
    if (existingSlugs.has(slug)) continue;
    return generateAlternativesDraft({ tool, alternatives: entries });
  }
  return null;
}

// ─── Learn candidate ────────────────────────────────────────────────────────
// Latest published workflow with steps and tool picks.

async function buildLearnDraft(supabase: any, existingSlugs: Set<string>) {
  const { data: workflows } = await supabase
    .from("workflows")
    .select("id,slug,title,description,outcome,target_role")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(5);
  if (!workflows || workflows.length === 0) return null;

  for (const wf of workflows as WorkflowRow[]) {
    const slug = `learn-${wf.slug}`;
    if (existingSlugs.has(slug)) continue;

    const [{ data: steps }, { data: wtRows }] = await Promise.all([
      supabase
        .from("workflow_steps")
        .select("step_number,title,description")
        .eq("workflow_id", wf.id)
        .order("step_number", { ascending: true }),
      supabase
        .from("workflow_tools")
        .select("tier,notes,tool_id")
        .eq("workflow_id", wf.id)
        .order("sort_order", { ascending: true })
        .limit(6),
    ]);

    const toolIds = (wtRows ?? []).map((w: any) => w.tool_id);
    const { data: tools } = toolIds.length
      ? await supabase.from("tools").select(TOOL_COLS).in("id", toolIds).eq("is_published", true)
      : { data: [] };
    const toolById = new Map<string, ToolRow>((tools ?? []).map((t: ToolRow) => [t.id, t]));

    const toolsForArticle: WorkflowToolRow[] = (wtRows ?? [])
      .filter((w: any) => toolById.has(w.tool_id))
      .map((w: any) => ({
        tier: w.tier,
        notes: w.notes,
        tool: toolById.get(w.tool_id) as ToolRow,
      }));

    // Need at least one step or one tool to write anything honest.
    if ((!steps || steps.length === 0) && toolsForArticle.length === 0) continue;

    return generateLearnDraft({
      workflow: wf,
      steps: (steps ?? []) as WorkflowStepRow[],
      tools: toolsForArticle,
    });
  }
  return null;
}

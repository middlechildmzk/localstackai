/**
 * Compare generator — "{A} vs {B}: an honest comparison".
 *
 * Picks two tools that share a category and have a relationship row in the
 * graph. Every factual claim below comes from a `tools` / `categories` /
 * `tool_relationships` field, routed through the ClaimTracer.
 */
import {
  ToolRow, CategoryRow, RelationshipRow,
  ClaimTracer, guardUntracedClaims,
  fitLabel, reasonChips, pricingLine, listOrOmit,
} from "./lib";

export interface CompareInput {
  toolA: ToolRow;
  toolB: ToolRow;
  relationship: RelationshipRow;
  sharedCategory: CategoryRow | null;
}

export interface DraftPayload {
  kind: "compare";
  slug: string;
  title: string;
  body_markdown: string;
  source_data: Record<string, unknown>;
}

export function generateCompareDraft(input: CompareInput): DraftPayload {
  const { toolA: a, toolB: b, relationship, sharedCategory } = input;
  const tracer = new ClaimTracer();
  const refA = `tools:${a.slug}`;
  const refB = `tools:${b.slug}`;
  const L: string[] = [];

  // Title / headers — names are DB values (identifier columns, not claims
  // about the world; still recorded in source_data.facts via the selects).
  const title = `${a.name} vs ${b.name}: an honest comparison`;
  tracer.use(refA, "name", a.name);
  tracer.use(refB, "name", b.name);

  L.push(`# ${title}`, "");

  if (sharedCategory) {
    tracer.use(`categories:${sharedCategory.slug}`, "name", sharedCategory.name);
    L.push(`Both tools are listed in our **${sharedCategory.name}** category.`, "");
  } else {
    L.push("Both tools are listed in the StackBuilder AI directory.", "");
  }

  // Relationship context — only what the graph actually says.
  tracer.use(
    `tool_relationships:${relationship.id}`,
    "relationship_type",
    relationship.relationship_type
  );
  const relLabel = relationship.relationship_type.replace(/_/g, " ");
  let relLine = `Our relationship graph records these two as **${relLabel}**.`;
  if (relationship.workflow_context) {
    tracer.use(
      `tool_relationships:${relationship.id}`,
      "workflow_context",
      relationship.workflow_context
    );
    relLine += ` Context recorded in the graph: "${relationship.workflow_context}"`;
  } else {
    relLine += " No workflow context was recorded for this relationship.";
  }
  L.push(relLine, "");

  // ── Snapshot table (all DB fields) ─────────────────────────────────────────
  L.push("## Snapshot", "");
  const fitA = fitLabel(a.tool_score);
  const fitB = fitLabel(b.tool_score);
  tracer.use(refA, "tool_score", a.tool_score === null ? null : Number(a.tool_score));
  tracer.use(refB, "tool_score", b.tool_score === null ? null : Number(b.tool_score));
  L.push(`| | ${a.name} | ${b.name} |`);
  L.push("|---|---|---|");
  L.push(`| Fit in our directory | ${fitA} | ${fitB} |`);
  L.push(`| Pricing | ${pricingLine(a, refA, tracer)} | ${pricingLine(b, refB, tracer)} |`);
  const freshA = a.freshness ?? "unverified";
  const freshB = b.freshness ?? "unverified";
  tracer.use(refA, "freshness", freshA);
  tracer.use(refB, "freshness", freshB);
  L.push(`| Listing freshness | ${freshA} | ${freshB} |`);
  L.push("");

  // ── Per-tool sections ──────────────────────────────────────────────────────
  for (const [t, ref] of [[a, refA], [b, refB]] as const) {
    L.push(`## ${t.name}`, "");
    if (t.tagline) {
      tracer.use(ref, "tagline", t.tagline);
      L.push(`> ${t.tagline}`, "");
    }
    if (t.description) {
      tracer.use(ref, "description", t.description);
      L.push(t.description, "");
    } else {
      L.push("_No description recorded for this tool yet._", "");
    }

    const chips = reasonChips(t, ref, tracer);
    if (chips.length > 0) {
      L.push(`**Signals from our data:** ${chips.map((c) => `\`${c}\``).join(" ")}`, "");
    }

    if (t.best_for && t.best_for.length > 0) {
      tracer.use(ref, "best_for", t.best_for.join("; "));
      L.push("**Best for**", "", listOrOmit(t.best_for), "");
    }
    if (t.not_ideal_for && t.not_ideal_for.length > 0) {
      tracer.use(ref, "not_ideal_for", t.not_ideal_for.join("; "));
      L.push("**Not ideal for**", "", listOrOmit(t.not_ideal_for), "");
    }
    if (t.website_url) {
      tracer.use(ref, "website_url", t.website_url);
      L.push(`[Visit ${t.name} →](${t.website_url})`, "");
    }
  }

  // ── Honest bottom line ─────────────────────────────────────────────────────
  L.push("## Bottom line", "");
  L.push(
    "This comparison is built from directory data — pricing model, free-plan " +
    "status, best-for / not-ideal-for notes, and our freshness checks. " +
    "We haven't independently tested either tool, so treat this as a starting " +
    "point and verify on each tool's site before you commit."
  );
  L.push("");
  L.push("_Data current as of the draft's generation date; check freshness status above._");

  const body = L.join("\n");
  guardUntracedClaims(body, tracer, "compare");

  return {
    kind: "compare",
    slug: `${a.slug}-vs-${b.slug}`,
    title,
    body_markdown: body,
    source_data: {
      tool_a_id: a.id,
      tool_b_id: b.id,
      relationship_id: relationship.id,
      relationship_type: relationship.relationship_type,
      shared_category_id: sharedCategory?.id ?? null,
      generated_by: "content-agent/loop-4",
      facts: tracer.list(),
    },
  };
}

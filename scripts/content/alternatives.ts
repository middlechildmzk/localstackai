/**
 * Alternatives generator — "{Tool} alternatives".
 *
 * Picks a tool plus its 'alternative' / 'replaces' relationship rows.
 * The replacement context comes ONLY from the graph's `workflow_context`
 * column — if a row has none, the draft says so instead of inventing one.
 */
import {
  ToolRow, RelationshipRow,
  ClaimTracer, guardUntracedClaims,
  pricingLine,
} from "./lib";

export interface AlternativeEntry {
  tool: ToolRow;
  relationship: RelationshipRow;
}

export interface AlternativesInput {
  tool: ToolRow;
  alternatives: AlternativeEntry[];
}

export interface DraftPayload {
  kind: "alternatives";
  slug: string;
  title: string;
  body_markdown: string;
  source_data: Record<string, unknown>;
}

export function generateAlternativesDraft(input: AlternativesInput): DraftPayload {
  const { tool, alternatives } = input;
  const tracer = new ClaimTracer();
  const ref = `tools:${tool.slug}`;
  const L: string[] = [];

  const title = `${tool.name} alternatives (${alternatives.length})`;
  tracer.use(ref, "name", tool.name);

  L.push(`# ${title}`, "");

  if (tool.tagline) {
    tracer.use(ref, "tagline", tool.tagline);
    L.push(`${tool.name} — ${tool.tagline}`, "");
  }

  const pricing = pricingLine(tool, ref, tracer);
  L.push(
    `Considering switching, or just shopping around? Our relationship graph ` +
    `records ${alternatives.length} tool${alternatives.length === 1 ? "" : "s"} ` +
    `that can substitute for ${tool.name}. Current listing notes on ` +
    `${tool.name}: ${pricing}`
  );
  L.push("");

  L.push("## The alternatives", "");
  for (const { tool: alt, relationship } of alternatives) {
    const altRef = `tools:${alt.slug}`;
    tracer.use(altRef, "name", alt.name);
    tracer.use(
      `tool_relationships:${relationship.id}`,
      "relationship_type",
      relationship.relationship_type
    );
    L.push(`### ${alt.name}`, "");
    if (alt.tagline) {
      tracer.use(altRef, "tagline", alt.tagline);
      L.push(`_${alt.tagline}_`, "");
    }

    // Replacement context: graph text verbatim, or an explicit gap note.
    if (relationship.workflow_context) {
      tracer.use(
        `tool_relationships:${relationship.id}`,
        "workflow_context",
        relationship.workflow_context
      );
      L.push(`**Why it's listed as an alternative:** ${relationship.workflow_context}`, "");
    } else {
      L.push(
        `**Why it's listed as an alternative:** our graph records an ` +
        `\`${relationship.relationship_type.replace(/_/g, " ")}\` relationship, ` +
        `but no replacement context was recorded — treat this as a lead, not a verdict.`,
        ""
      );
    }

    L.push(`**Pricing:** ${pricingLine(alt, altRef, tracer)}`, "");
    if (alt.best_for && alt.best_for.length > 0) {
      tracer.use(altRef, "best_for", alt.best_for.join("; "));
      L.push(`**Best for:** ${alt.best_for.join(", ")}`, "");
    }
    if (alt.website_url) {
      tracer.use(altRef, "website_url", alt.website_url);
      L.push(`[Visit ${alt.name} →](${alt.website_url})`, "");
    }
  }

  L.push("## How to choose", "");
  L.push(
    "Compare the pricing models and best-for notes above against what you " +
    "actually need. Check each tool's freshness status on its directory page, " +
    "then confirm details on the vendor's own site — we haven't independently " +
    "tested these tools."
  );

  const body = L.join("\n");
  guardUntracedClaims(body, tracer, "alternatives");

  return {
    kind: "alternatives",
    slug: `${tool.slug}-alternatives`,
    title,
    body_markdown: body,
    source_data: {
      tool_id: tool.id,
      relationship_ids: alternatives.map((e) => e.relationship.id),
      relationship_types: [...new Set(alternatives.map((e) => e.relationship.relationship_type))],
      alternative_tool_ids: alternatives.map((e) => e.tool.id),
      generated_by: "content-agent/loop-4",
      facts: tracer.list(),
    },
  };
}

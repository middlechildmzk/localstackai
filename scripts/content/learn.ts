/**
 * Learn generator — workflow-based how-to article.
 *
 * Built from `workflows`, `workflow_steps`, and `workflow_tools` rows.
 * Step titles/descriptions and tool picks come verbatim from the DB;
 * where a step or tool note is missing, the draft says so.
 */
import {
  WorkflowRow, WorkflowStepRow, WorkflowToolRow,
  ClaimTracer, guardUntracedClaims,
  pricingLine,
} from "./lib";

export interface LearnInput {
  workflow: WorkflowRow;
  steps: WorkflowStepRow[];
  tools: WorkflowToolRow[];
}

export interface DraftPayload {
  kind: "learn";
  slug: string;
  title: string;
  body_markdown: string;
  source_data: Record<string, unknown>;
}

export function generateLearnDraft(input: LearnInput): DraftPayload {
  const { workflow, steps, tools } = input;
  const tracer = new ClaimTracer();
  const wref = `workflows:${workflow.slug}`;
  const L: string[] = [];

  tracer.use(wref, "title", workflow.title);
  const goalLine = workflow.outcome ?? workflow.description ?? null;
  const title = `How to ${goalLine ? goalLine : workflow.title}`;
  L.push(`# ${title}`, "");

  if (workflow.description) {
    tracer.use(wref, "description", workflow.description);
    L.push(workflow.description, "");
  }
  if (workflow.target_role) {
    tracer.use(wref, "target_role", workflow.target_role);
    L.push(`**Who this is for:** ${workflow.target_role}`, "");
  }

  // ── Steps ──────────────────────────────────────────────────────────────────
  if (steps.length > 0) {
    L.push("## The workflow, step by step", "");
    steps
      .slice()
      .sort((x, y) => x.step_number - y.step_number)
      .forEach((s, i) => {
        const sref = `${wref}:step-${s.step_number}`;
        tracer.use(sref, "title", s.title);
        L.push(`### Step ${i + 1}: ${s.title}`, "");
        if (s.description) {
          tracer.use(sref, "description", s.description);
          L.push(s.description, "");
        } else {
          L.push("_No description was recorded for this step._", "");
        }
      });
  } else {
    L.push("_No workflow steps were recorded for this workflow yet._", "");
  }

  // ── Tool picks ─────────────────────────────────────────────────────────────
  if (tools.length > 0) {
    L.push("## Tools that fit this workflow", "");
    for (const wt of tools) {
      const t = wt.tool;
      const tref = `tools:${t.slug}`;
      tracer.use(tref, "name", t.name);
      tracer.use(`${wref}:tool-pick`, "tier", wt.tier);
      L.push(`### ${t.name} (${wt.tier} pick)`, "");
      if (t.tagline) {
        tracer.use(tref, "tagline", t.tagline);
        L.push(`_${t.tagline}_`, "");
      }
      if (wt.notes) {
        tracer.use(`${wref}:tool-pick`, "notes", wt.notes);
        L.push(`> ${wt.notes}`, "");
      }
      L.push(`**Pricing:** ${pricingLine(t, tref, tracer)}`, "");
    }
  } else {
    L.push("_No tool picks were recorded for this workflow yet._", "");
  }

  L.push("## Keep in mind", "");
  L.push(
    "Tool picks are directory suggestions for the workflow above — check each " +
    "tool's freshness status and confirm pricing on the vendor's site before " +
    "you commit. We haven't independently tested these tools."
  );

  const body = L.join("\n");
  guardUntracedClaims(body, tracer, "learn");

  return {
    kind: "learn",
    slug: `learn-${workflow.slug}`,
    title,
    body_markdown: body,
    source_data: {
      workflow_id: workflow.id,
      step_count: steps.length,
      tool_pick_ids: tools.map((wt) => wt.tool.id),
      generated_by: "content-agent/loop-4",
      facts: tracer.list(),
    },
  };
}

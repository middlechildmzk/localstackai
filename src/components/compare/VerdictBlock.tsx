/**
 * VerdictBlock — the three-line decision summary for comparison and
 * alternatives pages: "Choose A when …", "Choose B when …",
 * "Neither fits when …".
 *
 * Every line is derived ONLY from data already present on the page
 * (workflow tags, free-plan status, freshness). When the data is too thin
 * to support a recommendation, the line says so instead of inventing one.
 * These lines are never influenced by sponsorships.
 */

export type VerdictToolLike = {
  name: string;
  best_for?: string[] | null;
  has_free_plan?: boolean | null;
  pricing_model?: string | null;
  freshness?: string | null;
  data_source?: string | null;
};

export type VerdictLine = { label: string; text: string };

function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function isFallback(tool: VerdictToolLike): boolean {
  return tool.data_source === "static_fallback";
}

function hasWorkflowData(tool: VerdictToolLike): boolean {
  return !!tool.best_for?.length;
}

/** "Choose X when …" — falls back to an honest unknown when data is thin. */
function chooseText(tool: VerdictToolLike): string {
  const job = tool.best_for?.[0];
  if (!job) {
    return `not enough recorded data exists — no verified workflow tags for ${tool.name} yet. Check the vendor site against your actual job before deciding.`;
  }
  const conditions = [`your main job is ${lowerFirst(job)}`];
  if (tool.has_free_plan === true) {
    conditions.push("you want to start on a free plan");
  }
  return `${conditions.join(" and ")}.`;
}

function neitherText(a: VerdictToolLike, b: VerdictToolLike): string {
  const coverage: string[] = [];
  if (a.best_for?.[0]) coverage.push(`${a.name} is recorded for ${lowerFirst(a.best_for[0])}`);
  if (b.best_for?.[0]) coverage.push(`${b.name} is recorded for ${lowerFirst(b.best_for[0])}`);
  const coverageNote = coverage.length
    ? ` On record, ${coverage.join("; ")}.`
    : " Neither tool has verified workflow tags on record.";
  const verifyNote =
    isFallback(a) || isFallback(b)
      ? " Pricing and plan details are not carried in the static record — verify current terms on the vendor sites."
      : "";
  return `your job falls outside both tools' recorded strengths.${coverageNote}${verifyNote}`;
}

export function buildCompareVerdict(
  toolA: VerdictToolLike,
  toolB: VerdictToolLike,
): VerdictLine[] {
  return [
    { label: `Choose ${toolA.name} when`, text: chooseText(toolA) },
    { label: `Choose ${toolB.name} when`, text: chooseText(toolB) },
    { label: "Neither fits when", text: neitherText(toolA, toolB) },
  ];
}

export function buildAlternativesVerdict(
  tool: VerdictToolLike,
  topAlternative: (VerdictToolLike & { _relationship?: { workflow_context?: string | null } | null }) | null,
): VerdictLine[] {
  const lines: VerdictLine[] = [
    { label: `Stick with ${tool.name} when`, text: chooseText(tool) },
  ];

  if (topAlternative) {
    const context = topAlternative._relationship?.workflow_context;
    const base = chooseText(topAlternative);
    const text = context
      ? `${base} Recorded replacement context: ${lowerFirst(context)}.`
      : base;
    lines.push({ label: `Switch to ${topAlternative.name} when`, text });
  } else {
    lines.push({
      label: "Switch when",
      text: "no alternatives are recorded for this tool yet. Submit one or check the task pages for tools that cover your job.",
    });
  }

  lines.push({
    label: "Neither fits when",
    text: topAlternative
      ? neitherText(tool, topAlternative)
      : `your job is outside ${tool.name}'s recorded strengths${
          hasWorkflowData(tool) ? ` (${lowerFirst(tool.best_for![0])})` : ""
        }. Browse the task pages for a tool whose workflow tags match your job.`,
  });

  return lines;
}

export function VerdictBlock({ lines }: { lines: VerdictLine[] }) {
  return (
    <section className="glass p-5 mb-8 border border-brand-500/20">
      <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">
        Verdict
      </p>
      <div className="space-y-3">
        {lines.map(({ label, text }) => (
          <p key={label} className="text-sm text-zinc-300 leading-relaxed">
            <strong className="text-white">{label} </strong>
            {text}
          </p>
        ))}
      </div>
      <p className="text-xs text-zinc-600 mt-3">
        Derived from the recorded data on this page — workflow tags, pricing
        availability, and freshness. Sponsored placements never change these
        lines.
      </p>
    </section>
  );
}

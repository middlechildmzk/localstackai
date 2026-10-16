import type { Tool } from "@/types";

/**
 * Budget-awareness for the stack finder.
 *
 * Trust rule: NEVER invent prices. Every label below is derived only from the
 * tool's stored pricing_model / has_free_plan fields. When pricing data is
 * absent, the UI says "Price unverified" — that honesty is the feature.
 */

export type CostBucket = "free" | "freemium" | "paid" | "unverified";

export function costBucket(tool: Pick<Tool, "pricing_model" | "has_free_plan">): CostBucket {
  const model = (tool.pricing_model ?? "unknown") as string;
  if (model === "free" || model === "open_source") return "free";
  if (model === "freemium") return "freemium";
  if (
    model === "paid" ||
    model === "subscription" ||
    model === "usage_based" ||
    model === "enterprise"
  ) {
    // A paid tool with a real free tier is effectively freemium.
    return tool.has_free_plan === true ? "freemium" : "paid";
  }
  return "unverified";
}

const CHIP_STYLES: Record<CostBucket, { label: string; classes: string; dot: string }> = {
  free: {
    label: "Free",
    classes: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  freemium: {
    label: "Freemium",
    classes: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    dot: "bg-sky-400",
  },
  paid: {
    label: "Paid",
    classes: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
  },
  unverified: {
    label: "Price unverified",
    classes: "border-white/10 bg-white/5 text-zinc-400",
    dot: "bg-zinc-500",
  },
};

export function CostChip({ tool }: { tool: Pick<Tool, "pricing_model" | "has_free_plan"> }) {
  const bucket = costBucket(tool);
  const style = CHIP_STYLES[bucket];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.classes}`}
      title={
        bucket === "unverified"
          ? "We have not verified this tool's pricing. Check the vendor's site."
          : undefined
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden />
      {style.label}
    </span>
  );
}

/** Honest one-line cost rollup for a recommended stack. Never invents totals. */
export function stackCostSummary(
  tools: Array<Pick<Tool, "pricing_model" | "has_free_plan">>
): string {
  const counts: Record<CostBucket, number> = { free: 0, freemium: 0, paid: 0, unverified: 0 };
  for (const tool of tools) counts[costBucket(tool)] += 1;
  const total = tools.length;
  if (total === 0) return "Estimated cost: no tools in this stack.";
  if (counts.unverified === total) {
    return `Estimated cost: pricing unverified for all ${total} tool${total === 1 ? "" : "s"} — check each vendor's site.`;
  }
  const parts: string[] = [];
  if (counts.free > 0) parts.push(`${counts.free} free`);
  if (counts.freemium > 0) parts.push(`${counts.freemium} freemium`);
  if (counts.paid > 0) parts.push(`${counts.paid} paid`);
  if (counts.unverified > 0)
    parts.push(`${counts.unverified} with unverified pricing`);
  return `Estimated cost: ${parts.join(", ")}.`;
}

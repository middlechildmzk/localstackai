import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Methodology — How StackBuilder AI Recommends Tools",
  description: "How StackBuilder AI evaluates workflow fit, freshness, sponsored listings, corrections, and editorial recommendations during beta.",
  path: "/methodology",
});

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      <div>
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">Trust methodology</p>
        <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>How recommendations work</h1>
        <p className="text-zinc-400 mt-4">
          StackBuilder ranks and organizes tools by workflow usefulness, pricing transparency, freshness signals, stack fit, clear use cases, and editorial judgment. During beta, tool information should be treated as researched guidance, not a guarantee.
        </p>
      </div>
      {sections.map(([title, body]) => (
        <section key={title} className="glass p-5">
          <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
        </section>
      ))}
    </div>
  );
}

const sections = [
  ["Workflow fit", "We prioritize whether a tool helps a specific workflow ship, not just whether the tool is popular."],
  ["Freshness signals", "Tools may be marked as fresh, stale, or unverified based on visible product signals and editorial review. Pricing and product claims should be rechecked before publishing major updates."],
  ["Stack usage", "Tools used together in public stacks become part of the stack graph, which helps power alternatives and recommendations."],
  ["Sponsored listings", "Sponsored placements must be labeled. Rankings are not for sale."],
  ["Corrections", "Users and makers can submit corrections. Risky changes require human review before going live."],
];

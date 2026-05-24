import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Methodology — How StackBuilder AI Ranks and Verifies Tools",
  description: "How StackBuilder AI evaluates tools, freshness, sponsored listings, workflow fit, and stack usage.",
  path: "/methodology",
});

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      <div>
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">Trust methodology</p>
        <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>How rankings work</h1>
        <p className="text-zinc-400 mt-4">StackBuilder ranks tools by workflow usefulness, freshness, stack usage, saves, clicks, pricing transparency, and editorial fit. Sponsored placements are always labeled and do not silently override organic ranking.</p>
      </div>
      {[
        ["Workflow fit", "We prioritize whether a tool helps a specific workflow ship, not just whether the tool is popular."],
        ["Freshness", "Tools can be marked verified, fresh, stale, or unverified. Pricing and claims should be rechecked before publishing updates."],
        ["Stack usage", "Tools used together in public stacks become part of the stack graph, which powers alternatives and recommendations."],
        ["Sponsored listings", "Sponsored placements must be labeled. Rankings are not for sale."],
        ["Corrections", "Users and makers can submit corrections. Risky changes require human review before going live."],
      ].map(([title, body]) => (
        <section key={title} className="glass p-5">
          <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
        </section>
      ))}
    </div>
  );
}

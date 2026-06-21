import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: "Terms for using StackBuilder AI as a beta AI tools discovery, workflow planning, and stack-building product.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      <div>
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">Terms</p>
        <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Terms of Service</h1>
        <p className="text-zinc-400 mt-4 leading-relaxed">
          Use StackBuilder AI as a beta discovery and workflow planning tool. Tool details can change quickly, so always verify pricing, terms, and product capabilities on the official tool website before purchasing or adopting a tool.
        </p>
      </div>

      {sections.map(([title, body]) => (
        <section key={title} className="glass p-5 space-y-2">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm leading-6 text-zinc-400">{body}</p>
        </section>
      ))}
    </div>
  );
}

const sections = [
  ["Beta product", "StackBuilder AI is currently in beta. Some data, routes, recommendations, and stack-building features may be incomplete, experimental, or subject to change."],
  ["No guarantee of tool accuracy", "We try to keep tool information useful and current, but pricing, features, affiliate availability, product names, and terms can change. Verify final details on official tool websites."],
  ["User submissions", "If you submit tools, corrections, claims, stacks, or feedback, you are responsible for the accuracy of what you submit and for having the right to share it."],
  ["Recommendations", "StackBuilder AI provides discovery and planning help. Recommendations are not guarantees that a tool will fit every use case, budget, compliance need, or technical environment."],
  ["Sponsored and affiliate links", "Some links may be sponsored or affiliate links. Sponsored placements must be labeled, and rankings should not be sold."],
  ["Changes", "We may update these terms as the product evolves."],
];

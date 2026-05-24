import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "AI Tool Alternatives",
  description: "Find AI tool alternatives ranked by workflow fit, freshness, price, and stack usage.",
  path: "/alternatives",
});

const alternatives = ["chatgpt", "claude", "runway", "midjourney", "elevenlabs", "perplexity"];

export default function AlternativesHubPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="text-brand-400 text-sm font-medium mb-2">Alternatives Engine</p>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Find the right replacement for your workflow.
        </h1>
        <p className="text-zinc-400 max-w-2xl">
          Alternatives are ranked by real stack context, not just similar category labels.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {alternatives.map((slug) => (
          <Link key={slug} href={`/alternatives/${slug}`} className="glass p-5 hover:border-white/10 transition-all capitalize">
            <h2 className="text-white font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {slug.replaceAll("-", " ")} alternatives
            </h2>
            <p className="text-sm text-zinc-500">Compare replacements by price, freshness, and workflow fit.</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

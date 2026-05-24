import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "AI Tool Comparisons",
  description: "Compare popular AI tools by pricing, freshness, stack usage, and workflow fit.",
  path: "/compare",
});

const comparisons = [
  { slug: "chatgpt-vs-claude", title: "ChatGPT vs Claude", note: "Best general-purpose AI assistant for writing, coding, and research." },
  { slug: "runway-vs-midjourney", title: "Runway vs Midjourney", note: "Video generation vs image generation in creator workflows." },
  { slug: "perplexity-vs-chatgpt", title: "Perplexity vs ChatGPT", note: "Cited research compared with general AI assistant workflows." },
];

export default function CompareHubPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="text-brand-400 text-sm font-medium mb-2">Comparison Lab</p>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Compare AI tools by workflow fit.
        </h1>
        <p className="text-zinc-400 max-w-2xl">
          Compare pricing, freshness, stack usage, and best-fit workflows. Rankings are not vote-only and sponsored placements must be labeled.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparisons.map((item) => (
          <Link key={item.slug} href={`/compare/${item.slug}`} className="glass p-5 hover:border-white/10 transition-all">
            <h2 className="text-white font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>{item.title}</h2>
            <p className="text-sm text-zinc-500">{item.note}</p>
            <span className="inline-block mt-4 text-xs text-brand-400">Open comparison →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { ArticleDisclosure, QuickAnswer, RelatedLinks, StackCta } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "HeyGen vs Synthesia",
  description: "Compare HeyGen and Synthesia for AI avatar videos, talking-head explainers, faceless content, training videos, and business video workflows.",
  path: "/compare/heygen-vs-synthesia",
});

const rows = [
  ["Best fit", "Creator-style avatar and multilingual video workflows", "Polished business, training, and enterprise video workflows"],
  ["Common uses", "Faceless talking-head videos, sales clips, translated videos", "Training videos, corporate explainers, internal comms"],
  ["Creator fit", "High", "Medium"],
  ["Business fit", "High", "High"],
  ["Watch out for", "Avatar video can still feel synthetic without editing", "Can feel more corporate than creator-native"],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Comparison</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>HeyGen vs Synthesia</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">HeyGen and Synthesia both create AI avatar videos, but they fit different jobs. HeyGen often feels more creator and marketing friendly, while Synthesia is more established for polished business and training video workflows.</p>
      <QuickAnswer>Pick HeyGen if you want avatar videos for creator, marketing, sales, or multilingual social workflows. Pick Synthesia if your main job is polished training, internal communications, or enterprise-style explainers.</QuickAnswer>
      <ArticleDisclosure />
      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-white/[0.03] text-zinc-300"><tr><th className="p-4">Category</th><th className="p-4">HeyGen</th><th className="p-4">Synthesia</th></tr></thead><tbody className="divide-y divide-white/5">{rows.map((row) => <tr key={row[0]} className="text-zinc-400"><td className="p-4 font-medium text-white">{row[0]}</td><td className="p-4">{row[1]}</td><td className="p-4">{row[2]}</td></tr>)}</tbody></table></div>
      <section className="mt-10 grid gap-4 md:grid-cols-2"><div className="glass p-5"><h2 className="font-semibold text-white">Choose HeyGen if</h2><p className="mt-2 text-sm leading-6 text-zinc-400">You want creator-friendly avatar videos, multilingual clips, sales videos, or social content that can fit a faceless channel workflow.</p></div><div className="glass p-5"><h2 className="font-semibold text-white">Choose Synthesia if</h2><p className="mt-2 text-sm leading-6 text-zinc-400">You want a polished business video workflow for training, explainers, onboarding, or enterprise communications.</p></div></section>
      <RelatedLinks links={[["/learn/best-ai-video-generators-for-creators", "Best AI video generators for creators"], ["/learn/how-to-make-a-faceless-youtube-video-with-ai", "How to make a faceless YouTube video"], ["/learn/best-ai-stack-for-faceless-youtube", "Best faceless YouTube stack"], ["/compare/elevenlabs-vs-murf-vs-playht", "Compare AI voiceover tools"]]} />
      <StackCta query="ai avatar video" label="Find my avatar video stack" secondaryHref="/learn/best-ai-video-generators-for-creators" secondaryLabel="See video tools" />
    </article>
  );
}

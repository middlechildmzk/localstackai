import { ArticleDisclosure, QuickAnswer, RelatedLinks, StackCta, WorkflowCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Tools to Add Captions to Short Videos",
  description: "A creator-focused guide to AI caption tools for TikTok, Reels, Shorts, podcast clips, faceless videos, and social content.",
  path: "/learn/best-ai-tools-to-add-captions-to-short-videos",
});

const tools = [
  ["Submagic", "Best for creators who want animated captions, hooks, emojis, b-roll helpers, and short-form polish."],
  ["CapCut", "Best free or budget option for TikTok-style edits, captions, templates, and mobile-first polishing."],
  ["VEED", "Good browser-based option for captions, resizing, brand assets, and quick team-friendly edits."],
  ["Descript", "Best when captions are part of a broader transcript-editing or podcast/video workflow."],
  ["Zubtitle", "Simple captioning and resizing workflow for social clips and talking-head videos."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Short-form polish guide</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Tools to Add Captions to Short Videos</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">Captions are not just accessibility. For short-form video, captions shape retention, pacing, and whether someone understands the clip with sound off.</p>
      <QuickAnswer>Use CapCut if you want the easiest budget option, Submagic if you want creator-style caption polish, VEED if you want browser editing, and Descript if captions are part of a podcast or long-video workflow.</QuickAnswer>
      <ArticleDisclosure />
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Recommended caption tools</h2>{tools.map(([name, body]) => <WorkflowCard key={name} title={name} body={body} />)}</section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Caption workflow</h2><ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-zinc-400"><li>Start with a clip that already has a clear hook.</li><li>Generate captions automatically.</li><li>Fix names, jargon, punctuation, and awkward line breaks.</li><li>Style captions for readability, not just flash.</li><li>Export in the right aspect ratio for TikTok, Reels, Shorts, and LinkedIn.</li></ol></section>
      <RelatedLinks links={[["/learn/best-ai-tools-to-turn-long-videos-into-shorts", "Turn long videos into Shorts"], ["/learn/best-ai-tools-to-repurpose-podcast-into-clips", "Repurpose podcasts into clips"], ["/learn/best-ai-tools-for-tiktok-content", "TikTok AI tools guide"], ["/compare/opusclip-vs-klap-vs-vizard", "Compare clipping tools"]]} />
      <StackCta query="caption short videos" label="Find my short-form stack" secondaryHref="/learn/best-ai-tools-to-turn-long-videos-into-shorts" secondaryLabel="See repurposing guide" />
    </article>
  );
}

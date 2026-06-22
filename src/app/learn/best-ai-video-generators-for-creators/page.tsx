import { ArticleDisclosure, QuickAnswer, RelatedLinks, StackCta, WorkflowCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Video Generators for Creators",
  description: "A workflow-first guide to the best AI video generators for creators, faceless channels, Shorts, Reels, TikToks, explainers, and social clips.",
  path: "/learn/best-ai-video-generators-for-creators",
});

const tools = [
  ["Runway", "Best for creative AI video generation, image-to-video experiments, stylized clips, and creator visuals."],
  ["Pika", "Best for quick creative clips, social experiments, and fast visual ideas."],
  ["Luma Dream Machine", "Best to consider for cinematic image-to-video and creative motion tests."],
  ["Kling", "Best to test for realistic motion and creator video experiments when available in your market."],
  ["HeyGen", "Best for avatar videos, talking-head explainers, translated videos, and faceless business content."],
  ["InVideo AI", "Best for text-to-video drafts, beginner faceless videos, and quick explainer workflows."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">AI video stack guide</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Video Generators for Creators</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">AI video tools are not all for the same job. Some are better for cinematic clips, some for avatars, some for text-to-video drafts, and some for quick social experiments.</p>
      <QuickAnswer>Start with Runway or Pika for creative video generation, HeyGen or Synthesia for avatar videos, and InVideo AI or similar tools for fast text-to-video drafts. Use CapCut or Descript to finish the video before publishing.</QuickAnswer>
      <ArticleDisclosure />
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Recommended AI video tools</h2>{tools.map(([name, body]) => <WorkflowCard key={name} title={name} body={body} />)}</section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Best stack by use case</h2><ul className="list-disc space-y-3 pl-5 text-sm leading-6 text-zinc-400"><li><strong className="text-zinc-200">Faceless YouTube:</strong> Claude or ChatGPT, ElevenLabs, Runway or stock footage, CapCut, Canva.</li><li><strong className="text-zinc-200">Short-form clips:</strong> OpusClip, CapCut, Submagic, Buffer or Metricool.</li><li><strong className="text-zinc-200">Avatar explainers:</strong> HeyGen or Synthesia, Canva, Descript, scheduling tool.</li><li><strong className="text-zinc-200">Creative experiments:</strong> Runway, Pika, Midjourney, CapCut.</li></ul></section>
      <RelatedLinks links={[["/compare/heygen-vs-synthesia", "HeyGen vs Synthesia"], ["/compare/opusclip-vs-klap-vs-vizard", "OpusClip vs Klap vs Vizard"], ["/learn/best-ai-stack-for-faceless-youtube", "Faceless YouTube stack"], ["/learn/best-ai-tools-to-turn-long-videos-into-shorts", "Long video to Shorts stack"]]} />
      <StackCta query="ai video generator for creators" label="Find my AI video stack" secondaryHref="/learn/how-to-make-a-faceless-youtube-video-with-ai" secondaryLabel="See faceless workflow" />
    </article>
  );
}

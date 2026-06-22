import { ArticleDisclosure, QuickAnswer, RelatedLinks, StackCta, WorkflowCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Tools for YouTube Shorts",
  description: "A workflow-first AI stack for YouTube Shorts: ideas, scripts, clips, voiceovers, captions, thumbnails, optimization, and scheduling.",
  path: "/learn/best-ai-tools-for-youtube-shorts",
});

const stack = [
  ["Research", "Perplexity, vidIQ, or TubeBuddy", "Find topics, search angles, competitor patterns, and titles people already care about."],
  ["Script", "Claude or ChatGPT", "Draft hooks, punchy narration, alternate intros, and 30 to 60 second structures."],
  ["Clip or create", "OpusClip, Runway, Pika, or CapCut", "Repurpose existing videos or create new short-form visual assets."],
  ["Voice", "ElevenLabs, Murf, or Play.ht", "Add narration when the video is faceless or story-driven."],
  ["Captions", "CapCut, Submagic, VEED, or Descript", "Add captions that are readable, accurate, and platform-native."],
  ["Publish", "YouTube Studio, Buffer, or Metricool", "Schedule posts and track which hooks and topics work."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Shorts stack guide</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Tools for YouTube Shorts</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">YouTube Shorts can be a standalone content strategy or a repurposing engine for long videos. The right AI stack depends on whether you are making original Shorts, faceless clips, podcast cuts, or previews for long-form videos.</p>
      <QuickAnswer>Use Perplexity, vidIQ, or TubeBuddy for topic research, Claude or ChatGPT for scripts, OpusClip for repurposing, CapCut or Submagic for captions, ElevenLabs for voiceover, and Buffer or Metricool for distribution.</QuickAnswer>
      <ArticleDisclosure />
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Recommended YouTube Shorts stack</h2>{stack.map(([step, tool, body]) => <WorkflowCard key={step} title={`${step}: ${tool}`} body={body} />)}</section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Best Shorts workflows</h2><ul className="list-disc space-y-3 pl-5 text-sm leading-6 text-zinc-400"><li>Clip the best moments from a podcast or interview.</li><li>Turn a faceless script into a narrated short explainer.</li><li>Create a quick visual idea with Runway or Pika, then finish in CapCut.</li><li>Use Shorts as teasers for long-form YouTube videos.</li></ul></section>
      <RelatedLinks links={[["/learn/best-ai-tools-to-turn-long-videos-into-shorts", "Turn long videos into Shorts"], ["/compare/opusclip-vs-klap-vs-vizard", "Compare clipping tools"], ["/learn/best-ai-tools-to-add-captions-to-short-videos", "Caption tools"], ["/learn/best-ai-stack-for-faceless-youtube", "Faceless YouTube stack"]]} />
      <StackCta query="youtube shorts ai tools" label="Find my Shorts stack" secondaryHref="/learn/best-ai-stack-for-tiktok-creators" secondaryLabel="See TikTok stack" />
    </article>
  );
}

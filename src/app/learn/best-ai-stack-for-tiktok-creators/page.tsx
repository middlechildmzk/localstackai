import { ArticleDisclosure, QuickAnswer, RelatedLinks, StackCta, WorkflowCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Stack for TikTok Creators",
  description: "A practical AI stack for TikTok creators: ideas, hooks, scripts, captions, video editing, repurposing, scheduling, and content testing.",
  path: "/learn/best-ai-stack-for-tiktok-creators",
});

const stack = [
  ["Ideas and trend research", "Perplexity, TikTok search, and ChatGPT", "Find recurring hooks, audience questions, and formats you can adapt without copying."],
  ["Hooks and scripts", "Claude or ChatGPT", "Draft several openings, punchier rewrites, captions, and alternate angles."],
  ["Editing", "CapCut", "Cut the video, add captions, use templates carefully, and keep the pacing tight."],
  ["Caption polish", "Submagic or VEED", "Add readable captions, emphasis, and short-form polish when needed."],
  ["Repurposing", "OpusClip or Vizard", "Turn long videos, podcasts, or webinars into TikTok-ready clips."],
  ["Scheduling and review", "Buffer or Metricool", "Plan posts, track hooks, and identify which formats deserve more attempts."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">TikTok stack guide</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Stack for TikTok Creators</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">The best TikTok AI stack is not about replacing taste. It helps you generate ideas, test hooks, edit faster, add captions, and turn one idea into several short-form assets.</p>
      <QuickAnswer>Use Perplexity and TikTok search for research, Claude or ChatGPT for hooks and scripts, CapCut for editing, Submagic or VEED for caption polish, OpusClip or Vizard for repurposing, and Buffer or Metricool for scheduling.</QuickAnswer>
      <ArticleDisclosure />
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Recommended TikTok creator stack</h2>{stack.map(([step, tool, body]) => <WorkflowCard key={step} title={`${step}: ${tool}`} body={body} />)}</section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">What AI should help with</h2><ul className="list-disc space-y-3 pl-5 text-sm leading-6 text-zinc-400"><li>Generate multiple hook options before filming.</li><li>Turn one topic into a list of short video angles.</li><li>Speed up captions and edits.</li><li>Repurpose long content into TikTok-friendly cuts.</li><li>Review what worked and build the next batch from real signals.</li></ul></section>
      <RelatedLinks links={[["/learn/best-ai-tools-for-tiktok-content", "Best AI tools for TikTok content"], ["/learn/best-ai-tools-to-add-captions-to-short-videos", "Caption tools"], ["/learn/best-ai-tools-for-youtube-shorts", "YouTube Shorts stack"], ["/learn/best-free-ai-tools-for-content-creators", "Free AI tools for creators"]]} />
      <StackCta query="tiktok creator ai stack" label="Find my TikTok stack" secondaryHref="/learn/best-ai-tools-to-turn-long-videos-into-shorts" secondaryLabel="Repurpose long videos" />
    </article>
  );
}

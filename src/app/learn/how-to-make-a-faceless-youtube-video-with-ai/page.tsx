import { ArticleDisclosure, QuickAnswer, RelatedLinks, StackCta, WorkflowCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "How to Make a Faceless YouTube Video With AI",
  description: "A practical step-by-step AI workflow for making a faceless YouTube video without fake income promises or low-effort AI slop.",
  path: "/learn/how-to-make-a-faceless-youtube-video-with-ai",
});

const steps = [
  ["Choose the idea", "Pick a topic where viewers want a story, tutorial, explanation, list, or answer. Avoid copying competitors."],
  ["Research the facts", "Use Perplexity, Google, YouTube, and source notes to understand the topic before scripting."],
  ["Write the script", "Use Claude or ChatGPT to draft hooks, narration, scene notes, and alternate openings."],
  ["Create the voice", "Generate a draft voiceover with ElevenLabs, Murf, or Play.ht, then listen for pacing and pronunciation."],
  ["Build the visuals", "Use Runway, Pika, InVideo, stock footage, screenshots, or simple graphics depending on the video style."],
  ["Edit and caption", "Use CapCut, Descript, VEED, or Submagic to tighten pacing, add captions, music, and final polish."],
  ["Package and publish", "Create a title, thumbnail, description, and short clips that lead back to the full video."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Step-by-step workflow</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>How to Make a Faceless YouTube Video With AI</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">AI can help with scripting, voice, visuals, editing, and repurposing. But the real advantage is not automation for its own sake. It is building a repeatable workflow that still uses human judgment.</p>
      <QuickAnswer>The basic workflow is: research the idea, script the video, generate narration, create visuals, edit and caption the video, package it for YouTube, then repurpose the best moments into Shorts.</QuickAnswer>
      <ArticleDisclosure />
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">The workflow</h2>{steps.map(([title, body]) => <WorkflowCard key={title} title={title} body={body} />)}</section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Common mistakes</h2><ul className="list-disc space-y-3 pl-5 text-sm leading-6 text-zinc-400"><li>Buying too many tools before validating the channel idea.</li><li>Letting AI write scripts with no fact-checking or voice.</li><li>Publishing every generated clip without human editing.</li><li>Using robotic narration that does not fit the channel.</li><li>Making generic videos with no clear viewer payoff.</li></ul></section>
      <RelatedLinks links={[["/learn/best-ai-stack-for-faceless-youtube", "Best AI stack for faceless YouTube"], ["/learn/cheapest-ai-stack-for-faceless-youtube", "Cheapest faceless YouTube stack"], ["/learn/best-ai-voiceover-tools-for-faceless-videos", "Best AI voiceover tools"], ["/learn/best-ai-tools-to-add-captions-to-short-videos", "Best AI caption tools"]]} />
      <StackCta query="make faceless youtube video" label="Find my faceless video stack" secondaryHref="/learn/best-ai-stack-for-faceless-youtube" secondaryLabel="See full stack" />
    </article>
  );
}

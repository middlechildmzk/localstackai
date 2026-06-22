import { ArticleDisclosure, QuickAnswer, RelatedLinks, StackCta, WorkflowCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Voiceover Tools for Faceless Videos",
  description: "Compare AI voiceover tools for faceless YouTube, Shorts, Reels, TikTok clips, narration, and podcast-style creator videos.",
  path: "/learn/best-ai-voiceover-tools-for-faceless-videos",
});

const tools = [
  ["ElevenLabs", "Best mainstream pick for realistic narration, creator voiceovers, dubbing, and faceless video workflows."],
  ["Murf", "Good for polished explainer voiceovers, business videos, training content, and beginner-friendly voice projects."],
  ["Play.ht", "Useful when you need lots of voices, multilingual options, and a more volume-friendly narration workflow."],
  ["Descript", "Best when voice cleanup, transcript editing, screen recordings, and podcast/video editing are part of the same workflow."],
  ["Speechify", "A strong fit for simple text-to-speech, listening workflows, and lightweight narration experiments."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Voice stack guide</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Voiceover Tools for Faceless Videos</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">Voice is one of the biggest quality signals in a faceless video. A weak robotic voice can make the whole channel feel low-effort, even if the script and visuals are good.</p>
      <QuickAnswer>Start with ElevenLabs if you want the safest creator pick, Murf if you want polished explainer narration, Play.ht if you need more voice variety, and Descript if editing is part of the same workflow.</QuickAnswer>
      <ArticleDisclosure />
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Recommended tools</h2>{tools.map(([name, body]) => <WorkflowCard key={name} title={name} body={body} />)}</section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">How to choose</h2><ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-zinc-400"><li>Pick a voice that matches the channel, not just the most dramatic demo voice.</li><li>Test the same 30-second script across two or three tools.</li><li>Listen for pacing, pronunciation, warmth, and fatigue.</li><li>Export a draft and edit it with the actual video before paying for a higher tier.</li></ol></section>
      <RelatedLinks links={[["/compare/elevenlabs-vs-murf-vs-playht", "Compare ElevenLabs vs Murf vs Play.ht"], ["/learn/best-ai-stack-for-faceless-youtube", "See the full faceless YouTube stack"], ["/learn/cheapest-ai-stack-for-faceless-youtube", "See the cheapest faceless stack"], ["/learn/best-ai-tools-to-turn-long-videos-into-shorts", "Repurpose videos into Shorts"]]} />
      <StackCta query="faceless video voiceover" label="Find my voiceover stack" secondaryHref="/compare/elevenlabs-vs-murf-vs-playht" secondaryLabel="Compare voice tools" />
    </article>
  );
}

import { ArticleDisclosure, QuickAnswer, RelatedLinks, StackCta, WorkflowCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Tools for Reddit Story Videos",
  description: "A workflow-first AI stack for Reddit story videos, story Reels, narration clips, captions, and faceless short-form channels.",
  path: "/learn/best-ai-tools-for-reddit-story-videos",
});

const tools = [
  ["Claude or ChatGPT", "Rewrite and structure a story script while preserving clarity, pacing, and a human-feeling narration arc."],
  ["ElevenLabs or Play.ht", "Generate narration that sounds natural enough for story-driven short-form content."],
  ["CapCut", "Edit vertical videos, captions, simple overlays, background footage, and platform-native pacing."],
  ["Canva", "Create templates, text cards, simple backgrounds, and thumbnail-style covers."],
  ["Submagic or VEED", "Add stronger captions, emphasis, and social-first polish when CapCut is not enough."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Niche faceless stack</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Tools for Reddit Story Videos</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">Reddit-style story videos are popular because the format is simple: hook, story, narration, captions, and visual rhythm. The risk is making low-effort repost content. Use this stack to create original, transformed, clearly edited story videos.</p>
      <QuickAnswer>A simple Reddit story video stack is Claude or ChatGPT for script shaping, ElevenLabs or Play.ht for narration, CapCut for editing, Canva for templates, and Submagic or VEED for caption polish.</QuickAnswer>
      <ArticleDisclosure />
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Recommended tools</h2>{tools.map(([name, body]) => <WorkflowCard key={name} title={name} body={body} />)}</section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Trust and originality note</h2><p className="text-sm leading-6 text-zinc-400">Do not scrape or repost other people&apos;s stories blindly. Focus on original story formats, permission-safe content, transformed scripts, commentary, educational framing, or fictional/storytelling formats you own.</p></section>
      <RelatedLinks links={[["/learn/best-ai-stack-for-faceless-youtube", "Faceless YouTube stack"], ["/learn/best-ai-voiceover-tools-for-faceless-videos", "AI voiceover tools"], ["/learn/best-ai-tools-to-add-captions-to-short-videos", "AI caption tools"], ["/learn/cheapest-ai-stack-for-faceless-youtube", "Cheapest faceless stack"]]} />
      <StackCta query="reddit story video ai tools" label="Find my story video stack" secondaryHref="/learn/how-to-make-a-faceless-youtube-video-with-ai" secondaryLabel="See the workflow" />
    </article>
  );
}

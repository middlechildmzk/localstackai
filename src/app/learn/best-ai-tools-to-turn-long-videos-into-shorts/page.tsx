import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Tools to Turn Long Videos Into Shorts",
  description: "A workflow-first guide to AI tools that turn podcasts, webinars, YouTube videos, and interviews into Shorts, Reels, and TikTok clips.",
  path: "/learn/best-ai-tools-to-turn-long-videos-into-shorts",
});

const tools = [
  ["OpusClip", "Best-known long-video-to-short-clips tool for finding highlight moments and turning them into vertical clips."],
  ["Klap", "Good option for YouTube videos, interviews, and talking-head content that needs quick vertical clips."],
  ["Vizard", "Useful for creators and teams who want clipping, captions, and repurposing in one workflow."],
  ["Descript", "Best when you also need transcript editing, cleanup, captions, and podcast/video editing."],
  ["CapCut", "Best finishing tool for captions, pacing, overlays, templates, and platform-native polish."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Repurposing stack guide</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Tools to Turn Long Videos Into Shorts</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">The best long-video-to-shorts stack is not just one clipper. You need a tool to find the moments, a tool to edit and caption the clip, and a simple publishing workflow.</p>
      <div className="mt-8 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-5 text-sm leading-6 text-brand-100">Quick answer: start with OpusClip, Klap, or Vizard for clipping, then polish the best clips in CapCut or Descript before publishing.</div>
      <p className="mt-5 text-xs leading-5 text-zinc-600">Disclosure: some outbound tool links may be affiliate links. StackBuilder rankings are editorial and are not sold.</p>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Recommended tools</h2>{tools.map(([name, description]) => <div key={name} className="glass p-5"><h3 className="font-semibold text-white">{name}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p></div>)}</section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Simple workflow</h2><ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-zinc-400"><li>Upload the long video to a clipping tool.</li><li>Let the tool suggest highlight moments.</li><li>Pick only the clips that make sense as standalone posts.</li><li>Polish captions, pacing, and hooks in CapCut or Descript.</li><li>Schedule the strongest clips across Shorts, Reels, TikTok, and LinkedIn.</li></ol></section>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="/find-stack?q=turn%20long%20video%20into%20shorts" className="rounded-xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-500">Find my repurposing stack</Link><Link href="/compare/opusclip-vs-klap-vs-vizard" className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm text-zinc-300 hover:border-white/20">Compare clippers</Link></div>
    </article>
  );
}

import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Tools to Repurpose a Podcast Into Clips",
  description: "A workflow-first guide to turning podcast episodes into Shorts, Reels, TikToks, captions, show notes, and social posts with AI.",
  path: "/learn/best-ai-tools-to-repurpose-podcast-into-clips",
});

const stack = [
  ["Record or import", "Riverside or Descript", "Start with clean audio and video, or import the finished episode."],
  ["Find clip moments", "OpusClip, Klap, or Vizard", "Use AI to surface potential highlight clips, then manually choose the best ones."],
  ["Edit and caption", "Descript or CapCut", "Clean the clip, tighten pacing, add captions, and format for each platform."],
  ["Create assets", "Canva", "Make thumbnails, quote cards, carousel posts, and cover images."],
  ["Schedule", "Buffer or Metricool", "Queue the best clips and track which hooks actually get attention."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Podcast repurposing stack</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Tools to Repurpose a Podcast Into Clips</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">One podcast episode can become Shorts, Reels, TikToks, quote cards, newsletters, and blog drafts. The key is using AI to speed up the first pass while keeping a human editor in the loop.</p>
      <div className="mt-8 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-5 text-sm leading-6 text-brand-100">Quick answer: use Riverside or Descript for recording and editing, OpusClip or Vizard for clip discovery, CapCut for polish, Canva for social assets, and Buffer or Metricool for scheduling.</div>
      <p className="mt-5 text-xs leading-5 text-zinc-600">Disclosure: some outbound tool links may be affiliate links. StackBuilder rankings are editorial and are not sold.</p>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Recommended podcast-to-clips stack</h2>{stack.map(([step, tool, reason]) => <div key={step} className="glass p-5"><h3 className="font-semibold text-white">{step}: {tool}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{reason}</p></div>)}</section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">What to avoid</h2><p className="text-sm leading-6 text-zinc-400">Do not publish every AI-generated clip. Pick clips with a clear hook, standalone context, and a complete thought. AI is useful for discovery, but human judgment keeps the feed from feeling like spam.</p></section>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="/find-stack?q=podcast%20clips" className="rounded-xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-500">Find my podcast clip stack</Link><Link href="/compare/opusclip-vs-klap-vs-vizard" className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm text-zinc-300 hover:border-white/20">Compare clipping tools</Link></div>
    </article>
  );
}

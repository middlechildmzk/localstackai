import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Stack for Faceless YouTube Channels",
  description: "A workflow-first AI stack for faceless YouTube: research, scripting, voiceover, visuals, editing, thumbnails, repurposing, and publishing.",
  path: "/learn/best-ai-stack-for-faceless-youtube",
});

const steps = [
  ["Research", "Perplexity", "Find angles, examples, and source-backed facts before writing."],
  ["Script", "Claude or ChatGPT", "Draft hooks, outlines, narration, scene notes, and alternate intros."],
  ["Voice", "ElevenLabs", "Generate narration drafts and test tone before final editing."],
  ["Visuals", "Runway, Pika, InVideo, or stock footage", "Create b-roll, simple scenes, explainer visuals, or supporting clips."],
  ["Edit", "CapCut, Descript, or VEED", "Tighten pacing, captions, cuts, music, and mobile-first formatting."],
  ["Thumbnail", "Canva, Midjourney, or Ideogram", "Package the video with a clear title and thumbnail concept."],
  ["Repurpose", "OpusClip, Klap, or Vizard", "Turn strong moments into Shorts, Reels, and TikTok clips."],
];

const tiers = [
  ["Free starter", "ChatGPT or Claude free tier, CapCut, Canva free, free stock assets"],
  ["Budget stack", "ChatGPT Plus or Claude Pro, ElevenLabs starter, Canva Pro, CapCut"],
  ["Creator stack", "Claude or ChatGPT, ElevenLabs, Runway or InVideo, OpusClip, Canva Pro, Descript or CapCut"],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Flagship stack guide</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Stack for Faceless YouTube Channels</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">A faceless YouTube channel is not powered by one magic tool. It is a repeatable stack: research, script, voice, visuals, edit, package, publish, and repurpose. The best stack is the one that gets you publishing consistently without turning your channel into low-effort AI slop.</p>
      <div className="mt-8 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-5 text-sm leading-6 text-brand-100">Quick answer: use Perplexity for research, Claude or ChatGPT for scripting, ElevenLabs for narration, Runway, Pika, InVideo, or stock footage for visuals, CapCut or Descript for editing, Canva for thumbnails, and OpusClip or Vizard for repurposing.</div>
      <p className="mt-5 text-xs leading-5 text-zinc-600">Disclosure: some outbound tool links may be affiliate links. StackBuilder rankings are editorial and are not sold.</p>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">The stack at a glance</h2>{steps.map(([step, tool, reason]) => <div key={step} className="glass p-5"><h3 className="font-semibold text-white">{step}: {tool}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{reason}</p></div>)}</section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Free, budget, and creator versions</h2><div className="grid gap-4 md:grid-cols-3">{tiers.map(([tier, tools]) => <div key={tier} className="rounded-2xl border border-white/10 bg-[#111118] p-5"><h3 className="font-semibold text-white">{tier}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{tools}</p></div>)}</div></section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">How to use the stack</h2><ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-zinc-400"><li>Pick a niche where viewers already want answers, stories, education, entertainment, or useful explainers.</li><li>Use research tools to build a fact base before writing.</li><li>Write a script with a strong hook, clear payoff, and simple visual notes.</li><li>Create narration and visuals, then edit for pacing and retention.</li><li>Publish the full video, then repurpose strong moments into short clips.</li></ol></section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Trust note</h2><p className="text-sm leading-6 text-zinc-400">AI can help you create faster, but it does not guarantee views or income. YouTube and social platforms reward useful, original, engaging content. Review facts, avoid mass-produced spam, and keep a human editor in the loop.</p></section>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="/find-stack?q=faceless%20youtube" className="rounded-xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-500">Find my faceless stack</Link><Link href="/learn/cheapest-ai-stack-for-faceless-youtube" className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm text-zinc-300 hover:border-white/20">See cheapest stack</Link><Link href="/learn/best-ai-tools-to-turn-long-videos-into-shorts" className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm text-zinc-300 hover:border-white/20">Repurpose clips</Link></div>
    </article>
  );
}

import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Tools for TikTok Content Creation",
  description: "A practical AI stack for TikTok ideation, scripting, short-form video, captions, editing, repurposing, and scheduling.",
  path: "/learn/best-ai-tools-for-tiktok-content",
});

const stack = [
  ["Idea and hook generation", "ChatGPT or Claude", "Create hooks, angles, captions, and short scripts from one topic."],
  ["Research and trend checks", "Perplexity", "Use source-backed research and quick niche scans before posting."],
  ["Visual assets", "Runway, Pika, Canva", "Create short visuals, backgrounds, covers, and simple on-brand assets."],
  ["Editing and captions", "CapCut or Descript", "Cut clips, add captions, adjust pacing, and export mobile-first video."],
  ["Repurposing", "OpusClip or similar tools", "Turn longer videos, podcasts, or livestreams into short clips."],
  ["Scheduling", "Buffer, Later, or Metricool", "Plan posts, track publishing cadence, and organize content experiments."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Short-form stack guide</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Tools for TikTok Content Creation</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">A useful TikTok AI stack helps you move from idea to hook to edit to caption to post. The goal is not more tools. The goal is a repeatable short-form workflow.</p>
      <div className="mt-8 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-5 text-sm leading-6 text-brand-100">Quick answer: start with ChatGPT or Claude for hooks, Perplexity for research, Canva for assets, CapCut or Descript for editing, and Buffer, Later, or Metricool for scheduling.</div>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Recommended TikTok content stack</h2>{stack.map(([step, tools, reason]) => <div key={step} className="glass p-5"><h3 className="font-semibold text-white">{step}: {tools}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{reason}</p></div>)}</section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Best way to use the stack</h2><p className="text-sm leading-6 text-zinc-400">Batch the workflow. Generate 20 hooks, pick 5, create or record assets, edit the strongest clips, then schedule and review performance. Keep the stack simple until the process is repeatable.</p></section>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="/find-stack?q=tiktok%20content" className="rounded-xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-500">Find my TikTok stack</Link><Link href="/tools?q=short-form%20video" className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm text-zinc-300 hover:border-white/20">Browse short-form tools</Link></div>
    </article>
  );
}

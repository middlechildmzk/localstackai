import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Stack for Faceless YouTube Videos",
  description: "A practical AI stack for faceless YouTube workflows: research, script, voiceover, visuals, editing, thumbnails, and publishing.",
  path: "/learn/best-ai-stack-for-faceless-youtube",
});

const steps = [
  ["Research the topic", "Perplexity", "Use cited research and competitor scans before writing the script."],
  ["Write the script", "Claude or ChatGPT", "Create outlines, hooks, narration, scene notes, and alternate intros."],
  ["Generate voiceover", "ElevenLabs", "Create narration drafts and test tone before final editing."],
  ["Create visuals", "Runway, Pika, or stock footage", "Generate supporting visuals or short clips for key scenes."],
  ["Edit the video", "CapCut or Descript", "Add captions, pacing, music, cuts, and final polish."],
  ["Package and publish", "Canva and a scheduler", "Create thumbnails, titles, descriptions, and posting assets."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Workflow stack guide</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Stack for Faceless YouTube Videos</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">A faceless YouTube workflow needs more than a script tool. The useful stack covers research, scriptwriting, voiceover, visuals, editing, thumbnails, and publishing.</p>
      <div className="mt-8 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-5 text-sm leading-6 text-brand-100">Quick answer: start with Perplexity for research, Claude or ChatGPT for scripting, ElevenLabs for narration, Runway or Pika for visuals, CapCut or Descript for editing, and Canva for thumbnails.</div>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Recommended workflow</h2>{steps.map(([step, tool, reason]) => <div key={step} className="glass p-5"><h3 className="font-semibold text-white">{step}: {tool}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{reason}</p></div>)}</section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Free vs paid setup</h2><p className="text-sm leading-6 text-zinc-400">A free or low-cost version can use free tiers for scripting, editing, and design. Paid upgrades usually matter most when you need better voice quality, higher video generation limits, faster editing, or brand templates.</p></section>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="/find-stack?q=faceless%20youtube" className="rounded-xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-500">Find a faceless YouTube stack</Link><Link href="/workflows?q=faceless%20youtube" className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm text-zinc-300 hover:border-white/20">Browse workflow</Link></div>
    </article>
  );
}

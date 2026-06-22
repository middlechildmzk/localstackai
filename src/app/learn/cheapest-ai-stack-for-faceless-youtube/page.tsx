import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "The Cheapest AI Stack to Start a Faceless YouTube Channel",
  description: "A budget-friendly AI stack for starting a faceless YouTube workflow without overbuying tools.",
  path: "/learn/cheapest-ai-stack-for-faceless-youtube",
});

const tiers = [
  ["Free starter", "ChatGPT or Claude free tier, CapCut, Canva free, free stock assets", "Best for testing the niche before buying tools."],
  ["Budget stack", "ChatGPT Plus or Claude Pro, ElevenLabs starter, CapCut, Canva Pro", "Best for consistent scripts, better voiceovers, and faster production."],
  ["Creator stack", "Claude or ChatGPT, ElevenLabs, OpusClip, Canva Pro, CapCut or Descript", "Best once the channel has a repeatable production rhythm."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Budget stack guide</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>The Cheapest AI Stack to Start a Faceless YouTube Channel</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">Do not start by buying every AI video tool. Start with the cheapest stack that lets you test your niche, make a few videos, and learn what actually works.</p>
      <div className="mt-8 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-5 text-sm leading-6 text-brand-100">Quick answer: start free with a writing assistant, CapCut, Canva, and free assets. Upgrade voice and editing only after you know the channel idea is worth continuing.</div>
      <p className="mt-5 text-xs leading-5 text-zinc-600">Disclosure: some outbound tool links may be affiliate links. StackBuilder rankings are editorial and are not sold.</p>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Free, budget, and creator tiers</h2>{tiers.map(([tier, tools, reason]) => <div key={tier} className="glass p-5"><h3 className="font-semibold text-white">{tier}</h3><p className="mt-2 text-sm leading-6 text-zinc-400"><strong className="text-zinc-200">Tools:</strong> {tools}</p><p className="mt-2 text-sm leading-6 text-zinc-400">{reason}</p></div>)}</section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Upgrade rule</h2><p className="text-sm leading-6 text-zinc-400">Upgrade only when a paid tool removes a real bottleneck. Pay for voice if narration quality is holding you back. Pay for clipping if you are repurposing long videos. Pay for design if thumbnails and packaging slow you down.</p></section>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="/find-stack?q=cheap%20faceless%20youtube" className="rounded-xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-500">Find my budget stack</Link><Link href="/learn/best-ai-stack-for-faceless-youtube" className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm text-zinc-300 hover:border-white/20">See full faceless stack</Link></div>
    </article>
  );
}

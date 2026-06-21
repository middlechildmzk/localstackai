import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Tools for Content Creators",
  description: "A practical AI stack for creators who need ideas, writing, visuals, video, editing, scheduling, and automation.",
  path: "/learn/best-ai-tools-for-creators",
});

const stack = [
  ["Ideas and scripts", "ChatGPT or Claude", "Use for ideation, outlines, hooks, captions, and script drafts."],
  ["Research", "Perplexity", "Use for source-backed research and quick competitive scans."],
  ["Design", "Canva or Midjourney", "Use for thumbnails, carousels, covers, and visual concepts."],
  ["Video", "Runway or Pika", "Use for short clips, visual experiments, and AI-generated assets."],
  ["Editing", "CapCut or Descript", "Use for captions, edits, clips, and polish."],
  ["Automation", "Zapier or Make", "Use to connect forms, content calendars, sheets, and publishing workflows."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Creator stack guide</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Tools for Content Creators</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">The best AI creator stack is not one tool. It is a simple workflow: research, write, design, create, edit, publish, and automate. Start with a few reliable tools, then add specialized apps only when they remove real friction.</p>
      <div className="mt-8 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-5 text-sm leading-6 text-brand-100">Quick answer: creators should usually start with ChatGPT or Claude for ideas and writing, Perplexity for research, Canva for design, CapCut or Descript for editing, and Zapier or Make for automation.</div>
      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold text-white">Recommended creator stack</h2>
        {stack.map(([step, tools, reason]) => <div key={step} className="glass p-5"><h3 className="font-semibold text-white">{step}: {tools}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{reason}</p></div>)}
      </section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">How to choose</h2><p className="text-sm leading-6 text-zinc-400">Pick tools by the workflow you actually repeat. If you make short videos, prioritize scripting, captions, editing, and scheduling. If you write long-form content, prioritize research, outlining, drafting, SEO, and republishing.</p></section>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="/find-stack?q=content%20creator" className="rounded-xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-500">Find my creator stack</Link><Link href="/tools?role=creators" className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm text-zinc-300 hover:border-white/20">Browse creator tools</Link></div>
    </article>
  );
}

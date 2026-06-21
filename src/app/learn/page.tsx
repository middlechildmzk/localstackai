import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "AI Tools Knowledge Center",
  description: "Workflow-first AI tool guides, stack breakdowns, comparisons, and practical recommendations.",
  path: "/learn",
});

const articles = [
  {
    href: "/learn/best-ai-tools-for-creators",
    title: "Best AI Tools for Content Creators",
    description: "A practical creator stack for writing, visuals, video, editing, publishing, and automation.",
    tag: "Creators",
  },
  {
    href: "/learn/best-ai-stack-for-faceless-youtube",
    title: "Best AI Stack for Faceless YouTube Videos",
    description: "A step-by-step stack for scripts, voiceovers, visuals, editing, thumbnails, and publishing.",
    tag: "Video",
  },
  {
    href: "/learn/best-ai-tools-for-tiktok-content",
    title: "Best AI Tools for TikTok Content Creation",
    description: "Tools and workflows for ideation, short-form video, captions, repurposing, and scheduling.",
    tag: "Short-form",
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="border-b border-white/5 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300">
            <BookOpen size={13} /> Knowledge center beta
          </div>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
            Learn which AI tools belong in your workflow.
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-zinc-400">
            Practical guides for creators, operators, recruiters, musicians, and small teams. Each article starts with the workflow, then maps the stack.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.href} href={article.href} className="rounded-3xl border border-white/10 bg-[#111118] p-6 transition-colors hover:border-brand-500/40">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-400">{article.tag}</span>
              <h2 className="mt-4 text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{article.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{article.description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm text-brand-400">Read guide <ArrowRight size={13} /></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

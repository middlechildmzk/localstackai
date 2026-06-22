export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { createServerClient } from "@/lib/supabase";
import { ToolCard } from "@/components/tools/ToolCard";
import { WorkflowCard } from "@/components/workflows/WorkflowCard";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import type { Tool, Workflow } from "@/types";

export const metadata: Metadata = buildMetadata({
  title: "Find My AI Stack",
  description: "Describe what you want to build and get workflow-first AI stack recommendations.",
  path: "/find-stack",
});

type FindStackParams = { q?: string };

export default async function FindStackPage({ searchParams }: { searchParams: Promise<FindStackParams> }) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const terms = expandQuery(query);
  const supabase = createServerClient();

  const [{ data: workflows }, { data: tools }] = await Promise.all([
    supabase.from("workflows").select("*, steps:workflow_steps(*), tools:workflow_tools(*, tool:tools(*))").eq("is_published", true).order("sort_order").limit(80),
    supabase.from("tools").select("*, categories:tool_categories(category:categories(*)), tags:tool_tags(tag:tags(*))").eq("is_published", true).order("tool_score", { ascending: false }).limit(250),
  ]);

  const allWorkflows = (workflows ?? []) as Array<Workflow & { tools?: any[]; steps?: any[] }>;
  const allTools = (tools ?? []) as Array<Tool & { categories?: any[]; tags?: any[] }>;
  const workflowResults = rank(allWorkflows, terms, workflowText).slice(0, 6);
  const toolResults = rank(allTools, terms, toolText).slice(0, 9);
  const bestWorkflow = workflowResults[0] ?? allWorkflows.find((workflow) => workflow.is_featured) ?? allWorkflows[0];
  const stackTools = bestWorkflow?.tools?.map((entry: any) => entry.tool).filter(Boolean).slice(0, 5) ?? toolResults.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="relative overflow-hidden border-b border-white/5 px-4 py-16">
        <div className="absolute left-1/2 top-0 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300"><Sparkles size={13} /> Public beta stack finder</div>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>Find the right AI stack for what you want to build.</h1>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-zinc-400">Describe your workflow and StackBuilder will map it to relevant workflows, tools, and starter stack options.</p>
          <form action="/find-stack" className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl border border-white/10 bg-[#111118] p-3 sm:flex-row">
            <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} /><input name="q" defaultValue={query} placeholder="Try: faceless YouTube, podcast clips, captions, ebooks, app builder..." className="h-12 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-500/60" /></div>
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-500">Find Stack <ArrowRight size={15} /></button>
          </form>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 space-y-12">
        {query && <ResultHeader query={query} />}
        {bestWorkflow && <RecommendedWorkflow workflow={bestWorkflow} stackTools={stackTools} query={query} />}
        <Results title="Workflow matches" href="/workflows">{(workflowResults.length ? workflowResults : allWorkflows).slice(0, 6).map((workflow) => <WorkflowCard key={workflow.id} workflow={workflow} />)}</Results>
        <Results title="Tool matches" href={query ? `/tools?q=${encodeURIComponent(query)}` : "/tools"}>{(toolResults.length ? toolResults : allTools).slice(0, 9).map((tool, i) => <ToolCard key={tool.id} tool={tool} rank={i + 1} />)}</Results>
      </section>
    </div>
  );
}

function ResultHeader({ query }: { query: string }) { return <div className="rounded-2xl border border-brand-500/20 bg-brand-500/10 p-5"><p className="text-sm text-brand-200">Showing matches for:</p><h2 className="mt-1 text-2xl font-bold text-white">“{query}”</h2></div>; }

function RecommendedWorkflow({ workflow, stackTools, query }: { workflow: Workflow; stackTools: Tool[]; query: string }) {
  return <section className="rounded-3xl border border-white/10 bg-[#111118] p-6"><p className="text-sm font-medium text-brand-400">Recommended workflow</p><h2 className="mt-1 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{workflow.title}</h2>{workflow.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">{workflow.description}</p>}{stackTools.length > 0 && <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">{stackTools.slice(0, 5).map((tool, index) => <Link key={tool.id} href={`/tools/${tool.slug}`} className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:border-brand-500/40"><div className="mb-2 text-xs font-mono text-zinc-600">Step {index + 1}</div><div className="font-semibold text-white">{tool.name}</div><p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-500">{tool.tagline}</p></Link>)}</div>}<div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/stacks/new" className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-500">Build this stack</Link><Link href={query ? `/tools?q=${encodeURIComponent(query)}` : "/tools"} className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 hover:border-white/20">Browse matching tools</Link></div></section>;
}

function Results({ title, href, children }: { title: string; href: string; children: React.ReactNode }) { return <section><div className="mb-6 flex items-end justify-between gap-4"><h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{title}</h2><Link href={href} className="text-sm text-brand-400 hover:text-brand-300">View all →</Link></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div></section>; }

const INTENT_TERMS: Record<string, string[]> = {
  tiktok: ["short-form", "shorts", "reels", "video", "caption", "captions", "social", "creator", "capcut"],
  youtube: ["video", "faceless", "script", "voice", "voiceover", "editing", "thumbnail", "vidiq", "tubebuddy"],
  faceless: ["youtube", "video", "script", "voice", "voiceover", "narration", "editing", "thumbnail"],
  shorts: ["short-form", "reels", "tiktok", "clips", "captions", "repurposing", "opusclip", "capcut"],
  reels: ["short-form", "shorts", "tiktok", "clips", "captions", "repurposing"],
  clips: ["repurposing", "short-form", "podcast", "captions", "opusclip", "klap", "vizard"],
  repurpose: ["clips", "short-form", "podcast", "captions", "opusclip", "descript", "vizard"],
  captions: ["short-form", "submagic", "capcut", "veed", "descript", "video"],
  caption: ["captions", "short-form", "submagic", "capcut", "veed", "video"],
  voiceover: ["voice", "narration", "faceless", "elevenlabs", "murf", "playht", "video"],
  voice: ["voiceover", "narration", "faceless", "elevenlabs", "murf", "playht"],
  story: ["faceless", "voiceover", "captions", "short-form", "reddit", "video"],
  reddit: ["story", "faceless", "voiceover", "captions", "short-form"],
  podcast: ["audio", "clips", "short-form", "transcript", "descript", "riverside", "video", "social"],
  music: ["audio", "song", "suno", "udio", "artist", "video", "social"],
  ebook: ["writing", "digital", "product", "canva", "gumroad", "publishing"],
  digital: ["product", "ebook", "canva", "gumroad", "creator", "selling"],
  app: ["website", "builder", "mvp", "v0", "lovable", "bolt", "coding"],
  website: ["builder", "landing", "framer", "webflow", "seo", "content"],
  affiliate: ["seo", "blog", "content", "surfer", "jasper", "writing", "marketing"],
  recruiter: ["sourcing", "research", "candidate", "outreach", "productivity", "automation"],
  blog: ["writing", "seo", "research", "marketing", "content"],
  newsletter: ["writing", "email", "content", "growth", "marketing"],
};

function expandQuery(query: string) { const tokens = tokenize(query); return Array.from(new Set([...tokens, ...tokens.flatMap((token) => INTENT_TERMS[token] ?? [])])); }
function tokenize(value: string) { return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((token) => token.length > 2); }
function rank<T>(items: T[], terms: string[], getText: (item: T) => string) { if (!terms.length) return items; return items.map((item) => ({ item, score: terms.reduce((sum, term) => sum + (getText(item).includes(term) ? 1 : 0), 0) })).filter((result) => result.score > 0).sort((a, b) => b.score - a.score).map((result) => result.item); }
function workflowText(workflow: Workflow & { tools?: any[]; steps?: any[] }) { return [workflow.title, workflow.description, workflow.outcome, workflow.target_role, ...(workflow.steps ?? []).flatMap((step: any) => [step.title, step.description]), ...(workflow.tools ?? []).flatMap((entry: any) => [entry.notes, entry.tool?.name, entry.tool?.tagline, entry.tool?.description, ...(entry.tool?.best_for ?? [])])].filter(Boolean).join(" ").toLowerCase(); }
function toolText(tool: Tool & { categories?: any[]; tags?: any[] }) { return [tool.name, tool.tagline, tool.description, tool.pricing_notes, ...(tool.best_for ?? []), ...(tool.not_ideal_for ?? []), ...(tool.categories ?? []).map((item: any) => item.category?.name ?? item.name ?? item.category?.slug ?? item.slug), ...(tool.tags ?? []).map((item: any) => item.tag?.name ?? item.name ?? item.tag?.slug ?? item.slug)].filter(Boolean).join(" ").toLowerCase(); }

export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowRight, CheckCircle2, GitFork, Layers, Route, Sparkles } from "lucide-react";
import { createServerClient } from "@/lib/supabase";
import { WorkflowCard } from "@/components/workflows/WorkflowCard";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import type { Workflow } from "@/types";

export const metadata: Metadata = buildMetadata({
  title: "AI Workflow Stacks",
  description: "Browse outcome-focused AI workflows and fork complete AI tool stacks.",
  path: "/workflows",
});

export default async function WorkflowsHubPage() {
  const supabase = createServerClient();
  const { data: workflows } = await supabase
    .from("workflows")
    .select("*, steps:workflow_steps(*), tools:workflow_tools(*, tool:tools(*))")
    .eq("is_published", true)
    .order("sort_order")
    .limit(80);

  const items = (workflows ?? []) as Workflow[];
  const featured = items.filter((workflow) => workflow.is_featured).slice(0, 3);
  const roles = Array.from(new Set(items.map((workflow) => workflow.target_role).filter(Boolean))) as string[];
  const mappedTools = items.reduce((sum: number, workflow: any) => sum + (workflow.tools?.length ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="relative overflow-hidden border-b border-white/5 px-4 py-16">
        <div className="absolute right-0 top-0 h-[520px] w-[620px] rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300">
              <Route size={13} /> Workflow library
            </div>
            <h1 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
              Start with the workflow. Then build the stack.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-zinc-400">
              StackBuilder organizes AI tools around real outcomes: what step they support, what they replace, what they work with, and when they are worth paying for.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/stacks/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500">
                Build from a workflow <ArrowRight size={15} />
              </Link>
              <Link href="/tools" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-white/20">
                Browse all tools
              </Link>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat icon={<Layers size={16} />} label="Published workflows" value={items.length} />
            <Stat icon={<Sparkles size={16} />} label="Mapped tool options" value={mappedTools} />
            <Stat icon={<CheckCircle2 size={16} />} label="Role categories" value={roles.length || 6} />
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="border-b border-white/5 px-4 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-400">Featured workflow maps</p>
                <h2 className="mt-1 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>High-intent starting points</h2>
              </div>
              <Link href="/for" className="text-sm text-brand-400 hover:text-brand-300">Browse by role →</Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {featured.map((workflow) => <WorkflowCard key={workflow.id} workflow={workflow} />)}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-zinc-500">All workflows</p>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                Outcome-based AI workflow stacks
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {roles.slice(0, 6).map((role) => (
                <span key={role} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">{role}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((workflow) => <WorkflowCard key={workflow.id} workflow={workflow} />)}
          </div>

          {items.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-[#111118] px-6 py-16 text-center">
              <h3 className="text-xl font-bold text-white">No workflows published yet.</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">Add workflow templates in Supabase or run the workflow expansion pack to populate this page.</p>
              <Link href="/submit" className="mt-6 inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500">Suggest a workflow</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 text-brand-400">{icon}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-sm text-zinc-500">{label}</div>
    </div>
  );
}

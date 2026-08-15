export const dynamic = "force-dynamic";
import { createServerClient } from "@/lib/supabase";
import { HeroStackSearch } from "@/components/tools/HeroStackSearch";
import { ToolCard } from "@/components/tools/ToolCard";
import { WorkflowCard } from "@/components/workflows/WorkflowCard";
import { PublicStackCard } from "@/components/stacks/PublicStackCard";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import Link from "next/link";
import { ArrowRight, Zap, Shield, GitFork } from "lucide-react";
import type { Tool, Workflow, Stack } from "@/types";
import type { Metadata } from "next";

const CANONICAL_APP_URL = "https://www.stackbuilderai.com";

export const metadata: Metadata = {
  title: "Build an AI Tool Stack for Your Workflow",
  description: "Compare AI tools, workflows, and practical stacks by job. Build a usable AI workflow with cost and tradeoff context instead of collecting disconnected tools.",
  alternates: { canonical: "/" },
};

async function getHomepageData() {
  const supabase = createServerClient();

  const [toolsRes, workflowsRes, stacksRes] = await Promise.all([
    supabase
      .from("tools")
      .select(
        `*, categories:tool_categories(category:categories(*)), trending:trending_scores(*)`
      )
      .eq("is_published", true)
      .order("trending_score", {
        referencedTable: "trending_scores",
        ascending: false,
      })
      .limit(6),
    supabase
      .from("workflows")
      .select("*")
      .eq("is_published", true)
      .order("sort_order")
      .limit(6),
    supabase
      .from("stacks")
      .select(`*, owner:profiles(*), stack_tools(*, tool:tools(*))`)
      .eq("visibility", "public")
      .eq("is_featured", true)
      .limit(4),
  ]);

  return {
    tools: (toolsRes.data ?? []) as Tool[],
    workflows: (workflowsRes.data ?? []) as Workflow[],
    stacks: (stacksRes.data ?? []) as Stack[],
  };
}

export default async function HomePage() {
  const { tools, workflows, stacks } = await getHomepageData();

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "StackBuilder AI",
          url: CANONICAL_APP_URL,
          description: "A workflow-first AI tool comparison and stack-building resource.",
          potentialAction: {
            "@type": "SearchAction",
            target: `${CANONICAL_APP_URL}/tools?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }) }}
      />
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, #22c55e 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-xs font-medium">
            <Zap size={12} />
            Workflow-first AI tool comparison
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Build the right{" "}
            <span className="gradient-text">AI stack</span>
            <br />
            for your workflow.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-9 leading-relaxed">
            Compare tools by the job they need to do, then assemble a practical workflow with clearer tradeoffs, cost context, and alternatives.
          </p>

          <HeroStackSearch />
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto grid gap-4 sm:grid-cols-3">
          <Link href="/tools" className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 hover:border-zinc-700">
            <Shield className="text-brand-400 mb-3" size={20} />
            <h2 className="text-lg font-semibold text-white">Compare individual AI tools</h2>
            <p className="mt-2 text-sm text-zinc-400">Use structured tool pages and comparisons to understand fit before adding another subscription.</p>
          </Link>
          <Link href="/workflows" className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 hover:border-zinc-700">
            <GitFork className="text-brand-400 mb-3" size={20} />
            <h2 className="text-lg font-semibold text-white">Start with the workflow</h2>
            <p className="mt-2 text-sm text-zinc-400">See which tools belong together for a concrete task rather than browsing an undifferentiated directory.</p>
          </Link>
          <Link href="/find-stack" className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 hover:border-zinc-700">
            <Zap className="text-brand-400 mb-3" size={20} />
            <h2 className="text-lg font-semibold text-white">Find a stack by job</h2>
            <p className="mt-2 text-sm text-zinc-400">Describe what you are trying to accomplish and narrow the tool set around that outcome.</p>
          </Link>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div><p className="text-xs uppercase tracking-widest text-brand-400 mb-2">Tools</p><h2 className="text-2xl font-semibold text-white">Explore popular AI tools</h2></div>
            <Link href="/tools" className="text-sm text-zinc-300 hover:text-white inline-flex items-center gap-1">View tools <ArrowRight size={14}/></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
        </div>
      </section>

      <section className="py-12 px-4 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-6"><div><p className="text-xs uppercase tracking-widest text-brand-400 mb-2">Workflows</p><h2 className="text-2xl font-semibold text-white">Build around a real outcome</h2></div><Link href="/workflows" className="text-sm text-zinc-300 hover:text-white inline-flex items-center gap-1">View workflows <ArrowRight size={14}/></Link></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{workflows.map((workflow) => <WorkflowCard key={workflow.id} workflow={workflow} />)}</div>
        </div>
      </section>

      {stacks.length > 0 && <section className="py-12 px-4 border-t border-zinc-900"><div className="max-w-6xl mx-auto"><div className="flex items-end justify-between gap-4 mb-6"><div><p className="text-xs uppercase tracking-widest text-brand-400 mb-2">Stacks</p><h2 className="text-2xl font-semibold text-white">See complete tool combinations</h2></div><Link href="/stacks" className="text-sm text-zinc-300 hover:text-white inline-flex items-center gap-1">View stacks <ArrowRight size={14}/></Link></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{stacks.map((stack) => <PublicStackCard key={stack.id} stack={stack} />)}</div></div></section>}

      <section className="py-16 px-4 border-t border-zinc-900"><div className="max-w-3xl mx-auto text-center"><h2 className="text-2xl font-semibold text-white mb-3">Get practical AI workflow research</h2><p className="text-zinc-400 mb-6">New comparisons, workflow guides, and stack updates without the tool-directory noise.</p><div className="max-w-xl mx-auto"><NewsletterForm /></div></div></section>
    </div>
  );
}

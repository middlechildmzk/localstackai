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
          url: process.env.NEXT_PUBLIC_APP_URL ?? "https://stackbuilder.ai",
          potentialAction: {
            "@type": "SearchAction",
            target: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://stackbuilder.ai"}/tools?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }) }}
      />
      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        {/* Ambient glow */}
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
            Workflow-first AI stack graph · V21
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

          <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto">
            Stop bookmarking AI tools. Build a stack that actually ships. Find,
            compare, save, and share AI tool stacks for any workflow.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
            <Link href="/stacks/new" className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-colors">
              Start Your Stack <ArrowRight size={15} />
            </Link>
            <Link href="/stacks" className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-white/10 hover:border-white/20 text-zinc-300 text-sm font-medium rounded-xl transition-all">
              Browse Stacks
            </Link>
          </div>

          <HeroStackSearch />

          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
            {["YouTube Shorts", "Solopreneurs", "Content Repurposing", "Agencies", "Podcast Production"].map(
              (tag) => (
                <Link
                  key={tag}
                  href={`/workflows?q=${encodeURIComponent(tag)}`}
                  className="hover:text-brand-400 transition-colors"
                >
                  {tag} →
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-white/5 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8 text-sm text-zinc-500">
          {[
            { icon: <Shield size={14} />, label: "Human-verified freshness" },
            { icon: <Zap size={14} />, label: "Workflow-first discovery" },
            { icon: <GitFork size={14} />, label: "Fork any public stack" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-brand-500">{icon}</span>
              {label}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Sponsored listings always labeled
          </div>
        </div>
      </section>

      {/* Trending Tools */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Trending This Week
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                Ranked by saves, stack adds, and freshness — never votes alone.
              </p>
            </div>
            <Link
              href="/trending"
              className="flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} rank={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Workflows */}
      <section className="py-16 px-4 bg-[#111118]/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Popular Workflows
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                Curated tool stacks for real outcomes.
              </p>
            </div>
            <Link
              href="/workflows"
              className="flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              All workflows <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((w) => (
              <WorkflowCard key={w.id} workflow={w} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stacks */}
      {stacks.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Featured Stacks
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                  Built and shared by the community.
                </p>
              </div>
              <Link
                href="/stacks"
                className="flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                Browse stacks <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stacks.map((stack) => (
                <PublicStackCard key={stack.id} stack={stack} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-20 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2
            className="text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Get the best AI stacks every week
          </h2>
          <p className="text-zinc-400 mb-8">
            Fresh tools, new stacks, and workflow guides — no fluff.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}

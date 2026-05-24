import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { buildMetadata } from "@/lib/seo";
import { logAnalyticsEvent } from "@/lib/analytics";
import { ToolCard } from "@/components/tools/ToolCard";
import { GitFork } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerClient();
  const { data } = await supabase
    .from("workflows")
    .select("title, description")
    .eq("slug", slug)
    .single();
  if (!data) return {};
  return buildMetadata({
    title: data.title,
    description: data.description ?? undefined,
    path: `/workflows/${slug}`,
  });
}

export default async function WorkflowPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServerClient();

  const { data: workflow } = await supabase
    .from("workflows")
    .select(`*, steps:workflow_steps(*), tools:workflow_tools(*, tool:tools(*))`)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!workflow) notFound();

  await logAnalyticsEvent({
    event_type: "workflow_view",
    entity_id: workflow.id,
    entity_type: "workflow",
  });

  const stepMap = new Map(workflow.steps?.map((s: any) => [s.id, s]));
  const byStep: Record<string, any[]> = {};
  const noStep: any[] = [];

  for (const wt of workflow.tools ?? []) {
    if (wt.step_id && stepMap.has(wt.step_id)) {
      if (!byStep[wt.step_id]) byStep[wt.step_id] = [];
      byStep[wt.step_id].push(wt);
    } else {
      noStep.push(wt);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          {workflow.target_role && (
            <span className="badge" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80" }}>
              {workflow.target_role}
            </span>
          )}
        </div>
        <h1
          className="text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {workflow.title}
        </h1>
        {workflow.description && (
          <p className="text-zinc-400 text-lg">{workflow.description}</p>
        )}
        {workflow.outcome && (
          <div className="mt-4 p-3 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm">
            🎯 Outcome: {workflow.outcome}
          </div>
        )}
      </div>

      {/* Steps */}
      {workflow.steps?.length > 0 && (
        <div className="space-y-8 mb-10">
          {workflow.steps
            .sort((a: any, b: any) => a.step_number - b.step_number)
            .map((step: any) => {
              const stepTools = byStep[step.id] ?? [];
              return (
                <section key={step.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {step.step_number}
                    </div>
                    <div>
                      <h2
                        className="font-semibold text-white"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {step.title}
                      </h2>
                      {step.description && (
                        <p className="text-sm text-zinc-500">{step.description}</p>
                      )}
                    </div>
                  </div>
                  {stepTools.length > 0 && (
                    <div className="ml-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {stepTools
                        .sort((a: any, b: any) => a.sort_order - b.sort_order)
                        .map((wt: any) => (
                          <div key={wt.id}>
                            <div className="mb-1 flex items-center gap-2">
                              <span
                                className={`text-xs font-medium ${
                                  wt.tier === "budget"
                                    ? "text-zinc-500"
                                    : wt.tier === "pro"
                                    ? "text-purple-400"
                                    : "text-brand-400"
                                }`}
                              >
                                {wt.tier === "budget"
                                  ? "💰 Budget"
                                  : wt.tier === "pro"
                                  ? "⚡ Pro"
                                  : "★ Recommended"}
                              </span>
                            </div>
                            <ToolCard tool={wt.tool} />
                            {wt.notes && (
                              <p className="text-xs text-zinc-600 mt-1 px-1">
                                {wt.notes}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </section>
              );
            })}
        </div>
      )}

      {/* Tools without steps */}
      {noStep.length > 0 && (
        <section className="mb-10">
          <h2
            className="text-xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Recommended Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {noStep.map((wt: any) => (
              <ToolCard key={wt.id} tool={wt.tool} />
            ))}
          </div>
        </section>
      )}

      {/* Fork CTA */}
      <div className="glass p-6 text-center">
        <h3
          className="font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Build your own version of this stack
        </h3>
        <p className="text-sm text-zinc-500 mb-4">
          Fork it, customize the tools, and share it with your team.
        </p>
        <Link
          href={`/stacks/new?workflow=${workflow.slug}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <GitFork size={14} /> Fork this workflow
        </Link>
      </div>
    </div>
  );
}

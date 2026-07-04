import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { buildMetadata, stackJsonLd } from "@/lib/seo";
import { logAnalyticsEvent } from "@/lib/analytics";
import { ToolCard } from "@/components/tools/ToolCard";
import { ForkButton } from "@/components/stacks/ForkButton";
import { DollarSign, GitFork, Bookmark, Globe, Lock } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerClient();
  const { data } = await supabase
    .from("stacks")
    .select("title,description")
    .eq("slug", slug)
    .single();
  if (!data) return {};
  return buildMetadata({
    title: data.title,
    description: data.description ?? undefined,
    path: `/stacks/${slug}`,
  });
}

export default async function StackPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServerClient();

  const { data: stack } = await supabase
    .from("stacks")
    .select(`*, owner:profiles(*), stack_tools(*, tool:tools(*)), workflow:workflows(id,slug,title)`)
    .eq("slug", slug)
    .eq("visibility", "public")
    .single();

  if (!stack) notFound();

  await logAnalyticsEvent({
    event_type: "stack_view",
    entity_id: stack.id,
    entity_type: "stack",
  });

  const jsonLd = stackJsonLd(stack);
  const tools = stack.stack_tools?.sort((a: any, b: any) => a.step_order - b.step_order) ?? [];
  const totalCost = tools.reduce((sum: number, st: any) => sum + (st.monthly_cost ?? 0), 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-xs text-zinc-600">
            <Link href="/stacks" className="hover:text-zinc-400 transition-colors">
              Stacks
            </Link>
            <span>/</span>
            <span>{stack.title}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1
                className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {stack.title}
              </h1>
              {stack.description && (
                <p className="text-zinc-400">{stack.description}</p>
              )}
            </div>
            <ForkButton stackSlug={slug} />
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-zinc-500">
            {stack.owner && (
              <span>by {stack.owner.display_name ?? "Anonymous"}</span>
            )}
            {totalCost > 0 && (
              <span className="flex items-center gap-1">
                <DollarSign size={13} />
                ~${totalCost}/mo
              </span>
            )}
            {stack.fork_count > 0 && (
              <span className="flex items-center gap-1">
                <GitFork size={13} />
                {stack.fork_count} forks
              </span>
            )}
            {stack.save_count > 0 && (
              <span className="flex items-center gap-1">
                <Bookmark size={13} />
                {stack.save_count} saves
              </span>
            )}
            {stack.workflow && (
              <Link
                href={`/workflows/${stack.workflow.slug}`}
                className="flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors"
              >
                ← Based on: {stack.workflow.title}
              </Link>
            )}
          </div>
        </div>

        {/* Tools */}
        <div className="space-y-3 mb-8">
          {tools.map((st: any, i: number) => (
            <div key={st.id} className="flex gap-3">
              <div className="w-8 pt-4 shrink-0 text-center">
                <span className="text-xs text-zinc-700 font-mono">{i + 1}</span>
              </div>
              <div className="flex-1">
                {st.role_in_stack && (
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">
                    {st.role_in_stack}
                  </p>
                )}
                <ToolCard tool={st.tool} />
                <div className="flex gap-3 mt-1 px-1 text-xs text-zinc-600">
                  {st.monthly_cost != null && st.monthly_cost > 0 && (
                    <span>${st.monthly_cost}/mo</span>
                  )}
                  {st.data_flow_type && st.data_flow_type !== "unknown" && (
                    <span className="capitalize">
                      via {st.data_flow_type.replace("_", " ")}
                    </span>
                  )}
                  {st.notes && <span>{st.notes}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cost summary */}
        {totalCost > 0 && (
          <div className="glass p-4 flex items-center justify-between mb-6">
            <span className="text-zinc-400 text-sm">Estimated monthly cost</span>
            <span className="font-bold text-white">${totalCost}/mo</span>
          </div>
        )}

        {/* Fork CTA */}
        <div className="glass p-6 text-center">
          <h3
            className="font-bold text-white mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Make it yours
          </h3>
          <p className="text-sm text-zinc-500 mb-4">
            Fork this stack, swap out tools, and share your version.
          </p>
          <ForkButton stackSlug={slug} variant="large" />
        </div>
      </div>
    </>
  );
}

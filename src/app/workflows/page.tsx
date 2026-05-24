export const dynamic = "force-dynamic";
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
    .select("*")
    .eq("is_published", true)
    .order("sort_order")
    .limit(60);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="text-brand-400 text-sm font-medium mb-2">Workflow Library</p>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Start with the workflow, then build the stack.
        </h1>
        <p className="text-zinc-400">Every workflow maps tools to actual steps and outcomes.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(workflows ?? []).map((workflow: Workflow) => <WorkflowCard key={workflow.id} workflow={workflow} />)}
      </div>
    </div>
  );
}

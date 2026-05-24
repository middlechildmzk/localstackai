export const dynamic = "force-dynamic";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { PublicStackCard } from "@/components/stacks/PublicStackCard";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import type { Stack } from "@/types";

export const metadata: Metadata = buildMetadata({
  title: "Public AI Stacks",
  description: "Browse, save, and fork public AI tool stacks for creator, marketing, agency, and operator workflows.",
  path: "/stacks",
});

export default async function PublicStacksPage() {
  const supabase = createServerClient();
  const { data: stacks } = await supabase
    .from("stacks")
    .select(`*, owner:profiles(*), stack_tools(*, tool:tools(*))`)
    .eq("visibility", "public")
    .order("save_count", { ascending: false })
    .limit(60);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-brand-400 text-sm font-medium mb-2">Public Stack Gallery</p>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Forkable AI stacks that actually ship.
          </h1>
          <p className="text-zinc-400">Browse complete tool bundles by workflow, cost, and outcome.</p>
        </div>
        <Link href="/stacks/new" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors">
          Build a stack
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(stacks ?? []).map((stack: Stack) => <PublicStackCard key={stack.id} stack={stack} />)}
      </div>
    </div>
  );
}

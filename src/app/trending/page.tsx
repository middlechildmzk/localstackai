export const dynamic = "force-dynamic";
import { createServerClient } from "@/lib/supabase";
import { ToolCard } from "@/components/tools/ToolCard";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import type { Tool } from "@/types";

export const metadata: Metadata = buildMetadata({
  title: "Trending AI Tools",
  description: "The hottest AI tools right now — ranked by saves, stack adds, and freshness. Never by votes alone.",
  path: "/trending",
});

export const revalidate = 3600; // 1 hour

export default async function TrendingPage() {
  const supabase = createServerClient();

  const { data: tools } = await supabase
    .from("tools")
    .select(`*, trending:trending_scores(*)`)
    .eq("is_published", true)
    .order("trending_score", {
      referencedTable: "trending_scores",
      ascending: false,
    })
    .limit(30);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Trending AI Tools
        </h1>
        <p className="text-zinc-400">
          Ranked by saves, stack adds, and freshness —{" "}
          <strong className="text-white">never by votes alone.</strong>{" "}
          Updated hourly.
        </p>
      </div>

      {/* Scoring explanation */}
      <div className="glass p-4 mb-8 text-sm text-zinc-500">
        <strong className="text-zinc-300">How ranking works:</strong> 30% saves
        + 25% outbound clicks + 20% stack adds + freshness & maker claim boosts
        × time decay. Spam is penalized. Sponsored tools are clearly labeled.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(tools ?? []).map((tool: Tool, i: number) => (
          <ToolCard key={tool.id} tool={tool} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}

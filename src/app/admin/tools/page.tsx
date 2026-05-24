export const dynamic = "force-dynamic";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { freshnessLabel, formatPrice } from "@/lib/utils";

export default async function AdminToolsPage() {
  const supabase = createServerClient();
  const { data: tools } = await supabase
    .from("tools")
    .select("id,slug,name,pricing_model,starting_price,freshness,last_verified_at,is_published,is_sponsored,is_claimed,tool_score")
    .order("tool_score", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>Tools Admin</h1>
      <div className="glass overflow-hidden">
        {(tools ?? []).map((tool: any) => (
          <div key={tool.id} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-white/5 last:border-0 text-sm items-center">
            <Link href={`/tools/${tool.slug}`} className="text-white hover:text-brand-400 transition-colors">{tool.name}</Link>
            <span className="text-zinc-500">{formatPrice(tool.starting_price, tool.pricing_model)}</span>
            <span className="text-zinc-500">{freshnessLabel(tool.freshness)}</span>
            <span className="text-zinc-500">Score {Math.round(tool.tool_score ?? 0)}</span>
            <span className="text-xs text-zinc-600">{tool.is_sponsored ? "Sponsored" : tool.is_claimed ? "Claimed" : "Unclaimed"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

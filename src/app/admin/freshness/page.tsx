export const dynamic = "force-dynamic";
import { createServerClient } from "@/lib/supabase";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

export default async function FreshnessQueuePage() {
  const supabase = createServerClient();

  const { data: checks } = await supabase
    .from("source_checks")
    .select(`*, tool:tools(id,slug,name)`)
    .in("status", ["pending", "broken", "changed"])
    .order("created_at", { ascending: true })
    .limit(50);

  const { data: staleTools } = await supabase
    .from("tools")
    .select("id,slug,name,freshness,last_verified_at")
    .eq("is_published", true)
    .eq("freshness", "stale")
    .order("last_verified_at", { ascending: true })
    .limit(20);

  return (
    <div className="space-y-8">
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Freshness Queue
      </h1>

      {/* Source checks */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3">
          Source Checks ({checks?.length ?? 0})
        </h2>
        {(!checks || checks.length === 0) && (
          <p className="text-zinc-600 text-sm">Queue is clear.</p>
        )}
        <div className="space-y-2">
          {checks?.map((c: any) => (
            <div key={c.id} className="glass p-3 flex items-center gap-4 text-sm">
              <span
                className={`text-xs font-medium w-16 ${
                  c.status === "broken"
                    ? "text-red-400"
                    : c.status === "changed"
                    ? "text-yellow-400"
                    : "text-zinc-500"
                }`}
              >
                {c.status}
              </span>
              <span className="text-xs text-zinc-600 w-16 uppercase">
                {c.check_type}
              </span>
              <Link
                href={`/admin/tools?edit=${c.tool?.id}`}
                className="text-white hover:text-brand-400 transition-colors"
              >
                {c.tool?.name}
              </Link>
              {c.source_url && (
                <a
                  href={c.source_url}
                  target="_blank"
                  rel="noopener"
                  className="text-zinc-600 hover:text-brand-400 ml-auto text-xs"
                >
                  Check URL →
                </a>
              )}
              <span className="text-xs text-zinc-700">{timeAgo(c.created_at)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stale tools */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3">
          Stale Tools ({staleTools?.length ?? 0})
        </h2>
        <div className="space-y-2">
          {staleTools?.map((t: any) => (
            <div key={t.id} className="glass p-3 flex items-center gap-4 text-sm">
              <span className="text-yellow-400 text-xs w-12">stale</span>
              <Link
                href={`/tools/${t.slug}`}
                className="text-white hover:text-brand-400 transition-colors"
              >
                {t.name}
              </Link>
              <span className="text-xs text-zinc-700 ml-auto">
                Last verified:{" "}
                {t.last_verified_at ? timeAgo(t.last_verified_at) : "never"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

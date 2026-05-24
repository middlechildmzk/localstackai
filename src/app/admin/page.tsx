export const dynamic = "force-dynamic";
import { createServerClient } from "@/lib/supabase";

export default async function AdminPage() {
  const supabase = createServerClient();

  const [
    { count: toolCount },
    { count: pendingSubmissions },
    { count: pendingClaims },
    { count: newsletterCount },
    { count: stackCount },
    { data: recentEvents },
  ] = await Promise.all([
    supabase.from("tools").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("claims").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("stacks").select("*", { count: "exact", head: true }),
    supabase.from("analytics_events").select("event_type,created_at").order("created_at", { ascending: false }).limit(10),
  ]);

  const stats = [
    { label: "Published Tools", value: toolCount ?? 0, href: "/admin/tools", urgent: false },
    { label: "Pending Submissions", value: pendingSubmissions ?? 0, href: "/admin/submissions", urgent: (pendingSubmissions ?? 0) > 0 },
    { label: "Pending Claims", value: pendingClaims ?? 0, href: "/admin/claims", urgent: (pendingClaims ?? 0) > 0 },
    { label: "Newsletter Subs", value: newsletterCount ?? 0, href: "/admin/analytics", urgent: false },
    { label: "Public Stacks", value: stackCount ?? 0, href: "/admin/tools", urgent: false },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
        Admin Overview
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className={`glass p-4 hover:border-white/10 transition-all ${stat.urgent ? "border-yellow-500/30 bg-yellow-500/5" : ""}`}
          >
            <div className={`text-2xl font-bold mb-1 ${stat.urgent ? "text-yellow-400" : "text-white"}`}>
              {stat.value}
            </div>
            <div className="text-xs text-zinc-500">{stat.label}</div>
          </a>
        ))}
      </div>

      <section>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3">
          Recent Events
        </h2>
        <div className="glass overflow-hidden">
          {(recentEvents ?? []).map((e: any, i: number) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0 text-sm"
            >
              <span className="font-mono text-xs text-zinc-600 w-24 shrink-0">
                {e.event_type}
              </span>
              <span className="text-zinc-500 text-xs ml-auto">
                {new Date(e.created_at).toLocaleString()}
              </span>
            </div>
          ))}
          {(!recentEvents || recentEvents.length === 0) && (
            <p className="px-4 py-4 text-sm text-zinc-600">No events yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

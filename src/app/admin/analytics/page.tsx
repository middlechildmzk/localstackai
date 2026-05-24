export const dynamic = "force-dynamic";
import { createServerClient } from "@/lib/supabase";

export default async function AdminAnalyticsPage() {
  const supabase = createServerClient();
  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const counts = (events ?? []).reduce((acc: Record<string, number>, event: any) => {
    acc[event.event_type] = (acc[event.event_type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(counts).map(([name, count]) => (
          <div key={name} className="glass p-4">
            <div className="text-2xl font-bold text-white">{Number(count)}</div>
            <div className="text-xs text-zinc-500">{name}</div>
          </div>
        ))}
      </div>
      <div className="glass overflow-hidden">
        {(events ?? []).map((event: any, index: number) => (
          <div key={index} className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 last:border-0 text-sm">
            <span className="text-zinc-300">{event.event_type}</span>
            <span className="text-xs text-zinc-600">{new Date(event.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

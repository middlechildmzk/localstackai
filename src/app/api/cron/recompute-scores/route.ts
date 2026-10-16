import { NextResponse } from "next/server";
import { createServerClient, hasSupabaseServiceConfig } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json({ ok: true, mode: "demo", message: "Score recompute skipped because Supabase env vars are not configured." });
  }
  const supabase = createServerClient();
  // Trending first: compute_tool_scores() reads trending_scores.trending_score,
  // so it must see this run's fresh values.
  const { error: trendError } = await supabase.rpc("compute_trending_scores");
  if (trendError) return NextResponse.json({ error: trendError.message }, { status: 500 });
  // Loop 3 scoring: writes the full tool_score composite. The function is
  // money-blind by construction — it never reads sponsorship data.
  const { error: scoreError } = await supabase.rpc("compute_tool_scores");
  if (scoreError) return NextResponse.json({ error: scoreError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

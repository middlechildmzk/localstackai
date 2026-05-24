import { NextResponse } from "next/server";
import { createServerClient, hasSupabaseServiceConfig } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json({ ok: true, mode: "demo", message: "Freshness cron skipped because Supabase env vars are not configured." });
  }
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("tools")
    .select("id,slug,name,last_verified_at")
    .eq("is_published", true)
    .order("last_verified_at", { ascending: true })
    .limit(25);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, queued: data?.length ?? 0, tools: data });
}

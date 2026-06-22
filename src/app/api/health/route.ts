import { NextResponse } from "next/server";
import { createServerClient, hasSupabaseConfig, hasSupabaseServiceConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServerClient();
  let dbReadOk = false;
  let dbError: string | null = null;

  try {
    const { error } = await supabase.from("tools").select("id").limit(1);
    dbReadOk = !error;
    dbError = error?.message ?? null;
  } catch (error) {
    dbReadOk = false;
    dbError = error instanceof Error ? error.message : "Unknown database read error";
  }

  return NextResponse.json({
    ok: dbReadOk,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    checks: {
      hasSupabasePublicConfig: hasSupabaseConfig(),
      hasSupabaseServiceConfig: hasSupabaseServiceConfig(),
      hasAppUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
      hasPosthogKey: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY),
      hasCronSecret: Boolean(process.env.CRON_SECRET),
      dbReadOk,
    },
    dbError,
  });
}

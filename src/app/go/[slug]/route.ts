import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getFallbackTool } from "@/lib/fallback-tools";
import { logAnalyticsEvent } from "@/lib/analytics";

type RouteContext = { params: { slug: string } };

export async function GET(req: NextRequest, { params }: RouteContext) {
  let tool: any = null;

  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("tools")
      .select("id,slug,website_url,affiliate_url,is_published")
      .eq("slug", params.slug)
      .eq("is_published", true)
      .single();
    tool = data ?? null;
  } catch {
    tool = null;
  }

  const fallback = getFallbackTool(params.slug);
  const resolved = tool ?? fallback;

  if (!resolved) return NextResponse.redirect(new URL("/tools", req.url));

  const destination = resolved.affiliate_url || resolved.website_url;
  if (!destination) return NextResponse.redirect(new URL(`/tools/${resolved.slug}`, req.url));

  if (tool?.id) {
    await logAnalyticsEvent({
      event_type: "outbound_click",
      entity_id: tool.id,
      entity_type: "tool",
      metadata: { destination_source: "live_database" },
    });
  } else {
    await logAnalyticsEvent({
      event_type: "outbound_click",
      entity_id: fallback?.id,
      entity_type: "tool",
      metadata: { destination_source: "verified_official_fallback" },
    });
  }

  return NextResponse.redirect(destination, { status: 302 });
}

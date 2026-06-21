import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { logAnalyticsEvent } from "@/lib/analytics";

type RouteContext = { params: { slug: string } };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const supabase = createServerClient();
  const { data: tool } = await supabase
    .from("tools")
    .select("id,slug,website_url,affiliate_url,is_published")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!tool) return NextResponse.redirect(new URL("/tools", req.url));
  const destination = tool.affiliate_url || tool.website_url;
  if (!destination) return NextResponse.redirect(new URL(`/tools/${tool.slug}`, req.url));

  await logAnalyticsEvent({ event_type: "outbound_click", entity_id: tool.id, entity_type: "tool" });
  return NextResponse.redirect(destination, { status: 302 });
}

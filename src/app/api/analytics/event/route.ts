import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { z } from "zod";

const EventSchema = z.object({
  event_type: z.enum([
    "tool_view", "search", "save", "stack_create", "stack_fork",
    "compare_click", "outbound_click", "submit_tool", "claim_tool",
    "newsletter_signup", "stack_view", "workflow_view",
  ]),
  entity_id: z.string().uuid().optional(),
  entity_type: z.string().optional(),
  session_id: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = EventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 422 });
  }

  const supabase = createServerClient();
  await supabase.from("analytics_events").insert(parsed.data);

  return NextResponse.json({ ok: true });
}

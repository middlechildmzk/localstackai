import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";
import { logAnalyticsEvent } from "@/lib/analytics";

const ClaimSchema = z.object({
  tool_id: z.string().uuid(),
  claimant_email: z.string().email(),
  proof_url: z.string().url().optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = ClaimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 422 });
  }

  const { error } = await supabase.from("claims").insert({
    ...parsed.data,
    claimed_by: user.id,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: "Claim failed" }, { status: 500 });
  }

  await logAnalyticsEvent({
    event_type: "claim_tool",
    entity_id: parsed.data.tool_id,
    entity_type: "tool",
    user_id: user.id,
  });

  return NextResponse.json({ message: "Claim submitted for review." });
}

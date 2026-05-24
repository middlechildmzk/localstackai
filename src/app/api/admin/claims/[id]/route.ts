import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { action, review_notes } = await req.json().catch(() => ({}));

  if (!["approved", "rejected"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 422 });
  }

  const { data: claim } = await supabase
    .from("claims")
    .update({ status: action, reviewer_id: user.id, review_notes })
    .eq("id", id)
    .select()
    .single();

  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

  // If approved: mark tool as claimed
  if (action === "approved") {
    await supabase
      .from("tools")
      .update({ is_claimed: true, claimed_by: claim.claimed_by })
      .eq("id", claim.tool_id);

    await supabase
      .from("profiles")
      .update({ is_maker: true })
      .eq("id", claim.claimed_by);
  }

  await supabase.from("admin_audit_log").insert({
    admin_id: user.id,
    action: `claim_${action}`,
    entity_type: "claim",
    entity_id: id,
    notes: review_notes,
  });

  return NextResponse.json({ success: true });
}

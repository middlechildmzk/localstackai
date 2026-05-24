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

  // Check admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { action, review_notes } = body as { action: "approved" | "rejected"; review_notes?: string };

  if (!["approved", "rejected"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 422 });
  }

  const { error } = await supabase
    .from("submissions")
    .update({ status: action, reviewer_id: user.id, review_notes })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  // Audit log
  await supabase.from("admin_audit_log").insert({
    admin_id: user.id,
    action: `submission_${action}`,
    entity_type: "submission",
    entity_id: id,
    notes: review_notes,
  });

  return NextResponse.json({ success: true });
}

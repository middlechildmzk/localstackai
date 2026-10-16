export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerClient } from "@/lib/supabase";
import { SponsorshipReviewTable } from "@/components/showcase/SponsorshipReviewTable";
import { durationForPlacement, type SponsorshipWithTool } from "@/components/showcase/tiers";
import { revalidatePath } from "next/cache";

/**
 * /admin/sponsorships — human approval queue for paid showcase placements.
 *
 * TRUST RULE: these server actions are the ONLY code paths in the codebase
 * that may set sponsorships.is_active. The Stripe webhook marks
 * payment_status='paid' but can never activate — approval is always human.
 *
 *  - approve: starts the live window NOW (starts_at=now, ends_at=now+duration
 *    for the placement), sets is_active=true, and mirrors tools.is_sponsored=true
 *    so detail pages / ToolCard render the Sponsored badge consistently.
 *  - reject: is_active stays false; the tool never goes live. (Refunds are a
 *    manual Stripe-dashboard step — noted, not automated.)
 *  - expire: ends a live placement immediately (is_active=false, ends_at=now,
 *    tools.is_sponsored=false).
 *
 * Render rule (also enforced in <SponsoredSlot> and by RLS): only rows with
 * is_active=true AND starts_at <= now <= ends_at may appear in sponsored slots.
 */

async function requireAdmin() {
  const authClient = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) throw new Error("Sign in required.");
  const { data: profile } = await authClient
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("Admin access required.");
  return user;
}

async function audit(adminId: string, action: string, id: string, notes?: string) {
  const supabase = createServerClient();
  await supabase.from("admin_audit_log").insert({
    admin_id: adminId,
    action,
    entity_type: "sponsorship",
    entity_id: id,
    notes,
  });
}

async function approveSponsorship(id: string) {
  "use server";
  const admin = await requireAdmin();
  const supabase = createServerClient();

  const { data: row } = await supabase
    .from("sponsorships")
    .select("id, tool_id, placement, is_active, payment_status")
    .eq("id", id)
    .single();

  if (!row) throw new Error("Sponsorship not found.");
  if (row.payment_status !== "paid") {
    throw new Error("Only paid sponsorships can be approved — payment is not confirmed.");
  }
  if (row.is_active) throw new Error("Already live.");

  const now = new Date();
  const endsAt = new Date(now.getTime() + durationForPlacement(row.placement) * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from("sponsorships")
    .update({
      is_active: true, // ← the ONLY place this becomes true
      starts_at: now.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error("Approval failed.");

  // Mirror flag so ToolCard / tool detail pages render the Sponsored badge.
  await supabase.from("tools").update({ is_sponsored: true }).eq("id", row.tool_id);
  await audit(admin.id, "sponsorship_approved", id, `Live until ${endsAt.toISOString()}.`);
  revalidatePath("/admin/sponsorships");
}

async function rejectSponsorship(id: string) {
  "use server";
  const admin = await requireAdmin();
  const supabase = createServerClient();

  const { data: row } = await supabase
    .from("sponsorships")
    .select("id, is_active")
    .eq("id", id)
    .single();

  if (!row) throw new Error("Sponsorship not found.");
  if (row.is_active) throw new Error("Already live — use Expire instead.");

  // is_active stays false; never goes live. Refund (if owed) is a manual
  // Stripe-dashboard step — intentionally not automated here.
  const { error } = await supabase
    .from("sponsorships")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error("Rejection failed.");
  await audit(admin.id, "sponsorship_rejected", id, "Rejected by admin; never went live.");
  revalidatePath("/admin/sponsorships");
}

async function expireSponsorship(id: string) {
  "use server";
  const admin = await requireAdmin();
  const supabase = createServerClient();

  const { data: row } = await supabase
    .from("sponsorships")
    .select("id, tool_id")
    .eq("id", id)
    .single();

  if (!row) throw new Error("Sponsorship not found.");

  const { error } = await supabase
    .from("sponsorships")
    .update({ is_active: false, ends_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error("Expire failed.");

  await supabase.from("tools").update({ is_sponsored: false }).eq("id", row.tool_id);
  await audit(admin.id, "sponsorship_expired", id, "Ended early by admin.");
  revalidatePath("/admin/sponsorships");
}

export default async function AdminSponsorshipsPage() {
  // Admin gate for the page itself (existing admin pages don't gate; this one
  // handles money, so it does).
  try {
    await requireAdmin();
  } catch {
    return (
      <div>
        <h1
          className="text-2xl font-bold text-white mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Sponsorships
        </h1>
        <p className="text-sm text-zinc-500">
          Admin access required. Sign in with an admin account to review paid
          showcase placements.
        </p>
      </div>
    );
  }

  const supabase = createServerClient();
  const { data } = await supabase
    .from("sponsorships")
    .select(
      "id, tool_id, starts_at, ends_at, placement, is_active, amount_usd, stripe_session_id, payment_status, paid_at, created_at, tool:tools(id, slug, name, tagline, logo_url, website_url, is_published)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const sponsorships = (data ?? []) as unknown as SponsorshipWithTool[];

  return (
    <div>
      <h1
        className="text-2xl font-bold text-white mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Sponsorships
      </h1>
      <p className="text-sm text-zinc-500 mb-6 max-w-2xl">
        Paid showcase placements. Approving a <em>paid</em> row is the only way
        a sponsorship goes live — the Stripe webhook can record payment but can
        never activate. Only active rows inside their date window render in{" "}
        <span className="badge badge-sponsored">Sponsored</span> slots, and paid
        slots never affect rankings (
        <a href="/methodology" className="underline hover:text-zinc-300">
          methodology
        </a>
        ).
      </p>
      <SponsorshipReviewTable
        sponsorships={sponsorships}
        onApprove={approveSponsorship}
        onReject={rejectSponsorship}
        onExpire={expireSponsorship}
      />
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase";
import { getTier } from "@/components/showcase/tiers";

export const dynamic = "force-dynamic";

/**
 * POST /api/showcase/checkout
 * Body: { tier: "launch" | "sponsored", toolSlug: string, email?: string }
 *
 * TEST MODE ONLY. The Stripe secret key must be a test key (sk_test_...);
 * any other key is refused outright — this route can never create a live
 * charge. No live keys or price ids are hardcoded anywhere; everything comes
 * from env (see SHOWCASE_ENV_VARS in components/showcase/tiers.ts).
 *
 * Flow:
 *  1. Validate tier + resolve the tool (must exist and be published).
 *  2. Insert a sponsorships row with is_active=false (NOT live — human
 *     approval in /admin/sponsorships is required before anything renders).
 *  3. Create a Stripe Checkout Session in test mode, linking the row via
 *     client_reference_id + metadata.
 *  4. Return the session URL for redirect.
 *
 * The rank pipeline is untouched: this route never reads or writes
 * tool_score and never touches sort order.
 */

interface CheckoutBody {
  tier?: string;
  toolSlug?: string;
  email?: string;
}

function extractSlug(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  // Accept a full tool URL too: https://.../tools/my-tool -> my-tool
  const match = trimmed.match(/\/tools\/([A-Za-z0-9-_]+)\/?(?:[?#].*)?$/);
  if (match) return match[1];
  // Otherwise treat the input as a bare slug.
  return trimmed.split("/").filter(Boolean).pop() ?? "";
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as CheckoutBody;
  const tier = getTier(body.tier ?? "");
  const slug = extractSlug(body.toolSlug ?? "");

  if (!tier) {
    return NextResponse.json({ error: "Invalid tier." }, { status: 422 });
  }
  if (!slug) {
    return NextResponse.json(
      { error: "Provide your tool's slug or StackBuilder tool URL." },
      { status: 422 }
    );
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = tier.priceEnvVar ? process.env[tier.priceEnvVar] : undefined;

  // ── Hard test-mode guard: refuse anything that is not a Stripe TEST key.
  if (!secretKey || !secretKey.startsWith("sk_test_")) {
    return NextResponse.json(
      {
        error:
          "Showcase checkout is not configured (test mode only). The site owner needs to set a Stripe TEST secret key.",
      },
      { status: 503 }
    );
  }
  if (!priceId || !priceId.startsWith("price_")) {
    return NextResponse.json(
      {
        error: `Showcase checkout is not configured: missing ${tier.priceEnvVar} (Stripe test price id).`,
      },
      { status: 503 }
    );
  }

  const supabase = createServerClient();

  // The tool must exist and be published — no showcasing drafts or ghosts.
  const { data: tool } = await supabase
    .from("tools")
    .select("id, slug, name, is_published")
    .eq("slug", slug)
    .single();

  if (!tool || !tool.is_published) {
    return NextResponse.json(
      { error: "Tool not found. It must be a published tool on StackBuilder." },
      { status: 404 }
    );
  }

  // Avoid double-selling the same slot: if this tool already has a pending or
  // live sponsorship for this placement, point the buyer at the existing one.
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("sponsorships")
    .select("id, is_active, payment_status")
    .eq("tool_id", tool.id)
    .eq("placement", tier.placement)
    .or(`and(is_active.eq.true,ends_at.gte.${now}),payment_status.eq.unpaid,payment_status.eq.paid`)
    .limit(1);

  if (existing && existing.length > 0) {
    const row = existing[0] as { is_active: boolean; payment_status: string };
    return NextResponse.json(
      {
        error:
          row.is_active
            ? "This tool already has a live sponsored placement in this slot."
            : "This tool already has a showcase purchase in progress. It is awaiting payment or admin approval.",
      },
      { status: 409 }
    );
  }

  // Insert the sponsorship row: NOT active. A human approves in /admin
  // before anything is visible. Dates below are provisional; approval sets
  // the real live window (starts_at=now, ends_at=now+durationDays).
  const provisionalEnd = new Date(
    Date.now() + tier.durationDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: sponsorship, error: insertError } = await supabase
    .from("sponsorships")
    .insert({
      tool_id: tool.id,
      starts_at: now,
      ends_at: provisionalEnd,
      placement: tier.placement,
      is_active: false, // ← never live until admin approval
      amount_usd: tier.priceUsd,
      payment_status: "unpaid",
    })
    .select("id")
    .single();

  if (insertError || !sponsorship) {
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secretKey);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      // Link the Stripe session back to our row (the webhook reads this).
      client_reference_id: sponsorship.id,
      metadata: {
        sponsorship_id: sponsorship.id,
        tool_id: tool.id,
        tool_slug: tool.slug,
        tier: tier.id,
        placement: tier.placement,
        test_mode: "true",
      },
      customer_email: body.email?.trim() || undefined,
      success_url: `${appUrl}/showcase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/showcase/cancel`,
    });

    // Persist the session id for the admin audit trail.
    await supabase
      .from("sponsorships")
      .update({ stripe_session_id: session.id })
      .eq("id", sponsorship.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Stripe failed after we created the row: leave it as unpaid (admin can
    // see and clean it up); never leave a half-wired paid state.
    console.error("[showcase/checkout] stripe session create failed", err);
    return NextResponse.json(
      { error: "Payment provider error (test mode). Please try again." },
      { status: 502 }
    );
  }
}

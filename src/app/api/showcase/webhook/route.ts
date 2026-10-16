import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * POST /api/showcase/webhook — Stripe webhook (TEST MODE).
 *
 * Security:
 *  - Every request must carry a valid Stripe signature, verified against
 *    STRIPE_WEBHOOK_SECRET via stripe.webhooks.constructEvent. Unsigned or
 *    mis-signed requests are rejected with 400 — no state changes.
 *  - The raw request body is used for verification (req.text(), never req.json()).
 *
 * TRUST RULE — the single most important line in this file:
 *   On checkout.session.completed this handler marks the sponsorship
 *   payment_status='paid' (paid-but-pending-approval). It MUST NEVER set
 *   is_active=true. Activation is a human decision in /admin/sponsorships
 *   only. There is no code path in this file that writes is_active.
 */
export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !secretKey.startsWith("sk_test_")) {
    // Test-mode guard: this endpoint only ever runs against test keys.
    return NextResponse.json(
      { error: "Webhook not configured (test mode only)." },
      { status: 503 }
    );
  }
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured: missing STRIPE_WEBHOOK_SECRET." },
      { status: 503 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);
  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[showcase/webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = createServerClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const sponsorshipId =
        session.metadata?.sponsorship_id ?? session.client_reference_id;

      if (!sponsorshipId) {
        console.error(
          "[showcase/webhook] completed session without sponsorship linkage",
          session.id
        );
        break;
      }

      // Mark PAID — but keep is_active=false. Admin approval required.
      // Idempotent: only transitions unpaid -> paid.
      const { error } = await supabase
        .from("sponsorships")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          stripe_session_id: session.id,
          // is_active is deliberately NOT touched here. Ever.
        })
        .eq("id", sponsorshipId)
        .eq("payment_status", "unpaid");

      if (error) {
        console.error("[showcase/webhook] failed to mark paid", error);
        return NextResponse.json(
          { error: "Failed to record payment." },
          { status: 500 }
        );
      }
      console.info(
        `[showcase/webhook] sponsorship ${sponsorshipId} marked paid (pending admin approval), session ${session.id}`
      );
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const sponsorshipId =
        session.metadata?.sponsorship_id ?? session.client_reference_id;
      if (sponsorshipId) {
        await supabase
          .from("sponsorships")
          .update({ payment_status: "expired" })
          .eq("id", sponsorshipId)
          .eq("payment_status", "unpaid");
      }
      break;
    }

    default:
      // Acknowledge unhandled event types without action.
      break;
  }

  return NextResponse.json({ received: true });
}

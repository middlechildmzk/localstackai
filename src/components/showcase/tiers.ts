/**
 * Paid-showcase domain config (Phase 2 monetization).
 *
 * TRUST RULE — read before touching: money buys LABELED VISIBILITY in dedicated
 * slots, and NOTHING else. It never buys rank, scores, reviews, freshness, or
 * verification status. The rank/scoring pipeline must never read `is_sponsored`
 * or the `sponsorships` table — see AUTONOMOUS_BUSINESS_DESIGN.md and
 * /methodology ("Sponsored placements must be labeled. Rankings are not for sale.").
 *
 * PRICES ARE PLACEHOLDER / TEST ONLY. Stripe runs in TEST MODE (the checkout
 * route refuses any key that is not an sk_test_ key). No real charges, ever,
 * until Dan explicitly approves live mode.
 */

export const SPONSORED_PLACEMENTS = ["launchboard", "tools_page", "category_page"] as const;
export type SponsoredPlacement = (typeof SPONSORED_PLACEMENTS)[number];

export type ShowcaseTierId = "launch" | "sponsored";

export interface ShowcaseTier {
  id: ShowcaseTierId;
  name: string;
  tagline: string;
  /** Display price — TEST/PLACEHOLDER, not final pricing. */
  priceDisplay: string;
  priceUsd: number;
  billing: string;
  /** Live window granted on admin approval. */
  durationDays: number;
  placement: SponsoredPlacement;
  placementLabel: string;
  /** Env var holding the Stripe TEST price id for this tier. */
  priceEnvVar: "STRIPE_LAUNCH_PRICE_ID" | "STRIPE_SPONSORED_PRICE_ID";
  features: string[];
}

export const SHOWCASE_TIERS: ShowcaseTier[] = [
  {
    id: "launch",
    name: "Launch Feature",
    tagline: "Put your launch in front of builders for a full week.",
    priceDisplay: "$49",
    priceUsd: 49,
    billing: "one-time",
    durationDays: 7,
    placement: "launchboard",
    placementLabel: "Launchboard slot",
    priceEnvVar: "STRIPE_LAUNCH_PRICE_ID",
    features: [
      "Featured card in the launchboard slot for 7 days",
      "Always rendered with a visible “Sponsored” label",
      "Links to your tool profile and website",
    ],
  },
  {
    id: "sponsored",
    name: "Sponsored Slot",
    tagline: "Stay visible where builders browse, all month.",
    priceDisplay: "$99",
    priceUsd: 99,
    billing: "per 30 days",
    durationDays: 30,
    placement: "tools_page",
    placementLabel: "/tools + category pages",
    priceEnvVar: "STRIPE_SPONSORED_PRICE_ID",
    features: [
      "Labeled sponsored slot on /tools and category pages for 30 days",
      "Always rendered with a visible “Sponsored” label",
      "Separate from — and never mixed into — organic rankings",
    ],
  },
];

export function getTier(id: string): ShowcaseTier | undefined {
  return SHOWCASE_TIERS.find((t) => t.id === id);
}

/** Live window (in days) granted when an admin approves a placement. */
export function durationForPlacement(placement: string): number {
  const tier = SHOWCASE_TIERS.find((t) => t.placement === placement);
  return tier?.durationDays ?? 30;
}

/** Payment lifecycle. Webhook may move unpaid → paid/expired. ONLY a human in
 *  /admin/sponsorships may flip is_active. */
export type SponsorshipPaymentStatus = "unpaid" | "paid" | "expired" | "refunded";

export interface Sponsorship {
  id: string;
  tool_id: string;
  starts_at: string;
  ends_at: string;
  placement: string;
  is_active: boolean;
  amount_usd: number | null;
  stripe_session_id: string | null;
  payment_status: SponsorshipPaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export interface SponsorshipWithTool extends Sponsorship {
  tool: {
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    logo_url: string | null;
    website_url: string | null;
    is_published: boolean;
  } | null;
}

/** Env vars Dan must set for the paid-showcase flow (all TEST mode). */
export const SHOWCASE_ENV_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_LAUNCH_PRICE_ID",
  "STRIPE_SPONSORED_PRICE_ID",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const;

export type FallbackTool = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  website_url: string;
  affiliate_url: string | null;
  pricing_model: "unknown";
  has_free_plan: null;
  starting_price: null;
  freshness: "unverified";
  stack_count: number;
  best_for: string[];
  is_published: true;
  data_source: "static_fallback";
};

export function partnerUrl(envName: string): string | null {
  const value = process.env[envName]?.trim();
  return value || null;
}

/**
 * Minimal continuity data for high-value comparison and editorial pages.
 *
 * This is intentionally NOT a pricing database. These records exist so an
 * unavailable Supabase project does not turn already-discovered comparison
 * URLs or vendor CTAs into 404s/dead ends. Product identity, broad workflow
 * category, and official vendor URL are sourced from vendor-owned public
 * product/help pages; commercial terms remain explicitly unverified until the
 * live data layer is available again.
 *
 * Approved affiliate destinations can be injected through server-only Vercel
 * environment variables. When none is configured, /go/* always falls back to
 * the official vendor URL rather than a dead end.
 */

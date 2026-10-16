import { createServerClient } from "@/lib/supabase";
import { ShowcaseCard } from "./ShowcaseCard";
import { SHOWCASE_TIERS, type SponsoredPlacement } from "./tiers";

/**
 * <SponsoredSlot placement="..." />
 *
 * Renders paid sponsorships in a DEDICATED slot. Trust rules enforced here:
 *
 * 1. ONLY rows with is_active=true AND a currently-valid date window
 *    (starts_at <= now <= ends_at) may render. This is filtered in the query
 *    AND backstopped by the "sponsorships_public_active" RLS policy
 *    (supabase/migrations/002_sponsorships_payments.sql). Pending payment,
 *    pending approval, rejected, and expired rows can never leak through.
 *
 * 2. This slot NEVER alters the sort order of organic results. It queries the
 *    sponsorships table directly and renders its own section — it does not
 *    inject into, reorder, or score any organic tool list. The rank pipeline
 *    stays blind to money: nothing here reads tool_score, is_sponsored, or
 *    influences any ranking query.
 *
 * 3. Every card carries an unconditional "Sponsored" badge (see ShowcaseCard).
 *
 * Usage (drop into a page wherever a sponsored slot is wanted — this component
 * does NOT wire itself into /tools or category pages; that integration is a
 * separate, explicit step):
 *
 *   <SponsoredSlot placement="tools_page" title="Sponsored" />
 *   <SponsoredSlot placement="launchboard" title="Featured launches" />
 *   <SponsoredSlot placement="category_page" categoryLimit={3} />
 */
export async function SponsoredSlot({
  placement,
  title = "Sponsored",
  limit = 4,
}: {
  placement: SponsoredPlacement;
  title?: string;
  limit?: number;
}) {
  const supabase = createServerClient();
  const now = new Date().toISOString();

  // Active + date-valid ONLY. Pending/expired rows are excluded here and by RLS.
  const { data: sponsorships } = await supabase
    .from("sponsorships")
    .select(
      "id, starts_at, ends_at, placement, tool:tools!inner(id, slug, name, tagline, logo_url, website_url, is_published)"
    )
    .eq("placement", placement)
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .order("starts_at", { ascending: false })
    .limit(limit);

  const rows = (sponsorships ?? []).filter(
    (s: any) => s.tool && s.tool.is_published
  );

  if (rows.length === 0) return null;

  const placementLabel =
    SHOWCASE_TIERS.find((t) => t.placement === placement)?.placementLabel ??
    placement;

  return (
    <section aria-label={`${title} — paid placements`} className="space-y-3">
      <div className="flex items-center gap-2">
        <h2
          className="text-sm font-semibold text-zinc-400 uppercase tracking-widest"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
        <span className="badge badge-sponsored">Sponsored</span>
      </div>
      <p className="text-xs text-zinc-600">
        Paid placements. These slots are labeled and never affect tool rankings —{" "}
        <a href="/methodology" className="underline hover:text-zinc-400">
          how recommendations work
        </a>
        .
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((s: any) => (
          <ShowcaseCard
            key={s.id}
            tool={s.tool}
            placementLabel={placementLabel}
          />
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";
import { BadgeDollarSign, ShieldCheck } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { SHOWCASE_TIERS } from "@/components/showcase/tiers";
import { ShowcaseCheckoutForm } from "@/components/showcase/ShowcaseCheckoutForm";

export const metadata: Metadata = buildMetadata({
  title: "Feature Your Tool — Paid Showcase (Test Mode)",
  description:
    "Buy labeled visibility for your AI tool on StackBuilder: a launch feature or a sponsored slot. Money buys visibility, never rank. Test pricing.",
  path: "/showcase",
});

export default function ShowcasePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <div>
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">
          Paid showcase · test mode
        </p>
        <h1
          className="text-4xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Feature your tool
        </h1>
        <p className="text-zinc-400 mt-4 leading-relaxed">
          Get your tool in front of builders with a labeled sponsored placement.
          Every paid placement carries a visible{" "}
          <span className="badge badge-sponsored">Sponsored</span> label, lives
          in its own dedicated slot, and is reviewed by a human before it goes
          live.
        </p>
        <p className="mt-3 inline-flex items-start gap-2 text-sm text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2.5">
          <BadgeDollarSign size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong>Test pricing.</strong> The prices below are placeholders
            while checkout runs in Stripe test mode — no real charges are
            possible. Final pricing is not set.
          </span>
        </p>
      </div>

      {/* What money buys / never buys */}
      <section className="grid sm:grid-cols-2 gap-4">
        <div className="glass p-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-3">
            What money buys
          </h2>
          <ul className="text-sm text-zinc-400 space-y-2 list-disc pl-4">
            <li>Labeled visibility in a dedicated sponsored slot</li>
            <li>A “Sponsored” badge on every paid card, no exceptions</li>
            <li>Placement for a fixed window (7 or 30 days), then it ends</li>
          </ul>
        </div>
        <div className="glass p-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-3">
            What money <span className="text-red-400">never</span> buys
          </h2>
          <ul className="text-sm text-zinc-400 space-y-2 list-disc pl-4">
            <li>Rank or position in any listing, search, or recommendation</li>
            <li>Scores, fit labels, or freshness status</li>
            <li>Reviews, ratings, or verification badges</li>
            <li>Editorial coverage or a spot in the newsletter</li>
          </ul>
        </div>
      </section>

      <p className="text-sm text-zinc-500 flex items-start gap-2">
        <ShieldCheck size={16} className="shrink-0 mt-0.5 text-brand-400" />
        <span>
          Rankings are never for sale — the scoring pipeline cannot see paid
          placements by design. Read the full policy in{" "}
          <Link href="/methodology" className="underline text-zinc-300 hover:text-white">
            our methodology
          </Link>
          .
        </span>
      </p>

      {/* Tiers */}
      <section className="space-y-4">
        <h2
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Tiers
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {SHOWCASE_TIERS.map((tier) => (
            <div key={tier.id} className="glass p-5 flex flex-col">
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="font-semibold text-white">{tier.name}</h3>
                <p className="text-2xl font-bold text-brand-400">
                  {tier.priceDisplay}
                  <span className="text-xs font-normal text-zinc-500"> {tier.billing} · test</span>
                </p>
              </div>
              <p className="text-sm text-zinc-500 mb-3">{tier.tagline}</p>
              <ul className="text-sm text-zinc-400 space-y-1.5 list-disc pl-4 mb-3">
                {tier.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className="text-xs text-zinc-600 mt-auto">
                {tier.durationDays}-day run · {tier.placementLabel} · human approval before live
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Checkout */}
      <section className="space-y-4">
        <h2
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Get featured
        </h2>
        <ShowcaseCheckoutForm tiers={SHOWCASE_TIERS} />
      </section>

      <p className="text-xs text-zinc-600">
        Questions? Read <Link href="/methodology" className="underline hover:text-zinc-400">how recommendations work</Link> or{" "}
        <Link href="/contact" className="underline hover:text-zinc-400">contact us</Link>.
      </p>
    </div>
  );
}

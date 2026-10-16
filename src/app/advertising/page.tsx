import Link from "next/link";
import { ShieldCheck, Eye, Ban } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Advertising Policy — What Money Can and Cannot Buy",
  description:
    "StackBuilder's advertising policy: money buys clearly labeled visibility, never rank, scores, verification, or recommendations.",
  path: "/advertising",
});

const NEVER = [
  "Organic rank in any list, category, or search result",
  "Editorial scores or the fit labels visitors see",
  "Verified status or freshness signals",
  "Placement in finder results or workflow stacks",
  "Suppression of criticism, negative reviews, or corrections",
  "A 'best for' task recommendation or category leadership badge",
];

const ALWAYS = [
  "A visible Sponsored label on every paid placement",
  "Separation from numbered organic results — ads live in their own slots",
  'rel="sponsored" on paid outbound links',
  "Human review before any paid placement goes live",
  "The same relevance and safety screening as organic listings",
];

export default function AdvertisingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <div>
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">
          Policy
        </p>
        <h1
          className="text-4xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Advertising policy
        </h1>
        <p className="text-zinc-400 mt-4 leading-relaxed">
          StackBuilder is funded by advertising, and we intend to keep it that
          way — openly. This page states the commercial contract in plain
          language: what money buys, what it can never buy, and how you can
          tell the difference.
        </p>
      </div>

      <section className="glass p-6 border-l-4 border-l-emerald-500">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
          <ShieldCheck size={18} className="text-emerald-400" />
          The non-negotiable rule
        </h2>
        <p className="text-zinc-300 leading-relaxed">
          Money buys <strong className="text-white">clearly labeled visibility</strong>,
          never organic rank. The scoring function that orders every tool
          cannot see sponsorship data — it is never passed in, so no payment
          can influence a rank, a score, a verification badge, or a finder
          recommendation. This is enforced in code, not just promised in
          policy. Read the full mechanism on the{" "}
          <Link href="/methodology" className="text-brand-400 hover:underline">
            methodology page
          </Link>
          .
        </p>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="glass p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white uppercase tracking-widest mb-3">
            <Eye size={16} className="text-brand-400" /> What money buys
          </h2>
          <ul className="space-y-2 text-sm text-zinc-400">
            {ALWAYS.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white uppercase tracking-widest mb-3">
            <Ban size={16} className="text-red-400" /> What money never buys
          </h2>
          <ul className="space-y-2 text-sm text-zinc-400">
            {NEVER.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-red-400 mt-0.5">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Sponsorship products</h2>
        <div className="glass p-5 space-y-2">
          <h3 className="font-semibold text-white">Showcase slots</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Dedicated sponsored placements on high-traffic surfaces. Always
            labeled <span className="badge badge-sponsored">Sponsored</span>,
            always in their own slot outside the ranked list.{" "}
            <Link href="/showcase" className="text-brand-400 hover:underline">
              See current options
            </Link>
            .
          </p>
        </div>
        <div className="glass p-5 space-y-2">
          <h3 className="font-semibold text-white">Newsletter sponsorship</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            A distinct sponsored block inside the newsletter — never a
            purchased editorial winner. The digest's tool picks are chosen by
            the same ranking the site uses.
          </p>
        </div>
        <div className="glass p-5 space-y-2">
          <h3 className="font-semibold text-white">Affiliate links</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Some outbound links earn us a commission. Commissions are disclosed
            adjacent to the link and are excluded from editorial scoring and
            finder fit. Read the{" "}
            <Link
              href="/affiliate-disclosure"
              className="text-brand-400 hover:underline"
            >
              affiliate disclosure
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Corrections</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Correction requests are free for everyone — tool makers, readers,
          competitors. Paying for promotion never buys a faster correction
          queue, and it never buys suppression of one. If you spot an error,{" "}
          <Link href="/contact" className="text-brand-400 hover:underline">
            tell us
          </Link>
          .
        </p>
      </section>

      <section className="glass p-5">
        <p className="text-xs text-zinc-500 leading-relaxed">
          Why "Sponsored" and not "Featured": "featured" is ambiguous — it can
          read as an editorial pick. Every paid placement on StackBuilder says
          Sponsored, because that is what it is.
        </p>
      </section>
    </div>
  );
}

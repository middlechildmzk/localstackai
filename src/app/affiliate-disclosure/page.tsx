import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Affiliate Disclosure",
  description: "How StackBuilder AI handles affiliate links, sponsored listings, and editorial recommendations.",
  path: "/affiliate-disclosure",
});

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      <div>
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">Trust and monetization</p>
        <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Affiliate Disclosure</h1>
        <p className="text-zinc-400 mt-4 leading-relaxed">
          StackBuilder AI may earn a commission when you click certain links to AI tools, software products, or partner websites. This does not cost you extra.
        </p>
      </div>

      <section className="glass p-5 space-y-3">
        <h2 className="text-lg font-semibold text-white">How affiliate links work</h2>
        <p className="text-sm leading-6 text-zinc-400">
          Some outbound links may be affiliate links. If you visit a tool through StackBuilder AI and later buy a paid plan, we may receive a commission or referral credit.
        </p>
      </section>

      <section className="glass p-5 space-y-3">
        <h2 className="text-lg font-semibold text-white">Sponsored listings</h2>
        <p className="text-sm leading-6 text-zinc-400">
          Sponsored placements must be clearly labeled. Sponsored status should not silently override editorial rankings, workflow fit, freshness, or usefulness.
        </p>
      </section>

      <section className="glass p-5 space-y-3">
        <h2 className="text-lg font-semibold text-white">Editorial independence</h2>
        <p className="text-sm leading-6 text-zinc-400">
          StackBuilder AI is built around workflow fit. We do not sell organic rankings. Recommendations should be based on usefulness for a specific workflow, pricing transparency, freshness, and clear fit for the user.
        </p>
      </section>

      <section className="glass p-5 space-y-3">
        <h2 className="text-lg font-semibold text-white">Beta note</h2>
        <p className="text-sm leading-6 text-zinc-400">
          StackBuilder AI is in beta. Tool pricing, features, affiliate availability, and product details can change. Always confirm final pricing and terms on the official tool website before purchasing.
        </p>
      </section>
    </div>
  );
}

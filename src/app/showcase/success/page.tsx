import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Showcase Payment Received — Pending Review",
  description: "Your showcase payment was received and is pending human review.",
  path: "/showcase/success",
});

/**
 * Shown after Stripe Checkout completes (test mode). Deliberately does NOT
 * claim the placement is live — a human must approve it in /admin/sponsorships
 * first. The webhook marks the row paid-but-pending; nothing renders until
 * approval.
 */
export default function ShowcaseSuccessPage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center space-y-6">
      <CheckCircle2 size={48} className="mx-auto text-brand-400" />
      <h1
        className="text-3xl font-bold text-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Payment received — pending review
      </h1>
      <p className="text-zinc-400 leading-relaxed">
        Thanks — your showcase purchase went through (test mode, no real
        charge). A human reviews every paid placement before it goes live, so
        your sponsored slot is <strong className="text-white">not live yet</strong>.
        We approve most placements within 2 business days.
      </p>
      <p className="text-sm text-zinc-500">
        When approved, your tool appears with a visible{" "}
        <span className="badge badge-sponsored">Sponsored</span> label in its
        dedicated slot — never in the organic rankings.
      </p>
      <div className="flex items-center justify-center gap-4 pt-2">
        <Link
          href="/tools"
          className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-300 hover:text-white hover:border-white/25 transition-all"
        >
          Browse tools
        </Link>
        <Link
          href="/showcase"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm text-white font-semibold transition-colors"
        >
          Back to showcase
        </Link>
      </div>
    </div>
  );
}

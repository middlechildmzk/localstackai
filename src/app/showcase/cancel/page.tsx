import Link from "next/link";
import { XCircle } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Showcase Checkout Canceled",
  description: "Your showcase checkout was canceled. No payment was made.",
  path: "/showcase/cancel",
});

export default function ShowcaseCancelPage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center space-y-6">
      <XCircle size={48} className="mx-auto text-zinc-600" />
      <h1
        className="text-3xl font-bold text-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Checkout canceled
      </h1>
      <p className="text-zinc-400 leading-relaxed">
        No payment was made and nothing was published. Your showcase request is
        saved as unpaid — you can restart checkout any time, or just head back
        to browsing.
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
          Try again
        </Link>
      </div>
    </div>
  );
}

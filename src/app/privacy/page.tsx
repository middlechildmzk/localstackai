import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "Privacy Policy", description: "StackBuilder AI collects only the information needed to run submissions, claims, newsletter signups, analytics, and account workflows. Connect a produ", path: "/privacy" });

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Privacy Policy</h1>
      <p className="text-zinc-400 leading-relaxed">StackBuilder AI collects only the information needed to run submissions, claims, newsletter signups, analytics, and account workflows. Connect a production privacy policy before public launch.</p>
    </div>
  );
}

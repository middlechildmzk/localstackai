import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "About StackBuilder AI", description: "StackBuilder AI helps creators, solopreneurs, agencies, operators, and small businesses build AI stacks for real workflows instead of browsing endless", path: "/about" });

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>About StackBuilder AI</h1>
      <p className="text-zinc-400 leading-relaxed">StackBuilder AI helps creators, solopreneurs, agencies, operators, and small businesses build AI stacks for real workflows instead of browsing endless tool lists.</p>
    </div>
  );
}

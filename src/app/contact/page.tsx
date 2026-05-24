import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "Contact StackBuilder AI", description: "For corrections, maker claims, partnerships, or beta feedback, use the submit and claim flows or connect a production contact inbox before public laun", path: "/contact" });

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Contact StackBuilder AI</h1>
      <p className="text-zinc-400 leading-relaxed">For corrections, maker claims, partnerships, or beta feedback, use the submit and claim flows or connect a production contact inbox before public launch.</p>
    </div>
  );
}

import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "Terms of Service", description: "Use StackBuilder AI as a discovery and workflow planning tool. Tool data may be incomplete or outdated during beta, and users should verify pricing an", path: "/terms" });

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Terms of Service</h1>
      <p className="text-zinc-400 leading-relaxed">Use StackBuilder AI as a discovery and workflow planning tool. Tool data may be incomplete or outdated during beta, and users should verify pricing and product details on official tool websites.</p>
    </div>
  );
}

import { buildMetadata } from "@/lib/seo";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { Mail, Zap, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Newsletter — Get the Best AI Stacks Weekly",
  description: "Fresh AI tools, new stacks, and workflow guides every week. No fluff.",
  path: "/newsletter",
});

export default function NewsletterPage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-6">
          <Mail className="text-white" size={24} />
        </div>
        <h1
          className="text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Get the best AI stacks every week
        </h1>
        <p className="text-zinc-400 text-lg">
          Fresh tools, curated stacks, and workflow guides. No fluff, no spam.
        </p>
      </div>

      <div className="glass p-6 mb-6 space-y-3">
        {[
          { icon: <Zap size={14} />, text: "New verified AI tools every week" },
          { icon: <Shield size={14} />, text: "Stacks built by real creators and operators" },
          { icon: <Mail size={14} />, text: "Workflow guides for creators, solopreneurs, and agencies" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-3 text-sm text-zinc-400">
            <span className="text-brand-400">{icon}</span>
            {text}
          </div>
        ))}
      </div>

      <NewsletterForm source="newsletter-page" />

      <p className="text-center text-xs text-zinc-700 mt-4">
        Unsubscribe anytime. We never sell your email.
      </p>
    </div>
  );
}

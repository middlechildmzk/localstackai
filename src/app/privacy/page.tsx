import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How StackBuilder AI handles newsletter signups, submissions, analytics, accounts, and beta product data.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      <div>
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">Privacy</p>
        <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Privacy Policy</h1>
        <p className="text-zinc-400 mt-4 leading-relaxed">
          StackBuilder AI collects only the information needed to operate the site, improve recommendations, process submissions, manage newsletter signups, and keep the beta useful.
        </p>
      </div>

      {sections.map(([title, body]) => (
        <section key={title} className="glass p-5 space-y-2">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm leading-6 text-zinc-400">{body}</p>
        </section>
      ))}
    </div>
  );
}

const sections = [
  ["Information we collect", "We may collect your email address when you join the newsletter, submit a tool, claim a listing, request updates, or create an account. We may also collect tool submissions, stack data, corrections, and basic usage events such as searches, page views, saves, and outbound clicks."],
  ["How we use information", "We use this information to run StackBuilder AI, improve tool and workflow recommendations, review submissions, send requested emails, prevent abuse, debug issues, and understand which workflows are useful."],
  ["Analytics", "StackBuilder AI may use product analytics to understand aggregate usage and improve the product experience."],
  ["Affiliate and outbound links", "Some links may send you to third-party websites. Those websites have their own privacy practices. We may log outbound clicks in aggregate so we can understand which tools are useful and measure affiliate performance."],
  ["Beta status", "StackBuilder AI is in beta. Some features may use demo, preview, or incomplete data while the production data system is being finalized. We aim to label beta behavior clearly."],
  ["Contact", "For privacy questions, corrections, or removal requests, use the contact page or the email associated with StackBuilder AI."],
];

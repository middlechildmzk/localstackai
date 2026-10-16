import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Methodology: How StackBuilder AI Recommends Tools",
  description: "How StackBuilder AI scores tools, how rankings stay independent of sponsorships, fit labels, freshness, corrections, and editorial recommendations during beta.",
  path: "/methodology",
});

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      <div>
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">Trust methodology</p>
        <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>How recommendations work</h1>
        <p className="text-zinc-400 mt-4">
          StackBuilder ranks tools with a daily-recomputed scoring formula built from real signals — never invented metrics. During beta, tool information should be treated as researched guidance, not a guarantee.
        </p>
      </div>
      {sections.map(([title, body]) => (
        <section key={title} className="glass p-5">
          <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
        </section>
      ))}
    </div>
  );
}

const sections = [
  ["The scoring formula", "Every tool's rank comes from one composite, recomputed daily from real evidence — nothing is invented, and nothing is guessed. The components and their weights: verification status 20% (verified, fresh, unverified, or stale, plus recency of the last verification check and whether the maker claimed the listing), freshness decay 15% (how recently the tool was actually verified, decaying with a 30-day half-life), stack usage 15% (how often the tool appears in public stacks and workflow guides), save momentum 10% (saves in the last 7 days), click quality 10% (outbound clicks in the last 7 days), trend velocity 10% (the daily trending score), pricing transparency 5% (whether the pricing model, starting price, pricing notes, and free-plan status are all disclosed), claim confidence 5% (a maker-claimed listing scores higher), category relevance 5% (listed under at least one category and one tag), and editorial fit 5% (set by a human reviewer — never by the scoring engine). A spam-risk penalty for thin or missing listing data is subtracted. Activity components are normalized against the current maximum, so scores stay relative as the catalog grows."],
  ["Rankings are not for sale", "Money cannot buy rank — technically, not just as policy. The scoring function that computes every tool's score never reads sponsorship data: it does not reference who paid for a showcase because that field is never read by the scoring code. Rankings come only from the signals above."],
  ["Sponsored listings", "Paid showcases exist to keep the lights on. They are always visibly labeled “Sponsored” in dedicated slots — never mixed into the ranked list, and never affecting a tool's score."],
  ["Fit labels, not raw scores", "You will never see a raw score. Tools are presented with plain fit labels — Strong fit, Worth a look, Long shot — alongside the reason chips behind them (for example, “verified this month” or “saved by dozens of people this week”). The number is internal; the reasoning is visible."],
  ["Freshness signals", "A tool is verified only after a real check — a successful link check or an editorial review — and we record when it happened. Freshness decays over time, so a tool verified a year ago does not outrank one verified last week. The freshness agent rechecks listings daily and flags stale ones for human review."],
  ["Stack usage", "When a tool appears in public stacks and workflow guides, that is evidence it works alongside other tools in real workflows. The stack graph also powers alternatives and recommendations."],
  ["Corrections", "Users and makers can submit corrections. Risky changes require human review before going live."],
];

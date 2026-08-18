import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Ahrefs Online: Free Account, SEO Tools, Pricing Tiers & Alternatives",
  description: "Looking for Ahrefs online? See what Ahrefs Free includes in 2026, which tools require verified site ownership, when paid plans make sense, and what to compare before subscribing.",
  path: "/tools/ahrefs",
});

const freeTools = [
  ["Site Explorer", "Limited backlink and organic-keyword data for websites you verify ownership of."],
  ["Site Audit", "Technical and on-page crawling for verified websites, with a monthly crawl allowance."],
  ["Web Analytics", "Privacy-focused traffic analytics for verified projects."],
  ["Social Media Manager", "Social publishing and performance tools included in the free account."],
  ["AI Content Helper", "Limited monthly access for content research and optimization."],
  ["SEO Toolbar", "Browser-based SEO metrics and on-page inspection features."],
];

const decisions = [
  ["I only need data for my own website", "Start with Ahrefs Free. Verified-site access is the biggest reason not to assume you need a paid subscription immediately."],
  ["I need to research competitors or unverified sites", "Free verified-site access is not the same as full competitive research. Compare Starter and the main paid plans against the reports and limits you actually need."],
  ["I mainly need keyword research", "Check whether the paid tier gives you the Keywords Explorer depth and usage allowance you need before subscribing."],
  ["I need a full agency / in-house SEO workflow", "Compare projects, historical data, tracked keywords, report limits, user seats, crawl credits, API needs, and competitive-analysis depth—not just the headline monthly price."],
];

const officialSources = [
  ["Ahrefs Free", "https://ahrefs.com/free"],
  ["Ahrefs Free / Webmaster Tools", "https://ahrefs.com/webmaster-tools"],
  ["Plans & Pricing", "https://ahrefs.com/pricing"],
  ["Free SEO Tools", "https://ahrefs.com/free-seo-tools"],
];

export default function AhrefsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Ahrefs Online: Free Account, SEO Tools, Pricing Tiers & Alternatives",
        description: "A current, independent guide to accessing Ahrefs online, what its free account includes, and how to decide whether you need a paid plan.",
        datePublished: "2026-08-16",
        dateModified: "2026-08-18",
        author: { "@type": "Organization", name: "StackBuilder AI" },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Can I use Ahrefs for free?",
            acceptedAnswer: { "@type": "Answer", text: "Yes. Ahrefs currently offers a free account with limited access to several tools. Some core SEO features require you to verify ownership of the website you are analyzing." },
          },
          {
            "@type": "Question",
            name: "Is Ahrefs Webmaster Tools still available?",
            acceptedAnswer: { "@type": "Answer", text: "Ahrefs says Webmaster Tools is now Ahrefs Free. The free account has expanded beyond the original verified-site SEO-tool positioning." },
          },
          {
            "@type": "Question",
            name: "Do I need a paid Ahrefs plan?",
            acceptedAnswer: { "@type": "Answer", text: "Not necessarily. Start with the free account if you mainly need data for websites you own. Paid tiers become more relevant for competitive research, greater limits, keyword research, historical data, tracking, exports, users, and larger workflows." },
          },
        ],
      },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4"><span className="badge badge-green">Checked Aug 16, 2026</span><span className="badge">Independent guide</span></div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Ahrefs online: what you can use free, and when you actually need to pay.</h1>
        <p className="text-lg text-zinc-400 leading-8 max-w-4xl">If you searched for “online Ahrefs,” you are probably trying to get into the tool, find a free version, check a site, or decide whether the subscription is worth it. The important 2026 change is that Ahrefs now has a broader free account—not just a paid suite with a few public checkers.</p>
        <div className="flex flex-wrap gap-3 mt-6">
          <a href="https://ahrefs.com" target="_blank" rel="noopener noreferrer nofollow" className="px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors">Open Ahrefs ↗</a>
          <a href="https://ahrefs.com/free" target="_blank" rel="noopener noreferrer nofollow" className="px-5 py-3 border border-white/10 hover:border-white/20 text-zinc-200 rounded-xl transition-colors">See Ahrefs Free ↗</a>
          <Link href="/compare" className="px-5 py-3 border border-white/10 hover:border-white/20 text-zinc-200 rounded-xl transition-colors">Compare AI tools</Link>
        </div>
        <p className="mt-3 text-xs text-zinc-600">StackBuilder does not sell ranking position. Verify current plan details on Ahrefs before purchasing.</p>
      </div>

      <section className="glass p-6 mb-6">
        <p className="text-xs uppercase tracking-widest text-brand-400 font-semibold mb-2">Quick answer</p>
        <h2 className="text-2xl font-bold text-white mb-3">Is there a free online version of Ahrefs?</h2>
        <p className="text-zinc-300 leading-7">Yes. Ahrefs currently offers <strong>Ahrefs Free</strong>, a permanent limited account rather than a short trial. Ahrefs says its former “Webmaster Tools” offering is now Ahrefs Free. Some SEO data—especially Site Explorer and Site Audit access—depends on verifying ownership of the website. Competitive and higher-volume workflows still push you toward a paid tier.</p>
      </section>

      <section className="mb-8">
        <div className="mb-5"><p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Ahrefs Free</p><h2 className="text-2xl font-bold text-white mt-2">Six useful tools in the current free account</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {freeTools.map(([title, copy]) => <div className="glass p-5" key={title}><h3 className="font-semibold text-white mb-2">{title}</h3><p className="text-sm text-zinc-400 leading-6">{copy}</p></div>)}
        </div>
        <p className="text-sm text-zinc-500 mt-4">Limits change. Ahrefs currently publishes its exact free-account allowances on its own Free and Webmaster Tools pages; use those pages as the source of truth rather than an old review or screenshot.</p>
      </section>

      <section className="glass p-6 mb-8">
        <p className="text-xs uppercase tracking-widest text-brand-400 font-semibold mb-2">Decision guide</p>
        <h2 className="text-2xl font-bold text-white mb-5">Which Ahrefs access level do you need?</h2>
        <div className="space-y-4">
          {decisions.map(([title, copy]) => <div key={title} className="border-b border-white/5 pb-4 last:border-0 last:pb-0"><h3 className="font-semibold text-white">{title}</h3><p className="text-sm text-zinc-400 leading-6 mt-1">{copy}</p></div>)}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass p-6"><p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-2">What Ahrefs is strong at</p><h2 className="text-xl font-bold text-white mb-3">Web-scale SEO research</h2><p className="text-sm text-zinc-400 leading-6">Ahrefs combines backlink research, organic-search data, site auditing, keyword research, rank tracking, competitive analysis, content research, and newer AI-visibility workflows. Its value is highest when you actually need several of those jobs in one data platform.</p></div>
        <div className="glass p-6"><p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-2">Where people overspend</p><h2 className="text-xl font-bold text-white mb-3">Buying the suite for one small job</h2><p className="text-sm text-zinc-400 leading-6">If you only need an occasional keyword idea, audit of a site you own, simple rank check, or one backlink lookup, start with the free account and public free tools. Upgrade because a real workflow hits a limit—not because a roundup says every marketer needs a premium SEO suite.</p></div>
      </section>

      <section className="glass p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-3">Current plan structure</h2>
        <p className="text-sm text-zinc-400 leading-6">Ahrefs currently publishes a Free account, an entry-level Starter tier, and its primary Lite, Standard, Advanced, and Enterprise plans. Pricing and included usage can vary by billing currency, region, legacy subscription, and plan changes, so StackBuilder intentionally does not freeze a single dollar figure into this page.</p>
        <a href="https://ahrefs.com/pricing" target="_blank" rel="noopener noreferrer nofollow" className="inline-block mt-4 text-brand-400 hover:text-brand-300">Check current Ahrefs pricing →</a>
      </section>

      <section className="glass p-6 mb-8">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">Primary sources</p>
        <h2 className="text-xl font-bold text-white mb-4">Where this page gets current product facts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{officialSources.map(([label, href]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer nofollow" className="p-4 rounded-lg bg-white/3 border border-white/5 text-sm text-zinc-300 hover:text-white hover:border-white/10 transition-all">{label} ↗</a>)}</div>
      </section>

      <section className="glass p-6">
        <h2 className="text-xl font-bold text-white mb-4">FAQ</h2>
        <div className="space-y-5"><div><h3 className="font-semibold text-white">Can I use Ahrefs for free?</h3><p className="text-sm text-zinc-400 mt-1 leading-6">Yes. The current Ahrefs Free account provides limited permanent access to multiple tools. Some SEO features require verified site ownership.</p></div><div><h3 className="font-semibold text-white">Is Ahrefs Webmaster Tools gone?</h3><p className="text-sm text-zinc-400 mt-1 leading-6">Ahrefs describes Webmaster Tools as now being Ahrefs Free—the free account has broadened beyond the original naming.</p></div><div><h3 className="font-semibold text-white">What should I compare before paying?</h3><p className="text-sm text-zinc-400 mt-1 leading-6">The reports you use, projects, competitor research, keyword workflows, historical data, tracked keywords/prompts, crawl limits, exports, user seats, API requirements, and the cost of stitching together alternatives.</p></div></div>
      </section>
    </div>
  </>;
}
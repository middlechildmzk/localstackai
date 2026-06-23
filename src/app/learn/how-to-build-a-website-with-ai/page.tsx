import { ArticleDisclosure, CautionBox, FAQBlock, HowWeChose, LastUpdated, QuickAnswer, RecommendedStackBlock, RelatedLinks, StackCta } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const updated = "2026-06-23";

export const metadata: Metadata = buildMetadata({
  title: "How to Build a Website With AI",
  description: "A practical AI website workflow for planning, copy, design, pages, SEO basics, analytics, email capture, and launch QA.",
  path: "/learn/how-to-build-a-website-with-ai",
});

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Website workflow</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>How to Build a Website With AI</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">AI can help plan, write, design, and launch a website. The key is to keep the first version focused: one audience, one goal, clear pages, tested forms, and a way to capture leads.</p>
      <LastUpdated date={updated} />
      <QuickAnswer>To build a website with AI, define the goal, map the pages, draft copy with ChatGPT or Claude, build in Framer, Webflow, Wix, or Hostinger, add analytics and email capture, then test every page, form, mobile layout, and CTA before launch.</QuickAnswer>
      <ArticleDisclosure />

      <RecommendedStackBlock title="AI website build stack" intro="Use AI to reduce friction, but keep the site focused and verifiable." roles={[
        ["Planning", "ChatGPT or Claude", "Define audience, offer, pages, calls to action, and FAQs."],
        ["Site builder", "Framer, Webflow, Wix, or Hostinger", "Choose based on design needs and technical comfort."],
        ["UI ideas", "v0", "Generate layout concepts or landing page sections when needed."],
        ["Design assets", "Canva or Ideogram", "Create graphics, thumbnails, lead magnets, and page visuals."],
        ["Automation", "Zapier or Make", "Route form submissions, newsletter signups, and content handoffs."],
      ]} />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold text-white">Step-by-step website workflow</h2>
        <ol className="space-y-3 text-sm leading-6 text-zinc-400">
          <li><strong className="text-white">1. Choose one goal.</strong> Email capture, product sales, portfolio, service leads, or content discovery.</li>
          <li><strong className="text-white">2. Map the pages.</strong> Start with homepage, about, contact, privacy, and one offer or content hub.</li>
          <li><strong className="text-white">3. Draft the copy.</strong> Use AI for first drafts, then edit for proof, clarity, and your actual voice.</li>
          <li><strong className="text-white">4. Build the layout.</strong> Pick a builder and keep the design clean before adding advanced features.</li>
          <li><strong className="text-white">5. Add trust elements.</strong> Disclosures, methodology, examples, FAQs, and contact paths matter.</li>
          <li><strong className="text-white">6. Add capture.</strong> Use a newsletter, lead magnet, or contact form so traffic is not wasted.</li>
          <li><strong className="text-white">7. Test the launch.</strong> Check mobile, forms, links, metadata, analytics, speed, and 404s.</li>
        </ol>
      </section>

      <CautionBox title="Launch caution"><p>AI can create convincing website copy that is still inaccurate. Verify claims, policies, pricing, contact details, forms, analytics, and mobile layouts before publishing.</p></CautionBox>

      <HowWeChose><p>This workflow focuses on the practical launch path: site goal, page map, copy, builder choice, analytics, lead capture, internal links, and launch QA.</p></HowWeChose>
      <FAQBlock items={[
        { q: "Can AI build a website for me?", a: "AI can help plan, write, and design a website. You still need to choose the goal, review the copy, test forms, and launch carefully." },
        { q: "What website builder should I use?", a: "Use Framer for polished landing pages, Webflow for more control, Wix or Hostinger for simpler beginner sites, and v0 for UI ideas." },
        { q: "What pages should a creator website have?", a: "Start with homepage, about, contact, privacy, and one clear offer or content hub. Add more pages only when they support a workflow." },
        { q: "What should I test before launch?", a: "Test mobile layout, forms, links, analytics, metadata, email capture, navigation, and page speed." },
      ]} />

      <RelatedLinks links={[["/learn/best-ai-website-builders-for-creators", "Best AI website builders for creators"], ["/learn/best-ai-app-builders", "Best AI app builders"], ["/compare/zapier-vs-make", "Zapier vs Make"], ["/learn/best-ai-tools-for-affiliate-marketing", "AI tools for affiliate marketing"]]} />
      <StackCta query="build a website with ai" label="Find my AI website stack" secondaryHref="/learn/best-ai-website-builders-for-creators" secondaryLabel="Compare website builders" />
    </article>
  );
}

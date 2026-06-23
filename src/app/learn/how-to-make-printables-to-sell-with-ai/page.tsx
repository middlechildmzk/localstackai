import { ArticleDisclosure, CautionBox, FAQBlock, HowWeChose, LastUpdated, QuickAnswer, RecommendedStackBlock, RelatedLinks, StackCta, TierGrid } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const updated = "2026-06-23";

const tiers: Array<[string, string, string]> = [
  ["Starter", "ChatGPT or Claude, Canva", "Best for checklists, worksheets, simple planners, and lead magnets."],
  ["Product shop", "Claude, Canva, Etsy, Gumroad", "Best for polished digital products, bundles, and direct sale testing."],
  ["Content engine", "AI assistant, Canva, scheduler, email tool", "Best when printables support a larger creator brand or niche site."],
];

export const metadata: Metadata = buildMetadata({
  title: "How to Make Printables to Sell With AI",
  description: "A practical workflow for creating AI-assisted printables like planners, worksheets, journals, templates, wall art, and checklists.",
  path: "/learn/how-to-make-printables-to-sell-with-ai",
});

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Printables workflow</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>How to Make Printables to Sell With AI</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">AI can help you create printables faster, but the best products still solve a specific problem. Start small, design cleanly, add useful instructions, and test demand before making a huge catalog.</p>
      <LastUpdated date={updated} />
      <QuickAnswer>Pick a niche problem, use ChatGPT or Claude to outline the printable, design it in Canva, export clean files, create listing images, and sell through Etsy, Gumroad, or your own site. Avoid generic templates and always review quality manually.</QuickAnswer>
      <ArticleDisclosure />

      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Printable stacks</h2><TierGrid tiers={tiers} /></section>

      <RecommendedStackBlock title="Printable creation stack" intro="Use one tool for planning, one for design, and one for selling." roles={[
        ["Product idea", "ChatGPT or Claude", "Find a specific buyer problem and turn it into a simple printable structure."],
        ["Design", "Canva", "Build the pages, covers, mockups, and listing images."],
        ["Image ideas", "Ideogram", "Create visual concepts or accents, then finish the design manually."],
        ["Marketplace", "Etsy or Gumroad", "Publish and learn from clicks, questions, and sales signals."],
      ]} />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold text-white">Step-by-step workflow</h2>
        <ol className="space-y-3 text-sm leading-6 text-zinc-400">
          <li><strong className="text-white">1. Choose one buyer.</strong> A printable for new moms, teachers, sourcers, guitar students, or budgeters is stronger than a generic planner.</li>
          <li><strong className="text-white">2. Define the job.</strong> Is it a checklist, tracker, worksheet, journal page, calendar, wall art, or template?</li>
          <li><strong className="text-white">3. Draft the structure.</strong> Use AI to outline pages, prompts, questions, sections, and instructions.</li>
          <li><strong className="text-white">4. Design in Canva.</strong> Keep layouts readable, print-friendly, and consistent.</li>
          <li><strong className="text-white">5. Package the files.</strong> Include PDF files, size notes, usage instructions, and preview images.</li>
          <li><strong className="text-white">6. Publish and improve.</strong> Watch questions, clicks, and refunds, then revise the product.</li>
        </ol>
      </section>

      <CautionBox title="Quality and marketplace caution"><p>Printables are competitive. Do not upload generic AI content at scale. Verify marketplace rules, avoid copying other sellers, and make sure the final product is useful, readable, and original enough to stand on its own.</p></CautionBox>

      <HowWeChose><p>We built this stack around the actual workflow: idea, structure, design, file packaging, listing assets, publishing, and revision. AI helps with speed, but the product still needs human judgment.</p></HowWeChose>
      <FAQBlock items={[
        { q: "Can I make printables with AI?", a: "Yes. AI is useful for ideas, page structure, prompts, and copy. You should still design, edit, proofread, and package the final printable yourself." },
        { q: "What tool should I use for printable design?", a: "Canva is the most practical starting point for most creators because it handles layouts, exports, mockups, and listing images." },
        { q: "Can I sell AI-assisted printables?", a: "Possibly, but check the current rules of the marketplace and the AI tools you use. Do not assume every generated asset is cleared for sale." },
        { q: "What printable should I make first?", a: "Choose one specific buyer problem and create a simple checklist, tracker, worksheet, or planner before attempting a large bundle." },
      ]} />

      <RelatedLinks links={[["/learn/best-ai-tools-for-etsy-digital-products", "AI tools for Etsy digital products"], ["/learn/best-ai-tools-to-create-and-sell-digital-products", "Create and sell digital products"], ["/learn/best-ai-tools-to-write-and-publish-ebook", "AI ebook writing stack"], ["/compare/chatgpt-vs-claude", "ChatGPT vs Claude"]]} />
      <StackCta query="make printables to sell with ai" label="Find my printable stack" secondaryHref="/learn/best-ai-tools-for-etsy-digital-products" secondaryLabel="See Etsy product stack" />
    </article>
  );
}

import { ArticleDisclosure, CautionBox, FAQBlock, HowWeChose, LastUpdated, QuickAnswer, RecommendedStackBlock, RelatedLinks, StackCta, TierGrid, ToolMentionCard, WorkflowCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const updated = "2026-06-23";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Tools to Write and Publish an Ebook",
  description: "A practical AI ebook stack for outlining, drafting, editing, formatting, cover design, publishing, and selling digital books.",
  path: "/learn/best-ai-tools-to-write-and-publish-ebook",
});

const tiers: Array<[string, string, string]> = [
  ["Starter", "ChatGPT or Claude, Canva, Google Docs", "Best for testing a short guide or lead magnet before buying more tools."],
  ["Publishing stack", "Claude or ChatGPT, Sudowrite, Atticus, Canva", "Best when you want a polished ebook file and better editing workflow."],
  ["Creator product stack", "Writing assistant, formatter, cover tool, Gumroad, email tool", "Best when the ebook is part of a real digital product funnel."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">AI writing stack</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Tools to Write and Publish an Ebook</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">AI can help with outlining, drafting, editing, formatting, cover design, and launch copy. It does not replace having a useful idea or doing the final human edit.</p>
      <LastUpdated date={updated} />
      <QuickAnswer>A practical ebook stack is ChatGPT or Claude for outline and drafting, Sudowrite for fiction or deeper rewriting, Atticus for formatting, Canva or Ideogram for cover assets, and Gumroad or a marketplace for selling. Use AI to assist, not autopilot quality.</QuickAnswer>
      <ArticleDisclosure />

      <RecommendedStackBlock title="A full AI ebook stack" intro="Use one tool per stage so the workflow stays clean." roles={[
        ["Idea and outline", "ChatGPT or Claude", "Turn a topic into a clear promise, chapter outline, and reader journey."],
        ["Drafting", "Claude or ChatGPT", "Draft sections, examples, summaries, and rewrites with your own direction."],
        ["Fiction and style", "Sudowrite", "Useful when the ebook is story-driven or needs creative rewriting."],
        ["Formatting", "Atticus or a book formatter", "Create clean ebook and print-ready files instead of shipping messy docs."],
        ["Cover and assets", "Canva, Ideogram, or another design tool", "Create covers, mockups, lead magnet graphics, and promo images."],
        ["Selling", "Gumroad, KDP, or your own site", "Choose the sales channel that fits the product and audience."],
      ]} />

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <ToolMentionCard name="ChatGPT" href="/go/chatgpt" description="Useful for outlines, fast drafting, examples, title ideas, FAQs, and launch copy." />
        <ToolMentionCard name="Claude" href="/go/claude" description="Strong for long-form chapters, careful editing, document work, and tone refinement." />
        <ToolMentionCard name="Canva" href="/go/canva" description="Useful for ebook covers, mockups, lead magnets, social assets, and simple design systems." />
        <ToolMentionCard name="Gumroad" href="/go/gumroad" description="A simple way to sell digital products directly if your audience is off-platform." />
      </section>

      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Free, publishing, and product stacks</h2><TierGrid tiers={tiers} /></section>

      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Step-by-step ebook workflow</h2>
        <WorkflowCard title="1. Define the reader promise" body="Before drafting, write the exact result the reader should get. AI can help shape the promise, but you need to own the point of view." />
        <WorkflowCard title="2. Build the outline" body="Create chapters, subheads, examples, checklists, and practical takeaways before drafting full sections." />
        <WorkflowCard title="3. Draft in passes" body="Draft one section at a time. Give AI your outline, tone, examples, and constraints instead of asking for a whole book at once." />
        <WorkflowCard title="4. Edit like a human" body="Cut repetition, add personal examples, verify facts, improve flow, and make the book useful instead of generic." />
        <WorkflowCard title="5. Format and package" body="Create a readable file, cover, product page, sample pages, and launch copy." />
      </section>

      <CautionBox title="Quality and platform caution">
        <p>Do not publish raw AI output as a book. It will usually feel generic, repetitive, and low trust. Add your own examples, structure, editing, and judgment.</p>
        <p>If you publish through a marketplace, verify current platform rules around AI-assisted or AI-generated content and disclosure.</p>
      </CautionBox>

      <HowWeChose><p>We chose tools by the actual ebook workflow: idea, outline, draft, edit, format, cover design, sales page, and promotion. The best stack depends on whether you are making a lead magnet, paid guide, fiction book, or digital product.</p></HowWeChose>

      <FAQBlock items={[
        { q: "Can AI write an ebook for me?", a: "AI can help draft and edit, but you should not publish raw output. The best ebooks still need a clear promise, human editing, examples, and a useful point of view." },
        { q: "What is the best AI tool for ebook writing?", a: "Claude and ChatGPT are strong general choices. Sudowrite is useful for fiction or more creative rewriting. Formatting and cover design usually need separate tools." },
        { q: "Can I sell an ebook made with AI?", a: "Possibly, but platform rules vary and change. Verify current marketplace policies and disclose AI involvement where required." },
        { q: "What is the cheapest ebook stack?", a: "Start with a free AI assistant, Google Docs, and Canva. Upgrade to a formatter like Atticus only when you are preparing a real paid product." },
      ]} />

      <RelatedLinks links={[["/compare/chatgpt-vs-claude", "ChatGPT vs Claude"], ["/learn/best-free-ai-tools-for-content-creators", "Free AI tools for creators"], ["/learn/best-ai-tools-for-creators", "Best AI tools for creators"], ["/learn/how-to-make-money-with-ai-music", "How to make money with AI music"]]} />
      <StackCta query="write and publish an ebook with ai" label="Find my ebook stack" secondaryHref="/compare/chatgpt-vs-claude" secondaryLabel="Compare AI assistants" />
    </article>
  );
}

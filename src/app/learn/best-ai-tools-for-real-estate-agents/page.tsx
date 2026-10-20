import { ArticleDisclosure, CautionBox, ComparisonTable, FAQBlock, HowWeChose, LastUpdated, QuickAnswer, RecommendedStackBlock, RelatedLinks, StackCta, ToolMentionCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const updated = "2026-10-20";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Tools for Real Estate Agents",
  description: "Compare AI tools for real estate agents by workflow fit: listing copy, marketing design, follow-up drafting, and listing video.",
  path: "/learn/best-ai-tools-for-real-estate-agents",
});

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">AI tools for real estate</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Tools for Real Estate Agents</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">Most agent time goes to writing and follow-up, not showings. Listing descriptions, marketing flyers, lead replies, and social posts are drafting jobs — and that is where general AI tools earn their keep.</p>
      <LastUpdated date={updated} />
      <QuickAnswer>Start with ChatGPT or Claude for listing copy and lead follow-up drafts. Use Canva for flyers, social posts, and listing graphics. Add Jasper or Writesonic when you produce marketing copy at volume, and OpusClip to turn walkthrough footage into short listing videos. Review every draft before it goes to a client or a listing portal.</QuickAnswer>
      <ArticleDisclosure />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold text-white">AI tools for agents compared</h2>
        <ComparisonTable columns={["Best for", "Workflow fit", "Caution"]} rows={[
          { label: "ChatGPT", values: ["Listing copy and follow-up drafts", "Descriptions, lead replies, open-house posts", "Verify facts about the property before publishing"] },
          { label: "Claude", values: ["Longer, careful writing", "Buyer letters, market summaries, email sequences", "Verify facts about the property before publishing"] },
          { label: "Canva", values: ["Marketing design", "Flyers, just-listed posts, feature sheets", "Use licensed photos you have rights to"] },
          { label: "Jasper", values: ["Marketing copy at volume", "Ad copy, campaign variations, brand voice", "Check every claim against the listing"] },
          { label: "Writesonic", values: ["Fast short-form copy", "Social captions, ad variants, quick drafts", "Check every claim against the listing"] },
        ]} />
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <ToolMentionCard name="ChatGPT" href="/go/chatgpt" description="A practical first draft tool for listing descriptions, lead replies, and open-house announcements." />
        <ToolMentionCard name="Claude" href="/go/claude" description="Useful for longer pieces like neighborhood summaries, buyer guides, and multi-email follow-up sequences." />
        <ToolMentionCard name="Canva" href="/go/canva" description="Design flyers, feature sheets, and just-listed social posts without a designer." />
        <ToolMentionCard name="Jasper" href="/go/jasper" description="Built for marketing copy, so it fits agents running ads and campaigns across many listings." />
      </section>

      <RecommendedStackBlock title="Best AI stack for real estate agents" intro="Cover the four recurring jobs — listing copy, design, follow-up, and video — before adding anything specialized." roles={[
        ["Listing copy", "ChatGPT or Claude", "Draft descriptions and property highlights, then verify every detail against the actual listing."],
        ["Marketing design", "Canva", "Flyers, feature sheets, and social graphics from your listing photos."],
        ["Follow-up drafting", "ChatGPT or Claude", "Turn your notes into lead replies and check-in emails you review and send yourself."],
        ["Listing video", "OpusClip or CapCut", "Cut walkthrough footage into short clips for social and listing pages."],
      ]} />

      <CautionBox title="Advertising and fair-housing caution"><p>AI drafts can invent property details and can slip into language that describes who a home is "perfect for." Check every fact against the listing, avoid wording that targets or excludes protected classes, and follow your brokerage's advertising rules.</p></CautionBox>
      <HowWeChose><p>We organized these tools by the jobs agents actually repeat every week: listing copy, marketing design, lead follow-up, and listing video. The current catalog does not stock dedicated real-estate CRMs, so this guide focuses on general AI tools matched to agent workflows.</p></HowWeChose>
      <FAQBlock items={[
        { q: "What AI tool should a real estate agent start with?", a: "A general assistant like ChatGPT or Claude covers the highest-volume work first: listing descriptions, lead replies, and follow-up emails. Add Canva when design becomes the bottleneck." },
        { q: "Can AI write my listing descriptions?", a: "It can draft them well. You still need to verify every fact — beds, baths, features, schools, and claims — against the real property before anything is published." },
        { q: "Are AI tools safe for client communication?", a: "Use them for drafts you review and send yourself, and avoid pasting sensitive client financial or personal details into tools your brokerage has not approved." },
      ]} />
      <RelatedLinks links={[["/compare/chatgpt-vs-claude", "ChatGPT vs Claude"], ["/compare/jasper-vs-copy-ai", "Jasper vs Copy.ai"], ["/learn/best-ai-tools-for-creators", "Best AI tools for creators"], ["/tools/canva", "Canva tool page"]]} />
      <StackCta query="best ai tools for real estate agents" label="Find my real estate AI stack" secondaryHref="/compare/chatgpt-vs-claude" secondaryLabel="Compare ChatGPT and Claude" />
    </article>
  );
}

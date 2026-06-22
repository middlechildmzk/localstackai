import { ArticleDisclosure, QuickAnswer, RelatedLinks, StackCta, TierGrid, WorkflowCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Best Free AI Tools for Content Creators",
  description: "A practical free and budget AI stack for creators making videos, Shorts, Reels, TikToks, thumbnails, captions, newsletters, and digital products.",
  path: "/learn/best-free-ai-tools-for-content-creators",
});

const tools = [
  ["ChatGPT or Claude", "Use for ideas, outlines, scripts, hooks, captions, emails, and content repurposing drafts."],
  ["Perplexity", "Use for research, sources, current topics, competitor scans, and topic validation."],
  ["Canva", "Use for thumbnails, social posts, simple lead magnets, carousels, and templates."],
  ["CapCut", "Use for short-form editing, captions, cuts, templates, and social video polish."],
  ["Buffer", "Use for lightweight social scheduling and testing your posting rhythm."],
];

const tiers: Array<[string, string, string]> = [
  ["Free starter", "ChatGPT or Claude free tier, Perplexity free, Canva free, CapCut free", "Best for testing content ideas before paying for tools."],
  ["Budget creator", "One paid AI assistant, Canva Pro, CapCut Pro or Descript starter", "Best when you need speed and consistency."],
  ["Growth stack", "AI assistant, design tool, editor, clipping tool, scheduler, analytics", "Best once publishing is consistent."],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Free creator stack</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best Free AI Tools for Content Creators</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">You do not need a giant paid stack to start creating with AI. Start free, learn the workflow, then upgrade only when a tool removes a real bottleneck.</p>
      <QuickAnswer>The best free starter stack is ChatGPT or Claude for writing, Perplexity for research, Canva for visuals, CapCut for video editing, and a simple scheduler like Buffer when you are ready to publish consistently.</QuickAnswer>
      <ArticleDisclosure />
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Best free or freemium tools</h2>{tools.map(([name, body]) => <WorkflowCard key={name} title={name} body={body} />)}</section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Free, budget, and growth stack</h2><TierGrid tiers={tiers} /></section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Upgrade rule</h2><p className="text-sm leading-6 text-zinc-400">Pay only when you can name the bottleneck. Upgrade voice when narration sounds weak. Upgrade design when thumbnails are slowing you down. Upgrade clipping when you have long videos worth repurposing. Upgrade scheduling when your posting calendar becomes real.</p></section>
      <RelatedLinks links={[["/learn/best-ai-tools-for-creators", "Best AI tools for creators"], ["/learn/best-ai-tools-for-tiktok-content", "TikTok AI tools"], ["/learn/best-ai-stack-for-faceless-youtube", "Faceless YouTube stack"], ["/learn/best-ai-tools-to-add-captions-to-short-videos", "Caption tools"]]} />
      <StackCta query="free ai tools for creators" label="Find my free creator stack" secondaryHref="/learn/best-ai-video-generators-for-creators" secondaryLabel="See video tools" />
    </article>
  );
}

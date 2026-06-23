import { ArticleDisclosure, ComparisonTable, FAQBlock, HowWeChose, LastUpdated, QuickAnswer, RecommendedStackBlock, RelatedLinks, StackCta, ToolMentionCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const updated = "2026-06-23";

export const metadata: Metadata = buildMetadata({
  title: "ChatGPT vs Claude: Which AI Assistant Belongs in Your Stack?",
  description: "A workflow-first ChatGPT vs Claude comparison for writing, coding, research, documents, creator workflows, and AI stack building.",
  path: "/compare/chatgpt-vs-claude",
});

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">AI assistant comparison</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>ChatGPT vs Claude: Which AI Assistant Belongs in Your Stack?</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">ChatGPT and Claude are both strong assistants. The better choice depends less on leaderboard hype and more on the work you actually do: writing, coding, research, documents, brainstorming, or content production.</p>
      <LastUpdated date={updated} />
      <QuickAnswer>Use ChatGPT if you want a broad, flexible assistant with a huge ecosystem. Use Claude if your workflow leans toward long-form writing, document work, careful editing, and structured reasoning. Many teams keep both and switch by task.</QuickAnswer>
      <ArticleDisclosure />

      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">Compare by workflow</h2><ComparisonTable columns={["ChatGPT", "Claude"]} rows={[
        { label: "Brainstorming", values: ["Fast, broad, flexible", "Structured and thoughtful"] },
        { label: "Long-form writing", values: ["Strong", "Often preferred for tone and long drafts"] },
        { label: "Editing and rewriting", values: ["Flexible, many styles", "Careful, measured, strong for polish"] },
        { label: "Coding help", values: ["Strong, large ecosystem", "Strong reasoning through code and context"] },
        { label: "Documents", values: ["Capable", "A common strength"] },
        { label: "Research workflow", values: ["Good with browsing/tools when available", "Strong synthesis, often paired with Perplexity"] },
        { label: "Best StackBuilder fit", values: ["Default all-purpose assistant", "Long-form and careful-work assistant"] },
      ]} /></section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <ToolMentionCard name="ChatGPT" href="/go/chatgpt" description="A general-purpose AI assistant for writing, coding, research support, planning, image work, and broad productivity workflows." />
        <ToolMentionCard name="Claude" href="/go/claude" description="A careful AI assistant often used for long-form writing, document analysis, code reasoning, rewriting, and structured thinking." />
      </section>

      <RecommendedStackBlock title="A practical assistant stack" intro="Many creators and operators use more than one assistant. The best stack depends on the work, not loyalty to one tool." roles={[
        ["Default assistant", "ChatGPT or Claude", "Pick the one you naturally reach for most often."],
        ["Long-form writing", "Claude", "Use for deep drafts, careful rewrites, and document-heavy work."],
        ["Broad production", "ChatGPT", "Use for all-purpose tasks, ideation, coding help, and ecosystem features."],
        ["Sourced research", "Perplexity", "Pair either assistant with a research tool when citations and current sources matter."],
      ]} />

      <HowWeChose><p>We compared ChatGPT and Claude by durable workflows rather than temporary benchmark drama: writing, editing, documents, coding help, research, and creator production. Both tools change often, so this page should be treated as a workflow fit guide.</p></HowWeChose>

      <FAQBlock items={[
        { q: "Is ChatGPT or Claude better for writing?", a: "Both are strong. Claude is often preferred for longer drafts, tone, and careful editing. ChatGPT is strong across many writing and production workflows." },
        { q: "Is ChatGPT or Claude better for coding?", a: "Both can help with code. ChatGPT has a broad ecosystem and Claude is strong at reasoning through larger context. Many developers use both." },
        { q: "Should I pay for both?", a: "Not at first. Try both free paths if available, then pay for the one that removes the biggest bottleneck in your real workflow." },
        { q: "Can I use ChatGPT and Claude together?", a: "Yes. A common stack is one assistant for drafting and another for critique, editing, or second-pass reasoning." },
      ]} />

      <RelatedLinks links={[["/compare/suno-vs-udio", "Suno vs Udio"], ["/learn/best-ai-stack-for-music-artists", "AI stack for music artists"], ["/learn/best-free-ai-tools-for-content-creators", "Free AI tools for creators"], ["/learn/best-ai-tools-for-creators", "Best AI tools for creators"]]} />
      <StackCta query="ai assistant for writing coding and research" label="Find my assistant stack" secondaryHref="/learn/best-free-ai-tools-for-content-creators" secondaryLabel="See free creator tools" />
    </article>
  );
}

import { ArticleDisclosure, CautionBox, ComparisonTable, FAQBlock, HowWeChose, LastUpdated, QuickAnswer, RecommendedStackBlock, RelatedLinks, StackCta } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const updated = "2026-06-23";

export const metadata: Metadata = buildMetadata({
  title: "Can You Sell AI-Generated Music?",
  description: "A cautious, workflow-first explainer on selling AI-generated music, commercial-use terms, copyright questions, distributors, and platform rules.",
  path: "/learn/can-you-sell-ai-generated-music",
});

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">AI music rights</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Can You Sell AI-Generated Music?</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">Maybe, but do not treat that as a simple yes. Selling AI-generated music depends on the tool terms, your plan, your human contribution, your distributor, and the platform where you publish.</p>
      <LastUpdated date={updated} />
      <QuickAnswer>You may be able to sell AI-generated or AI-assisted music if your tool plan and distribution path allow it, but commercial use, ownership, copyright, and platform monetization are separate issues. Verify current terms before publishing. This is not legal advice.</QuickAnswer>
      <CautionBox title="Not legal advice"><p>This page is a practical checklist, not legal advice. AI music rules change quickly. Check the current terms for the music tool, distributor, marketplace, and platform before selling or monetizing a track.</p></CautionBox>
      <ArticleDisclosure />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold text-white">The four questions to separate</h2>
        <ComparisonTable columns={["What it means", "Who decides", "What to verify"]} rows={[
          { label: "Commercial use", values: ["Whether you can use the output in paid projects", "The AI tool terms and plan", "Plan limits, paid-tier rules, and prohibited uses"] },
          { label: "Ownership", values: ["Who controls or can use the output", "The AI tool terms", "Rights language, licensing terms, and account requirements"] },
          { label: "Copyright", values: ["Whether the final work can be protected", "Law and human authorship facts", "Your human lyrics, vocals, arrangement, edits, and documentation"] },
          { label: "Distribution", values: ["Whether a distributor or platform accepts the release", "Distributor and platform policies", "AI disclosure, metadata, content rules, and takedown risk"] },
        ]} />
      </section>

      <RecommendedStackBlock title="Safer release workflow" intro="The goal is to document your work and avoid assuming the tool handles every rights question for you." roles={[
        ["Create", "Suno or Udio", "Generate the track, then refine it with human editing and judgment."],
        ["Document", "Project notes", "Save prompts, lyrics, stems, edits, and decisions so you can explain your process."],
        ["Package", "Canva or Ideogram", "Create cover art and release assets that fit the track."],
        ["Distribute", "DistroKid, TuneCore, or another distributor", "Check current rules before uploading."],
      ]} />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold text-white">Practical checklist before selling</h2>
        <ol className="space-y-3 text-sm leading-6 text-zinc-400">
          <li><strong className="text-white">1. Check the AI tool terms.</strong> Confirm whether your plan allows commercial use.</li>
          <li><strong className="text-white">2. Add real human contribution.</strong> Lyrics, vocals, arrangement, editing, and production decisions can matter.</li>
          <li><strong className="text-white">3. Save your process.</strong> Keep proof of prompts, edits, stems, lyrics, and release assets.</li>
          <li><strong className="text-white">4. Check the distributor.</strong> Rules differ and can change.</li>
          <li><strong className="text-white">5. Avoid overclaiming.</strong> Do not promise ownership, protection, or platform approval unless you have verified it.</li>
        </ol>
      </section>

      <HowWeChose><p>We organized this page around the real decision points that affect creators: tool terms, human contribution, distribution, platform rules, and practical documentation.</p></HowWeChose>
      <FAQBlock items={[
        { q: "Can I sell a song made with Suno or Udio?", a: "Possibly, depending on your plan and the current terms. Verify the latest rules before selling or distributing anything." },
        { q: "Does commercial use mean I own copyright?", a: "Not necessarily. Commercial-use permission and copyright protection are separate questions." },
        { q: "Can I upload AI music to Spotify?", a: "A distributor may allow it, but rules vary and can change. Check the distributor and platform before uploading." },
        { q: "What is the safest way to use AI music commercially?", a: "Use a paid plan where required, add meaningful human authorship, document your process, and verify current platform rules." },
      ]} />
      <RelatedLinks links={[["/learn/how-to-make-money-with-ai-music", "How to make money with AI music"], ["/learn/how-to-release-ai-music-on-spotify", "How to release AI music on Spotify"], ["/compare/suno-vs-udio", "Suno vs Udio"], ["/learn/best-ai-music-generators", "Best AI music generators"]]} />
      <StackCta query="sell ai generated music safely" label="Find my AI music release stack" secondaryHref="/learn/how-to-release-ai-music-on-spotify" secondaryLabel="See release workflow" />
    </article>
  );
}

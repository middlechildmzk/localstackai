import { ArticleDisclosure, CautionBox, ComparisonTable, FAQBlock, HowWeChose, LastUpdated, QuickAnswer, RecommendedStackBlock, RelatedLinks, StackCta, ToolMentionCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const updated = "2026-10-20";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Tools for Recruiters",
  description: "Compare AI recruiting tools by workflow fit: sourcing, applicant tracking, interview notes, and outreach — with human review kept in the loop.",
  path: "/learn/best-ai-tools-for-recruiters",
});

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">AI recruiting tools</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Tools for Recruiters</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">Recruiting AI is most useful on the work around decisions: finding candidates, keeping pipelines organized, summarizing interviews, and drafting outreach. The decisions themselves stay with people.</p>
      <LastUpdated date={updated} />
      <QuickAnswer>Start with your ATS — Ashby, Greenhouse, or Lever — as the system of record. Add SeekOut or Gem for sourcing hard-to-find candidates, hireEZ for outreach workflows, and Metaview for interview notes and summaries. Keep a human review step on every screen, score, and rejection.</QuickAnswer>
      <ArticleDisclosure />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold text-white">AI recruiting tools compared</h2>
        <ComparisonTable columns={["Best for", "Workflow fit", "Caution"]} rows={[
          { label: "Gem", values: ["Sourcing and outreach in one place", "Candidate search, sequences, pipeline CRM", "Review AI-suggested matches before outreach"] },
          { label: "SeekOut", values: ["Hard-to-find candidate sourcing", "Deep talent search and diversity sourcing", "Verify profile data before relying on it"] },
          { label: "hireEZ", values: ["Outbound recruiting", "Sourcing plus engagement workflows", "Personalize outreach instead of sending templates blind"] },
          { label: "Ashby", values: ["ATS and scheduling", "Pipeline management, interview scheduling, analytics", "Configure AI features to your hiring policy"] },
          { label: "Metaview", values: ["Interview notes", "Automatic notes, summaries, and scorecard drafts", "Confirm summaries against what was actually said"] },
        ]} />
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <ToolMentionCard name="Gem" href="/go/gem" description="Combines sourcing, outreach sequences, and a candidate CRM for teams doing serious outbound hiring." />
        <ToolMentionCard name="SeekOut" href="/go/seekout" description="A deep search tool for technical and hard-to-find roles where LinkedIn alone is not enough." />
        <ToolMentionCard name="Ashby" href="/go/ashby" description="An applicant tracking system with scheduling and analytics that fits growing hiring teams." />
        <ToolMentionCard name="Metaview" href="/go/metaview" description="Records and summarizes interviews so recruiters can listen instead of typing, then review structured notes." />
      </section>

      <RecommendedStackBlock title="Best AI recruiting stack by workflow" intro="Build around the ATS, then add sourcing and interview support where your team actually loses time." roles={[
        ["System of record", "Ashby, Greenhouse, or Lever", "Applications, pipelines, scheduling, and hiring-team coordination."],
        ["Sourcing", "SeekOut or Gem", "Find candidates beyond your inbound pool, especially for scarce skills."],
        ["Outreach", "Gem or hireEZ", "Draft and sequence candidate outreach you review before sending."],
        ["Interview notes", "Metaview", "Summaries and scorecard drafts that interviewers verify and edit."],
      ]} />

      <CautionBox title="Human review and bias caution"><p>AI screening, matching, and scoring tools can reproduce bias in their training data and criteria. Keep humans making every advance and rejection decision, audit outcomes regularly, and check that any automated step complies with your organization's policy and applicable employment law.</p></CautionBox>
      <HowWeChose><p>We organized these tools by recruiting workflow: system of record, sourcing, outreach, and interview documentation. Fit depends on your hiring volume, role types, and existing ATS — not on any single ranking.</p></HowWeChose>
      <FAQBlock items={[
        { q: "What is the first AI tool a recruiting team should adopt?", a: "Usually better tooling inside the ATS you already use — scheduling, summaries, and templates — before adding a separate sourcing platform." },
        { q: "Can AI screen candidates for us?", a: "AI can organize and summarize information, but screening decisions should stay with trained humans. Automated screening carries bias and legal risk that needs active oversight." },
        { q: "Do sourcing tools replace job boards?", a: "No. They help you find and contact people who are not applying. Inbound applicants, referrals, and sourcing work best as parallel channels." },
      ]} />
      <RelatedLinks links={[["/tools/gem", "Gem tool page"], ["/tools/seekout", "SeekOut tool page"], ["/tools/hireez", "hireEZ tool page"], ["/tools/ashby", "Ashby tool page"]]} />
      <StackCta query="best ai tools for recruiters" label="Find my recruiting AI stack" secondaryHref="/tools/gem" secondaryLabel="See Gem" />
    </article>
  );
}

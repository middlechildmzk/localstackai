import { ArticleDisclosure, CautionBox, ComparisonTable, FAQBlock, HowWeChose, LastUpdated, QuickAnswer, RecommendedStackBlock, RelatedLinks, StackCta, ToolMentionCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const updated = "2026-10-20";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Meeting Assistants",
  description: "Compare AI meeting assistants by workflow fit: transcription, summaries, sales calls, and bot-free note-taking for team meetings.",
  path: "/learn/best-ai-meeting-assistants",
});

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">AI meeting tools</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Meeting Assistants</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">A meeting assistant earns its place when nobody has to take notes and the follow-ups still happen. The tools differ mainly in how they join, what they produce, and where the notes end up.</p>
      <LastUpdated date={updated} />
      <QuickAnswer>Start with Otter or Fireflies for team transcription and searchable meeting records. Try Fathom for fast, clean summaries of video calls. Choose Granola or Jamie if you want notes without a bot joining the call, and Avoma when sales-call coaching and CRM sync matter.</QuickAnswer>
      <ArticleDisclosure />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold text-white">AI meeting assistants compared</h2>
        <ComparisonTable columns={["Best for", "Workflow fit", "Caution"]} rows={[
          { label: "Otter", values: ["Team transcription", "Live transcripts, summaries, searchable records", "Announce recording to everyone on the call"] },
          { label: "Fireflies", values: ["Meeting records at scale", "Transcription, summaries, conversation search", "Check retention settings for sensitive calls"] },
          { label: "Fathom", values: ["Fast call summaries", "Video-call highlights and shareable clips", "Review summaries before forwarding them"] },
          { label: "Granola", values: ["Bot-free notes", "Enhances your own notes without joining the call", "You still take the rough notes it builds on"] },
          { label: "Read AI", values: ["Meeting analytics", "Summaries plus engagement and talk-time signals", "Decide which metrics your team actually needs"] },
        ]} />
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <ToolMentionCard name="Otter" href="/go/otter" description="Live transcription and summaries with a searchable record your whole team can use." />
        <ToolMentionCard name="Fireflies" href="/go/fireflies" description="Records, transcribes, and makes past conversations searchable across your meeting tools." />
        <ToolMentionCard name="Fathom" href="/go/fathom" description="Quick summaries and highlight clips from video calls, easy to share with people who were not there." />
        <ToolMentionCard name="Granola" href="/go/granola" description="Turns your own rough notes into clean meeting notes without a bot joining the call." />
      </section>

      <RecommendedStackBlock title="Best AI meeting stack by workflow" intro="Match the assistant to the meeting type. One tool rarely fits internal standups, client calls, and sales calls equally well." roles={[
        ["Team meetings", "Otter or Fireflies", "Shared transcripts and summaries everyone can search later."],
        ["Sales and client calls", "Avoma or Grain", "Call recording with coaching insights and CRM-friendly summaries."],
        ["Bot-free note-taking", "Granola or Jamie", "Notes from your own device, with no extra participant on the invite."],
        ["Follow-up summaries", "Fathom or Supernormal", "Fast summaries and action items to drop into your project tools."],
      ]} />

      <CautionBox title="Recording consent caution"><p>Recording and transcription laws vary by location, and many calls require consent from everyone recorded. Announce the assistant, use your organization's approved settings for retention and sharing, and keep sensitive conversations off tools that have not been cleared for them.</p></CautionBox>
      <HowWeChose><p>We organized these tools by meeting workflow: team transcription, sales calls, bot-free notes, and follow-up summaries. The right fit depends on your meeting platform, your team's tolerance for a visible recording bot, and where notes need to land afterward.</p></HowWeChose>
      <FAQBlock items={[
        { q: "What is the best AI meeting assistant for a small team?", a: "Otter or Fireflies cover most team needs: transcription, summaries, and a searchable record. If a visible bot on calls bothers your team, look at Granola or Jamie instead." },
        { q: "Do AI meeting assistants join the call as a bot?", a: "Many do, and participants can see them. Bot-free tools like Granola and Jamie capture audio from your own device instead — which is also why consent still matters." },
        { q: "Are meeting transcripts accurate enough to rely on?", a: "Good enough for summaries and action items, not perfect for quotes. Names, numbers, and commitments should be spot-checked against the recording before they are shared." },
      ]} />
      <RelatedLinks links={[["/compare/otter-vs-gemini", "Otter vs Gemini"], ["/tools/otter", "Otter tool page"], ["/tools/fireflies", "Fireflies tool page"], ["/learn/best-ai-tools-to-repurpose-podcast-into-clips", "Best AI tools to repurpose podcast into clips"]]} />
      <StackCta query="best ai meeting assistants" label="Find my meeting AI stack" secondaryHref="/compare/otter-vs-gemini" secondaryLabel="Compare Otter and Gemini" />
    </article>
  );
}

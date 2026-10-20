import { ArticleDisclosure, CautionBox, ComparisonTable, FAQBlock, HowWeChose, LastUpdated, QuickAnswer, RecommendedStackBlock, RelatedLinks, StackCta, ToolMentionCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const updated = "2026-10-20";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Tools for Small Businesses",
  description: "Compare AI tools for small businesses by workflow fit: website, automation, email marketing, scheduling, and day-to-day operations.",
  path: "/learn/best-ai-tools-for-small-business",
});

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">AI tools for small business</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Tools for Small Businesses</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">Small businesses do not need more software. They need the repetitive work — follow-ups, scheduling, posting, invoicing reminders, data entry — to happen without someone remembering to do it.</p>
      <LastUpdated date={updated} />
      <QuickAnswer>Start with Zapier or Make to connect the tools you already use and automate handoffs. Add Canva for marketing design, Mailchimp for email, and Calendly for booking. Grow into ClickUp when projects and tasks outgrow a shared to-do list.</QuickAnswer>
      <ArticleDisclosure />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold text-white">AI tools for small businesses compared</h2>
        <ComparisonTable columns={["Best for", "Workflow fit", "Caution"]} rows={[
          { label: "Zapier", values: ["Everyday automation", "Connect apps, move data, trigger follow-ups", "Costs grow with task volume — audit your zaps"] },
          { label: "Make", values: ["Visual automation", "Multi-step workflows at lower volumes", "More setup than Zapier for simple jobs"] },
          { label: "Canva", values: ["Marketing design", "Social posts, flyers, menus, presentations", "Keep brand assets consistent across designs"] },
          { label: "Mailchimp", values: ["Email marketing", "Newsletters, campaigns, simple automations", "Keep your list clean and permission-based"] },
          { label: "ClickUp", values: ["Project and task management", "Tasks, docs, and goals for a small team", "Set it up simply or it becomes its own job"] },
        ]} />
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <ToolMentionCard name="Zapier" href="/go/zapier" description="The default way to make your existing apps hand work to each other automatically." />
        <ToolMentionCard name="Canva" href="/go/canva" description="Produce professional-looking marketing materials without hiring a designer for every asset." />
        <ToolMentionCard name="Mailchimp" href="/go/mailchimp" description="Email campaigns and basic automations sized for a small list and a small team." />
        <ToolMentionCard name="ClickUp" href="/go/clickup" description="One place for tasks, projects, and docs when sticky notes and chat threads stop working." />
      </section>

      <RecommendedStackBlock title="Best AI stack for small businesses by workflow" intro="Automate the handoffs first. Each tool below removes a recurring manual step rather than adding a new dashboard." roles={[
        ["Website", "Wix or Webflow", "A site you can update yourself, sized to how much design control you need."],
        ["Automation", "Zapier or Make", "New lead to CRM to follow-up email without copy-paste."],
        ["Email and audience", "Mailchimp or beehiiv", "Stay in touch with customers and subscribers on a schedule you can keep."],
        ["Scheduling and ops", "Calendly and ClickUp", "Bookings without email tag, and tasks the whole team can see."],
      ]} />

      <CautionBox title="Automation caution"><p>Automations act on your real customer data. Test every workflow with sample records first, review what gets sent to customers, and re-check connected tools after any price or plan change.</p></CautionBox>
      <HowWeChose><p>We organized these tools by the jobs small businesses repeat daily: getting a website up, moving information between apps, marketing, scheduling, and task management. Fit depends on your current toolset — automation only pays when it connects things you already use.</p></HowWeChose>
      <FAQBlock items={[
        { q: "What is the first AI tool a small business should buy?", a: "Usually an automation tool like Zapier that connects what you already pay for. It removes manual copy-paste work from day one instead of adding a new system to learn." },
        { q: "Zapier or Make for a small business?", a: "Zapier is simpler for straightforward connections. Make handles multi-step workflows visually and can cost less at volume. Start with the one that matches your most painful handoff." },
        { q: "How many tools does a small business actually need?", a: "Fewer than you think: a website, one automation layer, one email tool, and one place for tasks covers most operations. Add tools only when a specific job has no owner." },
      ]} />
      <RelatedLinks links={[["/compare/zapier-vs-make", "Zapier vs Make"], ["/tools/zapier", "Zapier tool page"], ["/tools/mailchimp", "Mailchimp tool page"], ["/learn/best-ai-tools-to-build-an-mvp", "Best AI tools to build an MVP"]]} />
      <StackCta query="best ai tools for small business" label="Find my small business AI stack" secondaryHref="/compare/zapier-vs-make" secondaryLabel="Compare Zapier and Make" />
    </article>
  );
}

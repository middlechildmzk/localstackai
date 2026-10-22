import { ArticleDisclosure, CautionBox, ComparisonTable, FAQBlock, HowWeChose, LastUpdated, QuickAnswer, RecommendedStackBlock, RelatedLinks, StackCta, ToolMentionCard } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const updated = "2026-10-20";

export const metadata: Metadata = buildMetadata({
  title: "Best AI Tools for Teachers",
  description: "Compare AI tools for teachers by workflow fit: lesson planning, differentiation, student practice, and classroom materials — with privacy checks first.",
  path: "/learn/best-ai-tools-for-teachers",
});

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">AI tools for teachers</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Best AI Tools for Teachers</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">The hours teachers lose are planning hours: lessons, differentiated readings, practice questions, and feedback drafts. AI tools built for classrooms target exactly that work.</p>
      <LastUpdated date={updated} />
      <QuickAnswer>Start with MagicSchool or SchoolAI for lesson planning and classroom workflows. Use Diffit to adapt readings to different levels, Khanmigo for guided student practice and planning support, and Canva for worksheets and classroom visuals. Check your school's approved-tools list before using anything with students.</QuickAnswer>
      <ArticleDisclosure />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold text-white">AI tools for teachers compared</h2>
        <ComparisonTable columns={["Best for", "Workflow fit", "Caution"]} rows={[
          { label: "MagicSchool", values: ["Lesson planning toolkit", "Plans, rubrics, emails, and teacher workflows", "Review generated content before class"] },
          { label: "SchoolAI", values: ["Classroom activities", "Interactive spaces and lesson support", "Follow your school's student-use policy"] },
          { label: "Diffit", values: ["Differentiated readings", "Adapt texts by reading level with questions", "Check adapted texts for accuracy"] },
          { label: "Khanmigo", values: ["Guided practice", "Tutoring-style student help and planning support", "Use within your school's approved setup"] },
          { label: "Brisk Teaching", values: ["Feedback and resource creation", "Works alongside your existing documents and LMS", "Verify feedback before it reaches students"] },
        ]} />
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <ToolMentionCard name="MagicSchool" href="/go/magicschool" description="A broad teacher toolkit for lesson plans, rubrics, assessments, and parent communication drafts." />
        <ToolMentionCard name="Diffit" href="/go/diffit" description="Adapts articles and texts to different reading levels and generates comprehension questions." />
        <ToolMentionCard name="Khanmigo" href="/go/khanmigo" description="Khan Academy's AI guide, designed to coach students through problems rather than hand them answers." />
        <ToolMentionCard name="Canva" href="/go/canva" description="Worksheets, slides, posters, and classroom visuals from ready-made education templates." />
      </section>

      <RecommendedStackBlock title="Best AI stack for teachers by workflow" intro="Pick one planning tool first, then add differentiation and student-facing practice only where your school policy allows." roles={[
        ["Lesson planning", "MagicSchool or SchoolAI", "Draft plans, activities, and assessments you refine before class."],
        ["Differentiation", "Diffit", "Level readings and generate questions for mixed-ability classes."],
        ["Student practice", "Khanmigo or Quizlet", "Guided practice and study sets, used under your school's approved setup."],
        ["Classroom materials", "Canva", "Worksheets, slides, and displays that match your lesson content."],
      ]} />

      <CautionBox title="Student privacy and accuracy caution"><p>Do not enter student names, grades, or personal details into tools your school or district has not approved. Student data is protected by law and policy in most schools. Also verify AI-generated content — facts, reading levels, and answer keys can all be wrong.</p></CautionBox>
      <HowWeChose><p>We organized these tools by teacher workflow: planning, differentiation, student practice, and materials. Whether a tool is appropriate depends on your school's approved list and data policies first, features second.</p></HowWeChose>
      <FAQBlock items={[
        { q: "What AI tool saves teachers the most time?", a: "Lesson-planning toolkits like MagicSchool and SchoolAI cover the widest range of weekly drafting work. Diffit is the specialist pick if differentiation is your biggest time cost." },
        { q: "Is it safe to use AI tools with students?", a: "Only tools your school or district has approved, used the way policy specifies. Avoid entering identifiable student information into unapproved tools." },
        { q: "Can AI grade student work?", a: "AI can help draft feedback, but grades and final feedback should be yours. Generated comments can be inaccurate or mismatched to your rubric." },
      ]} />
      <RelatedLinks links={[["/tools/khanmigo", "Khanmigo tool page"], ["/tools/magicschool", "MagicSchool tool page"], ["/tools/canva", "Canva tool page"], ["/learn/best-free-ai-tools-for-content-creators", "Best free AI tools for content creators"]]} />
      <StackCta query="best ai tools for teachers" label="Find my teaching AI stack" secondaryHref="/tools/magicschool" secondaryLabel="See MagicSchool" />
    </article>
  );
}

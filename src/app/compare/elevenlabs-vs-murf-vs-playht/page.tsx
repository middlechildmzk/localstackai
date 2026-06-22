import { ArticleDisclosure, QuickAnswer, RelatedLinks, StackCta } from "@/components/learn/ArticleBlocks";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "ElevenLabs vs Murf vs Play.ht",
  description: "Compare ElevenLabs, Murf, and Play.ht for AI voiceovers, narration, faceless YouTube videos, and creator workflows.",
  path: "/compare/elevenlabs-vs-murf-vs-playht",
});

const rows = [
  ["Best fit", "Realistic creator narration", "Polished explainers and business videos", "Voice variety and multilingual narration"],
  ["Workflow role", "Faceless YouTube voiceover", "Training, marketing, explainer voice", "High-volume narration and voice options"],
  ["Beginner friendly", "Medium", "High", "Medium"],
  ["Watch out for", "You still need script and pacing review", "May feel more corporate depending on voice", "Voice choice can take experimentation"],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Comparison</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>ElevenLabs vs Murf vs Play.ht</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">These three tools all create AI voiceovers, but they are not interchangeable. The best choice depends on whether your workflow needs realistic narration, polished business voiceovers, or a broad voice library.</p>
      <QuickAnswer>Pick ElevenLabs for faceless creator narration, Murf for polished explainer and business videos, and Play.ht when voice variety or multilingual narration matters most.</QuickAnswer>
      <ArticleDisclosure />
      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-white/[0.03] text-zinc-300"><tr><th className="p-4">Category</th><th className="p-4">ElevenLabs</th><th className="p-4">Murf</th><th className="p-4">Play.ht</th></tr></thead><tbody className="divide-y divide-white/5">{rows.map((row) => <tr key={row[0]} className="text-zinc-400"><td className="p-4 font-medium text-white">{row[0]}</td><td className="p-4">{row[1]}</td><td className="p-4">{row[2]}</td><td className="p-4">{row[3]}</td></tr>)}</tbody></table></div>
      <section className="mt-10 grid gap-4 md:grid-cols-3"><Verdict title="Choose ElevenLabs if" body="Your priority is realistic narration for faceless videos, story channels, explainers, or creator content." /><Verdict title="Choose Murf if" body="You want a simple studio-style workflow for business narration, explainer videos, and polished presentations." /><Verdict title="Choose Play.ht if" body="You want lots of voices, multilingual options, and room to test many narration styles." /></section>
      <RelatedLinks links={[["/learn/best-ai-voiceover-tools-for-faceless-videos", "Best AI voiceover tools guide"], ["/learn/best-ai-stack-for-faceless-youtube", "Faceless YouTube stack"], ["/learn/how-to-make-a-faceless-youtube-video-with-ai", "How to make a faceless YouTube video"], ["/learn/cheapest-ai-stack-for-faceless-youtube", "Cheapest faceless stack"]]} />
      <StackCta query="compare ai voiceover tools" label="Find my voice stack" secondaryHref="/learn/best-ai-voiceover-tools-for-faceless-videos" secondaryLabel="Read voiceover guide" />
    </article>
  );
}

function Verdict({ title, body }: { title: string; body: string }) {
  return <div className="glass p-5"><h2 className="font-semibold text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p></div>;
}

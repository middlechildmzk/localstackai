import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "OpusClip vs Klap vs Vizard",
  description: "Compare OpusClip, Klap, and Vizard for turning long videos into short-form clips.",
  path: "/compare/opusclip-vs-klap-vs-vizard",
});

const rows = [
  ["Best fit", "Creators who want a known clipping workflow", "YouTube-first creators who want fast vertical clips", "Teams who want clipping, captions, and repurposing"],
  ["Main job", "Find highlights and create shorts", "Turn long videos into vertical clips", "Clip, caption, and repurpose videos"],
  ["Good for", "Podcasts, interviews, webinars, YouTube videos", "YouTube videos, interviews, talking-head clips", "Marketing teams, creators, repurposing workflows"],
  ["Watch out for", "Review every AI-picked clip before publishing", "Output quality depends on source video", "May be more tool than a simple beginner needs"],
];

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Comparison</p>
      <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>OpusClip vs Klap vs Vizard</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-400">OpusClip, Klap, and Vizard all help turn long videos into short clips, but they fit slightly different workflows. The right choice depends on whether you want speed, editing control, team repurposing, or a simple creator workflow.</p>
      <div className="mt-8 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-5 text-sm leading-6 text-brand-100">Quick verdict: start with OpusClip if you want the safest mainstream choice, Klap if you mainly clip YouTube-style videos, and Vizard if you want a broader repurposing workspace.</div>
      <p className="mt-5 text-xs leading-5 text-zinc-600">Disclosure: some outbound tool links may be affiliate links. StackBuilder rankings are editorial and are not sold.</p>
      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-white/[0.03] text-zinc-300"><tr><th className="p-4">Category</th><th className="p-4">OpusClip</th><th className="p-4">Klap</th><th className="p-4">Vizard</th></tr></thead><tbody className="divide-y divide-white/5">{rows.map((row) => <tr key={row[0]} className="text-zinc-400"><td className="p-4 font-medium text-white">{row[0]}</td><td className="p-4">{row[1]}</td><td className="p-4">{row[2]}</td><td className="p-4">{row[3]}</td></tr>)}</tbody></table></div>
      <section className="mt-10 grid gap-4 md:grid-cols-3"><Card title="Choose OpusClip if" body="You want a known clipping tool for podcasts, interviews, webinars, and creator videos." /><Card title="Choose Klap if" body="Your source content is mostly YouTube videos and you want fast vertical clips." /><Card title="Choose Vizard if" body="You want clipping plus captions and repurposing features in one workspace." /></section>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="/find-stack?q=repurpose%20video%20into%20shorts" className="rounded-xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-500">Find my clipping stack</Link><Link href="/learn/best-ai-tools-to-turn-long-videos-into-shorts" className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm text-zinc-300 hover:border-white/20">Read the full guide</Link></div>
    </article>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return <div className="glass p-5"><h2 className="font-semibold text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p></div>;
}

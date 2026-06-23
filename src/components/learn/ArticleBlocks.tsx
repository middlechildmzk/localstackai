import Link from "next/link";

export function ArticleDisclosure() {
  return (
    <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-5 text-zinc-500">
      Disclosure: some outbound tool links may be affiliate links. StackBuilder rankings are editorial, sponsored placements are labeled, and rankings are not sold. <Link href="/affiliate-disclosure" className="text-brand-400 hover:text-brand-300">Read the full disclosure</Link>.
    </p>
  );
}

export function LastUpdated({ date }: { date: string }) {
  return <p className="mt-4 text-xs text-zinc-600">Last updated: <time dateTime={date}>{new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time></p>;
}

export function QuickAnswer({ children }: { children: React.ReactNode }) {
  return <div className="mt-8 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-5 text-sm leading-6 text-brand-100"><p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-300">Quick answer</p>{children}</div>;
}

export function StackCta({ query, label = "Find my AI stack", secondaryHref, secondaryLabel }: { query: string; label?: string; secondaryHref?: string; secondaryLabel?: string }) {
  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
      <Link href={`/find-stack?q=${encodeURIComponent(query)}`} className="rounded-xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-500">{label}</Link>
      {secondaryHref && secondaryLabel ? <Link href={secondaryHref} className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm text-zinc-300 hover:border-white/20">{secondaryLabel}</Link> : null}
    </div>
  );
}

export function WorkflowCard({ title, body }: { title: string; body: string }) {
  return <div className="glass p-5"><h3 className="font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p></div>;
}

export function TierGrid({ tiers }: { tiers: Array<[string, string, string]> }) {
  return <div className="grid gap-4 md:grid-cols-3">{tiers.map(([tier, tools, note]) => <div key={tier} className="rounded-2xl border border-white/10 bg-[#111118] p-5"><h3 className="font-semibold text-white">{tier}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{tools}</p><p className="mt-3 text-xs leading-5 text-zinc-500">{note}</p></div>)}</div>;
}

export function RelatedLinks({ links }: { links: Array<[string, string]> }) {
  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-lg font-semibold text-white">Related StackBuilder guides</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{links.map(([href, label]) => <Link key={href} href={href} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-300 hover:border-brand-500/40 hover:text-white">{label}</Link>)}</div>
    </section>
  );
}

export function CautionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5"><h2 className="font-semibold text-amber-100">{title}</h2><div className="mt-3 space-y-3 text-sm leading-6 text-amber-100/80">{children}</div></section>;
}

export function HowWeChose({ children }: { children?: React.ReactNode }) {
  return <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5"><h2 className="text-lg font-semibold text-white">How we chose these tools</h2><div className="mt-3 space-y-3 text-sm leading-6 text-zinc-400">{children ?? <p>We map each tool to the workflow on the page, weigh practical fit, learning curve, pricing clarity, and creator use cases, and avoid ranking by affiliate payout.</p>}</div></section>;
}

export function ComparisonTable({ columns, rows }: { columns: string[]; rows: Array<{ label: string; values: React.ReactNode[] }> }) {
  return <div className="mt-6 overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-white/[0.03] text-zinc-300"><tr><th className="p-4">Category</th>{columns.map((column) => <th key={column} className="p-4">{column}</th>)}</tr></thead><tbody className="divide-y divide-white/5">{rows.map((row) => <tr key={row.label} className="text-zinc-400"><td className="p-4 font-medium text-white">{row.label}</td>{row.values.map((value, index) => <td key={index} className="p-4">{value}</td>)}</tr>)}</tbody></table></div>;
}

export function RecommendedStackBlock({ title, intro, roles }: { title: string; intro: string; roles: Array<[string, string, string]> }) {
  return <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold text-white">{title}</h2><p className="text-sm leading-6 text-zinc-400">{intro}</p>{roles.map(([role, tool, note]) => <div key={`${role}-${tool}`} className="glass p-5"><h3 className="font-semibold text-white">{role}: {tool}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{note}</p></div>)}</section>;
}

export function FAQBlock({ items }: { items: Array<{ q: string; a: string }> }) {
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };
  return <section className="mt-10 space-y-4"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><h2 className="text-2xl font-bold text-white">FAQ</h2>{items.map((item) => <div key={item.q} className="rounded-2xl border border-white/10 bg-[#111118] p-5"><h3 className="font-semibold text-white">{item.q}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{item.a}</p></div>)}</section>;
}

export function ToolMentionCard({ name, href, description }: { name: string; href: string; description: string }) {
  return <Link href={href} className="mt-4 block rounded-2xl border border-white/10 bg-[#111118] p-5 hover:border-brand-500/40"><h3 className="font-semibold text-white">{name}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p><span className="mt-3 inline-block text-sm text-brand-400">View tool →</span></Link>;
}

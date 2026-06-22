import Link from "next/link";

export function ArticleDisclosure() {
  return (
    <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-5 text-zinc-500">
      Disclosure: some outbound tool links may be affiliate links. StackBuilder rankings are editorial, sponsored placements are labeled, and rankings are not sold. <Link href="/affiliate-disclosure" className="text-brand-400 hover:text-brand-300">Read the full disclosure</Link>.
    </p>
  );
}

export function QuickAnswer({ children }: { children: React.ReactNode }) {
  return <div className="mt-8 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-5 text-sm leading-6 text-brand-100">{children}</div>;
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
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tiers.map(([tier, tools, note]) => <div key={tier} className="rounded-2xl border border-white/10 bg-[#111118] p-5"><h3 className="font-semibold text-white">{tier}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{tools}</p><p className="mt-3 text-xs leading-5 text-zinc-500">{note}</p></div>)}
    </div>
  );
}

export function RelatedLinks({ links }: { links: Array<[string, string]> }) {
  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-lg font-semibold text-white">Related StackBuilder guides</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map(([href, label]) => <Link key={href} href={href} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-300 hover:border-brand-500/40 hover:text-white">{label}</Link>)}
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmailCapture, StackCta } from "@/components/learn/ArticleBlocks";

export type ClusterLink = { href: string; title: string; description: string; tag?: string };

export function ClusterHub({
  badge,
  title,
  intro,
  startHere,
  links,
  ctaQuery,
  emailVariant = "general",
}: {
  badge: string;
  title: string;
  intro: string;
  startHere: ClusterLink;
  links: ClusterLink[];
  ctaQuery: string;
  emailVariant?: "general" | "music" | "apps" | "video" | "digital";
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="border-b border-white/5 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">{badge}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-400">{intro}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 rounded-3xl border border-brand-500/20 bg-brand-500/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">Start here</p>
          <h2 className="mt-3 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{startHere.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-100/80">{startHere.description}</p>
          <Link href={startHere.href} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-500">Open start guide <ArrowRight size={15} /></Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-3xl border border-white/10 bg-[#111118] p-6 hover:border-brand-500/40">
              {link.tag && <span className="text-xs font-semibold uppercase tracking-widest text-brand-400">{link.tag}</span>}
              <h2 className="mt-3 text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{link.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{link.description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm text-brand-400">Read guide <ArrowRight size={13} /></span>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <StackCta query={ctaQuery} label="Build this kind of stack" secondaryHref="/find-stack" secondaryLabel="Open stack finder" />
        </div>
        <EmailCapture variant={emailVariant} />
      </section>
    </div>
  );
}

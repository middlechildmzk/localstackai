import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmailCapture, StackCta } from "@/components/learn/ArticleBlocks";

export type StarterTool = { role: string; tool: string; href: string; why: string };

export function StarterStackTemplate({
  badge,
  title,
  intro,
  tools,
  steps,
  related,
  ctaQuery,
  emailVariant = "general",
}: {
  badge: string;
  title: string;
  intro: string;
  tools: StarterTool[];
  steps: string[];
  related: Array<[string, string]>;
  ctaQuery: string;
  emailVariant?: "general" | "music" | "apps" | "video" | "digital";
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-16 sm:px-6">
      <article className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">{badge}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-400">{intro}</p>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {tools.map((item) => (
            <Link key={`${item.role}-${item.tool}`} href={item.href} rel={item.href.startsWith("/go/") ? "nofollow sponsored" : undefined} className="rounded-3xl border border-white/10 bg-[#111118] p-6 hover:border-brand-500/40">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">{item.role}</p>
              <h2 className="mt-3 text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{item.tool}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{item.why}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm text-brand-400">View tool <ArrowRight size={13} /></span>
            </Link>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>How to use this stack</h2>
          <ol className="mt-5 space-y-3 text-sm leading-6 text-zinc-400">
            {steps.map((step, index) => <li key={step}><strong className="text-white">{index + 1}.</strong> {step}</li>)}
          </ol>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold text-white">Related guides</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{related.map(([href, label]) => <Link key={href} href={href} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-300 hover:border-brand-500/40 hover:text-white">{label}</Link>)}</div>
        </section>

        <StackCta query={ctaQuery} label="Customize this stack" secondaryHref="/stacks" secondaryLabel="Browse public stacks" />
        <EmailCapture variant={emailVariant} />
      </article>
    </div>
  );
}

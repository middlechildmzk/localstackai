import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Layers, Search, Shield, Sparkles } from "lucide-react";
import { getRolePage, ROLE_PAGES } from "@/lib/role-pages";

export function generateStaticParams() {
  return ROLE_PAGES.map((role) => ({ slug: role.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const role = getRolePage(params.slug);
  if (!role) return { title: "AI Stacks by Role" };
  return {
    title: `${role.label} AI Stack`,
    description: role.subhead,
  };
}

export default function RolePage({ params }: { params: { slug: string } }) {
  const role = getRolePage(params.slug);
  if (!role) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="px-4 py-16 sm:py-20 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-4xl">
            <Link href="/for" className="text-sm text-brand-400 hover:text-brand-300">← All role stacks</Link>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-xs font-medium">
              <Layers size={13} />
              StackBuilder for {role.label}
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight mb-6" style={{ fontFamily: "var(--font-display)" }}>
              {role.headline}
            </h1>
            <p className="text-lg text-zinc-400 leading-8 max-w-3xl">{role.subhead}</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link href={`/stacks/new?role=${role.slug}`} className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-colors">
                Build this stack <ArrowRight size={15} />
              </Link>
              <Link href={`/tools?q=${encodeURIComponent(role.searchTerms[0] ?? role.label)}`} className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-white/10 hover:border-white/20 text-zinc-300 text-sm font-medium rounded-xl transition-all">
                Browse matching tools
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#111118] p-6">
            <div className="flex items-center gap-2 text-brand-400 text-sm font-medium mb-4">
              <Sparkles size={16} /> Recommended starter stack
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {role.starterStack.map((tool, index) => (
                <div key={tool} className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-zinc-200">{tool}</span>
                  {index < role.starterStack.length - 1 && <span className="text-zinc-700">→</span>}
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {role.stackSteps.map((step, index) => (
                <div key={step.step} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 flex items-center justify-center text-sm font-bold">{index + 1}</div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-white font-semibold">{step.step}</h2>
                      <p className="text-sm text-zinc-500 mt-1">{step.role}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {step.examples.map((example) => (
                          <span key={example} className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-zinc-300">{example}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-white font-semibold mb-3"><CheckCircle2 size={16} className="text-brand-400" /> Common pains</div>
              <ul className="space-y-3">
                {role.pains.map((pain) => (
                  <li key={pain} className="text-sm text-zinc-400 leading-6">• {pain}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-white font-semibold mb-3"><Search size={16} className="text-brand-400" /> SEO/GEO targets</div>
              <div className="space-y-2">
                {role.seoQueries.map((query) => (
                  <Link key={query} href={`/tools?q=${encodeURIComponent(query)}`} className="block text-sm text-zinc-400 hover:text-brand-300 transition-colors">{query} →</Link>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-white font-semibold mb-3"><Shield size={16} className="text-brand-400" /> Trust model</div>
              <p className="text-sm text-zinc-400 leading-6">Role pages are designed to connect tools to workflows, alternatives, pricing, verification, and stack usage instead of ranking tools by hype alone.</p>
              <Link href="/methodology" className="inline-flex items-center gap-1 mt-4 text-sm text-brand-400 hover:text-brand-300">View methodology <ArrowRight size={13} /></Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

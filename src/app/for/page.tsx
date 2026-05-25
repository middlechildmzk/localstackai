import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Layers, Search, Shield, Workflow } from "lucide-react";
import { ROLE_PAGES } from "@/lib/role-pages";

export const metadata: Metadata = {
  title: "AI Stacks by Role",
  description: "Browse AI tool stacks by role: creators, solopreneurs, marketers, agencies, recruiters, and operators.",
};

export default function ForIndexPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="px-4 py-16 sm:py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-xs font-medium">
              <Layers size={13} />
              Role-based AI stack maps
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5" style={{ fontFamily: "var(--font-display)" }}>
              Find the AI stack that fits how you actually work.
            </h1>
            <p className="text-lg text-zinc-400 leading-8">
              Most AI directories show tools in isolation. StackBuilder organizes tools by role, workflow, stack position, alternatives, freshness, and trust signals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            {[
              { icon: <Workflow size={18} />, title: "Workflow-first", body: "Start with the job to be done, then see which tools belong in each step." },
              { icon: <Search size={18} />, title: "Comparison-ready", body: "Move from role page to tool profile, alternatives, and compare pages." },
              { icon: <Shield size={18} />, title: "Trust-aware", body: "Pricing, freshness, claims, sponsorships, and correction paths stay visible." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-brand-400 mb-3">{item.icon}</div>
                <h2 className="text-white font-semibold mb-2">{item.title}</h2>
                <p className="text-sm text-zinc-500 leading-6">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {ROLE_PAGES.map((role) => (
              <Link key={role.slug} href={`/for/${role.slug}`} className="group rounded-2xl border border-white/10 bg-[#111118] p-6 hover:border-brand-500/50 hover:bg-white/[0.05] transition-all">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-400 mb-2">For {role.label}</p>
                    <h2 className="text-xl font-bold text-white group-hover:text-brand-200 transition-colors">{role.label}</h2>
                  </div>
                  <ArrowRight className="text-zinc-600 group-hover:text-brand-400 transition-colors" size={18} />
                </div>
                <p className="text-sm text-zinc-400 leading-6 mb-5">{role.subhead}</p>
                <div className="flex flex-wrap gap-2">
                  {role.starterStack.slice(0, 4).map((tool) => (
                    <span key={tool} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300">{tool}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

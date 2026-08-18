import Link from "next/link";
import { ArrowRight, GitCompare, Search, Shield, Sparkles } from "lucide-react";
import { createServerClient } from "@/lib/supabase";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "AI Tool Comparisons for Real Workflows (2026)",
  description: "Compare AI tools by workflow fit, pricing model, freshness, stack overlap, and whether two products should replace or complement each other.",
  path: "/compare",
});

const featuredComparisons = [
  { slug: "lovable-vs-perplexity", title: "Lovable vs Perplexity", note: "Cross-category comparison: decide whether these tools solve different jobs in the same workflow rather than treating them as direct substitutes." },
  { slug: "semrush-vs-gemini", title: "Semrush vs Gemini", note: "Compare workflow ownership, overlap, recurring cost, and where a specialist product versus a broader AI tool belongs in the stack." },
  { slug: "otter-vs-gemini", title: "Otter vs Gemini", note: "Compare what each tool contributes to a working stack and whether both are needed for the job you are trying to complete." },
  { slug: "chatgpt-vs-claude", title: "ChatGPT vs Claude", note: "General assistant comparison for writing, coding, and analysis workflows." },
  { slug: "suno-vs-udio", title: "Suno vs Udio", note: "AI music generation comparison for creator workflows." },
  { slug: "zapier-vs-make", title: "Zapier vs Make", note: "Workflow automation and app-integration comparison." },
  { slug: "perplexity-vs-chatgpt", title: "Perplexity vs ChatGPT", note: "Research-oriented and general-assistant workflow comparison." },
  { slug: "runway-vs-pika", title: "Runway vs Pika", note: "AI video generation comparison for creator and agency stacks." },
  { slug: "midjourney-vs-flux", title: "Midjourney vs FLUX", note: "AI image-generation comparison for creative-production workflows." },
];

export default async function CompareHubPage() {
  const supabase = createServerClient();
  const { data: tools } = await supabase
    .from("tools")
    .select("id,slug,name,tagline,pricing_model,starting_price,freshness,tool_score,stack_count")
    .eq("is_published", true)
    .order("tool_score", { ascending: false })
    .limit(48);

  const toolCount = tools?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="relative overflow-hidden border-b border-white/5 px-4 py-16">
        <div className="absolute left-1/2 top-0 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300">
              <GitCompare size={13} /> Workflow-fit comparison engine
            </div>
            <h1 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
              Compare AI tools by workflow, not hype.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-zinc-400">
              Compare pricing models, free plans, data freshness, stack usage, best-fit workflows, and paid overlap before adding another tool to your stack.
            </p>
          </div>

          <form action="/compare" className="mt-10 rounded-2xl border border-white/10 bg-[#111118] p-3">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <select name="a" className="h-12 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-zinc-300 outline-none focus:border-brand-500/60">
                <option value="">Choose first tool</option>
                {(tools ?? []).map((tool: any) => <option key={tool.slug} value={tool.slug}>{tool.name}</option>)}
              </select>
              <select name="b" className="h-12 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-zinc-300 outline-none focus:border-brand-500/60">
                <option value="">Choose second tool</option>
                {(tools ?? []).map((tool: any) => <option key={tool.slug} value={tool.slug}>{tool.name}</option>)}
              </select>
              <button formAction={compareAction} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-500">
                Compare <ArrowRight size={15} />
              </button>
            </div>
          </form>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat icon={<Search size={15} />} label="Tools available" value={toolCount} />
            <Stat icon={<Shield size={15} />} label="Decision fields" value={6} />
            <Stat icon={<Sparkles size={15} />} label="Featured comparisons" value={featuredComparisons.length} />
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-brand-400">High-intent comparisons</p>
              <h2 className="mt-1 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Popular AI tool matchups</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Start with the comparisons already attracting search demand, then use the selector above for any two published tools.</p>
            </div>
            <Link href="/tools" className="text-sm text-brand-400 hover:text-brand-300">Browse tools →</Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredComparisons.map((item, index) => (
              <Link key={item.slug} href={`/compare/${item.slug}`} className="group rounded-2xl border border-white/10 bg-[#111118] p-5 transition-all hover:border-brand-500/50 hover:bg-white/[0.05]">
                {index < 3 && <span className="mb-3 inline-flex rounded-full border border-brand-500/25 bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-300">Search demand</span>}
                <h3 className="mb-2 font-semibold text-white group-hover:text-brand-200" style={{ fontFamily: "var(--font-display)" }}>{item.title}</h3>
                <p className="text-sm leading-6 text-zinc-500">{item.note}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs text-brand-400">Open comparison <ArrowRight size={12} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

async function compareAction(formData: FormData) {
  "use server";
  const a = String(formData.get("a") ?? "");
  const b = String(formData.get("b") ?? "");
  if (!a || !b || a === b) return;
  const { redirect } = await import("next/navigation");
  redirect(`/compare/${a}-vs-${b}`);
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 text-brand-400">{icon}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-sm text-zinc-500">{label}</div>
    </div>
  );
}

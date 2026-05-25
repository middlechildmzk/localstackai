export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowRight, CopyPlus, DollarSign, GitFork, Layers, Sparkles } from "lucide-react";
import { createServerClient } from "@/lib/supabase";
import { PublicStackCard } from "@/components/stacks/PublicStackCard";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import type { Stack } from "@/types";

export const metadata: Metadata = buildMetadata({
  title: "Public AI Stacks",
  description: "Browse, save, and fork public AI tool stacks for creator, marketing, agency, and operator workflows.",
  path: "/stacks",
});

export default async function PublicStacksPage() {
  const supabase = createServerClient();
  const { data: stacks } = await supabase
    .from("stacks")
    .select(`*, owner:profiles(*), workflow:workflows(*), stack_tools(*, tool:tools(*))`)
    .eq("visibility", "public")
    .order("save_count", { ascending: false })
    .limit(80);

  const items = (stacks ?? []) as Stack[];
  const featured = items.filter((stack) => stack.is_featured).slice(0, 4);
  const totalTools = items.reduce((sum: number, stack: any) => sum + (stack.stack_tools?.length ?? 0), 0);
  const avgTools = items.length ? Math.round(totalTools / items.length) : 0;
  const freeOrLowCost = items.filter((stack) => Number(stack.monthly_cost ?? 0) <= 50).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="relative overflow-hidden border-b border-white/5 px-4 py-16">
        <div className="absolute left-1/2 top-0 h-[460px] w-[720px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300">
                <GitFork size={13} /> Public stack gallery
              </div>
              <h1 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
                Browse AI stacks that are built to be forked.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-zinc-400">
                See complete AI tool bundles by role, workflow, cost, and outcome. Fork a stack, swap tools, and turn discovery into an actual operating system.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/stacks/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500">
                  Build a stack <ArrowRight size={15} />
                </Link>
                <Link href="/for" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-white/20">
                  Choose by role
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Stat icon={<Layers size={15} />} label="Stacks" value={items.length} />
              <Stat icon={<CopyPlus size={15} />} label="Avg tools" value={avgTools} />
              <Stat icon={<DollarSign size={15} />} label="≤ $50/mo" value={freeOrLowCost} />
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="border-b border-white/5 px-4 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-400">Featured stacks</p>
                <h2 className="mt-1 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Recommended starting points</h2>
              </div>
              <Link href="/workflows" className="text-sm text-brand-400 hover:text-brand-300">Browse workflows →</Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {featured.map((stack) => <PublicStackCard key={stack.id} stack={stack} />)}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-zinc-500">All public stacks</p>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                Fork, compare, and adapt AI stacks
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Creator stacks</span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Marketing stacks</span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Automation stacks</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((stack) => <PublicStackCard key={stack.id} stack={stack} />)}
          </div>

          {items.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-[#111118] px-6 py-16 text-center">
              <h3 className="text-xl font-bold text-white">No public stacks yet.</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">Build the first public stack or run the data expansion pack to seed curated examples.</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/stacks/new" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500">Build a stack</Link>
                <Link href="/tools" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-white/20">Browse tools</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="mb-2 text-brand-400">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
    </div>
  );
}

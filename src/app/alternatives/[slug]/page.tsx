import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, GitCompare, Repeat2, Shield, SlidersHorizontal } from "lucide-react";
import { createServerClient } from "@/lib/supabase";
import { buildMetadata } from "@/lib/seo";
import { ToolCard } from "@/components/tools/ToolCard";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return buildMetadata({
    title: `Best Alternatives to ${slug}`,
    description: `Find the best alternatives to ${slug} ranked by workflow fit, price, freshness, and stack context.`,
    path: `/alternatives/${slug}`,
  });
}

const replacementContexts = [
  { label: "Cheaper", description: "Lower-cost or free/freemium replacements for budget-sensitive stacks." },
  { label: "Easier", description: "Simpler alternatives with lower learning curve and faster setup." },
  { label: "Open-source", description: "Tools that may fit developer or self-hosted workflows." },
  { label: "Creator-focused", description: "Alternatives better suited to content, video, audio, and social workflows." },
  { label: "Automation-friendly", description: "Tools that fit better into Zapier, Make, API, or webhook workflows." },
  { label: "Team-ready", description: "Options better suited for collaboration, governance, or client work." },
];

export default async function AlternativesPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServerClient();

  const { data: tool } = await supabase
    .from("tools")
    .select("id,slug,name,tagline,description,pricing_model,starting_price,has_free_plan,freshness,last_verified_at,stack_count")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!tool) notFound();

  const { data: rels } = await supabase
    .from("tool_relationships")
    .select(`relationship_type, workflow_context, confidence, target_tool:tools!target_tool_id(*)`)
    .eq("source_tool_id", tool.id)
    .in("relationship_type", ["alternative", "replaces", "complement"])
    .order("confidence", { ascending: false })
    .limit(18);

  const explicitTools = (rels ?? []).map((r: any) => ({ ...r.target_tool, _relationship: r })).filter((t: any) => t?.id);

  let fallback: any[] = [];
  if (explicitTools.length < 4) {
    const { data } = await supabase
      .from("tools")
      .select("*, categories:tool_categories(category:categories(*))")
      .eq("is_published", true)
      .neq("id", tool.id)
      .order("tool_score", { ascending: false })
      .limit(12);
    fallback = data ?? [];
  }

  const displayTools = dedupeBySlug([...explicitTools, ...fallback]).slice(0, 12);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best alternatives to ${tool.name}`,
    itemListElement: displayTools.map((t: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.stackbuilderai.com"}/tools/${t.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <section className="relative overflow-hidden border-b border-white/5 px-4 py-16">
        <div className="absolute right-0 top-0 h-[520px] w-[620px] rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl">
          <Link href={`/tools/${tool.slug}`} className="text-sm text-brand-400 hover:text-brand-300">← Back to {tool.name}</Link>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300">
            <Repeat2 size={13} /> V28 alternatives engine
          </div>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
                Best alternatives to {tool.name}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-400">
                Compare replacements by workflow fit, pricing, freshness, stack usage, and why you might switch. StackBuilder prioritizes replacement context over generic lists.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/compare/${tool.slug}-vs-${displayTools[0]?.slug ?? "chatgpt"}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-500">
                  Compare top alternative <ArrowRight size={15} />
                </Link>
                <Link href={`/stacks/new?tool=${tool.slug}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-zinc-300 hover:border-white/20">
                  Add {tool.name} to stack
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><Shield size={16} className="text-brand-400" /> Replacement checklist</div>
              <div className="space-y-3 text-sm text-zinc-400">
                <p>Start with the stack role, not brand popularity.</p>
                <p>Check free plan, pricing, freshness, and workflow overlap.</p>
                <p>Use compare pages before switching production workflows.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white"><SlidersHorizontal size={16} className="text-brand-400" /> Replacement contexts</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {replacementContexts.map((context) => (
              <div key={context.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h2 className="font-semibold text-white">{context.label}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{context.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-zinc-500">Ranked by workflow fit, confidence, and freshness</p>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                {displayTools.length} alternatives and complements
              </h2>
            </div>
            <Link href="/methodology" className="text-sm text-brand-400 hover:text-brand-300">How rankings work →</Link>
          </div>

          {displayTools.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#111118] px-6 py-16 text-center">
              <h3 className="text-xl font-bold text-white">No alternatives yet.</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">Submit a replacement or add a relationship in the admin workflow.</p>
              <Link href="/submit" className="mt-6 inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500">Submit a tool</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {displayTools.map((t: any, i: number) => (
                <div key={t.id} className="space-y-2">
                  <ToolCard tool={t} rank={i + 1} />
                  <div className="flex flex-wrap gap-2 px-1 text-xs">
                    <Link href={`/compare/${tool.slug}-vs-${t.slug}`} className="inline-flex items-center gap-1 text-zinc-500 hover:text-brand-400"><GitCompare size={12} /> Compare</Link>
                    <Link href={`/stacks/new?tool=${tool.slug}&alt=${t.slug}`} className="inline-flex items-center gap-1 text-zinc-500 hover:text-brand-400"><CheckCircle2 size={12} /> Test in stack</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function dedupeBySlug(items: any[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item?.slug || seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createServerClient } from "@/lib/supabase";
import { logAnalyticsEvent } from "@/lib/analytics";
import { buildMetadata, toolJsonLd } from "@/lib/seo";
import {
  freshnessColor,
  freshnessLabel,
  formatPrice,
  timeAgo,
} from "@/lib/utils";
import { ExternalLink, GitFork, Flag, Star } from "lucide-react";
import type { Metadata } from "next";
import type { Tool } from "@/types";

type Props = { params: Promise<{ slug: string }> };

async function getTool(slug: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("tools")
    .select(
      `*,
      categories:tool_categories(category:categories(*)),
      tags:tool_tags(tag:tags(*)),
      stack_tools(stack:stacks(id,slug,title,visibility)),
      alternatives:tool_relationships!source_tool_id(
        target_tool:tools!target_tool_id(id,slug,name,logo_url,tagline,freshness,starting_price,pricing_model)
      )`
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data as Tool | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);
  if (!tool) return {};
  return buildMetadata({
    title: `${tool.name} — AI Tool`,
    description: tool.tagline ?? tool.description ?? undefined,
    path: `/tools/${slug}`,
    image: tool.logo_url ?? undefined,
  });
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = await getTool(slug);
  if (!tool) notFound();

  await logAnalyticsEvent({ event_type: "tool_view", entity_id: tool.id, entity_type: "tool" });

  const jsonLd = toolJsonLd(tool);
  const alternatives = (tool as any).alternatives ?? [];
  const stacks = (tool as any).stack_tools ?? [];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-start gap-5 mb-8">
          <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
            {tool.logo_url ? <Image src={tool.logo_url} alt={tool.name} width={64} height={64} className="object-contain" /> : <span className="text-2xl font-bold text-zinc-400">{tool.name[0]}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{tool.name}</h1>
              {tool.is_sponsored && <span className="badge badge-sponsored">Sponsored</span>}
              <span className={`badge ${freshnessColor(tool.freshness).replace("text-", "badge-")}`}>{freshnessLabel(tool.freshness)}</span>
            </div>
            <p className="text-zinc-400 mb-3">{tool.tagline}</p>
            <div className="flex flex-wrap items-center gap-3">
              {tool.website_url && <a href={`/go/${tool.slug}`} target="_blank" rel="noopener noreferrer nofollow sponsored" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors">Visit Site <ExternalLink size={13} /></a>}
              <Link href={`/stacks/new?tool=${tool.slug}`} className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/20 text-zinc-300 text-sm rounded-lg transition-all"><GitFork size={13} /> Add to Stack</Link>
              <Link href={`/compare?a=${tool.slug}`} className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/20 text-zinc-300 text-sm rounded-lg transition-all">Compare</Link>
              <Link href={`/claim/${tool.slug}`} className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/20 text-zinc-300 text-sm rounded-lg transition-all">Claim this tool</Link>
            </div>
            <p className="mt-3 text-xs text-zinc-600">Some outbound links may be affiliate links. Sponsored placements are labeled and rankings are never sold.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {tool.description && <section className="glass p-5"><h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">What it does</h2><p className="text-zinc-300 text-sm leading-relaxed">{tool.description}</p></section>}
            {(tool.best_for?.length || tool.not_ideal_for?.length) && <section className="glass p-5 grid grid-cols-2 gap-4">{tool.best_for?.length ? <div><h3 className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">✓ Best for</h3><ul className="space-y-1.5">{tool.best_for.map((item) => <li key={item} className="text-sm text-zinc-400">{item}</li>)}</ul></div> : null}{tool.not_ideal_for?.length ? <div><h3 className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-2">✗ Not ideal for</h3><ul className="space-y-1.5">{tool.not_ideal_for.map((item) => <li key={item} className="text-sm text-zinc-400">{item}</li>)}</ul></div> : null}</section>}
            {stacks.length > 0 && <section className="glass p-5"><h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">Used in {stacks.length} stack{stacks.length !== 1 ? "s" : ""}</h2><div className="flex flex-wrap gap-2">{stacks.slice(0, 8).map((st: any) => <Link key={st.stack?.id} href={`/stacks/${st.stack?.slug}`} className="px-3 py-1.5 text-xs bg-white/5 border border-white/5 rounded-lg text-zinc-400 hover:text-white hover:border-white/10 transition-all">{st.stack?.title}</Link>)}</div></section>}
            {alternatives.length > 0 && <section className="glass p-5"><div className="flex items-center justify-between mb-3"><h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Alternatives</h2><Link href={`/alternatives/${tool.slug}`} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">See all →</Link></div><div className="space-y-2">{alternatives.slice(0, 4).map((rel: any) => { const alt = rel.target_tool; if (!alt) return null; return <Link key={alt.id} href={`/tools/${alt.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/3 transition-colors"><div className="w-7 h-7 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 shrink-0">{alt.name[0]}</div><div className="flex-1 min-w-0"><span className="text-sm text-white">{alt.name}</span>{alt.tagline && <span className="text-xs text-zinc-600 ml-2 truncate">{alt.tagline}</span>}</div><span className="text-xs text-zinc-600 shrink-0">{formatPrice(alt.starting_price, alt.pricing_model)}</span></Link>; })}</div></section>}
          </div>
          <div className="space-y-4">
            <div className="glass p-4"><h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Pricing</h3><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-zinc-500">Model</span><span className="text-white capitalize">{tool.pricing_model.replace("_", " ")}</span></div>{tool.has_free_plan && <div className="flex justify-between"><span className="text-zinc-500">Free plan</span><span className="text-brand-400">✓ Yes</span></div>}{tool.starting_price && <div className="flex justify-between"><span className="text-zinc-500">Starts at</span><span className="text-white">${tool.starting_price}/mo</span></div>}{tool.pricing_notes && <p className="text-xs text-zinc-600 mt-2 pt-2 border-t border-white/5">{tool.pricing_notes}</p>}</div></div>
            <div className="glass p-4"><h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Trust & Freshness</h3><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-zinc-500">Status</span><span className={freshnessColor(tool.freshness)}>{freshnessLabel(tool.freshness)}</span></div>{tool.last_verified_at && <div className="flex justify-between"><span className="text-zinc-500">Freshness checked</span><span className="text-zinc-400">{timeAgo(tool.last_verified_at)}</span></div>}<p className="pt-2 text-xs leading-5 text-zinc-600 border-t border-white/5">Beta profile. Verify pricing and product details on the official site before buying.</p></div></div>
            <div className="glass p-4 space-y-2">{!tool.is_claimed && <Link href={`/claim/${tool.slug}`} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"><Star size={13} /> Are you the maker? Claim this profile</Link>}<Link href={`/submit?correction=${tool.slug}`} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"><Flag size={13} /> Suggest a correction</Link></div>
          </div>
        </div>
      </div>
    </>
  );
}

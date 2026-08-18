import Link from "next/link";
import { ArrowRight, Filter, Search, Shield, SlidersHorizontal, Sparkles, Zap } from "lucide-react";
import { createServerClient, hasSupabaseServiceConfig } from "@/lib/supabase";
import { FALLBACK_TOOLS, type FallbackTool } from "@/lib/fallback-tools";
import { ToolCard } from "@/components/tools/ToolCard";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import type { Tool, Category } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "AI Tools Directory",
  description:
    "Browse AI tools by workflow fit, role, pricing model, freshness, and stack context. Commercial details are clearly marked when live verification is unavailable.",
  path: "/tools",
});

type ToolSearchParams = {
  category?: string;
  q?: string;
  pricing?: string;
  sort?: string;
  role?: string;
};

const ROLE_FILTERS = [
  { slug: "creators", label: "Creators", terms: ["video", "audio", "image", "content", "music", "design", "website"] },
  { slug: "solopreneurs", label: "Solopreneurs", terms: ["automation", "writing", "productivity", "coding", "marketing", "website"] },
  { slug: "marketers", label: "Marketers", terms: ["marketing", "seo", "writing", "image", "video", "automation", "research"] },
  { slug: "agencies", label: "Agencies", terms: ["team", "marketing", "video", "design", "automation", "productivity", "website"] },
  { slug: "recruiters", label: "Recruiters", terms: ["research", "writing", "productivity", "automation", "chat", "meeting"] },
  { slug: "operators", label: "Operators", terms: ["automation", "productivity", "research", "coding", "meeting"] },
];

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<ToolSearchParams>;
}) {
  const params = await searchParams;

  let rawTools: any[] = [];
  let categories: Category[] = [];

  if (hasSupabaseServiceConfig()) {
    try {
      const supabase = createServerClient();
      const [{ data: liveTools }, { data: liveCategories }] = await Promise.all([
        supabase
          .from("tools")
          .select(`*, categories:tool_categories(category:categories(*)), tags:tool_tags(tag:tags(*))`)
          .eq("is_published", true)
          .order("tool_score", { ascending: false })
          .limit(250),
        supabase.from("categories").select("*").order("sort_order"),
      ]);
      rawTools = liveTools ?? [];
      categories = (liveCategories ?? []) as Category[];
    } catch {
      rawTools = [];
      categories = [];
    }
  }

  const allTools = rawTools as Array<Tool & { categories?: any[]; tags?: any[] }>;
  const usingFallback = allTools.length === 0;

  const filteredTools = usingFallback
    ? []
    : sortTools(
        allTools.filter((tool) => matchesFilters(tool, params)),
        params.sort
      );

  const fallbackTools = usingFallback
    ? FALLBACK_TOOLS.filter((tool) => matchesFallbackFilters(tool, params))
    : [];

  const verifiedCount = usingFallback
    ? 0
    : allTools.filter((tool) => tool.freshness === "verified" || tool.last_verified_at).length;
  const freeCount = usingFallback
    ? 0
    : allTools.filter((tool) => tool.has_free_plan || tool.pricing_model === "free" || tool.pricing_model === "freemium").length;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="relative overflow-hidden border-b border-white/5 px-4 py-14 sm:py-16">
        <div className="absolute left-1/2 top-0 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300">
                <Sparkles size={13} />
                AI tools directory + stack graph
              </div>
              <h1 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
                Search the AI tools directory, then build the stack.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-zinc-400">
                Browse AI tools by workflow and stack fit. When live pricing or verification data is unavailable, StackBuilder labels that limitation instead of filling the gap with stale commercial claims.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
                <Shield className="text-brand-400" size={16} /> Directory health
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Stat label={usingFallback ? "Continuity" : "Tools"} value={usingFallback ? FALLBACK_TOOLS.length : allTools.length} />
                <Stat label="Live verified" value={verifiedCount} />
                <Stat label="Pricing verified" value={usingFallback ? 0 : freeCount} />
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-zinc-500">
                {usingFallback
                  ? "The live directory service is offline. Product identity and broad workflow fit remain available; pricing and plan fields are intentionally withheld."
                  : "Ranked by stack usefulness, freshness, verification, saves, clicks, and editor fit. Never votes alone."}
              </div>
            </div>
          </div>

          {usingFallback && (
            <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-4 text-sm leading-6 text-yellow-100/75">
              <strong className="text-yellow-100">Continuity mode:</strong> StackBuilder&apos;s live tool database is temporarily unavailable. These are minimal vendor-identity records only. Verify pricing, free-plan availability, limits, and commercial terms on each vendor&apos;s official site.
            </div>
          )}

          <form action="/tools" className="mt-10 rounded-2xl border border-white/10 bg-[#111118] p-3 shadow-2xl shadow-black/20">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  name="q"
                  defaultValue={params.q ?? ""}
                  placeholder={usingFallback ? "Search Lovable, Perplexity, Semrush, Gemini, Otter..." : "Search ChatGPT, Runway, Suno, automation, video, writing..."}
                  className="h-12 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-500/60"
                />
              </div>
              {!usingFallback && (
                <>
                  <select name="category" defaultValue={params.category ?? ""} className="h-12 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-zinc-300 outline-none focus:border-brand-500/60">
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                  <select name="pricing" defaultValue={params.pricing ?? ""} className="h-12 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-zinc-300 outline-none focus:border-brand-500/60">
                    <option value="">All pricing</option>
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="subscription">Subscription</option>
                    <option value="usage_based">Usage based</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="open_source">Open source</option>
                  </select>
                </>
              )}
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-500">
                Search <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="border-b border-white/5 px-4 py-5">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto pb-1">
          <QuickPill href="/tools" label="All tools" active={!params.role && !params.category && !params.pricing && !params.q} />
          {ROLE_FILTERS.map((role) => (
            <QuickPill key={role.slug} href={withParams(params, { role: role.slug })} label={role.label} active={params.role === role.slug} />
          ))}
        </div>
      </section>

      {usingFallback ? (
        <FallbackDirectory tools={fallbackTools} params={params} />
      ) : (
        <LiveDirectory tools={allTools} filteredTools={filteredTools} categories={categories} params={params} />
      )}
    </div>
  );
}

function FallbackDirectory({ tools, params }: { tools: FallbackTool[]; params: ToolSearchParams }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-7 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm text-brand-400">Continuity directory</p>
          <h2 className="mt-1 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{tools.length} supported tool records</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Use these records for broad workflow orientation only. Live plan data will return when the production data service is restored.</p>
        </div>
        <Link href="/tools/ahrefs" className="rounded-xl border border-brand-500/25 bg-brand-500/10 px-4 py-3 text-sm font-semibold text-brand-200 hover:bg-brand-500/15">
          Ahrefs 2026 guide →
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-xs text-zinc-500">
        {params.q && <ActiveBadge label={`Search: ${params.q}`} href={withParams(params, { q: "" })} />}
        {params.role && <ActiveBadge label={`Role: ${ROLE_FILTERS.find((role) => role.slug === params.role)?.label ?? params.role}`} href={withParams(params, { role: "" })} />}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => <FallbackToolCard key={tool.slug} tool={tool} />)}
      </div>

      {tools.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-[#111118] px-6 py-14 text-center">
          <h3 className="text-xl font-bold text-white">No continuity records matched.</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">Reset the search or use the comparison hub to browse the currently supported matchups.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/tools" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-white/20">Reset search</Link>
            <Link href="/compare" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500">Browse comparisons</Link>
          </div>
        </div>
      )}
    </section>
  );
}

function FallbackToolCard({ tool }: { tool: FallbackTool }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#111118] p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg font-bold text-zinc-300">{tool.name[0]}</div>
        <span className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-2.5 py-1 text-[11px] font-medium text-yellow-100/70">Commercial data unverified</span>
      </div>
      <h3 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{tool.name}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{tool.tagline}</p>
      <div className="mt-4 space-y-2">
        {tool.best_for.map((item) => <p key={item} className="text-sm text-zinc-400">✓ {item}</p>)}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-500">Official site ↗</a>
        <Link href="/compare" className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-white/20 hover:text-white">Compare workflow fit</Link>
      </div>
    </article>
  );
}

function LiveDirectory({
  tools,
  filteredTools,
  categories,
  params,
}: {
  tools: Array<Tool & { categories?: any[]; tags?: any[] }>;
  filteredTools: Array<Tool & { categories?: any[]; tags?: any[] }>;
  categories: Category[];
  params: ToolSearchParams;
}) {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-white/10 bg-[#111118] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><SlidersHorizontal size={15} className="text-brand-400" /> Sort</div>
          <div className="space-y-2">
            <SideLink href={withParams(params, { sort: "best" })} active={!params.sort || params.sort === "best"} label="Best fit" />
            <SideLink href={withParams(params, { sort: "verified" })} active={params.sort === "verified"} label="Recently verified" />
            <SideLink href={withParams(params, { sort: "stacks" })} active={params.sort === "stacks"} label="Most used in stacks" />
            <SideLink href={withParams(params, { sort: "free" })} active={params.sort === "free"} label="Free first" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111118] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Filter size={15} className="text-brand-400" /> Categories</div>
          <div className="space-y-2">
            <SideLink href={withParams(params, { category: "" })} active={!params.category} label="All categories" />
            {categories.map((cat) => <SideLink key={cat.slug} href={withParams(params, { category: cat.slug })} active={params.category === cat.slug} label={`${cat.icon ?? ""} ${cat.name}`.trim()} />)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-500/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><Zap size={15} className="text-brand-300" /> Build from tools</div>
          <p className="text-sm leading-6 text-zinc-400">Found a few tools you like? Turn them into a shareable stack with roles, cost, and alternatives.</p>
          <Link href="/stacks/new" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-300 hover:text-brand-200">Start stack builder <ArrowRight size={13} /></Link>
        </div>
      </aside>

      <main>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm text-zinc-500">Showing</p><h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{filteredTools.length} AI tools</h2></div>
          <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
            {params.q && <ActiveBadge label={`Search: ${params.q}`} href={withParams(params, { q: "" })} />}
            {params.role && <ActiveBadge label={`Role: ${ROLE_FILTERS.find((role) => role.slug === params.role)?.label ?? params.role}`} href={withParams(params, { role: "" })} />}
            {params.category && <ActiveBadge label={`Category: ${params.category}`} href={withParams(params, { category: "" })} />}
            {params.pricing && <ActiveBadge label={`Pricing: ${params.pricing}`} href={withParams(params, { pricing: "" })} />}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTools.map((tool: Tool, i: number) => <ToolCard key={tool.id} tool={tool} rank={i + 1} />)}
        </div>

        {filteredTools.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-[#111118] px-6 py-16 text-center">
            <h3 className="text-xl font-bold text-white">No tools matched this search.</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">Try a broader category or remove one filter.</p>
            <Link href="/tools" className="mt-6 inline-flex rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-white/20">Reset filters</Link>
          </div>
        )}
      </main>
    </section>
  );
}

function matchesFilters(tool: Tool & { categories?: any[]; tags?: any[] }, params: ToolSearchParams) {
  const haystack = [tool.name, tool.tagline, tool.description, tool.pricing_notes, ...(tool.best_for ?? []), ...(tool.not_ideal_for ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (params.q && !haystack.includes(params.q.toLowerCase())) return false;
  if (params.pricing && tool.pricing_model !== params.pricing) return false;
  if (params.category) {
    const cats = (tool.categories ?? []).map((item: any) => item.category?.slug ?? item.slug).filter(Boolean);
    if (!cats.includes(params.category)) return false;
  }
  if (params.role) {
    const role = ROLE_FILTERS.find((item) => item.slug === params.role);
    if (role && !role.terms.some((term) => haystack.includes(term))) return false;
  }
  return true;
}

function matchesFallbackFilters(tool: FallbackTool, params: ToolSearchParams) {
  const haystack = [tool.name, tool.tagline, tool.description, ...tool.best_for].join(" ").toLowerCase();
  if (params.q && !haystack.includes(params.q.toLowerCase())) return false;
  if (params.role) {
    const role = ROLE_FILTERS.find((item) => item.slug === params.role);
    if (role && !role.terms.some((term) => haystack.includes(term))) return false;
  }
  return true;
}

function sortTools(tools: Array<Tool & { categories?: any[]; tags?: any[] }>, sort?: string) {
  const sorted = [...tools];
  if (sort === "verified") return sorted.sort((a, b) => String(b.last_verified_at ?? "").localeCompare(String(a.last_verified_at ?? "")));
  if (sort === "stacks") return sorted.sort((a, b) => (b.stack_count ?? 0) - (a.stack_count ?? 0));
  if (sort === "free") return sorted.sort((a, b) => Number(b.has_free_plan) - Number(a.has_free_plan) || (b.tool_score ?? 0) - (a.tool_score ?? 0));
  return sorted.sort((a, b) => (b.tool_score ?? 0) - (a.tool_score ?? 0));
}

function withParams(current: ToolSearchParams, next: Partial<ToolSearchParams>) {
  const params = new URLSearchParams();
  const merged = { ...current, ...next };
  for (const [key, value] of Object.entries(merged)) if (value) params.set(key, value);
  const query = params.toString();
  return query ? `/tools?${query}` : "/tools";
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="text-2xl font-bold text-white">{value}</div><div className="mt-1 text-xs text-zinc-500">{label}</div></div>;
}

function QuickPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return <Link href={href} className={`shrink-0 rounded-full border px-3.5 py-2 text-sm transition-all ${active ? "border-brand-500 bg-brand-500/15 text-brand-200" : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"}`}>{label}</Link>;
}

function SideLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return <Link href={href} className={`block rounded-lg px-3 py-2 text-sm transition-all ${active ? "bg-brand-500/15 text-brand-200" : "text-zinc-500 hover:bg-white/5 hover:text-white"}`}>{label}</Link>;
}

function ActiveBadge({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-zinc-400 hover:border-white/20 hover:text-white">{label} ×</Link>;
}

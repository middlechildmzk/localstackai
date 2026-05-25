import Link from "next/link";
import { ArrowRight, Filter, Search, Shield, SlidersHorizontal, Sparkles, Zap } from "lucide-react";
import { createServerClient } from "@/lib/supabase";
import { ToolCard } from "@/components/tools/ToolCard";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import type { Tool, Category } from "@/types";

export const metadata: Metadata = buildMetadata({
  title: "AI Tools Directory",
  description:
    "Search and filter verified AI tools by workflow, role, pricing, freshness, category, and stack fit.",
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
  { slug: "creators", label: "Creators", terms: ["video", "audio", "image", "content", "music", "design"] },
  { slug: "solopreneurs", label: "Solopreneurs", terms: ["automation", "writing", "productivity", "coding", "marketing"] },
  { slug: "marketers", label: "Marketers", terms: ["marketing", "seo", "writing", "image", "video", "automation"] },
  { slug: "agencies", label: "Agencies", terms: ["team", "marketing", "video", "design", "automation", "productivity"] },
  { slug: "recruiters", label: "Recruiters", terms: ["research", "writing", "productivity", "automation", "chat"] },
  { slug: "operators", label: "Operators", terms: ["automation", "productivity", "research", "coding"] },
];

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<ToolSearchParams>;
}) {
  const params = await searchParams;
  const supabase = createServerClient();

  const [{ data: rawTools }, { data: categories }] = await Promise.all([
    supabase
      .from("tools")
      .select(`*, categories:tool_categories(category:categories(*)), tags:tool_tags(tag:tags(*))`)
      .eq("is_published", true)
      .order("tool_score", { ascending: false })
      .limit(250),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  const allTools = (rawTools ?? []) as Array<Tool & { categories?: any[]; tags?: any[] }>;
  const allCategories = (categories ?? []) as Category[];

  const filteredTools = sortTools(
    allTools.filter((tool) => matchesFilters(tool, params)),
    params.sort
  );

  const verifiedCount = allTools.filter((tool) => tool.freshness === "verified" || tool.last_verified_at).length;
  const freeCount = allTools.filter((tool) => tool.has_free_plan || tool.pricing_model === "free" || tool.pricing_model === "freemium").length;
  const stackReadyCount = allTools.filter((tool) => (tool.stack_count ?? 0) > 0).length;

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
                Browse AI tools by category, role, pricing, freshness, and stack fit. Unlike generic directories, StackBuilder shows how tools fit into real workflows.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
                <Shield className="text-brand-400" size={16} /> Directory health
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Tools" value={allTools.length} />
                <Stat label="Verified" value={verifiedCount} />
                <Stat label="Free/Freemium" value={freeCount} />
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-zinc-500">
                Ranked by stack usefulness, freshness, verification, saves, clicks, and editor fit. Never votes alone.
              </div>
            </div>
          </div>

          <form action="/tools" className="mt-10 rounded-2xl border border-white/10 bg-[#111118] p-3 shadow-2xl shadow-black/20">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  name="q"
                  defaultValue={params.q ?? ""}
                  placeholder="Search ChatGPT, Runway, Suno, automation, video, writing..."
                  className="h-12 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-500/60"
                />
              </div>
              <select name="category" defaultValue={params.category ?? ""} className="h-12 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-zinc-300 outline-none focus:border-brand-500/60">
                <option value="">All categories</option>
                {allCategories.map((cat) => (
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

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-white/10 bg-[#111118] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <SlidersHorizontal size={15} className="text-brand-400" /> Sort
            </div>
            <div className="space-y-2">
              <SideLink href={withParams(params, { sort: "best" })} active={!params.sort || params.sort === "best"} label="Best fit" />
              <SideLink href={withParams(params, { sort: "verified" })} active={params.sort === "verified"} label="Recently verified" />
              <SideLink href={withParams(params, { sort: "stacks" })} active={params.sort === "stacks"} label="Most used in stacks" />
              <SideLink href={withParams(params, { sort: "free" })} active={params.sort === "free"} label="Free first" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111118] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Filter size={15} className="text-brand-400" /> Categories
            </div>
            <div className="space-y-2">
              <SideLink href={withParams(params, { category: "" })} active={!params.category} label="All categories" />
              {allCategories.map((cat) => (
                <SideLink key={cat.slug} href={withParams(params, { category: cat.slug })} active={params.category === cat.slug} label={`${cat.icon ?? ""} ${cat.name}`.trim()} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-brand-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <Zap size={15} className="text-brand-300" /> Build from tools
            </div>
            <p className="text-sm leading-6 text-zinc-400">Found a few tools you like? Turn them into a shareable stack with roles, cost, and alternatives.</p>
            <Link href="/stacks/new" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-300 hover:text-brand-200">
              Start stack builder <ArrowRight size={13} />
            </Link>
          </div>
        </aside>

        <main>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-zinc-500">Showing</p>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                {filteredTools.length} AI tools
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
              {params.q && <ActiveBadge label={`Search: ${params.q}`} href={withParams(params, { q: "" })} />}
              {params.role && <ActiveBadge label={`Role: ${ROLE_FILTERS.find((role) => role.slug === params.role)?.label ?? params.role}`} href={withParams(params, { role: "" })} />}
              {params.category && <ActiveBadge label={`Category: ${params.category}`} href={withParams(params, { category: "" })} />}
              {params.pricing && <ActiveBadge label={`Pricing: ${params.pricing}`} href={withParams(params, { pricing: "" })} />}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool: Tool, i: number) => (
              <ToolCard key={tool.id} tool={tool} rank={i + 1} />
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-[#111118] px-6 py-16 text-center">
              <h3 className="text-xl font-bold text-white">No tools matched this search.</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                Try a broader category, remove one filter, or submit a missing tool so it can be reviewed for the StackBuilder graph.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/tools" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-white/20">Reset filters</Link>
                <Link href="/submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500">Submit a tool</Link>
              </div>
            </div>
          )}
        </main>
      </section>
    </div>
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

function sortTools(tools: Array<Tool & { categories?: any[]; tags?: any[] }>, sort?: string) {
  const sorted = [...tools];
  if (sort === "verified") {
    return sorted.sort((a, b) => String(b.last_verified_at ?? "").localeCompare(String(a.last_verified_at ?? "")));
  }
  if (sort === "stacks") {
    return sorted.sort((a, b) => (b.stack_count ?? 0) - (a.stack_count ?? 0));
  }
  if (sort === "free") {
    return sorted.sort((a, b) => Number(b.has_free_plan) - Number(a.has_free_plan) || (b.tool_score ?? 0) - (a.tool_score ?? 0));
  }
  return sorted.sort((a, b) => (b.tool_score ?? 0) - (a.tool_score ?? 0));
}

function withParams(current: ToolSearchParams, next: Partial<ToolSearchParams>) {
  const params = new URLSearchParams();
  const merged = { ...current, ...next };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/tools?${query}` : "/tools";
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function QuickPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`shrink-0 rounded-full border px-3.5 py-2 text-sm transition-all ${active ? "border-brand-500 bg-brand-500/15 text-brand-200" : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"}`}>
      {label}
    </Link>
  );
}

function SideLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`block rounded-lg px-3 py-2 text-sm transition-all ${active ? "bg-brand-500/15 text-brand-200" : "text-zinc-500 hover:bg-white/5 hover:text-white"}`}>
      {label}
    </Link>
  );
}

function ActiveBadge({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-zinc-400 hover:border-white/20 hover:text-white">
      {label} ×
    </Link>
  );
}

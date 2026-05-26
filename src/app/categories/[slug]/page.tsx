import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Grid3X3, Search, Shield, Sparkles } from "lucide-react";
import { createServerClient } from "@/lib/supabase";
import { ToolCard } from "@/components/tools/ToolCard";
import { buildMetadata } from "@/lib/seo";
import type { Category, Tool } from "@/types";

type Props = { params: Promise<{ slug: string }> };

async function getCategoryPage(slug: string) {
  const supabase = createServerClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) return null;

  const { data: tools } = await supabase
    .from("tools")
    .select("*, categories:tool_categories(category:categories(*)), tags:tool_tags(tag:tags(*))")
    .eq("is_published", true)
    .order("tool_score", { ascending: false })
    .limit(200);

  const filteredTools = (tools ?? []).filter((tool: any) =>
    (tool.categories ?? []).some((item: any) => (item.category?.slug ?? item.slug) === slug)
  );

  return { category: category as Category, tools: filteredTools as Tool[] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryPage(slug);
  if (!data) return {};
  return buildMetadata({
    title: `${data.category.name} AI Tools`,
    description: `Browse ${data.category.name} AI tools by pricing, freshness, stack usage, and workflow fit.`,
    path: `/categories/${slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCategoryPage(slug);
  if (!data) notFound();

  const { category, tools } = data;
  const verifiedCount = tools.filter((tool) => tool.freshness === "verified" || tool.last_verified_at).length;
  const freeCount = tools.filter((tool) => tool.has_free_plan || tool.pricing_model === "free" || tool.pricing_model === "freemium").length;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="relative overflow-hidden border-b border-white/5 px-4 py-16">
        <div className="absolute right-0 top-0 h-[520px] w-[620px] rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl">
          <Link href="/tools" className="text-sm text-brand-400 hover:text-brand-300">← All tools</Link>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300">
            <Grid3X3 size={13} /> Category directory
          </div>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
                {category.icon ? `${category.icon} ` : ""}{category.name} AI Tools
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-400">
                Browse tools in this category by workflow fit, pricing, verification, and stack usage. Use this page as a starting point, then compare tools or add them to a stack.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/tools?category=${category.slug}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-500">
                  Filter in tools directory <ArrowRight size={15} />
                </Link>
                <Link href="/stacks/new" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-zinc-300 hover:border-white/20">
                  Build a stack
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Stat icon={<Search size={15} />} label="Tools" value={tools.length} />
              <Stat icon={<Shield size={15} />} label="Verified" value={verifiedCount} />
              <Stat icon={<Sparkles size={15} />} label="Free/Freemium" value={freeCount} />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-zinc-500">Ranked by stack fit and freshness</p>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                Top {category.name} tools
              </h2>
            </div>
            <Link href="/methodology" className="text-sm text-brand-400 hover:text-brand-300">How rankings work →</Link>
          </div>

          {tools.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tools.map((tool, index) => <ToolCard key={tool.id} tool={tool} rank={index + 1} />)}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#111118] px-6 py-16 text-center">
              <h3 className="text-xl font-bold text-white">No published tools in this category yet.</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">Submit a tool or run the data expansion pack to populate this category.</p>
              <Link href="/submit" className="mt-6 inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500">Submit a tool</Link>
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

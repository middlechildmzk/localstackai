import { createServerClient } from "@/lib/supabase";
import { ToolCard } from "@/components/tools/ToolCard";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import type { Tool, Category } from "@/types";

export const metadata: Metadata = buildMetadata({
  title: "AI Tools Directory",
  description:
    "Browse verified AI tools by workflow, pricing, freshness, and stack fit.",
  path: "/tools",
});

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; pricing?: string }>;
}) {
  const params = await searchParams;
  const supabase = createServerClient();

  let query = supabase
    .from("tools")
    .select(`*, categories:tool_categories(category:categories(*))`)
    .eq("is_published", true)
    .order("tool_score", { ascending: false });

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`);
  }
  if (params.pricing) {
    query = query.eq("pricing_model", params.pricing);
  }

  const { data: rawTools } = await query.limit(60);
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  const tools = params.category
    ? (rawTools ?? []).filter((tool: any) =>
        (tool.categories ?? []).some((item: any) => (item.category?.slug ?? item.slug) === params.category)
      )
    : (rawTools ?? []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          AI Tools
        </h1>
        <p className="text-zinc-400">
          Verified tools ranked by real-world stack usage — not votes.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <FilterLink href="/tools" label="All" active={!params.category && !params.pricing} />
        <FilterLink href="/tools?pricing=free" label="Free" active={params.pricing === "free"} />
        <FilterLink href="/tools?pricing=freemium" label="Freemium" active={params.pricing === "freemium"} />
        {(categories ?? []).slice(0, 8).map((cat: Category) => (
          <FilterLink
            key={cat.id}
            href={`/tools?category=${cat.slug}`}
            label={cat.name}
            active={params.category === cat.slug}
          />
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(tools ?? []).map((tool: Tool, i: number) => (
          <ToolCard key={tool.id} tool={tool} rank={i + 1} />
        ))}
      </div>

      {(!tools || tools.length === 0) && (
        <div className="text-center py-20 text-zinc-600">
          No tools found for this filter. Try another category or submit a missing tool.
        </div>
      )}
    </div>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <a
      href={href}
      className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
        active
          ? "bg-brand-600 border-brand-600 text-white"
          : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
      }`}
    >
      {label}
    </a>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { buildMetadata } from "@/lib/seo";
import { ToolCard } from "@/components/tools/ToolCard";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return buildMetadata({
    title: `Best Alternatives to ${slug}`,
    description: `Find the best alternatives to ${slug} ranked by workflow fit, price, and freshness.`,
    path: `/alternatives/${slug}`,
  });
}

export default async function AlternativesPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServerClient();

  const { data: tool } = await supabase
    .from("tools")
    .select("id,slug,name,tagline")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!tool) notFound();

  const { data: rels } = await supabase
    .from("tool_relationships")
    .select(`target_tool:tools!target_tool_id(*)`)
    .eq("source_tool_id", tool.id)
    .eq("relationship_type", "alternative")
    .order("confidence", { ascending: false })
    .limit(12);

  const alternatives = (rels ?? []).map((r: any) => r.target_tool).filter(Boolean);

  // If no explicit alts, fall back to same categories
  let fallback: any[] = [];
  if (alternatives.length < 3) {
    const { data } = await supabase
      .from("tools")
      .select("*, categories:tool_categories(category:categories(*))")
      .eq("is_published", true)
      .neq("id", tool.id)
      .order("tool_score", { ascending: false })
      .limit(8);
    fallback = data ?? [];
  }

  const displayTools = alternatives.length > 0 ? alternatives : fallback;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best alternatives to ${tool.name}`,
    itemListElement: displayTools.map((t: any, i: number) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://stackbuilder.ai"}/tools/${t.slug}` })),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Best Alternatives to {tool.name}
        </h1>
        <p className="text-zinc-400">
          {tool.tagline} · Ranked by workflow fit, price, and freshness.
        </p>
        <p className="text-xs text-zinc-600 mt-3">Last updated: {new Date().toLocaleDateString()} · <Link href="/methodology" className="text-brand-400 hover:underline">How rankings work</Link></p>
      </div>

      <section className="glass p-5 mb-8">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">How to choose an alternative</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">Start with the workflow, not the brand name. Compare price, freshness, stack fit, and whether the replacement covers the same role in your stack.</p>
      </section>

      {displayTools.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          No alternatives yet.{" "}
          <Link href="/submit" className="text-brand-400 hover:underline">
            Submit one →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayTools.map((t: any, i: number) => (
            <div key={t.id}>
              <ToolCard tool={t} rank={i + 1} />
              <div className="flex gap-2 mt-2 ml-1">
                <Link
                  href={`/compare/${tool.slug}-vs-${t.slug}`}
                  className="text-xs text-zinc-600 hover:text-brand-400 transition-colors"
                >
                  Compare {tool.name} vs {t.name} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

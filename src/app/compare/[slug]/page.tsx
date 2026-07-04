import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { buildMetadata } from "@/lib/seo";
import { freshnessColor, freshnessLabel, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { logAnalyticsEvent } from "@/lib/analytics";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

function parseSlugs(slug: string): [string, string] | null {
  const parts = slug.split("-vs-");
  if (parts.length !== 2) return null;
  return [parts[0], parts[1]];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const slugs = parseSlugs(slug);
  if (!slugs) return {};
  const [a, b] = slugs;
  return buildMetadata({
    title: `${a} vs ${b}: AI Tool Comparison`,
    description: `Compare ${a} and ${b}: pricing, features, strengths, limitations, and stack use cases.`,
    path: `/compare/${slug}`,
  });
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const slugs = parseSlugs(slug);
  if (!slugs) notFound();

  const supabase = createServerClient();
  const [toolASlug, toolBSlug] = slugs;

  const { data: tools } = await supabase
    .from("tools")
    .select("*")
    .in("slug", [toolASlug, toolBSlug])
    .eq("is_published", true);

  if (!tools || tools.length < 2) notFound();

  const toolA = tools.find((t: any) => t.slug === toolASlug) ?? tools[0];
  const toolB = tools.find((t: any) => t.slug === toolBSlug) ?? tools[1];

  await logAnalyticsEvent({
    event_type: "compare_click",
    metadata: { tool_a: toolA.slug, tool_b: toolB.slug },
  });

  const rows = [
    { label: "Pricing model", a: toolA.pricing_model?.replace("_", " "), b: toolB.pricing_model?.replace("_", " ") },
    { label: "Free plan", a: toolA.has_free_plan ? "✓ Yes" : "✗ No", b: toolB.has_free_plan ? "✓ Yes" : "✗ No" },
    { label: "Starting price", a: formatPrice(toolA.starting_price, toolA.pricing_model), b: formatPrice(toolB.starting_price, toolB.pricing_model) },
    { label: "Freshness", a: freshnessLabel(toolA.freshness), b: freshnessLabel(toolB.freshness) },
    { label: "Stack count", a: String(toolA.stack_count), b: String(toolB.stack_count) },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `Which is better, ${toolA.name} or ${toolB.name}?`, acceptedAnswer: { "@type": "Answer", text: `${toolA.name} is usually stronger for ${toolA.best_for?.[0] ?? "some workflows"}, while ${toolB.name} is usually stronger for ${toolB.best_for?.[0] ?? "other workflows"}. The best choice depends on your stack and budget.` } },
      { "@type": "Question", name: `Which is cheaper, ${toolA.name} or ${toolB.name}?`, acceptedAnswer: { "@type": "Answer", text: `${toolA.name} starts at ${formatPrice(toolA.starting_price, toolA.pricing_model)} and ${toolB.name} starts at ${formatPrice(toolB.starting_price, toolB.pricing_model)}.` } },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="mb-8">
        <p className="text-zinc-500 text-sm mb-2">
          <Link href="/compare" className="hover:text-white transition-colors">Compare</Link> /
        </p>
        <h1
          className="text-3xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {toolA.name} vs {toolB.name}
        </h1>
      </div>

      {/* Side-by-side header */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[toolA, toolB].map((t: any) => (
          <div key={t.id} className="glass p-5 text-center">
            <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-white/5 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-zinc-400">
              {t.name[0]}
            </div>
            <h2
              className="font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.name}
            </h2>
            <p className="text-xs text-zinc-500">{t.tagline}</p>
            {t.website_url && (
              <a
                href={t.affiliate_url ?? t.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-3 py-1 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors"
              >
                Visit →
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="glass overflow-hidden mb-8">
        <div className="grid grid-cols-3 text-xs font-semibold text-zinc-500 uppercase tracking-widest px-4 py-2 border-b border-white/5">
          <span></span>
          <span className="text-center">{toolA.name}</span>
          <span className="text-center">{toolB.name}</span>
        </div>
        {rows.map(({ label, a, b }) => (
          <div
            key={label}
            className="grid grid-cols-3 px-4 py-3 border-b border-white/5 last:border-0 text-sm"
          >
            <span className="text-zinc-500">{label}</span>
            <span className="text-center text-white">{a ?? "N/A"}</span>
            <span className="text-center text-white">{b ?? "N/A"}</span>
          </div>
        ))}
      </div>

      {/* Best for */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[toolA, toolB].map((t: any) => (
          <div key={t.id} className="glass p-4">
            <h3 className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">
              {t.name} is best for
            </h3>
            {t.best_for?.length ? (
              <ul className="space-y-1">
                {t.best_for.map((item: string) => (
                  <li key={item} className="text-sm text-zinc-400">
                    ✓ {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-600 text-sm">N/A</p>
            )}
          </div>
        ))}
      </div>

      <section className="glass p-5 mb-8">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">Quick verdict</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Choose <strong>{toolA.name}</strong> if your workflow is closer to {toolA.best_for?.[0] ?? "its strongest use case"}. Choose <strong>{toolB.name}</strong> if your workflow is closer to {toolB.best_for?.[0] ?? "its strongest use case"}. Pricing and freshness should be verified before purchase.
        </p>
        <p className="text-xs text-zinc-600 mt-3">Last updated: {new Date().toLocaleDateString()}</p>
      </section>

      <section className="glass p-5 mb-8">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">FAQ</h2>
        <div className="space-y-4 text-sm">
          <div><h3 className="font-semibold text-white">Which is better for my workflow?</h3><p className="text-zinc-400 mt-1">Use the stack builder to compare both tools in the context of your actual workflow, cost, and data flow.</p></div>
          <div><h3 className="font-semibold text-white">Is this comparison sponsored?</h3><p className="text-zinc-400 mt-1">No. Sponsored listings must be clearly labeled and do not silently override organic recommendations.</p></div>
        </div>
      </section>

      {/* Stack CTA */}
      <div className="glass p-6 text-center">
        <p className="text-zinc-400 mb-4">
          Can't decide? Add both to a stack and see the cost side by side.
        </p>
        <Link
          href={`/stacks/new?tool=${toolA.slug}&tool=${toolB.slug}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Build a stack with both →
        </Link>
      </div>
    </div>
  );
}

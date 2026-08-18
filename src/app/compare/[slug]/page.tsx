import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { buildMetadata } from "@/lib/seo";
import { freshnessLabel, formatPrice } from "@/lib/utils";
import { getFallbackTool } from "@/lib/fallback-tools";
import Link from "next/link";
import { logAnalyticsEvent } from "@/lib/analytics";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

function parseSlugs(slug: string): [string, string] | null {
  const parts = slug.split("-vs-");
  if (parts.length !== 2) return null;
  return [parts[0], parts[1]];
}

function titleizeSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function bestForSummary(tool: any) {
  if (!tool?.best_for?.length) return "No verified workflow tags yet";
  return tool.best_for.slice(0, 2).join(", ");
}

function freePlanLabel(value: boolean | null | undefined) {
  if (value === true) return "✓ Yes";
  if (value === false) return "✗ No";
  return "? Verify";
}

function priceLabel(tool: any) {
  if (tool?.data_source === "static_fallback") return "Verify on vendor site";
  return formatPrice(tool?.starting_price, tool?.pricing_model);
}

function pricingAnswer(tool: any) {
  if (tool?.data_source === "static_fallback") {
    return `${tool.name} pricing is not carried in the static continuity record. Verify current pricing on the vendor-owned site before purchase.`;
  }
  return `${tool.name} is currently recorded at ${formatPrice(tool.starting_price, tool.pricing_model)}.`;
}

async function getComparisonTools(aSlug: string, bSlug: string) {
  let dbTools: any[] = [];

  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("tools")
      .select("*")
      .in("slug", [aSlug, bSlug])
      .eq("is_published", true);
    dbTools = data ?? [];
  } catch {
    dbTools = [];
  }

  const resolve = (slug: string) =>
    dbTools.find((tool: any) => tool.slug === slug) ?? getFallbackTool(slug);

  return [resolve(aSlug), resolve(bSlug)] as const;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const slugs = parseSlugs(slug);
  if (!slugs) return {};

  const [aSlug, bSlug] = slugs;
  const [toolA, toolB] = await getComparisonTools(aSlug, bSlug);
  const aName = toolA?.name ?? titleizeSlug(aSlug);
  const bName = toolB?.name ?? titleizeSlug(bSlug);

  return buildMetadata({
    title: `${aName} vs ${bName} (2026): Which Fits Your Workflow?`,
    description: `Compare ${aName} vs ${bName} by workflow fit, pricing model, data freshness, and stack overlap. See what each is best for and what to verify before buying.`,
    path: `/compare/${slug}`,
  });
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const slugs = parseSlugs(slug);
  if (!slugs) notFound();

  const [toolASlug, toolBSlug] = slugs;
  const [toolA, toolB] = await getComparisonTools(toolASlug, toolBSlug);

  if (!toolA || !toolB) notFound();

  await logAnalyticsEvent({
    event_type: "compare_click",
    metadata: { tool_a: toolA.slug, tool_b: toolB.slug },
  });

  const usesFallback = toolA.data_source === "static_fallback" || toolB.data_source === "static_fallback";

  const rows = [
    { label: "Best for", a: bestForSummary(toolA), b: bestForSummary(toolB) },
    { label: "Pricing model", a: toolA.data_source === "static_fallback" ? "Verify current plans" : toolA.pricing_model?.replace("_", " "), b: toolB.data_source === "static_fallback" ? "Verify current plans" : toolB.pricing_model?.replace("_", " ") },
    { label: "Free plan", a: freePlanLabel(toolA.has_free_plan), b: freePlanLabel(toolB.has_free_plan) },
    { label: "Starting price", a: priceLabel(toolA), b: priceLabel(toolB) },
    { label: "Data freshness", a: freshnessLabel(toolA.freshness), b: freshnessLabel(toolB.freshness) },
    { label: "Stack appearances", a: toolA.data_source === "static_fallback" ? "Not available" : String(toolA.stack_count ?? 0), b: toolB.data_source === "static_fallback" ? "Not available" : String(toolB.stack_count ?? 0) },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Which is better, ${toolA.name} or ${toolB.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${toolA.name} is a stronger fit when your workflow is closer to ${toolA.best_for?.[0] ?? "its core use cases"}; ${toolB.name} is a stronger fit when your workflow is closer to ${toolB.best_for?.[0] ?? "its core use cases"}. Compare the actual job, overlap with tools you already pay for, and current vendor terms before deciding.`,
        },
      },
      {
        "@type": "Question",
        name: `Which is cheaper, ${toolA.name} or ${toolB.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${pricingAnswer(toolA)} ${pricingAnswer(toolB)}`,
        },
      },
      {
        "@type": "Question",
        name: `Can ${toolA.name} and ${toolB.name} be used together?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Possibly. The useful question is whether the tools perform distinct jobs in one workflow or create paid overlap. Map the input, output, handoff, and recurring cost before keeping both.",
        },
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="mb-8">
        <p className="text-zinc-500 text-sm mb-2">
          <Link href="/compare" className="hover:text-white transition-colors">Compare</Link> /
        </p>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
          {toolA.name} vs {toolB.name}: which fits your workflow in 2026?
        </h1>
        <p className="text-zinc-400 mt-3 leading-relaxed">
          Compare the job each tool is strongest at, pricing availability, data freshness, and whether the two tools complement each other or simply duplicate the same step.
        </p>
      </div>

      {usesFallback && (
        <section className="glass p-4 mb-6 border border-yellow-500/20">
          <p className="text-sm text-yellow-100/80 leading-relaxed">
            <strong className="text-yellow-100">Continuity mode:</strong> StackBuilder&apos;s live tool database is temporarily unavailable, so this page is using a minimal vendor-identity fallback. Workflow categories remain available, but pricing, plan availability, stack counts, and other commercial fields must be verified on the vendor-owned sites.
          </p>
        </section>
      )}

      <section className="glass p-5 mb-8 border border-brand-500/20">
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">Quick answer</p>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Choose <strong className="text-white">{toolA.name}</strong> when your main job is closer to <strong className="text-white">{toolA.best_for?.[0] ?? "its strongest use case"}</strong>. Choose <strong className="text-white">{toolB.name}</strong> when your main job is closer to <strong className="text-white">{toolB.best_for?.[0] ?? "its strongest use case"}</strong>. If you need both, make sure they own different steps in the same workflow before paying for two subscriptions.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[toolA, toolB].map((t: any) => (
          <div key={t.id} className="glass p-5 text-center">
            <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-white/5 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-zinc-400">
              {t.name[0]}
            </div>
            <h2 className="font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>
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
                Visit official site →
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="glass overflow-hidden mb-8">
        <div className="grid grid-cols-3 text-xs font-semibold text-zinc-500 uppercase tracking-widest px-4 py-2 border-b border-white/5">
          <span>Decision factor</span>
          <span className="text-center">{toolA.name}</span>
          <span className="text-center">{toolB.name}</span>
        </div>
        {rows.map(({ label, a, b }) => (
          <div key={label} className="grid grid-cols-3 px-4 py-3 border-b border-white/5 last:border-0 text-sm">
            <span className="text-zinc-500">{label}</span>
            <span className="text-center text-white">{a ?? "N/A"}</span>
            <span className="text-center text-white">{b ?? "N/A"}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {[toolA, toolB].map((t: any) => (
          <div key={t.id} className="glass p-4">
            <h3 className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">
              {t.name} is best for
            </h3>
            {t.best_for?.length ? (
              <ul className="space-y-1">
                {t.best_for.map((item: string) => (
                  <li key={item} className="text-sm text-zinc-400">✓ {item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-600 text-sm">No verified workflow tags yet.</p>
            )}
          </div>
        ))}
      </div>

      <section className="glass p-5 mb-8">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">The four-part buying test</h2>
        <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
          <div><strong className="text-white">1. Job fit.</strong> Write the exact job you need the tool to do before comparing features. A better product for somebody else&apos;s workflow can still be the wrong product for yours.</div>
          <div><strong className="text-white">2. Net-new value.</strong> Check whether the candidate adds a capability you do not already own. Paid overlap is one of the easiest ways to build an expensive AI stack.</div>
          <div><strong className="text-white">3. Total cost.</strong> Include seats, usage limits, add-ons, API spend, and the manual work needed to move data between tools.</div>
          <div><strong className="text-white">4. Current evidence.</strong> Treat recorded prices and capabilities as a research starting point, not a guarantee. Verify vendor-owned pricing, plan limits, and product availability before purchase.</div>
        </div>
      </section>

      <section className="glass p-5 mb-8">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">Quick verdict</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          The decision is not “which brand wins?” It is which tool owns a necessary step in your workflow with the least redundant spend. Start with workflow fit, then compare current cost and evidence.
        </p>
        <p className="text-xs text-zinc-600 mt-3">
          Data freshness: {toolA.name} — {freshnessLabel(toolA.freshness)} · {toolB.name} — {freshnessLabel(toolB.freshness)}. Verify vendor-owned sources before buying.
        </p>
      </section>

      <section className="glass p-5 mb-8">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">FAQ</h2>
        <div className="space-y-4 text-sm">
          <div><h3 className="font-semibold text-white">Which is better for my workflow?</h3><p className="text-zinc-400 mt-1">Use the primary job as the deciding variable. Then compare overlap, current pricing, limits, and how each tool hands work to the next step in your stack.</p></div>
          <div><h3 className="font-semibold text-white">Can I use both?</h3><p className="text-zinc-400 mt-1">Yes when they own meaningfully different workflow steps. If both solve the same job, test whether the second subscription produces enough net-new value to justify the overlap.</p></div>
          <div><h3 className="font-semibold text-white">Is this comparison sponsored?</h3><p className="text-zinc-400 mt-1">No. Sponsored listings must be clearly labeled and do not silently override organic recommendations.</p></div>
        </div>
      </section>

      <div className="glass p-6 text-center">
        <p className="text-zinc-400 mb-4">
          Compare them in the context that matters: your full workflow and recurring stack cost.
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

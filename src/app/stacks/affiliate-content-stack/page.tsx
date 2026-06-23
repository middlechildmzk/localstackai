import { StarterStackTemplate } from "@/components/stacks/StarterStackTemplate";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "Affiliate Content Stack", description: "A practical AI stack for affiliate research, comparison pages, disclosure, SEO, email capture, and repurposing.", path: "/stacks/affiliate-content-stack" });

export default function Page() {
  return <StarterStackTemplate badge="Starter stack" title="Affiliate Content Stack" intro="A trust-first stack for researching tools, writing useful comparison pages, disclosing affiliate relationships, and capturing subscribers without turning the site into AI slop." ctaQuery="affiliate content stack ai tools" tools={[
    { role: "Research", tool: "Perplexity", href: "/go/perplexity", why: "Gather source-backed context before writing comparison or alternatives pages." },
    { role: "Writing", tool: "Claude or ChatGPT", href: "/compare/chatgpt-vs-claude", why: "Draft outlines, page sections, FAQs, and summaries after research." },
    { role: "SEO", tool: "Surfer SEO", href: "/go/surfer-seo", why: "Improve topical coverage without keyword stuffing." },
    { role: "Automation", tool: "Zapier or Make", href: "/compare/zapier-vs-make", why: "Route content updates, form fills, and publishing handoffs." },
    { role: "Capture", tool: "Newsletter", href: "/newsletter", why: "Turn comparison traffic into subscribers and repeat visitors." },
  ]} steps={[
    "Pick one high-intent comparison or alternatives topic.",
    "Research current positioning and verify facts before drafting.",
    "Build the page around use cases, who should choose what, and when not to use each tool.",
    "Add clear affiliate disclosure, related guides, and a stack CTA.",
    "Capture email and repurpose the page into short social posts.",
  ]} related={[["/learn/affiliate-marketing", "Affiliate marketing hub"], ["/learn/best-ai-tools-for-affiliate-marketing", "AI tools for affiliate marketing"], ["/compare/jasper-vs-copy-ai", "Jasper vs Copy.ai"], ["/affiliate-disclosure", "Affiliate disclosure"]]} />;
}

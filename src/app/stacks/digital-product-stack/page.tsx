import { StarterStackTemplate } from "@/components/stacks/StarterStackTemplate";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "Digital Product Stack", description: "A practical AI stack for creating, packaging, listing, selling, and improving digital products.", path: "/stacks/digital-product-stack" });

export default function Page() {
  return <StarterStackTemplate badge="Starter stack" title="Digital Product Stack" intro="A practical stack for turning one useful idea into a digital product, with product quality, packaging, marketplace rules, and email capture built in." emailVariant="digital" ctaQuery="digital product ai stack" tools={[
    { role: "Planning", tool: "ChatGPT or Claude", href: "/compare/chatgpt-vs-claude", why: "Define the buyer, problem, product promise, sections, and support notes." },
    { role: "Design", tool: "Canva", href: "/go/canva", why: "Create product files, covers, mockups, listing graphics, and lead magnets." },
    { role: "Marketplace", tool: "Etsy", href: "/learn/best-ai-tools-for-etsy-digital-products", why: "Use marketplace demand carefully while following rules and avoiding generic spam." },
    { role: "Direct sales", tool: "Gumroad", href: "/go/gumroad", why: "Sell directly, bundle products, and test offers outside a marketplace." },
    { role: "Traffic", tool: "Affiliate and content stack", href: "/learn/best-ai-tools-for-affiliate-marketing", why: "Build useful comparison content, disclosures, and email capture around the product." },
  ]} steps={[
    "Pick one buyer problem and create a small useful product first.",
    "Draft the structure with AI, then edit and package with human judgment.",
    "Create clean files, clear instructions, and preview images.",
    "Publish on one channel first, then improve from customer signals.",
    "Capture email so buyers and visitors become an audience, not one-time traffic.",
  ]} related={[["/learn/digital-products", "Digital products hub"], ["/learn/best-ai-tools-to-create-and-sell-digital-products", "Create and sell digital products"], ["/learn/how-to-make-printables-to-sell-with-ai", "Make printables with AI"], ["/learn/best-ai-tools-to-write-and-publish-ebook", "Write and publish an ebook"]]} />;
}

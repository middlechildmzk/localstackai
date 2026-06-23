import { ClusterHub } from "@/components/learn/ClusterHub";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "AI Digital Product Stack Guides", description: "AI tools for ebooks, Etsy products, printables, affiliate content, templates, and creator product workflows.", path: "/learn/digital-products" });

export default function Page() {
  return <ClusterHub badge="Digital products hub" title="AI stacks for digital products" intro="Use AI to make better digital products, not generic product spam. Start with the buyer problem, then build the product, packaging, listing, and distribution stack." emailVariant="digital" ctaQuery="ai tools to create and sell digital products" startHere={{ href: "/learn/best-ai-tools-to-create-and-sell-digital-products", title: "Best AI Tools to Create and Sell Digital Products", description: "Start here for the full digital product stack: idea, product, design, listing, sales page, and delivery." }} links={[
    { href: "/learn/best-ai-tools-to-write-and-publish-ebook", title: "Best AI Tools to Write and Publish an Ebook", description: "Outline, draft, edit, format, publish, and sell ebooks.", tag: "Ebooks" },
    { href: "/learn/best-ai-tools-for-etsy-digital-products", title: "Best AI Tools for Etsy Digital Products", description: "Research, design, mockups, listing copy, packaging, and support tools.", tag: "Etsy" },
    { href: "/learn/how-to-make-printables-to-sell-with-ai", title: "How to Make Printables to Sell With AI", description: "A workflow for planners, worksheets, checklists, and templates.", tag: "Printables" },
    { href: "/learn/best-ai-tools-for-affiliate-marketing", title: "Best AI Tools for Affiliate Marketing", description: "Research, comparison pages, disclosure, SEO, and email capture.", tag: "Affiliate" },
    { href: "/compare/chatgpt-vs-claude", title: "ChatGPT vs Claude", description: "Compare AI assistants for writing, planning, editing, and product work.", tag: "Assistants" },
    { href: "/learn/best-free-ai-tools-for-content-creators", title: "Best Free AI Tools for Creators", description: "Free and budget tools for creating assets and testing ideas.", tag: "Budget" },
  ]} />;
}

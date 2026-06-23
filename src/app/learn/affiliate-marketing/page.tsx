import { ClusterHub } from "@/components/learn/ClusterHub";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "AI Affiliate Marketing Stack Guides", description: "AI tools and workflows for affiliate research, comparison pages, disclosure, content systems, and conversion.", path: "/learn/affiliate-marketing" });

export default function Page() {
  return <ClusterHub badge="Affiliate hub" title="AI stacks for affiliate content and tool reviews" intro="Use AI to support research, structure, comparison pages, disclosure, email capture, and repurposing. The goal is trust and usefulness, not mass-produced content." emailVariant="general" ctaQuery="ai tools for affiliate marketing stack" startHere={{ href: "/learn/best-ai-tools-for-affiliate-marketing", title: "Best AI Tools for Affiliate Marketing", description: "Start here for research, comparison pages, SEO, disclosure, email capture, and content repurposing." }} links={[
    { href: "/compare/jasper-vs-copy-ai", title: "Jasper vs Copy.ai", description: "Compare specialized AI writing tools for content teams and creators.", tag: "Writing" },
    { href: "/compare/chatgpt-vs-claude", title: "ChatGPT vs Claude", description: "Choose the better assistant for research, writing, editing, and page structure.", tag: "Assistants" },
    { href: "/compare/zapier-vs-make", title: "Zapier vs Make", description: "Build content operations, notifications, and workflow handoffs.", tag: "Automation" },
    { href: "/alternatives/opusclip", title: "Best OpusClip Alternatives", description: "Affiliate-style alternatives page structure for short-form video tools.", tag: "Alternatives" },
    { href: "/alternatives/elevenlabs", title: "Best ElevenLabs Alternatives", description: "Affiliate-style alternatives page structure for AI voice tools.", tag: "Alternatives" },
    { href: "/learn/realistic-ways-to-make-money-with-ai", title: "Realistic Ways to Make Money With AI", description: "A safe, honest monetization overview with no income guarantees.", tag: "Money" },
  ]} />;
}

import { ClusterHub } from "@/components/learn/ClusterHub";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "AI App Builder Stack Guides", description: "AI app builders, no-code MVPs, app-building workflows, prototype QA, and launch stacks.", path: "/learn/ai-apps" });

export default function Page() {
  return <ClusterHub badge="AI apps hub" title="AI app builder and MVP stacks" intro="Use AI app builders to test focused workflows, not to pretend every prototype is production-ready. These guides help you scope, build, QA, and launch carefully." emailVariant="apps" ctaQuery="ai app builder mvp stack" startHere={{ href: "/learn/best-ai-app-builders", title: "Best AI App Builders for Non-Developers", description: "Start here to compare Lovable, Bolt, v0, Replit, Cursor, and Windsurf by workflow." }} links={[
    { href: "/compare/lovable-vs-bolt-vs-v0", title: "Lovable vs Bolt vs v0", description: "Compare AI app builders for prototypes, UI, and MVP workflows.", tag: "Comparison" },
    { href: "/learn/how-to-build-an-app-with-ai", title: "How to Build an App With AI", description: "Scope, prototype, database, auth, deployment, QA, and launch workflow.", tag: "How-to" },
    { href: "/learn/best-ai-tools-to-build-an-mvp", title: "Best AI Tools to Build an MVP", description: "Planning, app building, UI, deployment, feedback, and QA stack.", tag: "MVP" },
    { href: "/compare/chatgpt-vs-claude", title: "ChatGPT vs Claude", description: "Use AI assistants for planning, specs, prompts, QA, and documentation.", tag: "Planning" },
    { href: "/compare/zapier-vs-make", title: "Zapier vs Make", description: "Automation tools for forms, handoffs, alerts, and app operations.", tag: "Automation" },
    { href: "/learn/best-ai-website-builders-for-creators", title: "Best AI Website Builders", description: "Use a website builder when you need a site, not an app.", tag: "Websites" },
  ]} />;
}

import { StarterStackTemplate } from "@/components/stacks/StarterStackTemplate";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "No-Code MVP Stack", description: "A practical AI stack for scoping, prototyping, UI, QA, deployment, and feedback on an MVP.", path: "/stacks/no-code-mvp-stack" });

export default function Page() {
  return <StarterStackTemplate badge="Starter stack" title="No-Code MVP Stack" intro="A focused stack for building the smallest useful version of an app with AI, then testing it before pretending it is production-ready." emailVariant="apps" ctaQuery="no code mvp ai stack" tools={[
    { role: "Scope", tool: "ChatGPT or Claude", href: "/compare/chatgpt-vs-claude", why: "Define the user, promise, workflow, data model, and first test case before building." },
    { role: "Prototype", tool: "Lovable or Bolt", href: "/compare/lovable-vs-bolt-vs-v0", why: "Create the first working app prototype around one core workflow." },
    { role: "UI", tool: "v0", href: "/go/v0", why: "Improve the interface, landing page, and component structure." },
    { role: "Code help", tool: "Cursor or Windsurf", href: "/learn/best-ai-app-builders", why: "Review and debug code as the prototype becomes more serious." },
    { role: "Automation", tool: "Zapier or Make", href: "/compare/zapier-vs-make", why: "Route forms, notifications, and handoffs after the core workflow works." },
  ]} steps={[
    "Write the one-sentence promise and one user workflow.",
    "Prototype only the core flow, not a full platform.",
    "Add data, auth, and forms carefully, then test failure states.",
    "Deploy a preview and share with a small group for feedback.",
    "Improve from real signals before adding more features.",
  ]} related={[["/learn/ai-apps", "AI apps hub"], ["/learn/how-to-build-an-app-with-ai", "How to build an app with AI"], ["/learn/best-ai-tools-to-build-an-mvp", "Best AI tools to build an MVP"], ["/learn/best-ai-app-builders", "Best AI app builders"]]} />;
}

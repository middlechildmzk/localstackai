import { buildMetadata } from "@/lib/seo";
import { StackBuilder } from "@/components/stacks/StackBuilder";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Build a Stack",
  description: "Create and share your AI tool stack for any workflow.",
  path: "/stacks/new",
});

export default function NewStackPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Build a Stack
        </h1>
        <p className="text-zinc-400">
          Pick your tools, assign roles, estimate costs, and share your stack.
        </p>
      </div>
      <StackBuilder />
    </div>
  );
}

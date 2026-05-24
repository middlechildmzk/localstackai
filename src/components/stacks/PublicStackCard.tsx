import Link from "next/link";
import { GitFork, Bookmark, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Stack } from "@/types";

export function PublicStackCard({ stack }: { stack: Stack }) {
  const tools = stack.stack_tools ?? [];

  return (
    <Link
      href={`/stacks/${stack.slug}`}
      className="glass p-5 flex flex-col gap-4 hover:border-white/10 group transition-all"
    >
      <div>
        <h3
          className="font-semibold text-white group-hover:text-brand-400 transition-colors mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {stack.title}
        </h3>
        {stack.description && (
          <p className="text-sm text-zinc-500 line-clamp-2">
            {stack.description}
          </p>
        )}
      </div>

      {/* Tool pills */}
      {tools.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tools.slice(0, 5).map((st) => (
            <span
              key={st.id}
              className="px-2 py-0.5 text-xs bg-white/5 border border-white/5 rounded text-zinc-400"
            >
              {st.tool?.name ?? "Tool"}
            </span>
          ))}
          {tools.length > 5 && (
            <span className="px-2 py-0.5 text-xs text-zinc-600">
              +{tools.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-zinc-600">
        {stack.monthly_cost != null && (
          <span className="flex items-center gap-1">
            <DollarSign size={11} />
            {stack.monthly_cost === 0
              ? "Free"
              : `~$${stack.monthly_cost}/mo`}
          </span>
        )}
        <span className="flex items-center gap-1">
          <GitFork size={11} />
          {stack.fork_count} forks
        </span>
        <span className="flex items-center gap-1">
          <Bookmark size={11} />
          {stack.save_count} saves
        </span>
        {stack.owner && (
          <span className="ml-auto text-zinc-700">
            by {stack.owner.display_name ?? "Anonymous"}
          </span>
        )}
      </div>
    </Link>
  );
}

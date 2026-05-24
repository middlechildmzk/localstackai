import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import type { Workflow } from "@/types";

export function WorkflowCard({ workflow }: { workflow: Workflow }) {
  return (
    <Link
      href={`/workflows/${workflow.slug}`}
      className="glass p-5 flex flex-col gap-3 hover:border-white/10 group transition-all"
    >
      <div className="flex-1">
        <h3
          className="font-semibold text-white group-hover:text-brand-400 transition-colors mb-1.5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {workflow.title}
        </h3>
        {workflow.description && (
          <p className="text-sm text-zinc-500 line-clamp-2">
            {workflow.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-600">
        <div className="flex items-center gap-1.5">
          {workflow.target_role && (
            <>
              <Users size={11} />
              {workflow.target_role}
            </>
          )}
        </div>
        <span className="flex items-center gap-1 text-brand-500 group-hover:gap-2 transition-all">
          View stack <ArrowRight size={11} />
        </span>
      </div>
    </Link>
  );
}

"use client";

import { useState } from "react";
import { Check, X, ExternalLink, Loader2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { Submission } from "@/types";

export function SubmissionReviewTable({ submissions }: { submissions: Submission[] }) {
  const [list, setList] = useState(submissions);
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleAction(
    id: string,
    action: "approved" | "rejected",
    notes?: string
  ) {
    setProcessing(id);
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, review_notes: notes }),
    });
    if (res.ok) {
      setList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: action } : s))
      );
    }
    setProcessing(null);
  }

  const pending = list.filter((s) => s.status === "pending");
  const done = list.filter((s) => s.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Pending */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 && (
          <p className="text-zinc-600 text-sm">No pending submissions.</p>
        )}
        <div className="space-y-2">
          {pending.map((s) => (
            <div key={s.id} className="glass p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white text-sm">{s.tool_name}</span>
                  <a
                    href={s.tool_url}
                    target="_blank"
                    rel="noopener"
                    className="text-zinc-600 hover:text-brand-400 transition-colors"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
                {s.tagline && <p className="text-xs text-zinc-500">{s.tagline}</p>}
                <p className="text-xs text-zinc-700 mt-1">
                  {s.submitter_email} · {timeAgo(s.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {processing === s.id ? (
                  <Loader2 size={14} className="animate-spin text-zinc-500" />
                ) : (
                  <>
                    <button
                      onClick={() => handleAction(s.id, "approved")}
                      className="p-1.5 rounded-lg bg-brand-600/20 text-brand-400 hover:bg-brand-600/30 transition-colors"
                      title="Approve"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => handleAction(s.id, "rejected")}
                      className="p-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                      title="Reject"
                    >
                      <X size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviewed */}
      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            Reviewed ({done.length})
          </h2>
          <div className="space-y-2">
            {done.slice(0, 20).map((s) => (
              <div key={s.id} className="glass p-3 flex items-center gap-3 opacity-60">
                <span
                  className={`text-xs font-medium ${
                    s.status === "approved" ? "text-brand-400" : "text-red-400"
                  }`}
                >
                  {s.status}
                </span>
                <span className="text-sm text-zinc-400">{s.tool_name}</span>
                <span className="text-xs text-zinc-700 ml-auto">
                  {timeAgo(s.updated_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

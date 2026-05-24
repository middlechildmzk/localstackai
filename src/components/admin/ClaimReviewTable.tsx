"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { Claim } from "@/types";

export function ClaimReviewTable({ claims }: { claims: Claim[] }) {
  const [list, setList] = useState(claims);
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleAction(id: string, action: "approved" | "rejected") {
    setProcessing(id);
    const res = await fetch(`/api/admin/claims/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setList((prev) => prev.map((c) => (c.id === id ? { ...c, status: action } : c)));
    }
    setProcessing(null);
  }

  const pending = list.filter((c) => c.status === "pending");
  const done = list.filter((c) => c.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 && <p className="text-zinc-600 text-sm">No pending claims.</p>}
        <div className="space-y-2">
          {pending.map((c: any) => (
            <div key={c.id} className="glass p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm mb-0.5">
                  {c.tool?.name ?? "Unknown tool"}
                </div>
                <div className="text-xs text-zinc-500">
                  {c.claimant?.display_name ?? "Unknown"} · {c.claimant_email} ·{" "}
                  {timeAgo(c.created_at)}
                </div>
                {c.proof_url && (
                  <a
                    href={c.proof_url}
                    target="_blank"
                    rel="noopener"
                    className="text-xs text-brand-400 hover:underline mt-1 block"
                  >
                    View proof →
                  </a>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {processing === c.id ? (
                  <Loader2 size={14} className="animate-spin text-zinc-500" />
                ) : (
                  <>
                    <button
                      onClick={() => handleAction(c.id, "approved")}
                      className="p-1.5 rounded-lg bg-brand-600/20 text-brand-400 hover:bg-brand-600/30 transition-colors"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => handleAction(c.id, "rejected")}
                      className="p-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
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

      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            Reviewed ({done.length})
          </h2>
          <div className="space-y-2">
            {done.slice(0, 15).map((c: any) => (
              <div key={c.id} className="glass p-3 flex items-center gap-3 opacity-60 text-sm">
                <span className={c.status === "approved" ? "text-brand-400" : "text-red-400"}>
                  {c.status}
                </span>
                <span className="text-zinc-400">{c.tool?.name}</span>
                <span className="text-zinc-600 text-xs ml-auto">{timeAgo(c.updated_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

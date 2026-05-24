"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, Shield } from "lucide-react";
import { hasSupabaseConfig } from "@/lib/supabase";

export default function ClaimPage() {
  const { toolSlug } = useParams<{ toolSlug: string }>();
  const router = useRouter();
  const [form, setForm] = useState({
    claimant_email: "",
    proof_url: "",
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    if (!hasSupabaseConfig()) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStatus("success");
      return;
    }

    // First, get tool_id from slug
    const toolRes = await fetch(`/api/tools/by-slug?slug=${toolSlug}`);
    if (!toolRes.ok) {
      setStatus("error");
      setMessage("Tool not found.");
      return;
    }
    const { id: tool_id } = await toolRes.json();

    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool_id, ...form }),
    });

    if (res.ok) {
      setStatus("success");
    } else if (res.status === 401) {
      router.push("/account");
    } else {
      setStatus("error");
      const d = await res.json().catch(() => ({}));
      setMessage(d.error ?? "Claim failed. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-12 h-12 text-brand-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Claim submitted!
        </h1>
        <p className="text-zinc-400">We'll verify your claim and get back to you within 48 hours.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-2 mb-2">
        <Shield size={16} className="text-brand-400" />
        <span className="text-brand-400 text-sm font-medium">Maker claim</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
        Claim <span className="text-brand-400 capitalize">{toolSlug?.replace(/-/g, " ")}</span>
      </h1>
      <p className="text-zinc-400 mb-8">
        Are you the maker or an authorized representative? Claim this profile to update info, respond to feedback, and get a verified badge.
      </p>

      <div className="mb-5 rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 text-sm text-brand-100"><strong>Demo mode:</strong> claim review is simulated until Supabase Auth is connected.</div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block mb-1.5">
            Your work email *
          </label>
          <input
            type="email"
            value={form.claimant_email}
            onChange={(e) => setForm((p) => ({ ...p, claimant_email: e.target.value }))}
            placeholder="you@yourtool.com"
            required
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block mb-1.5">
            Proof URL (optional)
          </label>
          <input
            type="url"
            value={form.proof_url}
            onChange={(e) => setForm((p) => ({ ...p, proof_url: e.target.value }))}
            placeholder="LinkedIn, team page, or press release URL"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block mb-1.5">
            Notes (optional)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Any additional context about your role"
            rows={3}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all resize-none"
          />
        </div>

        {status === "error" && <p className="text-sm text-red-400">{message}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg transition-colors disabled:opacity-60"
        >
          {status === "loading" && <Loader2 size={14} className="animate-spin" />}
          Submit Claim
        </button>
      </form>
    </div>
  );
}

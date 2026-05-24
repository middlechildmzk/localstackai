"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { hasSupabaseConfig } from "@/lib/supabase";

export default function SubmitPage() {
  const [form, setForm] = useState({
    submitter_email: "",
    tool_name: "",
    tool_url: "",
    tagline: "",
    description: "",
    pricing_notes: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function update(k: keyof typeof form, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    if (!hasSupabaseConfig()) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStatus("success");
      setMessage("Demo mode: submission captured for preview. Connect Supabase to store real submissions.");
      return;
    }

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setStatus("success");
      setMessage("Submission received! We review all tools before publishing.");
    } else {
      setStatus("error");
      const d = await res.json().catch(() => ({}));
      setMessage(d.error ?? "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-12 h-12 text-brand-400 mx-auto mb-4" />
        <h1
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Tool submitted!
        </h1>
        <p className="text-zinc-400">{message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <h1
        className="text-3xl font-bold text-white mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Submit a Tool
      </h1>
      <p className="text-zinc-400 mb-8">
        All submissions are human-reviewed before publishing. No spam, no pay-to-rank.
      </p>

      <div className="mb-5 rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 text-sm text-brand-100"><strong>Demo mode:</strong> submissions are simulated until Supabase is connected.</div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ key, label, placeholder, type, required }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block mb-1.5">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === "textarea" ? (
              <textarea
                value={form[key as keyof typeof form]}
                onChange={(e) => update(key as keyof typeof form, e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all resize-none"
              />
            ) : (
              <input
                type={type ?? "text"}
                value={form[key as keyof typeof form]}
                onChange={(e) => update(key as keyof typeof form, e.target.value)}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all"
              />
            )}
          </div>
        ))}

        {status === "error" && (
          <p className="text-sm text-red-400">{message}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg transition-colors disabled:opacity-60"
        >
          {status === "loading" && <Loader2 size={14} className="animate-spin" />}
          Submit Tool
        </button>
      </form>
    </div>
  );
}

const fields = [
  { key: "tool_name", label: "Tool Name", placeholder: "e.g. Runway", type: "text", required: true },
  { key: "tool_url", label: "Tool URL", placeholder: "https://runwayml.com", type: "url", required: true },
  { key: "submitter_email", label: "Your Email", placeholder: "you@example.com", type: "email", required: true },
  { key: "tagline", label: "Tagline", placeholder: "One sentence about what it does", type: "text", required: false },
  { key: "description", label: "Description", placeholder: "What problem does it solve? Who is it for?", type: "textarea", required: false },
  { key: "pricing_notes", label: "Pricing Notes", placeholder: "Free tier? Starts at $X/mo?", type: "text", required: false },
];

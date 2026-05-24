"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { hasSupabaseConfig } from "@/lib/supabase";

export function NewsletterForm({ source }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    if (!hasSupabaseConfig()) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setStatus("success");
      setMessage("Demo mode: newsletter signup previewed. Connect Supabase to store subscribers.");
      setEmail("");
      return;
    }

    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), source: source ?? "homepage" }),
    });

    if (res.ok) {
      setStatus("success");
      setMessage("You're in! Check your inbox.");
      setEmail("");
    } else {
      setStatus("error");
      const data = await res.json().catch(() => ({}));
      setMessage(data.error ?? "Something went wrong. Try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-brand-400">
        <Check size={16} />
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
      <div className="relative flex-1">
        <Mail
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          size={15}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
      >
        {status === "loading" && <Loader2 size={14} className="animate-spin" />}
        Subscribe
      </button>
      {status === "error" && (
        <p className="absolute bottom-0 left-0 right-0 text-xs text-red-400 mt-1 text-center">
          {message}
        </p>
      )}
    </form>
  );
}

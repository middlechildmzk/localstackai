"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { SHOWCASE_TIERS, type ShowcaseTier } from "./tiers";

/**
 * Self-serve showcase purchase form. Posts to /api/showcase/checkout and
 * redirects the buyer to the Stripe Checkout page (test mode).
 *
 * The buyer picks a tier + their tool; the server validates everything and
 * creates the row with is_active=false. Nothing goes live without admin
 * approval in /admin/sponsorships.
 */
export function ShowcaseCheckoutForm({ tiers }: { tiers: ShowcaseTier[] }) {
  const [tierId, setTierId] = useState(SHOWCASE_TIERS[0].id);
  const [toolInput, setToolInput] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tier = tiers.find((t) => t.id === tierId) ?? tiers[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/showcase/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierId, toolSlug: toolInput, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Checkout failed. Please try again.");
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Checkout did not return a payment page. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="glass p-6 space-y-6">
      <div>
        <p className="text-sm font-semibold text-zinc-300 mb-3">1. Choose a tier</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {tiers.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTierId(t.id)}
              aria-pressed={tierId === t.id}
              className={`text-left p-4 rounded-xl border transition-all ${
                tierId === t.id
                  ? "border-brand-500 bg-brand-500/10"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-white">{t.name}</span>
                <span className="text-brand-400 font-bold">
                  {t.priceDisplay}
                  <span className="text-xs font-normal text-zinc-500"> {t.billing}</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">{t.tagline}</p>
              <p className="text-xs text-zinc-600 mt-2">
                {t.durationDays}-day run · {t.placementLabel}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="tool-input" className="text-sm font-semibold text-zinc-300 block mb-2">
          2. Your tool
        </label>
        <input
          id="tool-input"
          type="text"
          required
          value={toolInput}
          onChange={(e) => setToolInput(e.target.value)}
          placeholder="e.g. my-ai-tool — or paste your StackBuilder tool URL"
          className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-brand-500"
        />
        <p className="text-xs text-zinc-600 mt-1">
          Must be a published tool on StackBuilder. Paste the slug or the full /tools/… URL.
        </p>
      </div>

      <div>
        <label htmlFor="email-input" className="text-sm font-semibold text-zinc-300 block mb-2">
          3. Email for the receipt <span className="text-zinc-600 font-normal">(optional)</span>
        </label>
        <input
          id="email-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-brand-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Starting secure checkout…
          </>
        ) : (
          <>
            Continue to payment — {tier.priceDisplay} {tier.billing} (test mode){" "}
            <ArrowRight size={16} />
          </>
        )}
      </button>

      <p className="text-xs text-zinc-600 text-center">
        Payment runs through Stripe in test mode. Your showcase goes live only
        after a human review — nothing is published automatically.
      </p>
    </form>
  );
}

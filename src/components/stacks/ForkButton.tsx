"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitFork, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForkButtonProps {
  stackSlug: string;
  variant?: "default" | "large";
}

export function ForkButton({ stackSlug, variant = "default" }: ForkButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleFork() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/stacks/${stackSlug}/fork`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      router.push(`/stacks/${data.slug}`);
    } else if (res.status === 401) {
      router.push("/account");
    } else {
      setError("Fork failed. Try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleFork}
        disabled={loading}
        className={cn(
          "flex items-center gap-2 font-medium transition-colors disabled:opacity-60",
          variant === "large"
            ? "px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm"
            : "px-4 py-2 border border-white/10 hover:border-white/20 text-zinc-300 rounded-lg text-sm hover:bg-white/5"
        )}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <GitFork size={14} />
        )}
        Fork Stack
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

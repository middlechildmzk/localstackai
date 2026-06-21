"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { cn, freshnessColor, freshnessLabel, formatPrice, timeAgo } from "@/lib/utils";
import type { Tool } from "@/types";

interface ToolCardProps {
  tool: Tool;
  rank?: number;
}

export function ToolCard({ tool, rank }: ToolCardProps) {
  return (
    <article className="glass p-4 flex flex-col gap-3 hover:border-white/10 transition-all group">
      <div className="flex items-start gap-3">
        {rank && <span className="text-xs font-mono text-zinc-600 pt-1 w-4 shrink-0">{rank}</span>}
        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-white/5">
          {tool.logo_url ? <Image src={tool.logo_url} alt={tool.name} width={40} height={40} className="object-contain" /> : <span className="text-lg font-bold text-zinc-400">{tool.name[0]}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/tools/${tool.slug}`} className="font-semibold text-white hover:text-brand-400 transition-colors text-sm truncate" style={{ fontFamily: "var(--font-display)" }}>
              {tool.name}
            </Link>
            {tool.is_sponsored && <span className="badge badge-sponsored">Sponsored</span>}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{tool.tagline}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-zinc-500">
          <span className={cn("font-medium", freshnessColor(tool.freshness))} title={tool.last_verified_at ? `Freshness checked ${timeAgo(tool.last_verified_at)}` : "Freshness pending"}>
            {freshnessLabel(tool.freshness)}
          </span>
          <span>{formatPrice(tool.starting_price, tool.pricing_model)}</span>
          <span className="hidden sm:inline text-zinc-700">Beta profile</span>
        </div>
        {tool.website_url && (
          <a href={`/go/${tool.slug}`} target="_blank" rel="noopener noreferrer nofollow sponsored" className="text-zinc-600 hover:text-brand-400 transition-colors" onClick={(e) => e.stopPropagation()} aria-label={`Visit ${tool.name}`}>
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </article>
  );
}

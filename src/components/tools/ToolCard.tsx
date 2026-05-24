"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Bookmark } from "lucide-react";
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
        {/* Rank */}
        {rank && (
          <span className="text-xs font-mono text-zinc-600 pt-1 w-4 shrink-0">
            {rank}
          </span>
        )}

        {/* Logo */}
        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-white/5">
          {tool.logo_url ? (
            <Image
              src={tool.logo_url}
              alt={tool.name}
              width={40}
              height={40}
              className="object-contain"
            />
          ) : (
            <span className="text-lg font-bold text-zinc-400">
              {tool.name[0]}
            </span>
          )}
        </div>

        {/* Name + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/tools/${tool.slug}`}
              className="font-semibold text-white hover:text-brand-400 transition-colors text-sm truncate"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {tool.name}
            </Link>
            {tool.is_sponsored && (
              <span className="badge badge-sponsored">Sponsored</span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
            {tool.tagline}
          </p>
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-zinc-500">
          <span className={cn("font-medium", freshnessColor(tool.freshness))} title={tool.last_verified_at ? `Last verified ${timeAgo(tool.last_verified_at)}` : "Verification pending"}>
            {freshnessLabel(tool.freshness)}
          </span>
          <span>{formatPrice(tool.starting_price, tool.pricing_model)}</span>
          <span className="hidden sm:inline text-zinc-700">Used in {tool.stack_count ?? 0} stacks</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-600">
            <Bookmark size={12} className="inline mr-0.5" />
            {tool.save_count}
          </span>
          {tool.website_url && (
            <a
              href={tool.affiliate_url ?? tool.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-brand-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

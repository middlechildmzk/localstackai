import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

/**
 * Card for a paid sponsored tool. Every render includes an unmissable
 * "Sponsored" badge — no prop, flag, or theme can render this card unlabeled.
 *
 * This card is ONLY rendered inside <SponsoredSlot>, which queries the
 * sponsorships table directly (active + date-valid rows only). It never reads
 * tool_score and never participates in organic sort order.
 */
export function ShowcaseCard({
  tool,
  placementLabel,
}: {
  tool: {
    slug: string;
    name: string;
    tagline: string | null;
    logo_url: string | null;
    website_url: string | null;
  };
  placementLabel?: string;
}) {
  return (
    <article
      className="glass p-4 flex flex-col gap-3 border-violet-400/20"
      aria-label={`Sponsored listing: ${tool.name}`}
    >
      <div className="flex items-start gap-3">
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
            <span className="text-lg font-bold text-zinc-400">{tool.name[0]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/tools/${tool.slug}`}
              className="font-semibold text-white hover:text-brand-400 transition-colors text-sm truncate"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {tool.name}
            </Link>
            {/* Unmissable label: this badge is unconditional by design. */}
            <span className="badge badge-sponsored" aria-label="Paid sponsored placement">
              Sponsored
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{tool.tagline}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-600">
          {placementLabel ?? "Paid placement"} · does not affect rankings
        </span>
        {tool.website_url && (
          <a
            href={`/go/${tool.slug}`}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="text-zinc-500 hover:text-brand-400 transition-colors flex items-center gap-1"
            aria-label={`Visit ${tool.name} (sponsored link)`}
          >
            Visit <ExternalLink size={12} />
          </a>
        )}
      </div>
    </article>
  );
}

/**
 * Digest email composition — Loop 5 (distribution).
 *
 * This module COMPOSES draft content only. It contains no send path:
 * no Resend client, no `emails.send`, no outbound call of any kind.
 * Drafts are written to `digest_drafts` by /api/cron/digest and approved
 * by a human in /admin/digests. Approved != sent — sending is Dan's
 * manual action until auto-send is explicitly green-lit.
 *
 * Every fact in the email comes from DB columns (trending_scores +
 * tools). Nothing is invented. Rankings are blind to money: this module
 * never reads `is_sponsored` or `sponsorships`.
 */

export interface DigestTool {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  pricing_model: string | null;
  freshness: string | null;
  last_verified_at: string | null;
  created_at: string | null;
  saves_7d: number;
  clicks_7d: number;
  stack_adds_7d: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * DAY_MS;

function isWithinDays(iso: string | null, days = 7): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < days * DAY_MS;
}

/** Escape user/DB content before interpolating into HTML. */
function esc(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * "Why fresh" reason chips, built ONLY from DB fields.
 * No raw scores shown — labels and evidence, per the fit-label rule.
 */
export function whyFreshReasons(tool: DigestTool): string[] {
  const reasons: string[] = [];
  if (isWithinDays(tool.created_at)) reasons.push("New to the directory");
  if (isWithinDays(tool.last_verified_at)) reasons.push("Freshly verified");
  if (tool.saves_7d >= 5) reasons.push(`Saved ${tool.saves_7d} times this week`);
  else if (tool.saves_7d > 0) reasons.push("Gaining saves this week");
  if (tool.clicks_7d >= 5) reasons.push(`Popular on the site this week`);
  if (tool.stack_adds_7d > 0) reasons.push("Showing up in member stacks");
  if (tool.pricing_model === "free" || tool.pricing_model === "open_source") {
    reasons.push(tool.pricing_model === "free" ? "Free to use" : "Open source");
  }
  return reasons.slice(0, 3);
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://stackbuilder.ai";

export function toolPageUrl(slug: string): string {
  return `${SITE_URL}/tools/${slug}`;
}

function toolCard(tool: DigestTool): string {
  const reasons = whyFreshReasons(tool);
  const reasonChips = reasons
    .map(
      (r) =>
        `<span style="display:inline-block;background:#f4f4f5;color:#3f3f46;font-size:12px;padding:3px 10px;border-radius:999px;margin:0 6px 6px 0;">${esc(r)}</span>`
    )
    .join("");

  const tagline = tool.tagline ? `<p style="margin:6px 0 10px;color:#52525b;font-size:14px;">${esc(tool.tagline)}</p>` : "";
  const pricing = tool.pricing_model
    ? `<p style="margin:0 0 12px;color:#71717a;font-size:12px;">Pricing: ${esc(tool.pricing_model.replace(/_/g, " "))}</p>`
    : "";

  return `
    <div style="border:1px solid #e4e4e7;border-radius:12px;padding:18px;margin:0 0 16px;background:#ffffff;">
      <h3 style="margin:0 0 4px;font-size:18px;color:#18181b;">${esc(tool.name)}</h3>
      ${tagline}
      <div>${reasonChips}</div>
      ${pricing}
      <a href="${toolPageUrl(tool.slug)}" style="display:inline-block;background:#18181b;color:#ffffff;font-size:14px;text-decoration:none;padding:10px 18px;border-radius:8px;">View on StackBuilder AI</a>
    </div>`;
}

export interface DigestDraftContent {
  subject: string;
  body_html: string;
  tool_ids: string[];
}

/**
 * Compose the "5 fresh tools" email from DB-sourced tools only.
 * Returns null when there is nothing real to say (no tools -> no draft).
 */
export function composeDigest(tools: DigestTool[], dateLabel?: string): DigestDraftContent | null {
  const picks = tools.slice(0, 5);
  if (picks.length === 0) return null;

  const date = dateLabel ?? new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  });

  const subject = `${picks.length} fresh AI tools worth a look — ${date}`;
  const cards = picks.map(toolCard).join("\n");

  const body_html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
    <p style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;margin:0 0 8px;">StackBuilder AI · Daily Digest</p>
    <h1 style="font-size:26px;color:#18181b;margin:0 0 8px;">${esc(date)}</h1>
    <p style="color:#52525b;font-size:15px;margin:0 0 24px;">
      The tools trending this week on StackBuilder AI — ranked by real saves, clicks, and stack adds.
      Rankings are never for sale; money can buy a labeled Sponsored slot, never a rank.
    </p>
    ${cards}
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;">
    <p style="color:#a1a1aa;font-size:12px;">
      Every listing above was verified on the site or checked by our freshness loop.
      <a href="${SITE_URL}/methodology" style="color:#52525b;">How we rank</a> ·
      <a href="${SITE_URL}/unsubscribe" style="color:#52525b;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

  return { subject, body_html, tool_ids: picks.map((t) => t.id) };
}

/**
 * Draft social copy — drafts only, never posted. DB facts only.
 * Returns up to 3 drafts: tool launch, stack spotlight, comparison teaser.
 */
export interface SocialDraft {
  platform: "x" | "linkedin";
  body: string;
  tool_id: string | null;
}

const HASHTAGS = "#AItools #buildinpublic";

export function composeSocialDrafts(opts: {
  topTool: DigestTool | null;
  spotlightStack: { title: string; slug: string; toolNames: string[] } | null;
  comparePair: { aName: string; aSlug: string; bName: string; bSlug: string } | null;
}): SocialDraft[] {
  const drafts: SocialDraft[] = [];
  const { topTool, spotlightStack, comparePair } = opts;

  // 1. Tool launch — the week's top trending tool
  if (topTool) {
    drafts.push({
      platform: "x",
      tool_id: topTool.id,
      body: `${topTool.name} is trending on StackBuilder AI this week.${
        topTool.tagline ? `\n\n${topTool.tagline}` : ""
      }\n\nRanked by real saves + clicks — never paid placement.\n${toolPageUrl(topTool.slug)}\n\n${HASHTAGS}`,
    });
  }

  // 2. Stack spotlight — a real member stack, with its real tools
  if (spotlightStack) {
    drafts.push({
      platform: "linkedin",
      tool_id: null,
      body: `Stack spotlight: "${spotlightStack.title}"\n\nA member-built stack on StackBuilder AI featuring ${
        spotlightStack.toolNames.slice(0, 4).join(" · ") ||
        "a curated toolset"
      }.\n\nBrowse it and fork your own version:\n${SITE_URL}/stacks/${spotlightStack.slug}\n\n${HASHTAGS}`,
    });
  }

  // 3. Comparison teaser — from a real 'alternative' relationship
  if (comparePair) {
    drafts.push({
      platform: "x",
      tool_id: null,
      body: `${comparePair.aName} vs ${comparePair.bName} — which one fits your stack?\n\nSide-by-side on pricing, best-for, and real usage:\n${SITE_URL}/compare/${comparePair.aSlug}-vs-${comparePair.bSlug}\n\n${HASHTAGS}`,
    });
  }

  return drafts.slice(0, 3);
}

/* Sanity guard: this module must never grow a send path. */
if (typeof window !== "undefined") {
  throw new Error("[digest] email composition module loaded in browser context — refusing.");
}

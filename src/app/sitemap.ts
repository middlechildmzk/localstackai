export const dynamic = "force-dynamic";
import { createServerClient, hasSupabaseServiceConfig } from "@/lib/supabase";
import { FALLBACK_TOOLS } from "@/lib/fallback-tools";
import type { MetadataRoute } from "next";

const CANONICAL_APP_URL = "https://www.stackbuilderai.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = CANONICAL_APP_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, priority: 1.0, changeFrequency: "weekly" },
    { url: `${base}/find-stack`, priority: 0.95, changeFrequency: "weekly" },
    { url: `${base}/tools`, priority: 0.9, changeFrequency: "daily" },
    { url: `${base}/tools/ahrefs`, priority: 0.92, changeFrequency: "weekly" },
    { url: `${base}/workflows`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/stacks`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/learn/ai-music`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/learn/ai-video`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/learn/ai-apps`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/learn/digital-products`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/learn/affiliate-marketing`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-podcasters`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-online-course-creators`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-newsletter-writers`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-streamers`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-social-media-managers`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-real-estate-agents`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-recruiters`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-teachers`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-small-business`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-meeting-assistants`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/stacks/ai-music-release-stack`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/stacks/faceless-video-stack`, priority: 0.87, changeFrequency: "weekly" },
    { url: `${base}/stacks/no-code-mvp-stack`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/stacks/digital-product-stack`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/stacks/affiliate-content-stack`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/realistic-ways-to-make-money-with-ai`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-to-create-and-sell-digital-products`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-etsy-digital-products`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/how-to-make-printables-to-sell-with-ai`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-affiliate-marketing`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-app-builders`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/learn/how-to-build-an-app-with-ai`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-website-builders-for-creators`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/how-to-build-a-website-with-ai`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-to-build-an-mvp`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-music-generators`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/learn/can-you-sell-ai-generated-music`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/alternatives/suno`, priority: 0.87, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-music-visualizer-tools`, priority: 0.87, changeFrequency: "weekly" },
    { url: `${base}/learn/how-to-release-ai-music-on-spotify`, priority: 0.87, changeFrequency: "weekly" },
    { url: `${base}/compare/runway-vs-pika-vs-luma`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/compare/descript-vs-opusclip`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/compare/jasper-vs-copy-ai`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/compare/lovable-vs-bolt-vs-v0`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/compare/zapier-vs-make`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/compare/suno-vs-udio`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-stack-for-music-artists`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/learn/how-to-make-money-with-ai-music`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/learn/how-to-make-ai-music-videos`, priority: 0.87, changeFrequency: "weekly" },
    { url: `${base}/compare/chatgpt-vs-claude`, priority: 0.87, changeFrequency: "weekly" },
    { url: `${base}/alternatives/opusclip`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/alternatives/elevenlabs`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-to-write-and-publish-ebook`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-stack-for-faceless-youtube`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/learn/how-to-make-a-faceless-youtube-video-with-ai`, priority: 0.87, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-video-generators-for-creators`, priority: 0.87, changeFrequency: "weekly" },
    { url: `${base}/compare/heygen-vs-synthesia`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-free-ai-tools-for-content-creators`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-stack-for-tiktok-creators`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-youtube-shorts`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-voiceover-tools-for-faceless-videos`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/compare/elevenlabs-vs-murf-vs-playht`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-to-turn-long-videos-into-shorts`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/compare/opusclip-vs-klap-vs-vizard`, priority: 0.84, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-to-repurpose-podcast-into-clips`, priority: 0.84, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-to-add-captions-to-short-videos`, priority: 0.84, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-reddit-story-videos`, priority: 0.82, changeFrequency: "weekly" },
    { url: `${base}/learn/cheapest-ai-stack-for-faceless-youtube`, priority: 0.84, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-creators`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${base}/learn/best-ai-tools-for-tiktok-content`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${base}/trending`, priority: 0.8, changeFrequency: "daily" },
    { url: `${base}/compare`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/compare/lovable-vs-perplexity`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/compare/semrush-vs-gemini`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/compare/otter-vs-gemini`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/affiliate-disclosure`, priority: 0.4, changeFrequency: "monthly" },
    { url: `${base}/privacy`, priority: 0.4, changeFrequency: "monthly" },
    { url: `${base}/terms`, priority: 0.4, changeFrequency: "monthly" },
    { url: `${base}/methodology`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${base}/advertising`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${base}/showcase`, priority: 0.6, changeFrequency: "weekly" },
    { url: `${base}/newsletter`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${base}/compare/runway-vs-pika`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/compare/gumloop-vs-zapier`, priority: 0.88, changeFrequency: "weekly" },
  ];

  // Always include the full fallback catalog in the sitemap.
  // Previously the fallback routes were only added when Supabase was
  // unconfigured, so in production (where Supabase IS configured but not
  // yet seeded with the catalog expansion) the sitemap listed only the
  // static routes — 86 URLs with a single /tools/ entry — even though
  // all 2,902 tool pages render live from the fallback catalog.
  // Fix: merge fallback + Supabase routes, deduped by URL. Supabase
  // tool entries overlay their fallback counterparts so lastModified
  // from the database wins when a tool exists in both places.
  const routesByUrl = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const route of staticRoutes) {
    routesByUrl.set(route.url, route);
  }

  for (const t of FALLBACK_TOOLS) {
    const url = `${base}/tools/${t.slug}`;
    // "ahrefs" is already a static route with higher priority; skip the dupe.
    if (!routesByUrl.has(url)) {
      routesByUrl.set(url, { url, priority: 0.7, changeFrequency: "weekly" });
    }
  }

  if (hasSupabaseServiceConfig()) {
    try {
      const supabase = createServerClient();
      const [{ data: tools }, { data: workflows }, { data: stacks }] = await Promise.all([
        supabase.from("tools").select("slug,updated_at").eq("is_published", true),
        supabase.from("workflows").select("slug,updated_at").eq("is_published", true),
        supabase.from("stacks").select("slug,updated_at").eq("visibility", "public"),
      ]);

      for (const t of tools ?? []) {
        const url = `${base}/tools/${t.slug}`;
        // Overlay the fallback entry (keeps exactly one entry per tool,
        // now with the database lastModified). Tools that exist only in
        // Supabase are added here too.
        routesByUrl.set(url, { url, lastModified: t.updated_at, priority: 0.7, changeFrequency: "weekly" });
      }
      for (const w of workflows ?? []) {
        const url = `${base}/workflows/${w.slug}`;
        if (!routesByUrl.has(url)) {
          routesByUrl.set(url, { url, lastModified: w.updated_at, priority: 0.8, changeFrequency: "weekly" });
        }
      }
      for (const s of stacks ?? []) {
        const url = `${base}/stacks/${s.slug}`;
        if (!routesByUrl.has(url)) {
          routesByUrl.set(url, { url, lastModified: s.updated_at, priority: 0.6, changeFrequency: "weekly" });
        }
      }
    } catch {
      // Supabase unreachable: the fallback catalog above still gives a
      // complete sitemap. Never fall back to static routes only.
    }
  }

  return [...routesByUrl.values()];
}
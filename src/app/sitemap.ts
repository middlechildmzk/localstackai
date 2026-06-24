export const dynamic = "force-dynamic";
import { createServerClient } from "@/lib/supabase";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://stackbuilderai.com";
  const supabase = createServerClient();

  const [{ data: tools }, { data: workflows }, { data: stacks }] = await Promise.all([
    supabase.from("tools").select("slug,updated_at").eq("is_published", true),
    supabase.from("workflows").select("slug,updated_at").eq("is_published", true),
    supabase.from("stacks").select("slug,updated_at").eq("visibility", "public"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, priority: 1.0, changeFrequency: "daily" },
    { url: `${base}/find-stack`, priority: 0.95, changeFrequency: "daily" },
    { url: `${base}/tools`, priority: 0.9, changeFrequency: "daily" },
    { url: `${base}/workflows`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/stacks`, priority: 0.86, changeFrequency: "weekly" },
    { url: `${base}/learn`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/learn/ai-music`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/learn/ai-video`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/learn/ai-apps`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/learn/digital-products`, priority: 0.88, changeFrequency: "weekly" },
    { url: `${base}/learn/affiliate-marketing`, priority: 0.86, changeFrequency: "weekly" },
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
    { url: `${base}/trending`, priority: 0.8, changeFrequency: "hourly" },
    { url: `${base}/compare`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${base}/affiliate-disclosure`, priority: 0.4, changeFrequency: "monthly" },
    { url: `${base}/privacy`, priority: 0.4, changeFrequency: "monthly" },
    { url: `${base}/terms`, priority: 0.4, changeFrequency: "monthly" },
    { url: `${base}/methodology`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${base}/submit`, priority: 0.5 },
    { url: `${base}/newsletter`, priority: 0.5 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = (tools ?? []).map((t: any) => ({ url: `${base}/tools/${t.slug}`, lastModified: t.updated_at, priority: 0.7, changeFrequency: "weekly" }));
  const workflowRoutes: MetadataRoute.Sitemap = (workflows ?? []).map((w: any) => ({ url: `${base}/workflows/${w.slug}`, lastModified: w.updated_at, priority: 0.8, changeFrequency: "weekly" }));
  const stackRoutes: MetadataRoute.Sitemap = (stacks ?? []).map((s: any) => ({ url: `${base}/stacks/${s.slug}`, lastModified: s.updated_at, priority: 0.6, changeFrequency: "weekly" }));

  return [...staticRoutes, ...toolRoutes, ...workflowRoutes, ...stackRoutes];
}

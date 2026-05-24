export const dynamic = "force-dynamic";
import { createServerClient } from "@/lib/supabase";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://stackbuilder.ai";
  const supabase = createServerClient();

  const [{ data: tools }, { data: workflows }, { data: stacks }] =
    await Promise.all([
      supabase.from("tools").select("slug,updated_at").eq("is_published", true),
      supabase.from("workflows").select("slug,updated_at").eq("is_published", true),
      supabase.from("stacks").select("slug,updated_at").eq("visibility", "public"),
    ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, priority: 1.0, changeFrequency: "daily" },
    { url: `${base}/tools`, priority: 0.9, changeFrequency: "daily" },
    { url: `${base}/workflows`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/stacks`, priority: 0.8, changeFrequency: "daily" },
    { url: `${base}/trending`, priority: 0.8, changeFrequency: "hourly" },
    { url: `${base}/compare`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${base}/submit`, priority: 0.5 },
    { url: `${base}/newsletter`, priority: 0.5 },
    // SEO priority pages
    ...comparisons.map((slug) => ({
      url: `${base}/compare/${slug}`,
      priority: 0.8 as const,
      changeFrequency: "weekly" as const,
    })),
    ...altPages.map((slug) => ({
      url: `${base}/alternatives/${slug}`,
      priority: 0.8 as const,
      changeFrequency: "weekly" as const,
    })),
  ];

  const toolRoutes: MetadataRoute.Sitemap = (tools ?? []).map((t: any) => ({
    url: `${base}/tools/${t.slug}`,
    lastModified: t.updated_at,
    priority: 0.7,
    changeFrequency: "weekly",
  }));

  const workflowRoutes: MetadataRoute.Sitemap = (workflows ?? []).map((w: any) => ({
    url: `${base}/workflows/${w.slug}`,
    lastModified: w.updated_at,
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  const stackRoutes: MetadataRoute.Sitemap = (stacks ?? []).map((s: any) => ({
    url: `${base}/stacks/${s.slug}`,
    lastModified: s.updated_at,
    priority: 0.6,
    changeFrequency: "weekly",
  }));

  return [...staticRoutes, ...toolRoutes, ...workflowRoutes, ...stackRoutes];
}

const comparisons = [
  "chatgpt-vs-claude",
  "runway-vs-pika",
  "suno-vs-udio",
  "midjourney-vs-flux",
  "zapier-vs-make",
  "perplexity-vs-chatgpt",
];

const altPages = [
  "chatgpt",
  "claude",
  "runway",
  "suno",
  "midjourney",
  "notion-ai",
  "jasper",
  "zapier",
];

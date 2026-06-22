import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://stackbuilder.ai";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/go"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

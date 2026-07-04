import type { MetadataRoute } from "next";

const CANONICAL_APP_URL = "https://www.stackbuilderai.com";

export default function robots(): MetadataRoute.Robots {
  const base = CANONICAL_APP_URL;
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/go"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

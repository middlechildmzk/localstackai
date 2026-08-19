import type { Metadata } from "next";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "StackBuilder AI";
const APP_URL = "https://www.stackbuilderai.com";

export function buildMetadata({
  title,
  description,
  path = "",
  image,
  type = "website",
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  // The root layout already applies "%s | StackBuilder AI" to child titles.
  // Keep this helper brand-neutral so Next.js does not render the suffix twice.
  const pageTitle = title ?? APP_NAME;
  const desc =
    description ??
    "Build the right AI stack for your workflow in minutes. Discover, compare, and share AI tool stacks.";

  return {
    title: pageTitle,
    description: desc,
    metadataBase: new URL(APP_URL),
    alternates: { canonical: path },
    openGraph: {
      title: pageTitle,
      description: desc,
      url: `${APP_URL}${path}`,
      siteName: APP_NAME,
      type,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: desc,
    },
  };
}

export function articleJsonLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
}: {
  title: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${APP_URL}${path}`,
    mainEntityOfPage: `${APP_URL}${path}`,
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    publisher: {
      "@type": "Organization",
      name: APP_NAME,
      url: APP_URL,
    },
  };
}

export function toolJsonLd(tool: {
  name: string;
  description?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description ?? undefined,
    url: tool.website_url ?? `${APP_URL}/tools/${tool.slug}`,
    image: tool.logo_url ?? undefined,
    applicationCategory: "BusinessApplication",
  };
}

export function stackJsonLd(stack: {
  title: string;
  description?: string | null;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: stack.title,
    description: stack.description ?? undefined,
    url: `${APP_URL}/stacks/${stack.slug}`,
  };
}

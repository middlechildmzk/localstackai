import type { Metadata } from "next";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "StackBuilder AI";
const APP_URL = "https://www.stackbuilderai.com";

export function buildMetadata({
  title,
  description,
  path = "",
  image,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  const fullTitle = title ? `${title} | ${APP_NAME}` : APP_NAME;
  const desc =
    description ??
    "Build the right AI stack for your workflow in minutes. Discover, compare, and share AI tool stacks.";

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(APP_URL),
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description: desc,
      url: `${APP_URL}${path}`,
      siteName: APP_NAME,
      type: "website",
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
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

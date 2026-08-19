import type { Metadata } from "next";

const canonical = "https://www.stackbuilderai.com/submit";
const title = "Submit an AI Tool | StackBuilder AI";
const description = "Submit an AI tool for human review by StackBuilder AI.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  openGraph: {
    title,
    description,
    url: canonical,
    siteName: "StackBuilder AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}

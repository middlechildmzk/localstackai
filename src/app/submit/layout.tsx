import type { Metadata } from "next";

const canonical = "https://www.stackbuilderai.com/submit";

export const metadata: Metadata = {
  title: "Submit an AI Tool | StackBuilder AI",
  description: "Submit an AI tool for human review by StackBuilder AI.",
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
    title: "Submit an AI Tool | StackBuilder AI",
    description: "Submit an AI tool for human review by StackBuilder AI.",
    url: canonical,
    siteName: "StackBuilder AI",
    type: "website",
  },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}

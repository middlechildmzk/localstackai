import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PostHogProvider } from "@/components/layout/PostHogProvider";

const CANONICAL_APP_URL = "https://www.stackbuilderai.com";

export const metadata: Metadata = {
  title: {
    default: "StackBuilder AI: Build AI Stacks for Real Workflows",
    template: "%s | StackBuilder AI",
  },
  description:
    "Compare AI tools and assemble practical workflows for real jobs. StackBuilder AI focuses on tool combinations, workflow fit, tradeoffs, and cost—not just another directory.",
  metadataBase: new URL(CANONICAL_APP_URL),
  openGraph: {
    type: "website",
    siteName: "StackBuilder AI",
    title: "StackBuilder AI: Build AI Stacks for Real Workflows",
    description:
      "Compare AI tools and assemble practical workflows for real jobs, with explicit tradeoffs and cost context.",
    url: CANONICAL_APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "StackBuilder AI: Build AI Stacks for Real Workflows",
    description:
      "Compare AI tools and assemble practical workflows for real jobs, with explicit tradeoffs and cost context.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PostHogProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </PostHogProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PostHogProvider } from "@/components/layout/PostHogProvider";

export const metadata: Metadata = {
  title: {
    default: "StackBuilder AI: Build AI Stacks for Real Workflows",
    template: "%s | StackBuilder AI",
  },
  description:
    "Stop bookmarking AI tools. Build a stack that actually ships. Discover, compare, and share AI tool stacks for any workflow.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.stackbuilderai.com"
  ),
  openGraph: {
    type: "website",
    siteName: "StackBuilder AI",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
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

import { ClusterHub } from "@/components/learn/ClusterHub";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "AI Music Stack Guides", description: "AI music tools, release workflows, visualizers, commercial-use cautions, and creator stacks.", path: "/learn/ai-music" });

export default function Page() {
  return <ClusterHub badge="AI music hub" title="AI music stacks for creators and artists" intro="Start with the song, then build the stack for rights checks, visuals, distribution, and promotion. These guides keep AI music practical and cautious." emailVariant="music" ctaQuery="ai music release stack" startHere={{ href: "/learn/best-ai-stack-for-music-artists", title: "Best AI Stack for Music Artists", description: "The best starting point for creating songs, visuals, art, clips, and release assets with AI." }} links={[
    { href: "/learn/best-ai-music-generators", title: "Best AI Music Generators", description: "Compare generators by workflow fit for songs, demos, background music, and creator use.", tag: "Tools" },
    { href: "/compare/suno-vs-udio", title: "Suno vs Udio", description: "Choose the better AI music tool for demos, vocals, hooks, and release workflows.", tag: "Comparison" },
    { href: "/alternatives/suno", title: "Best Suno Alternatives", description: "Compare Udio, Riffusion, Soundraw, and Mubert by use case.", tag: "Alternatives" },
    { href: "/learn/can-you-sell-ai-generated-music", title: "Can You Sell AI-Generated Music?", description: "A cautious guide to commercial use, copyright, distributors, and platform rules.", tag: "Trust" },
    { href: "/learn/how-to-release-ai-music-on-spotify", title: "How to Release AI Music on Spotify", description: "A release checklist for distributors, metadata, artwork, and promo clips.", tag: "Release" },
    { href: "/learn/best-ai-music-visualizer-tools", title: "Best AI Music Visualizer Tools", description: "Tools for visualizers, lyric videos, AI scenes, and social release assets.", tag: "Visuals" },
    { href: "/learn/how-to-make-ai-music-videos", title: "How to Make AI Music Videos", description: "Turn a song into visualizers, AI scenes, lyric clips, and short-form assets.", tag: "Workflow" },
    { href: "/learn/how-to-make-money-with-ai-music", title: "How to Make Money With AI Music, Honestly", description: "Realistic income paths, no guarantees, and clear rights cautions.", tag: "Money" },
  ]} />;
}

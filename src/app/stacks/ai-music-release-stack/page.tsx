import { StarterStackTemplate } from "@/components/stacks/StarterStackTemplate";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "AI Music Release Stack", description: "A practical AI music stack for songs, rights checks, cover art, visualizers, distribution, and promotion.", path: "/stacks/ai-music-release-stack" });

export default function Page() {
  return <StarterStackTemplate badge="Starter stack" title="AI Music Release Stack" intro="A practical stack for turning an AI-assisted song into release assets, visuals, distribution checks, and promo clips without pretending the legal or platform questions are automatic." emailVariant="music" ctaQuery="ai music release stack" tools={[
    { role: "Song generator", tool: "Suno or Udio", href: "/compare/suno-vs-udio", why: "Generate song drafts, hooks, vocals, and alternate directions before choosing a final version." },
    { role: "Rights check", tool: "Tool terms and distributor rules", href: "/learn/can-you-sell-ai-generated-music", why: "Separate commercial use, copyright, distribution, and platform requirements before releasing." },
    { role: "Cover art", tool: "Canva or Ideogram", href: "/go/canva", why: "Create cover artwork, thumbnails, lyric cards, and social visuals around the track." },
    { role: "Visualizer", tool: "Runway, Pika, Kaiber, or Specterr", href: "/learn/best-ai-music-visualizer-tools", why: "Turn the track into a full visualizer and vertical promotional clips." },
    { role: "Release path", tool: "DistroKid or TuneCore", href: "/learn/how-to-release-ai-music-on-spotify", why: "Upload through a distributor only after verifying current rules and metadata requirements." },
  ]} steps={[
    "Generate and refine the track, then document prompts, lyrics, edits, and project decisions.",
    "Verify tool terms, distributor requirements, and platform policies before release.",
    "Create cover art, visualizer, and short promo clips before the release date.",
    "Upload with accurate metadata and keep all rights and process notes saved.",
    "Promote with clips, visualizers, and behind-the-scenes content instead of relying on streams alone.",
  ]} related={[["/learn/ai-music", "AI music hub"], ["/learn/best-ai-stack-for-music-artists", "Best AI stack for music artists"], ["/learn/how-to-make-ai-music-videos", "How to make AI music videos"], ["/learn/how-to-make-money-with-ai-music", "AI music monetization guide"]]} />;
}

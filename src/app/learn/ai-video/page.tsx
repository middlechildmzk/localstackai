import { ClusterHub } from "@/components/learn/ClusterHub";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "AI Video Stack Guides", description: "AI video generators, faceless YouTube, Shorts, clipping, captions, and creator video workflows.", path: "/learn/ai-video" });

export default function Page() {
  return <ClusterHub badge="AI video hub" title="AI video stacks for creators" intro="Use AI video tools to make better content systems, not random clips. Start with the workflow: long-form, short-form, faceless, clips, captions, or music visuals." emailVariant="video" ctaQuery="ai video creator stack" startHere={{ href: "/learn/best-ai-video-generators-for-creators", title: "Best AI Video Generators for Creators", description: "Start here if you are choosing AI video tools for social clips, visuals, avatars, or experiments." }} links={[
    { href: "/compare/runway-vs-pika-vs-luma", title: "Runway vs Pika vs Luma", description: "Compare AI video generators for creators, visual scenes, and short-form clips.", tag: "Comparison" },
    { href: "/compare/heygen-vs-synthesia", title: "HeyGen vs Synthesia", description: "Compare AI avatar video tools for creator, training, and marketing workflows.", tag: "Avatar" },
    { href: "/learn/best-ai-stack-for-faceless-youtube", title: "Best AI Stack for Faceless YouTube", description: "Research, script, voice, visuals, edit, publish, and repurpose.", tag: "Faceless" },
    { href: "/learn/how-to-make-a-faceless-youtube-video-with-ai", title: "How to Make a Faceless YouTube Video", description: "A practical step-by-step workflow for AI-assisted faceless video production.", tag: "How-to" },
    { href: "/learn/best-ai-tools-for-youtube-shorts", title: "Best AI Tools for YouTube Shorts", description: "Shorts research, scripting, clipping, voiceover, captions, and publishing.", tag: "Shorts" },
    { href: "/learn/best-ai-tools-to-turn-long-videos-into-shorts", title: "Turn Long Videos Into Shorts", description: "A repurposing workflow for podcasts, interviews, webinars, and YouTube videos.", tag: "Repurposing" },
    { href: "/compare/descript-vs-opusclip", title: "Descript vs OpusClip", description: "Pick the right source-editing and clip-discovery workflow.", tag: "Comparison" },
    { href: "/learn/best-ai-tools-to-add-captions-to-short-videos", title: "Best AI Caption Tools", description: "Caption tools for TikTok, Reels, Shorts, and podcast clips.", tag: "Captions" },
  ]} />;
}

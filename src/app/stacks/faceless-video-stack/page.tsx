import { StarterStackTemplate } from "@/components/stacks/StarterStackTemplate";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "Faceless Video Stack", description: "A practical AI stack for faceless YouTube, Shorts, voiceover, visuals, captions, clipping, and publishing.", path: "/stacks/faceless-video-stack" });

export default function Page() {
  return <StarterStackTemplate badge="Starter stack" title="Faceless Video Stack" intro="A practical stack for making faceless videos without relying on generic scripts or low-trust automation. Start with a real topic, then use AI to reduce production friction." emailVariant="video" ctaQuery="faceless youtube ai stack" tools={[
    { role: "Research", tool: "ChatGPT or Claude", href: "/compare/chatgpt-vs-claude", why: "Find angles, outlines, hooks, and structure, then verify claims." },
    { role: "Voiceover", tool: "ElevenLabs or Murf", href: "/compare/elevenlabs-vs-murf-vs-playht", why: "Create narration that fits the channel tone and video format." },
    { role: "Visuals", tool: "Runway, Pika, Canva", href: "/compare/runway-vs-pika-vs-luma", why: "Create b-roll, title cards, thumbnails, and visual sequences." },
    { role: "Editing", tool: "Descript or VEED", href: "/compare/descript-vs-opusclip", why: "Edit scripts, voice, captions, and clips into a clear video." },
    { role: "Repurposing", tool: "OpusClip", href: "/alternatives/opusclip", why: "Turn long-form videos into shorts after the main asset is finished." },
  ]} steps={[
    "Pick one niche and one repeatable video format.",
    "Research and outline with AI, then verify claims and examples.",
    "Record or generate voiceover, then assemble visuals around the story.",
    "Edit for pacing, add captions, and package the video with thumbnail and title.",
    "Repurpose strong moments into Shorts, Reels, and TikTok clips.",
  ]} related={[["/learn/ai-video", "AI video hub"], ["/learn/best-ai-stack-for-faceless-youtube", "Best AI stack for faceless YouTube"], ["/learn/how-to-make-a-faceless-youtube-video-with-ai", "Make a faceless video"], ["/learn/best-ai-tools-for-youtube-shorts", "YouTube Shorts tools"]]} />;
}

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "AI Tools Knowledge Center", description: "Workflow-first AI tool guides, stack breakdowns, comparisons, and practical recommendations.", path: "/learn" });

const articles = [
  { href: "/learn/best-ai-app-builders", title: "Best AI App Builders", description: "Compare AI app builders for prototypes, MVPs, UI, and code workflows.", tag: "App builders" },
  { href: "/learn/how-to-build-an-app-with-ai", title: "How to Build an App With AI", description: "Scope, prototype, database, auth, deployment, QA, and launch workflow.", tag: "App workflow" },
  { href: "/learn/best-ai-tools-to-build-an-mvp", title: "Best AI Tools to Build an MVP", description: "A practical MVP stack for planning, app building, UI, deploy, feedback, and QA.", tag: "MVP stack" },
  { href: "/learn/best-ai-website-builders-for-creators", title: "Best AI Website Builders for Creators", description: "Website builders for landing pages, creator sites, portfolios, and offers.", tag: "Website builders" },
  { href: "/learn/how-to-build-a-website-with-ai", title: "How to Build a Website With AI", description: "Plan, write, design, launch, test, and capture leads with an AI website stack.", tag: "Website workflow" },
  { href: "/learn/best-ai-tools-for-etsy-digital-products", title: "Best AI Tools for Etsy Digital Products", description: "Research, design, mockups, listing copy, packaging, and support tools.", tag: "Etsy" },
  { href: "/learn/how-to-make-printables-to-sell-with-ai", title: "How to Make Printables to Sell With AI", description: "A practical workflow for planners, worksheets, checklists, and templates.", tag: "Printables" },
  { href: "/learn/best-ai-tools-for-affiliate-marketing", title: "Best AI Tools for Affiliate Marketing", description: "Research, comparison pages, SEO, disclosure, email capture, and repurposing.", tag: "Affiliate" },
  { href: "/learn/best-ai-music-generators", title: "Best AI Music Generators", description: "Compare AI music tools by workflow fit for songs, demos, and creator content.", tag: "AI music" },
  { href: "/learn/can-you-sell-ai-generated-music", title: "Can You Sell AI-Generated Music?", description: "A cautious explainer for commercial use, distribution, and platform checks.", tag: "Music rights" },
  { href: "/alternatives/suno", title: "Best Suno Alternatives", description: "Compare Udio, Riffusion, Soundraw, and Mubert by use case.", tag: "Alternatives" },
  { href: "/learn/best-ai-music-visualizer-tools", title: "Best AI Music Visualizer Tools", description: "Tools for visualizers, lyric clips, cover animations, and music video assets.", tag: "Music visuals" },
  { href: "/learn/how-to-release-ai-music-on-spotify", title: "How to Release AI Music on Spotify", description: "A practical release workflow with distributor, metadata, and promo checks.", tag: "Music release" },
  { href: "/compare/runway-vs-pika-vs-luma", title: "Runway vs Pika vs Luma", description: "AI video generators for creators, music visuals, and short-form clips.", tag: "Comparison" },
  { href: "/compare/descript-vs-opusclip", title: "Descript vs OpusClip", description: "Podcast editing, transcripts, clipping, and repurposing workflow.", tag: "Comparison" },
  { href: "/compare/lovable-vs-bolt-vs-v0", title: "Lovable vs Bolt vs v0", description: "AI app builders for prototypes, UI, and MVP workflows.", tag: "App builders" },
  { href: "/compare/zapier-vs-make", title: "Zapier vs Make", description: "Automation tools for creator systems and AI workflows.", tag: "Automation" },
  { href: "/compare/suno-vs-udio", title: "Suno vs Udio", description: "A workflow-first comparison for AI music creators, demos, vocals, commercial-use caution, and release stacks.", tag: "AI Music" },
  { href: "/learn/best-ai-stack-for-music-artists", title: "Best AI Stack for Music Artists", description: "Create songs, visuals, album art, short clips, distribution assets, and promo content with a practical AI music stack.", tag: "Music stack" },
  { href: "/learn/how-to-make-money-with-ai-music", title: "How to Make Money With AI Music, Honestly", description: "Realistic AI music income workflows with effort, cost, rights, and platform cautions clearly explained.", tag: "AI music money" },
  { href: "/learn/how-to-make-ai-music-videos", title: "How to Make AI Music Videos and Visualizers", description: "Turn one song into visualizers, AI video scenes, lyric clips, and short-form promo assets.", tag: "Music visuals" },
  { href: "/compare/chatgpt-vs-claude", title: "ChatGPT vs Claude", description: "Compare AI assistants by workflow: writing, coding, research, documents, creator production, and stack building.", tag: "Comparison" },
  { href: "/alternatives/opusclip", title: "Best OpusClip Alternatives", description: "Compare clipping and repurposing tools by workflow, captions, editing control, and creator fit.", tag: "Alternatives" },
  { href: "/alternatives/elevenlabs", title: "Best ElevenLabs Alternatives", description: "Compare AI voiceover tools for narration, faceless videos, business voiceover, and editing workflows.", tag: "Alternatives" },
  { href: "/learn/best-ai-tools-to-write-and-publish-ebook", title: "Best AI Tools to Write and Publish an Ebook", description: "A practical ebook stack for outlining, drafting, editing, formatting, cover design, publishing, and selling.", tag: "Ebooks" },
  { href: "/learn/best-ai-stack-for-faceless-youtube", title: "Best AI Stack for Faceless YouTube Channels", description: "The flagship workflow: research, script, voice, visuals, edit, package, publish, and repurpose.", tag: "Faceless YouTube" },
  { href: "/learn/how-to-make-a-faceless-youtube-video-with-ai", title: "How to Make a Faceless YouTube Video With AI", description: "A practical step-by-step workflow for making a faceless video with human judgment in the loop.", tag: "How-to" },
  { href: "/learn/best-ai-video-generators-for-creators", title: "Best AI Video Generators for Creators", description: "A creator-first guide to AI video tools for avatars, social clips, faceless videos, and experiments.", tag: "AI video" },
  { href: "/compare/heygen-vs-synthesia", title: "HeyGen vs Synthesia", description: "Compare AI avatar video tools for creator, marketing, training, and faceless workflows.", tag: "Comparison" },
  { href: "/learn/best-free-ai-tools-for-content-creators", title: "Best Free AI Tools for Content Creators", description: "A free and budget creator stack for writing, visuals, video, captions, and publishing.", tag: "Free tools" },
  { href: "/learn/best-ai-stack-for-tiktok-creators", title: "Best AI Stack for TikTok Creators", description: "A practical TikTok stack for ideas, hooks, editing, captions, repurposing, and scheduling.", tag: "TikTok" },
  { href: "/learn/best-ai-tools-for-youtube-shorts", title: "Best AI Tools for YouTube Shorts", description: "A workflow for Shorts research, scripting, clipping, voiceover, captions, and publishing.", tag: "YouTube Shorts" },
  { href: "/learn/best-ai-voiceover-tools-for-faceless-videos", title: "Best AI Voiceover Tools for Faceless Videos", description: "Compare voiceover tools for narration, story videos, explainers, and faceless channels.", tag: "Voice" },
  { href: "/compare/elevenlabs-vs-murf-vs-playht", title: "ElevenLabs vs Murf vs Play.ht", description: "A buyer-intent comparison for choosing the right AI voice tool.", tag: "Comparison" },
  { href: "/learn/best-ai-tools-to-turn-long-videos-into-shorts", title: "Best AI Tools to Turn Long Videos Into Shorts", description: "A repurposing stack for turning podcasts, interviews, webinars, and YouTube videos into clips.", tag: "Repurposing" },
  { href: "/compare/opusclip-vs-klap-vs-vizard", title: "OpusClip vs Klap vs Vizard", description: "A buyer-intent comparison for choosing the right AI clipping tool.", tag: "Comparison" },
  { href: "/learn/best-ai-tools-to-repurpose-podcast-into-clips", title: "Best AI Tools to Repurpose a Podcast Into Clips", description: "A workflow for turning podcast episodes into clips, quote cards, posts, and distribution assets.", tag: "Podcast clips" },
  { href: "/learn/best-ai-tools-to-add-captions-to-short-videos", title: "Best AI Tools to Add Captions to Short Videos", description: "Caption tools for TikTok, Reels, Shorts, podcast clips, and faceless videos.", tag: "Captions" },
  { href: "/learn/best-ai-tools-for-reddit-story-videos", title: "Best AI Tools for Reddit Story Videos", description: "A niche faceless stack for story videos, narration clips, captions, and templates.", tag: "Story videos" },
  { href: "/learn/cheapest-ai-stack-for-faceless-youtube", title: "The Cheapest AI Stack to Start a Faceless YouTube Channel", description: "A free, budget, and creator-tier stack for testing a channel before overbuying tools.", tag: "Budget stack" },
  { href: "/learn/best-ai-tools-for-tiktok-content", title: "Best AI Tools for TikTok Content Creation", description: "Tools and workflows for ideation, short-form video, captions, repurposing, and scheduling.", tag: "Short-form" },
  { href: "/learn/best-ai-tools-for-creators", title: "Best AI Tools for Content Creators", description: "A practical creator stack for writing, visuals, video, editing, publishing, and automation.", tag: "Creators" },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="border-b border-white/5 px-4 py-16"><div className="mx-auto max-w-5xl"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300"><BookOpen size={13} /> Knowledge center beta</div><h1 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>AI stacks for creators who want to ship.</h1><p className="max-w-3xl text-lg leading-8 text-zinc-400">Practical guides for faceless channels, short-form video, AI music, podcast repurposing, digital products, and creator workflows. Each article starts with the workflow, then maps the stack.</p></div></section>
      <section className="mx-auto max-w-7xl px-4 py-12"><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{articles.map((article) => <Link key={article.href} href={article.href} className="rounded-3xl border border-white/10 bg-[#111118] p-6 transition-colors hover:border-brand-500/40"><span className="text-xs font-semibold uppercase tracking-widest text-brand-400">{article.tag}</span><h2 className="mt-4 text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{article.title}</h2><p className="mt-3 text-sm leading-6 text-zinc-400">{article.description}</p><span className="mt-5 inline-flex items-center gap-1 text-sm text-brand-400">Read guide <ArrowRight size={13} /></span></Link>)}</div></section>
    </div>
  );
}

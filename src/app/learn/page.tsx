import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({ title: "AI Tools Knowledge Center", description: "Workflow-first AI tool guides, stack breakdowns, comparisons, and practical recommendations.", path: "/learn" });

const hubs = [
  { href: "/learn/ai-music", title: "AI Music", description: "Generators, rights checks, visualizers, release workflows, and artist stacks." },
  { href: "/learn/ai-video", title: "AI Video", description: "Faceless channels, Shorts, clipping, captions, visualizers, and AI video tools." },
  { href: "/learn/ai-apps", title: "AI Apps and MVPs", description: "App builders, prototypes, no-code MVPs, QA, deployment, and automation." },
  { href: "/learn/digital-products", title: "Digital Products", description: "Ebooks, printables, Etsy products, templates, affiliate content, and product funnels." },
  { href: "/learn/affiliate-marketing", title: "Affiliate Marketing", description: "Comparison pages, disclosure, research, SEO, email capture, and tool review stacks." },
];

const starterStacks = [
  { href: "/stacks/ai-music-release-stack", title: "AI Music Release Stack" },
  { href: "/stacks/faceless-video-stack", title: "Faceless Video Stack" },
  { href: "/stacks/no-code-mvp-stack", title: "No-Code MVP Stack" },
  { href: "/stacks/digital-product-stack", title: "Digital Product Stack" },
  { href: "/stacks/affiliate-content-stack", title: "Affiliate Content Stack" },
];

const articles = [
  { href: "/learn/realistic-ways-to-make-money-with-ai", title: "Realistic Ways to Make Money With AI", description: "Honest AI monetization workflows with no income guarantees.", tag: "Money" },
  { href: "/learn/best-ai-tools-to-create-and-sell-digital-products", title: "Best AI Tools to Create and Sell Digital Products", description: "Create, package, list, sell, and improve digital products with AI.", tag: "Digital products" },
  { href: "/compare/jasper-vs-copy-ai", title: "Jasper vs Copy.ai", description: "AI writing tools for content teams, brand workflows, and repeatable writing tasks.", tag: "Comparison" },
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
  { href: "/compare/suno-vs-udio", title: "Suno vs Udio", description: "A workflow-first comparison for AI music creators and release stacks.", tag: "AI Music" },
  { href: "/learn/best-ai-stack-for-music-artists", title: "Best AI Stack for Music Artists", description: "Create songs, visuals, art, clips, distribution assets, and promo content.", tag: "Music stack" },
  { href: "/learn/how-to-make-money-with-ai-music", title: "How to Make Money With AI Music, Honestly", description: "Realistic AI music income workflows with clear cautions.", tag: "AI music money" },
  { href: "/learn/how-to-make-ai-music-videos", title: "How to Make AI Music Videos and Visualizers", description: "Turn one song into visualizers, AI video scenes, lyric clips, and social assets.", tag: "Music visuals" },
  { href: "/compare/chatgpt-vs-claude", title: "ChatGPT vs Claude", description: "Compare AI assistants by workflow and stack fit.", tag: "Comparison" },
  { href: "/alternatives/opusclip", title: "Best OpusClip Alternatives", description: "Compare clipping and repurposing tools by workflow and creator fit.", tag: "Alternatives" },
  { href: "/alternatives/elevenlabs", title: "Best ElevenLabs Alternatives", description: "Compare AI voiceover tools for faceless videos and creator workflows.", tag: "Alternatives" },
  { href: "/learn/best-ai-tools-to-write-and-publish-ebook", title: "Best AI Tools to Write and Publish an Ebook", description: "Outline, draft, edit, format, publish, and sell ebooks.", tag: "Ebooks" },
  { href: "/learn/best-ai-stack-for-faceless-youtube", title: "Best AI Stack for Faceless YouTube Channels", description: "Research, script, voice, visuals, edit, package, publish, and repurpose.", tag: "Faceless YouTube" },
  { href: "/learn/best-ai-video-generators-for-creators", title: "Best AI Video Generators for Creators", description: "AI video tools for avatars, social clips, faceless videos, and experiments.", tag: "AI video" },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="border-b border-white/5 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300"><BookOpen size={13} /> Knowledge center beta</div>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>AI stacks for creators who want to ship.</h1>
          <p className="max-w-3xl text-lg leading-8 text-zinc-400">Start with a cluster, pick a starter stack, then use the guides to choose tools for the workflow you actually want to build.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-10">
          <p className="text-sm font-medium text-brand-400">Start by cluster</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">{hubs.map((hub) => <Link key={hub.href} href={hub.href} className="rounded-3xl border border-brand-500/20 bg-brand-500/10 p-5 hover:border-brand-400/50"><h2 className="font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{hub.title}</h2><p className="mt-2 text-sm leading-6 text-brand-100/75">{hub.description}</p><span className="mt-4 inline-flex items-center gap-1 text-sm text-brand-300">Open hub <ArrowRight size={13} /></span></Link>)}</div>
        </div>

        <div className="mb-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="text-sm font-medium text-brand-400">Starter stacks</p><h2 className="mt-1 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Turn a guide into a working stack</h2></div>
            <Link href="/stacks" className="text-sm text-brand-400 hover:text-brand-300">Browse all stacks →</Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{starterStacks.map((stack) => <Link key={stack.href} href={stack.href} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-300 hover:border-brand-500/40 hover:text-white">{stack.title}</Link>)}</div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{articles.map((article) => <Link key={article.href} href={article.href} className="rounded-3xl border border-white/10 bg-[#111118] p-6 transition-colors hover:border-brand-500/40"><span className="text-xs font-semibold uppercase tracking-widest text-brand-400">{article.tag}</span><h2 className="mt-4 text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{article.title}</h2><p className="mt-3 text-sm leading-6 text-zinc-400">{article.description}</p><span className="mt-5 inline-flex items-center gap-1 text-sm text-brand-400">Read guide <ArrowRight size={13} /></span></Link>)}</div>
      </section>
    </div>
  );
}

#!/usr/bin/env tsx
/**
 * StackBuilder AI V21 — Seed Script
 * Usage: npm run db:seed
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// ─── Seed Data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "AI Writing", slug: "ai-writing", icon: "✍️", color: "#6366f1", sort_order: 1 },
  { name: "AI Video", slug: "ai-video", icon: "🎬", color: "#ec4899", sort_order: 2 },
  { name: "AI Image", slug: "ai-image", icon: "🎨", color: "#f59e0b", sort_order: 3 },
  { name: "AI Audio", slug: "ai-audio", icon: "🎵", color: "#10b981", sort_order: 4 },
  { name: "AI Coding", slug: "ai-coding", icon: "💻", color: "#3b82f6", sort_order: 5 },
  { name: "AI Automation", slug: "ai-automation", icon: "⚡", color: "#8b5cf6", sort_order: 6 },
  { name: "AI Research", slug: "ai-research", icon: "🔍", color: "#06b6d4", sort_order: 7 },
  { name: "AI Chat", slug: "ai-chat", icon: "💬", color: "#22c55e", sort_order: 8 },
  { name: "AI Productivity", slug: "ai-productivity", icon: "📊", color: "#f97316", sort_order: 9 },
  { name: "AI Music", slug: "ai-music", icon: "🎼", color: "#a855f7", sort_order: 10 },
];

const TAGS = [
  "no-code", "api", "free-tier", "open-source", "mobile", "browser-extension",
  "team", "solo", "content-creation", "marketing", "seo", "video-editing",
  "voice", "transcription", "translation", "summarization",
];

const TOOLS = [
  {
    slug: "chatgpt",
    name: "ChatGPT",
    tagline: "The world's most popular AI chatbot by OpenAI",
    description: "ChatGPT is a conversational AI assistant by OpenAI. It excels at writing, coding, analysis, brainstorming, and general-purpose tasks. With GPT-4o, it handles text, images, and voice.",
    website_url: "https://chat.openai.com",
    pricing_model: "freemium",
    has_free_plan: true,
    starting_price: 20,
    pricing_notes: "Free tier available. Plus $20/mo. Team $30/user/mo.",
    best_for: ["Writing and editing", "Coding assistance", "Research and analysis", "Brainstorming"],
    not_ideal_for: ["Real-time web search (free tier)", "Long document processing"],
    freshness: "verified",
    last_verified_at: new Date().toISOString(),
    tool_score: 0.92,
    editor_fit: 0.95,
    verification_score: 1.0,
    freshness_score: 1.0,
    stack_usage_score: 0.9,
    save_count: 4200,
    stack_count: 1850,
    view_count: 28000,
    categories: ["ai-chat", "ai-writing", "ai-coding"],
  },
  {
    slug: "claude",
    name: "Claude",
    tagline: "Anthropic's AI assistant — excels at long-form reasoning and safety",
    description: "Claude by Anthropic is known for nuanced reasoning, large context windows (200K tokens), and careful, honest responses. Ideal for complex writing, analysis, and coding.",
    website_url: "https://claude.ai",
    pricing_model: "freemium",
    has_free_plan: true,
    starting_price: 20,
    pricing_notes: "Free tier. Pro $20/mo. Teams $30/user/mo.",
    best_for: ["Long-document analysis", "Complex writing", "Coding with context", "Research synthesis"],
    not_ideal_for: ["Real-time web data (without tools)", "Image generation"],
    freshness: "verified",
    last_verified_at: new Date().toISOString(),
    tool_score: 0.90,
    editor_fit: 0.95,
    verification_score: 1.0,
    freshness_score: 1.0,
    stack_usage_score: 0.85,
    save_count: 3800,
    stack_count: 1600,
    view_count: 22000,
    categories: ["ai-chat", "ai-writing", "ai-coding"],
  },
  {
    slug: "runway",
    name: "Runway",
    tagline: "AI video generation and editing platform",
    description: "Runway ML offers Gen-3 video generation, background removal, inpainting, and a full suite of AI video tools. Used by professional creators and studios.",
    website_url: "https://runwayml.com",
    pricing_model: "subscription",
    has_free_plan: true,
    starting_price: 15,
    pricing_notes: "Free tier (125 credits). Standard $15/mo. Pro $35/mo.",
    best_for: ["AI video generation", "Video editing", "VFX and inpainting", "Short-form content"],
    not_ideal_for: ["Audio generation", "Long-form video (>4 min)"],
    freshness: "verified",
    last_verified_at: new Date().toISOString(),
    tool_score: 0.87,
    editor_fit: 0.90,
    verification_score: 0.95,
    freshness_score: 0.9,
    stack_usage_score: 0.82,
    save_count: 3100,
    stack_count: 1200,
    view_count: 18000,
    categories: ["ai-video"],
  },
  {
    slug: "midjourney",
    name: "Midjourney",
    tagline: "The leading AI image generation tool for artists and creators",
    description: "Midjourney produces stunning, highly stylized images via Discord or its web app. Known for its distinct aesthetic, it's the go-to for creatives wanting high-quality AI art.",
    website_url: "https://midjourney.com",
    pricing_model: "subscription",
    has_free_plan: false,
    starting_price: 10,
    pricing_notes: "Basic $10/mo (200 images). Standard $30/mo (unlimited relaxed).",
    best_for: ["High-quality AI art", "Marketing visuals", "Concept art", "Brand imagery"],
    not_ideal_for: ["Photorealistic product shots", "Text in images", "Free usage"],
    freshness: "verified",
    last_verified_at: new Date().toISOString(),
    tool_score: 0.86,
    editor_fit: 0.88,
    verification_score: 0.95,
    freshness_score: 0.85,
    stack_usage_score: 0.80,
    save_count: 2900,
    stack_count: 1100,
    view_count: 16000,
    categories: ["ai-image"],
  },
  {
    slug: "suno",
    name: "Suno",
    tagline: "AI music generation from text prompts",
    description: "Suno generates full songs with vocals, instruments, and lyrics from a simple text prompt. One of the fastest ways to create original music for content creators.",
    website_url: "https://suno.com",
    pricing_model: "freemium",
    has_free_plan: true,
    starting_price: 10,
    pricing_notes: "Free (10 songs/day). Pro $10/mo. Premier $30/mo.",
    best_for: ["Background music for videos", "Jingles and intros", "Podcast music", "Content creators"],
    not_ideal_for: ["Professional studio production", "Stems/stems export"],
    freshness: "verified",
    last_verified_at: new Date().toISOString(),
    tool_score: 0.83,
    editor_fit: 0.85,
    verification_score: 0.90,
    freshness_score: 0.88,
    stack_usage_score: 0.78,
    save_count: 2200,
    stack_count: 890,
    view_count: 12000,
    categories: ["ai-music", "ai-audio"],
  },
  {
    slug: "perplexity",
    name: "Perplexity",
    tagline: "AI-powered search with cited, real-time answers",
    description: "Perplexity is an AI search engine that retrieves real-time information and cites sources. Perfect for research tasks where accuracy and citations matter.",
    website_url: "https://perplexity.ai",
    pricing_model: "freemium",
    has_free_plan: true,
    starting_price: 20,
    pricing_notes: "Free tier available. Pro $20/mo.",
    best_for: ["Research with citations", "Current events", "Fact-checking", "Quick research briefs"],
    not_ideal_for: ["Creative writing", "Code generation"],
    freshness: "verified",
    last_verified_at: new Date().toISOString(),
    tool_score: 0.84,
    editor_fit: 0.88,
    verification_score: 0.95,
    freshness_score: 0.90,
    stack_usage_score: 0.75,
    save_count: 2400,
    stack_count: 980,
    view_count: 14000,
    categories: ["ai-research", "ai-chat"],
  },
  {
    slug: "elevenlabs",
    name: "ElevenLabs",
    tagline: "Hyper-realistic AI voice cloning and text-to-speech",
    description: "ElevenLabs produces studio-quality AI voices and voice clones. Used by podcasters, video creators, and businesses for professional voiceovers.",
    website_url: "https://elevenlabs.io",
    pricing_model: "freemium",
    has_free_plan: true,
    starting_price: 5,
    pricing_notes: "Free (10K chars/mo). Starter $5/mo. Creator $22/mo.",
    best_for: ["Voiceovers for video", "Podcast intros", "Audiobooks", "Voice cloning"],
    not_ideal_for: ["Music vocals", "Real-time voice changing"],
    freshness: "verified",
    last_verified_at: new Date().toISOString(),
    tool_score: 0.85,
    editor_fit: 0.88,
    verification_score: 0.95,
    freshness_score: 0.90,
    stack_usage_score: 0.82,
    save_count: 2600,
    stack_count: 1050,
    view_count: 15000,
    categories: ["ai-audio"],
  },
  {
    slug: "notion-ai",
    name: "Notion AI",
    tagline: "AI writing and summarization built into Notion",
    description: "Notion AI adds writing, editing, and summarization capabilities directly into Notion workspaces. Great for teams already using Notion for docs and project management.",
    website_url: "https://notion.so",
    pricing_model: "subscription",
    has_free_plan: false,
    starting_price: 10,
    pricing_notes: "AI add-on $10/user/mo on top of Notion plan.",
    best_for: ["Teams on Notion", "Meeting notes summarization", "Draft generation in docs"],
    not_ideal_for: ["Standalone AI usage", "Advanced coding"],
    freshness: "fresh",
    last_verified_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    tool_score: 0.76,
    editor_fit: 0.78,
    verification_score: 0.85,
    freshness_score: 0.80,
    stack_usage_score: 0.70,
    save_count: 1800,
    stack_count: 720,
    view_count: 11000,
    categories: ["ai-writing", "ai-productivity"],
  },
  {
    slug: "zapier",
    name: "Zapier",
    tagline: "Automate workflows between 6,000+ apps without code",
    description: "Zapier connects thousands of apps to automate repetitive tasks. Essential for no-code automation stacks. Widely used to connect AI tools to CRMs, email, and databases.",
    website_url: "https://zapier.com",
    pricing_model: "freemium",
    has_free_plan: true,
    starting_price: 19.99,
    pricing_notes: "Free (100 tasks/mo). Starter $19.99/mo. Professional $49/mo.",
    best_for: ["No-code automation", "Connecting AI tools", "Trigger-based workflows"],
    not_ideal_for: ["High-volume tasks (free tier)", "Complex logic (better with Make)"],
    freshness: "verified",
    last_verified_at: new Date().toISOString(),
    tool_score: 0.82,
    editor_fit: 0.85,
    verification_score: 0.95,
    freshness_score: 0.90,
    stack_usage_score: 0.80,
    save_count: 2100,
    stack_count: 950,
    view_count: 13000,
    categories: ["ai-automation"],
  },
  {
    slug: "make",
    name: "Make",
    tagline: "Visual automation platform — more powerful than Zapier for complex flows",
    description: "Make (formerly Integromat) offers visual scenario building for automation. More flexible than Zapier for multi-step, branching workflows with AI tools.",
    website_url: "https://make.com",
    pricing_model: "freemium",
    has_free_plan: true,
    starting_price: 9,
    pricing_notes: "Free (1000 ops/mo). Core $9/mo. Pro $16/mo.",
    best_for: ["Complex automation", "Multi-step workflows", "Data transformation", "AI API integrations"],
    not_ideal_for: ["Simple 2-step automations (Zapier easier)", "Non-technical users"],
    freshness: "verified",
    last_verified_at: new Date().toISOString(),
    tool_score: 0.80,
    editor_fit: 0.82,
    verification_score: 0.90,
    freshness_score: 0.88,
    stack_usage_score: 0.78,
    save_count: 1900,
    stack_count: 870,
    view_count: 11500,
    categories: ["ai-automation"],
  },
  {
    slug: "cursor",
    name: "Cursor",
    tagline: "AI-first code editor built on VS Code",
    description: "Cursor is a VS Code fork with deep AI integration — autocomplete, chat, and multi-file editing powered by Claude and GPT-4. The fastest-growing AI coding tool.",
    website_url: "https://cursor.sh",
    pricing_model: "freemium",
    has_free_plan: true,
    starting_price: 20,
    pricing_notes: "Free (limited). Pro $20/mo (500 fast requests).",
    best_for: ["Coding with AI pair programmer", "Refactoring", "Multi-file edits", "VS Code users"],
    not_ideal_for: ["Non-coders", "Simple scripts (ChatGPT faster)"],
    freshness: "verified",
    last_verified_at: new Date().toISOString(),
    tool_score: 0.88,
    editor_fit: 0.92,
    verification_score: 0.95,
    freshness_score: 0.95,
    stack_usage_score: 0.84,
    save_count: 2800,
    stack_count: 1150,
    view_count: 17000,
    categories: ["ai-coding"],
  },
  {
    slug: "pika",
    name: "Pika",
    tagline: "AI video generation from text and images",
    description: "Pika generates and edits videos using AI. Known for its ease of use and quick generation times. A popular alternative to Runway for creators who want fast results.",
    website_url: "https://pika.art",
    pricing_model: "freemium",
    has_free_plan: true,
    starting_price: 8,
    pricing_notes: "Free tier. Basic $8/mo. Standard $28/mo.",
    best_for: ["Quick AI video clips", "Social media content", "Image-to-video"],
    not_ideal_for: ["Professional VFX", "Long-form video"],
    freshness: "fresh",
    last_verified_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    tool_score: 0.78,
    editor_fit: 0.80,
    verification_score: 0.85,
    freshness_score: 0.82,
    stack_usage_score: 0.72,
    save_count: 1700,
    stack_count: 680,
    view_count: 10000,
    categories: ["ai-video"],
  },
];

const WORKFLOWS = [
  {
    slug: "faceless-youtube-channel",
    title: "Faceless YouTube Channel",
    description: "Build a fully automated faceless YouTube channel using AI tools — from script to upload.",
    outcome: "Publish 3+ videos/week without showing your face",
    target_role: "Content Creator",
    is_featured: true,
    sort_order: 1,
    steps: [
      { step_number: 1, title: "Research & Script", description: "Use AI to find trending topics and write scripts" },
      { step_number: 2, title: "Voiceover", description: "Generate professional voiceovers" },
      { step_number: 3, title: "Video Generation", description: "Create visuals and B-roll with AI" },
      { step_number: 4, title: "Music & SFX", description: "Add background music" },
      { step_number: 5, title: "Upload & Optimize", description: "Write SEO-optimized titles and descriptions" },
    ],
    tools: [
      { tool_slug: "chatgpt", tier: "recommended", step: 1, notes: "Research topics and write scripts" },
      { tool_slug: "claude", tier: "budget", step: 1, notes: "Alternative for script writing" },
      { tool_slug: "elevenlabs", tier: "recommended", step: 2, notes: "Studio-quality voiceovers" },
      { tool_slug: "runway", tier: "pro", step: 3, notes: "Premium AI video generation" },
      { tool_slug: "pika", tier: "budget", step: 3, notes: "Budget video generation" },
      { tool_slug: "suno", tier: "recommended", step: 4, notes: "Background music generation" },
      { tool_slug: "chatgpt", tier: "recommended", step: 5, notes: "SEO titles and descriptions" },
    ],
  },
  {
    slug: "solopreneur-content-machine",
    title: "Solopreneur Content Machine",
    description: "A complete AI stack for solopreneurs to create consistent content across all channels.",
    outcome: "Post daily content across LinkedIn, X, and newsletter",
    target_role: "Solopreneur",
    is_featured: true,
    sort_order: 2,
    steps: [
      { step_number: 1, title: "Idea Generation", description: "Generate content ideas from your expertise" },
      { step_number: 2, title: "Content Creation", description: "Write posts, threads, and newsletters" },
      { step_number: 3, title: "Visuals", description: "Create images and graphics" },
      { step_number: 4, title: "Scheduling & Distribution", description: "Automate posting and tracking" },
    ],
    tools: [
      { tool_slug: "perplexity", tier: "recommended", step: 1, notes: "Research trending topics" },
      { tool_slug: "claude", tier: "recommended", step: 2, notes: "Long-form writing and threads" },
      { tool_slug: "chatgpt", tier: "budget", step: 2, notes: "Quick post drafts" },
      { tool_slug: "midjourney", tier: "pro", step: 3, notes: "Premium visuals" },
      { tool_slug: "zapier", tier: "recommended", step: 4, notes: "Automate distribution" },
    ],
  },
  {
    slug: "podcast-production-stack",
    title: "AI Podcast Production Stack",
    description: "Record, transcribe, edit, and distribute your podcast with AI tools.",
    outcome: "Cut podcast production time by 80%",
    target_role: "Podcaster",
    is_featured: false,
    sort_order: 3,
    steps: [
      { step_number: 1, title: "Transcription", description: "Auto-transcribe episodes" },
      { step_number: 2, title: "Show Notes", description: "Generate chapters and show notes" },
      { step_number: 3, title: "Clips", description: "Create short clips for social" },
      { step_number: 4, title: "Distribution", description: "Automate publishing" },
    ],
    tools: [
      { tool_slug: "claude", tier: "recommended", step: 2, notes: "Generate show notes and chapters from transcript" },
      { tool_slug: "chatgpt", tier: "budget", step: 2, notes: "Alternative for show notes" },
      { tool_slug: "zapier", tier: "recommended", step: 4, notes: "Automate publishing to RSS + socials" },
    ],
  },
];

const TOOL_RELATIONSHIPS = [
  { source: "chatgpt", target: "claude", type: "alternative" },
  { source: "claude", target: "chatgpt", type: "alternative" },
  { source: "runway", target: "pika", type: "alternative" },
  { source: "pika", target: "runway", type: "alternative" },
  { source: "suno", target: "elevenlabs", type: "complement", context: "Music + voiceover for video" },
  { source: "zapier", target: "make", type: "alternative" },
  { source: "make", target: "zapier", type: "alternative" },
  { source: "chatgpt", target: "perplexity", type: "complement", context: "Writing + research" },
  { source: "cursor", target: "chatgpt", type: "complement", context: "IDE + chat assistant" },
  { source: "elevenlabs", target: "runway", type: "complement", context: "Voice + video for content" },
  { source: "midjourney", target: "runway", type: "complement", context: "Image → video workflow" },
  { source: "zapier", target: "chatgpt", type: "integrates_with", context: "Trigger ChatGPT via Zap" },
  { source: "make", target: "claude", type: "integrates_with", context: "Claude API in Make scenarios" },
];

const FEATURED_STACKS = [
  {
    title: "Faceless YouTube Production Stack",
    slug: "faceless-youtube-production-stack",
    description: "The complete AI stack for creating faceless YouTube videos at scale.",
    visibility: "public",
    is_featured: true,
    monthly_cost: 75,
    tools: [
      { slug: "chatgpt", role: "Script writing", order: 1, cost: 20, flow: "manual_export" },
      { slug: "elevenlabs", role: "Voiceover", order: 2, cost: 22, flow: "manual_export" },
      { slug: "runway", role: "Video generation", order: 3, cost: 15, flow: "manual_export" },
      { slug: "suno", role: "Background music", order: 4, cost: 10, flow: "manual_export" },
      { slug: "zapier", role: "Upload automation", order: 5, cost: 20, flow: "native_api" },
    ],
  },
  {
    title: "Solo Founder Marketing Stack",
    slug: "solo-founder-marketing-stack",
    description: "AI tools for solopreneurs who need to market without a team.",
    visibility: "public",
    is_featured: true,
    monthly_cost: 60,
    tools: [
      { slug: "claude", role: "Writing and strategy", order: 1, cost: 20, flow: "manual_export" },
      { slug: "perplexity", role: "Research", order: 2, cost: 20, flow: "manual_export" },
      { slug: "midjourney", role: "Brand visuals", order: 3, cost: 10, flow: "manual_export" },
      { slug: "zapier", role: "Distribution automation", order: 4, cost: 20, flow: "native_api" },
    ],
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding StackBuilder AI V21...\n");

  // 1. Categories
  console.log("📂 Seeding categories...");
  const { error: catErr } = await supabase
    .from("categories")
    .upsert(CATEGORIES, { onConflict: "slug" });
  if (catErr) throw new Error(`Categories: ${catErr.message}`);
  console.log(`   ✓ ${CATEGORIES.length} categories`);

  // 2. Tags
  console.log("🏷️  Seeding tags...");
  const { error: tagErr } = await supabase
    .from("tags")
    .upsert(TAGS.map((name) => ({ name, slug: name })), { onConflict: "slug" });
  if (tagErr) throw new Error(`Tags: ${tagErr.message}`);
  console.log(`   ✓ ${TAGS.length} tags`);

  // 3. Tools
  console.log("🔧 Seeding tools...");
  const { data: cats } = await supabase.from("categories").select("id,slug");
  const catMap = new Map(cats?.map((c: any) => [c.slug, c.id]));

  let toolMap = new Map<string, string>();

  for (const tool of TOOLS) {
    const { categories: catSlugs, ...toolData } = tool;
    const { data: existing } = await supabase
      .from("tools")
      .select("id")
      .eq("slug", tool.slug)
      .single();

    let toolId: string;
    if (existing) {
      await supabase.from("tools").update(toolData).eq("id", existing.id);
      toolId = existing.id;
    } else {
      const { data: newTool, error } = await supabase
        .from("tools")
        .insert(toolData)
        .select("id")
        .single();
      if (error || !newTool) throw new Error(`Tool ${tool.slug}: ${error?.message}`);
      toolId = newTool.id;
    }

    toolMap.set(tool.slug, toolId);

    // Category links
    await supabase.from("tool_categories").delete().eq("tool_id", toolId);
    const catLinks = catSlugs
      .map((slug) => catMap.get(slug))
      .filter(Boolean)
      .map((catId) => ({ tool_id: toolId, category_id: catId }));
    if (catLinks.length > 0) {
      await supabase.from("tool_categories").upsert(catLinks, {
        onConflict: "tool_id,category_id",
      });
    }

    // Seed trending score
    await supabase.from("trending_scores").upsert(
      { tool_id: toolId, trending_score: tool.tool_score * 10, computed_at: new Date().toISOString() },
      { onConflict: "tool_id" }
    );
  }
  console.log(`   ✓ ${TOOLS.length} tools`);

  // 4. Tool relationships
  console.log("🔗 Seeding tool relationships...");
  for (const rel of TOOL_RELATIONSHIPS) {
    const src = toolMap.get(rel.source);
    const tgt = toolMap.get(rel.target);
    if (!src || !tgt) continue;
    await supabase.from("tool_relationships").upsert(
      {
        source_tool_id: src,
        target_tool_id: tgt,
        relationship_type: rel.type,
        workflow_context: (rel as any).context ?? null,
        confidence: 0.9,
        source: "seed",
      },
      { onConflict: "source_tool_id,target_tool_id,relationship_type" }
    );
  }
  console.log(`   ✓ ${TOOL_RELATIONSHIPS.length} relationships`);

  // 5. Workflows + steps + tools
  console.log("📋 Seeding workflows...");
  for (const wf of WORKFLOWS) {
    const { steps, tools: wfTools, ...wfData } = wf;

    const { data: existing } = await supabase
      .from("workflows")
      .select("id")
      .eq("slug", wf.slug)
      .single();

    let wfId: string;
    if (existing) {
      await supabase.from("workflows").update(wfData).eq("id", existing.id);
      wfId = existing.id;
    } else {
      const { data: nw, error } = await supabase
        .from("workflows")
        .insert(wfData)
        .select("id")
        .single();
      if (error || !nw) throw new Error(`Workflow ${wf.slug}: ${error?.message}`);
      wfId = nw.id;
    }

    // Steps
    await supabase.from("workflow_steps").delete().eq("workflow_id", wfId);
    const stepRecords = steps.map((s) => ({ ...s, workflow_id: wfId }));
    const { data: createdSteps } = await supabase
      .from("workflow_steps")
      .insert(stepRecords)
      .select();
    const stepNumMap = new Map(createdSteps?.map((s: any) => [s.step_number, s.id]));

    // Workflow tools
    await supabase.from("workflow_tools").delete().eq("workflow_id", wfId);
    const wtRecords = wfTools
      .map((wt) => {
        const toolId = toolMap.get(wt.tool_slug);
        if (!toolId) return null;
        return {
          workflow_id: wfId,
          tool_id: toolId,
          step_id: wt.step ? stepNumMap.get(wt.step) ?? null : null,
          tier: wt.tier,
          notes: wt.notes,
        };
      })
      .filter(Boolean);
    if (wtRecords.length > 0) {
      await supabase.from("workflow_tools").insert(wtRecords);
    }
  }
  console.log(`   ✓ ${WORKFLOWS.length} workflows`);

  // 6. Featured stacks
  console.log("📚 Seeding featured stacks...");
  for (const stack of FEATURED_STACKS) {
    const { tools: stackTools, ...stackData } = stack;

    const { data: existing } = await supabase
      .from("stacks")
      .select("id")
      .eq("slug", stack.slug)
      .single();

    let stackId: string;
    if (existing) {
      await supabase.from("stacks").update(stackData).eq("id", existing.id);
      stackId = existing.id;
    } else {
      const { data: ns, error } = await supabase
        .from("stacks")
        .insert(stackData)
        .select("id")
        .single();
      if (error || !ns) throw new Error(`Stack ${stack.slug}: ${error?.message}`);
      stackId = ns.id;
    }

    await supabase.from("stack_tools").delete().eq("stack_id", stackId);
    const stRecords = stackTools
      .map((st) => {
        const toolId = toolMap.get(st.slug);
        if (!toolId) return null;
        return {
          stack_id: stackId,
          tool_id: toolId,
          role_in_stack: st.role,
          step_order: st.order,
          monthly_cost: st.cost,
          data_flow_type: st.flow,
        };
      })
      .filter(Boolean);
    if (stRecords.length > 0) {
      await supabase.from("stack_tools").insert(stRecords);
    }
  }
  console.log(`   ✓ ${FEATURED_STACKS.length} stacks`);

  console.log("\n✅ Seed complete!");
  console.log(`   ${TOOLS.length} tools, ${WORKFLOWS.length} workflows, ${FEATURED_STACKS.length} stacks, ${TOOL_RELATIONSHIPS.length} relationships`);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});

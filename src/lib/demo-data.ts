import type { Category, Claim, Stack, Submission, Tool, ToolRelationship, Workflow } from "@/types";

const now = new Date().toISOString();

export const demoCategories: Category[] = [
  { id: "cat-chat", name: "AI Chat", slug: "ai-chat", description: "Chatbots and general AI assistants", icon: "💬", color: "#22c55e", sort_order: 1, created_at: now },
  { id: "cat-video", name: "AI Video", slug: "ai-video", description: "Video generation and editing", icon: "🎬", color: "#ec4899", sort_order: 2, created_at: now },
  { id: "cat-image", name: "AI Image", slug: "ai-image", description: "Image generation and design", icon: "🎨", color: "#f59e0b", sort_order: 3, created_at: now },
  { id: "cat-audio", name: "AI Audio", slug: "ai-audio", description: "Voice, music, and audio tools", icon: "🎧", color: "#10b981", sort_order: 4, created_at: now },
  { id: "cat-automation", name: "AI Automation", slug: "ai-automation", description: "Workflow automation and agents", icon: "⚡", color: "#8b5cf6", sort_order: 5, created_at: now },
  { id: "cat-research", name: "AI Research", slug: "ai-research", description: "Research, search, and knowledge tools", icon: "🔎", color: "#06b6d4", sort_order: 6, created_at: now },
];

export const demoTools: Tool[] = [
  {
    id: "tool-chatgpt", slug: "chatgpt", name: "ChatGPT", tagline: "General-purpose AI assistant for writing, coding, analysis, and ideation", description: "ChatGPT is a flexible AI assistant used across writing, coding, analysis, brainstorming, customer support drafts, and general productivity workflows.", logo_url: null, website_url: "https://chat.openai.com", affiliate_url: null, pricing_model: "freemium", has_free_plan: true, starting_price: 20, pricing_notes: "Free plan available. Paid plans vary by user/team tier.", best_for: ["General assistant workflows", "Writing and editing", "Coding support", "Research synthesis"], not_ideal_for: ["Fully automated production workflows without review"], freshness: "verified", last_verified_at: now, is_sponsored: false, is_claimed: true, claimed_by: null, is_featured: true, is_published: true, tool_score: 92, view_count: 12000, save_count: 4200, stack_count: 1800, click_count: 5100, created_at: now, updated_at: now,
  },
  {
    id: "tool-claude", slug: "claude", name: "Claude", tagline: "Long-context AI assistant for writing, analysis, and careful reasoning", description: "Claude is an AI assistant used for long-form reasoning, document analysis, writing, summarization, coding, and structured planning.", logo_url: null, website_url: "https://claude.ai", affiliate_url: null, pricing_model: "freemium", has_free_plan: true, starting_price: 20, pricing_notes: "Free and paid plans available.", best_for: ["Long document analysis", "Careful writing", "Strategy docs", "Code review"], not_ideal_for: ["Native image generation"], freshness: "verified", last_verified_at: now, is_sponsored: false, is_claimed: true, claimed_by: null, is_featured: true, is_published: true, tool_score: 90, view_count: 9800, save_count: 3600, stack_count: 1500, click_count: 4200, created_at: now, updated_at: now,
  },
  {
    id: "tool-runway", slug: "runway", name: "Runway", tagline: "AI video generation and editing for creators and teams", description: "Runway is an AI video platform for text-to-video, image-to-video, editing, inpainting, and creator video workflows.", logo_url: null, website_url: "https://runwayml.com", affiliate_url: null, pricing_model: "subscription", has_free_plan: true, starting_price: 15, pricing_notes: "Free tier and paid creator plans available.", best_for: ["AI video generation", "Short-form creative assets", "Visual experiments", "Creator workflows"], not_ideal_for: ["Low-cost unlimited generation"], freshness: "verified", last_verified_at: now, is_sponsored: false, is_claimed: false, claimed_by: null, is_featured: true, is_published: true, tool_score: 87, view_count: 8300, save_count: 2900, stack_count: 1100, click_count: 3000, created_at: now, updated_at: now,
  },
  {
    id: "tool-midjourney", slug: "midjourney", name: "Midjourney", tagline: "High-quality AI image generation for creators and brands", description: "Midjourney is known for high-quality stylized AI images used in concepting, marketing, album art, thumbnails, and brand visuals.", logo_url: null, website_url: "https://www.midjourney.com", affiliate_url: null, pricing_model: "subscription", has_free_plan: false, starting_price: 10, pricing_notes: "Paid plans available.", best_for: ["Concept art", "Marketing images", "Thumbnails", "Brand visuals"], not_ideal_for: ["Precise text rendering"], freshness: "fresh", last_verified_at: now, is_sponsored: false, is_claimed: false, claimed_by: null, is_featured: true, is_published: true, tool_score: 86, view_count: 7600, save_count: 2500, stack_count: 950, click_count: 2600, created_at: now, updated_at: now,
  },
  {
    id: "tool-elevenlabs", slug: "elevenlabs", name: "ElevenLabs", tagline: "AI voice generation and text-to-speech for video, podcasts, and narration", description: "ElevenLabs is an AI voice platform for text-to-speech, voice cloning, dubbing, narration, and creator audio workflows.", logo_url: null, website_url: "https://elevenlabs.io", affiliate_url: null, pricing_model: "freemium", has_free_plan: true, starting_price: 5, pricing_notes: "Free tier and paid plans available.", best_for: ["Voiceovers", "Podcast narration", "Dubbing", "Creator videos"], not_ideal_for: ["Music generation"], freshness: "verified", last_verified_at: now, is_sponsored: false, is_claimed: false, claimed_by: null, is_featured: true, is_published: true, tool_score: 85, view_count: 7000, save_count: 2200, stack_count: 900, click_count: 2500, created_at: now, updated_at: now,
  },
  {
    id: "tool-perplexity", slug: "perplexity", name: "Perplexity", tagline: "AI search and research assistant with citations", description: "Perplexity is an AI search engine for cited answers, quick research, market scans, and source-backed exploration.", logo_url: null, website_url: "https://www.perplexity.ai", affiliate_url: null, pricing_model: "freemium", has_free_plan: true, starting_price: 20, pricing_notes: "Free and paid plans available.", best_for: ["Cited research", "Current information", "Competitive scans", "Briefing docs"], not_ideal_for: ["Long creative writing projects"], freshness: "verified", last_verified_at: now, is_sponsored: false, is_claimed: false, claimed_by: null, is_featured: true, is_published: true, tool_score: 84, view_count: 6700, save_count: 2100, stack_count: 780, click_count: 2200, created_at: now, updated_at: now,
  },

  {
    id: "tool-pika", slug: "pika", name: "Pika", tagline: "AI video generation for quick creative clips", description: "Pika helps creators generate and edit short AI video clips for social, ads, and creative experiments.", logo_url: null, website_url: "https://pika.art", affiliate_url: null, pricing_model: "freemium", has_free_plan: true, starting_price: 10, pricing_notes: "Free and paid creator plans available.", best_for: ["Quick AI video clips", "Creator experiments", "Short-form visuals"], not_ideal_for: ["Long-form video editing"], freshness: "fresh", last_verified_at: now, is_sponsored: false, is_claimed: false, claimed_by: null, is_featured: true, is_published: true, tool_score: 82, view_count: 5100, save_count: 1400, stack_count: 510, click_count: 1300, created_at: now, updated_at: now,
  },
  {
    id: "tool-suno", slug: "suno", name: "Suno", tagline: "AI music generation for songs, demos, and creator audio", description: "Suno generates music from text prompts and is commonly used for demos, creator audio, and experimental music workflows.", logo_url: null, website_url: "https://suno.com", affiliate_url: null, pricing_model: "freemium", has_free_plan: true, starting_price: 10, pricing_notes: "Free tier and paid plans available.", best_for: ["AI music demos", "Creator audio", "Song ideation"], not_ideal_for: ["Final human-mixed masters without review"], freshness: "fresh", last_verified_at: now, is_sponsored: false, is_claimed: false, claimed_by: null, is_featured: true, is_published: true, tool_score: 81, view_count: 5000, save_count: 1500, stack_count: 520, click_count: 1200, created_at: now, updated_at: now,
  },
  {
    id: "tool-udio", slug: "udio", name: "Udio", tagline: "AI music generation for songs and audio experiments", description: "Udio is an AI music generation platform for song ideas, creative audio experiments, and quick musical drafts.", logo_url: null, website_url: "https://udio.com", affiliate_url: null, pricing_model: "freemium", has_free_plan: true, starting_price: 10, pricing_notes: "Free and paid plans available.", best_for: ["Song ideation", "AI music sketches", "Audio experiments"], not_ideal_for: ["Guaranteed rights workflows without review"], freshness: "fresh", last_verified_at: now, is_sponsored: false, is_claimed: false, claimed_by: null, is_featured: true, is_published: true, tool_score: 79, view_count: 4200, save_count: 1200, stack_count: 410, click_count: 1100, created_at: now, updated_at: now,
  },
  {
    id: "tool-flux", slug: "flux", name: "Flux", tagline: "High-quality image generation model ecosystem", description: "Flux is used for high-quality AI image generation, prompt experiments, and design asset creation.", logo_url: null, website_url: "https://blackforestlabs.ai", affiliate_url: null, pricing_model: "freemium", has_free_plan: true, starting_price: 0, pricing_notes: "Availability and pricing vary by host/provider.", best_for: ["Image generation", "Design concepts", "Open model workflows"], not_ideal_for: ["Single official SaaS workflow only"], freshness: "fresh", last_verified_at: now, is_sponsored: false, is_claimed: false, claimed_by: null, is_featured: true, is_published: true, tool_score: 80, view_count: 4300, save_count: 1300, stack_count: 420, click_count: 1000, created_at: now, updated_at: now,
  },
  {
    id: "tool-zapier", slug: "zapier", name: "Zapier", tagline: "No-code automation platform for connecting apps and AI workflows", description: "Zapier connects apps and automates workflows, making it useful as the glue between AI tools, forms, CRMs, docs, and communication tools.", logo_url: null, website_url: "https://zapier.com", affiliate_url: null, pricing_model: "freemium", has_free_plan: true, starting_price: 20, pricing_notes: "Free tier and paid automation plans available.", best_for: ["Workflow automation", "App connections", "AI ops glue"], not_ideal_for: ["Highly custom backend engineering"], freshness: "verified", last_verified_at: now, is_sponsored: false, is_claimed: false, claimed_by: null, is_featured: true, is_published: true, tool_score: 83, view_count: 6100, save_count: 1800, stack_count: 690, click_count: 1700, created_at: now, updated_at: now,
  },
  {
    id: "tool-make", slug: "make", name: "Make", tagline: "Visual automation platform for complex multi-step workflows", description: "Make helps users visually connect apps and build automated scenarios across AI tools, data sources, and operations workflows.", logo_url: null, website_url: "https://make.com", affiliate_url: null, pricing_model: "freemium", has_free_plan: true, starting_price: 10, pricing_notes: "Free tier and paid plans available.", best_for: ["Visual automations", "Complex scenarios", "Operations workflows"], not_ideal_for: ["Users who want only simple one-step automations"], freshness: "verified", last_verified_at: now, is_sponsored: false, is_claimed: false, claimed_by: null, is_featured: true, is_published: true, tool_score: 82, view_count: 5900, save_count: 1700, stack_count: 650, click_count: 1600, created_at: now, updated_at: now,
  },
  {
    id: "tool-notion-ai", slug: "notion-ai", name: "Notion AI", tagline: "AI writing and knowledge assistance inside Notion workspaces", description: "Notion AI helps teams and solo operators draft, summarize, organize, and search knowledge inside Notion.", logo_url: null, website_url: "https://www.notion.so/product/ai", affiliate_url: null, pricing_model: "subscription", has_free_plan: false, starting_price: 10, pricing_notes: "Available as an add-on or included in some tiers.", best_for: ["Knowledge bases", "Docs", "Team notes"], not_ideal_for: ["Standalone chat workflows outside Notion"], freshness: "fresh", last_verified_at: now, is_sponsored: false, is_claimed: false, claimed_by: null, is_featured: true, is_published: true, tool_score: 78, view_count: 3900, save_count: 1000, stack_count: 360, click_count: 900, created_at: now, updated_at: now,
  },
  {
    id: "tool-jasper", slug: "jasper", name: "Jasper", tagline: "AI marketing content platform for brands and teams", description: "Jasper helps marketing teams generate campaign copy, brand-aligned content, and reusable marketing assets.", logo_url: null, website_url: "https://www.jasper.ai", affiliate_url: null, pricing_model: "subscription", has_free_plan: false, starting_price: 39, pricing_notes: "Paid plans focused on marketers and teams.", best_for: ["Marketing copy", "Brand voice workflows", "Campaign content"], not_ideal_for: ["Budget-only solo creator stacks"], freshness: "fresh", last_verified_at: now, is_sponsored: false, is_claimed: false, claimed_by: null, is_featured: true, is_published: true, tool_score: 77, view_count: 3500, save_count: 900, stack_count: 310, click_count: 820, created_at: now, updated_at: now,
  },
];

export const demoRelationships: ToolRelationship[] = [
  { id: "rel-chatgpt-claude", source_tool_id: "tool-chatgpt", target_tool_id: "tool-claude", relationship_type: "alternative", workflow_context: "General AI assistant and writing workflows", confidence: 0.94, source: "demo", created_at: now },
  { id: "rel-claude-chatgpt", source_tool_id: "tool-claude", target_tool_id: "tool-chatgpt", relationship_type: "alternative", workflow_context: "General AI assistant and writing workflows", confidence: 0.94, source: "demo", created_at: now },
  { id: "rel-runway-midjourney", source_tool_id: "tool-runway", target_tool_id: "tool-midjourney", relationship_type: "complement", workflow_context: "AI video asset creation", confidence: 0.82, source: "demo", created_at: now },
  { id: "rel-runway-elevenlabs", source_tool_id: "tool-runway", target_tool_id: "tool-elevenlabs", relationship_type: "used_with", workflow_context: "Faceless video production", confidence: 0.86, source: "demo", created_at: now },

  { id: "rel-runway-pika", source_tool_id: "tool-runway", target_tool_id: "tool-pika", relationship_type: "alternative", workflow_context: "AI video generation", confidence: 0.83, source: "demo", created_at: now },
  { id: "rel-pika-runway", source_tool_id: "tool-pika", target_tool_id: "tool-runway", relationship_type: "alternative", workflow_context: "AI video generation", confidence: 0.83, source: "demo", created_at: now },
  { id: "rel-suno-udio", source_tool_id: "tool-suno", target_tool_id: "tool-udio", relationship_type: "alternative", workflow_context: "AI music generation", confidence: 0.86, source: "demo", created_at: now },
  { id: "rel-udio-suno", source_tool_id: "tool-udio", target_tool_id: "tool-suno", relationship_type: "alternative", workflow_context: "AI music generation", confidence: 0.86, source: "demo", created_at: now },
  { id: "rel-midjourney-flux", source_tool_id: "tool-midjourney", target_tool_id: "tool-flux", relationship_type: "alternative", workflow_context: "AI image generation", confidence: 0.81, source: "demo", created_at: now },
  { id: "rel-flux-midjourney", source_tool_id: "tool-flux", target_tool_id: "tool-midjourney", relationship_type: "alternative", workflow_context: "AI image generation", confidence: 0.81, source: "demo", created_at: now },
  { id: "rel-zapier-make", source_tool_id: "tool-zapier", target_tool_id: "tool-make", relationship_type: "alternative", workflow_context: "Workflow automation", confidence: 0.87, source: "demo", created_at: now },
  { id: "rel-make-zapier", source_tool_id: "tool-make", target_tool_id: "tool-zapier", relationship_type: "alternative", workflow_context: "Workflow automation", confidence: 0.87, source: "demo", created_at: now },
  { id: "rel-chatgpt-jasper", source_tool_id: "tool-chatgpt", target_tool_id: "tool-jasper", relationship_type: "alternative", workflow_context: "Marketing writing", confidence: 0.72, source: "demo", created_at: now },
  { id: "rel-chatgpt-notion", source_tool_id: "tool-chatgpt", target_tool_id: "tool-notion-ai", relationship_type: "complement", workflow_context: "Knowledge and writing", confidence: 0.76, source: "demo", created_at: now },
];

export const demoWorkflows: Workflow[] = [
  { id: "wf-youtube-shorts", slug: "youtube-shorts-ai-stack", title: "YouTube Shorts AI Stack", description: "Plan, script, generate, voice, and package short-form videos with a lean creator stack.", outcome: "Publish short-form videos faster with fewer disconnected tools.", target_role: "Creator", hero_image: null, is_featured: true, is_published: true, sort_order: 1, view_count: 2000, save_count: 500, created_at: now, updated_at: now },
  { id: "wf-solopreneur", slug: "solopreneur-marketing-stack", title: "Solopreneur Marketing Stack", description: "Research offers, write content, compare positioning, and turn ideas into campaigns.", outcome: "A practical marketing workflow for one-person businesses.", target_role: "Solopreneur", hero_image: null, is_featured: true, is_published: true, sort_order: 2, view_count: 1600, save_count: 420, created_at: now, updated_at: now },
  { id: "wf-research", slug: "ai-research-brief-stack", title: "AI Research Brief Stack", description: "Collect cited research, synthesize findings, and produce shareable briefs.", outcome: "Fast source-backed research briefs.", target_role: "Operator", hero_image: null, is_featured: true, is_published: true, sort_order: 3, view_count: 1300, save_count: 330, created_at: now, updated_at: now },
];

export const demoWorkflowSteps = [
  { id: "step-idea", workflow_id: "wf-youtube-shorts", step_number: 1, title: "Find the angle", description: "Research the topic and choose the hook.", created_at: now },
  { id: "step-script", workflow_id: "wf-youtube-shorts", step_number: 2, title: "Script the video", description: "Write a tight 15 to 45 second script.", created_at: now },
  { id: "step-assets", workflow_id: "wf-youtube-shorts", step_number: 3, title: "Generate assets", description: "Create visuals, video clips, and voiceover.", created_at: now },
];

export const demoWorkflowTools = [
  { id: "wt-perplexity", workflow_id: "wf-youtube-shorts", step_id: "step-idea", tool_id: "tool-perplexity", tier: "recommended", notes: "Use for trend and topic research.", sort_order: 1, tool: demoTools.find(t => t.id === "tool-perplexity") },
  { id: "wt-chatgpt", workflow_id: "wf-youtube-shorts", step_id: "step-script", tool_id: "tool-chatgpt", tier: "recommended", notes: "Draft hooks, scripts, and variants.", sort_order: 2, tool: demoTools.find(t => t.id === "tool-chatgpt") },
  { id: "wt-runway", workflow_id: "wf-youtube-shorts", step_id: "step-assets", tool_id: "tool-runway", tier: "pro", notes: "Generate/edit video clips.", sort_order: 3, tool: demoTools.find(t => t.id === "tool-runway") },
  { id: "wt-elevenlabs", workflow_id: "wf-youtube-shorts", step_id: "step-assets", tool_id: "tool-elevenlabs", tier: "recommended", notes: "Generate voiceover.", sort_order: 4, tool: demoTools.find(t => t.id === "tool-elevenlabs") },
];

export const demoStacks: Stack[] = [
  { id: "stack-shorts", slug: "faceless-youtube-shorts-stack", title: "Faceless YouTube Shorts Stack", description: "A lean stack for researching, scripting, generating visuals, and adding voiceover.", owner_id: null, workflow_id: "wf-youtube-shorts", forked_from_id: null, visibility: "public", is_featured: true, monthly_cost: 60, view_count: 900, fork_count: 44, save_count: 220, created_at: now, updated_at: now },
  { id: "stack-research", slug: "research-to-content-stack", title: "Research to Content Stack", description: "Cited research, synthesis, writing, and publishing prep.", owner_id: null, workflow_id: "wf-research", forked_from_id: null, visibility: "public", is_featured: true, monthly_cost: 40, view_count: 720, fork_count: 31, save_count: 180, created_at: now, updated_at: now },
];

export const demoStackTools = [
  { id: "st1", stack_id: "stack-shorts", tool_id: "tool-perplexity", role_in_stack: "Research", step_order: 1, substitute_group: null, monthly_cost: 20, data_flow_type: "manual_export", notes: "Find current angles and facts.", created_at: now, tool: demoTools.find(t => t.id === "tool-perplexity") },
  { id: "st2", stack_id: "stack-shorts", tool_id: "tool-chatgpt", role_in_stack: "Script", step_order: 2, substitute_group: null, monthly_cost: 20, data_flow_type: "manual_export", notes: "Write and iterate scripts.", created_at: now, tool: demoTools.find(t => t.id === "tool-chatgpt") },
  { id: "st3", stack_id: "stack-shorts", tool_id: "tool-runway", role_in_stack: "Video", step_order: 3, substitute_group: null, monthly_cost: 15, data_flow_type: "manual_export", notes: "Generate/edit clips.", created_at: now, tool: demoTools.find(t => t.id === "tool-runway") },
  { id: "st4", stack_id: "stack-shorts", tool_id: "tool-elevenlabs", role_in_stack: "Voice", step_order: 4, substitute_group: null, monthly_cost: 5, data_flow_type: "manual_export", notes: "Voiceover.", created_at: now, tool: demoTools.find(t => t.id === "tool-elevenlabs") },
];

export const demoSubmissions: Submission[] = [
  { id: "sub-demo", submitted_by: null, submitter_email: "maker@example.com", tool_name: "Demo AI Tool", tool_url: "https://example.com", tagline: "Pending demo submission", description: "This shows the moderation queue in preview mode.", pricing_notes: "Freemium", category_ids: null, status: "pending", reviewer_id: null, review_notes: null, resulting_tool: null, created_at: now, updated_at: now },
];

export const demoClaims: any[] = [
  { id: "claim-demo", tool_id: "tool-runway", claimant_id: null, claimant_email: "maker@example.com", company_name: "Demo Maker", proof_url: "https://example.com/proof", proof_notes: "Demo claim in preview mode.", status: "pending", reviewer_id: null, review_notes: null, created_at: now, updated_at: now, tool: demoTools.find(t => t.id === "tool-runway") as any, claimant: null as any },
];

export const demoSourceChecks = [
  { id: "check-demo", tool_id: "tool-midjourney", check_type: "pricing", source_url: "https://www.midjourney.com", status: "changed", old_value: null, new_value: null, error_message: null, created_at: now, tool: demoTools.find(t => t.id === "tool-midjourney") },
];

export const demoAnalyticsEvents = [
  { id: "evt1", event_type: "tool_view", created_at: now },
  { id: "evt2", event_type: "stack_create", created_at: now },
  { id: "evt3", event_type: "compare_click", created_at: now },
];

export function getDemoTable(table: string): any[] {
  switch (table) {
    case "tools": return demoTools.map(t => attachToolRelations({ ...t }));
    case "categories": return demoCategories;
    case "workflows": return demoWorkflows.map(w => attachWorkflowRelations({ ...w }));
    case "workflow_steps": return demoWorkflowSteps;
    case "workflow_tools": return demoWorkflowTools;
    case "stacks": return demoStacks.map(s => attachStackRelations({ ...s }));
    case "stack_tools": return demoStackTools;
    case "tool_relationships": return demoRelationships.map(r => ({ ...r, target_tool: demoTools.find(t => t.id === r.target_tool_id), source_tool: demoTools.find(t => t.id === r.source_tool_id) }));
    case "submissions": return demoSubmissions;
    case "claims": return demoClaims;
    case "source_checks": return demoSourceChecks;
    case "newsletter_subscribers": return [{ id: "newsletter-demo", email: "demo@example.com", is_active: true, source_segment: "preview", created_at: now }];
    case "analytics_events": return demoAnalyticsEvents;
    case "profiles": return [{ id: "demo-admin", username: "demo", display_name: "Demo Admin", is_admin: true, is_maker: false, created_at: now, updated_at: now }];
    default: return [];
  }
}

function attachToolRelations(tool: any) {
  const catIds = categoryIdsForTool(tool.slug);
  tool.categories = catIds.map((id) => ({ category: demoCategories.find((c) => c.id === id) })).filter(x => x.category);
  tool.trending = { tool_id: tool.id, trending_score: tool.tool_score, saves_7d: Math.round(tool.save_count / 20), clicks_7d: Math.round(tool.click_count / 20), stack_adds_7d: Math.round(tool.stack_count / 20), updated_at: now };
  tool.alternatives = demoRelationships.filter(r => r.source_tool_id === tool.id).map(r => ({ ...r, target_tool: demoTools.find(t => t.id === r.target_tool_id) }));
  tool.stack_tools = demoStackTools.filter(st => st.tool_id === tool.id).map(st => ({ ...st, stack: demoStacks.find(s => s.id === st.stack_id) }));
  return tool;
}

function attachWorkflowRelations(workflow: any) {
  workflow.steps = demoWorkflowSteps.filter(s => s.workflow_id === workflow.id);
  workflow.tools = demoWorkflowTools.filter(wt => wt.workflow_id === workflow.id);
  return workflow;
}

function attachStackRelations(stack: any) {
  stack.stack_tools = demoStackTools.filter(st => st.stack_id === stack.id);
  stack.workflow = demoWorkflows.find(w => w.id === stack.workflow_id) ?? null;
  stack.owner = null;
  return stack;
}

function categoryIdsForTool(slug: string) {
  const map: Record<string, string[]> = {
    chatgpt: ["cat-chat"],
    claude: ["cat-chat"],
    runway: ["cat-video"],
    midjourney: ["cat-image"],
    elevenlabs: ["cat-audio"],
    perplexity: ["cat-research"],
    pika: ["cat-video"],
    suno: ["cat-audio"],
    udio: ["cat-audio"],
    flux: ["cat-image"],
    zapier: ["cat-automation"],
    make: ["cat-automation"],
    "notion-ai": ["cat-chat"],
    jasper: ["cat-chat"],
  };
  return map[slug] ?? [];
}

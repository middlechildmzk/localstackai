export type FallbackTool = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  website_url: string;
  affiliate_url: null;
  pricing_model: "unknown";
  has_free_plan: null;
  starting_price: null;
  freshness: "unverified";
  stack_count: number;
  best_for: string[];
  is_published: true;
  data_source: "static_fallback";
};

/**
 * Minimal continuity data for high-value comparison and editorial pages.
 *
 * This is intentionally NOT a pricing database. These records exist so an
 * unavailable Supabase project does not turn already-discovered comparison
 * URLs or vendor CTAs into 404s/dead ends. Product identity, broad workflow
 * category, and official vendor URL are sourced from vendor-owned public
 * product/help pages; commercial terms remain explicitly unverified until the
 * live data layer is available again.
 */
export const FALLBACK_TOOLS: FallbackTool[] = [
  {
    id: "fallback-lovable",
    slug: "lovable",
    name: "Lovable",
    tagline: "AI app and website building from natural-language direction",
    description: "Lovable is a full-stack AI development platform for building web applications through natural-language interaction.",
    website_url: "https://lovable.dev",
    affiliate_url: null,
    pricing_model: "unknown",
    has_free_plan: null,
    starting_price: null,
    freshness: "unverified",
    stack_count: 0,
    best_for: ["AI app and website building", "Natural-language web development"],
    is_published: true,
    data_source: "static_fallback",
  },
  {
    id: "fallback-perplexity",
    slug: "perplexity",
    name: "Perplexity",
    tagline: "AI-powered web research with source-backed answers",
    description: "Perplexity is an AI-powered search and research product designed to answer questions using information retrieved from the web with source citations.",
    website_url: "https://www.perplexity.ai",
    affiliate_url: null,
    pricing_model: "unknown",
    has_free_plan: null,
    starting_price: null,
    freshness: "unverified",
    stack_count: 0,
    best_for: ["Web research with citations", "Source-backed research briefs"],
    is_published: true,
    data_source: "static_fallback",
  },
  {
    id: "fallback-semrush",
    slug: "semrush",
    name: "Semrush",
    tagline: "SEO, search visibility, and digital marketing workflow platform",
    description: "Semrush provides search visibility and digital marketing workflows including SEO research, site auditing, and AI-search visibility capabilities.",
    website_url: "https://www.semrush.com",
    affiliate_url: null,
    pricing_model: "unknown",
    has_free_plan: null,
    starting_price: null,
    freshness: "unverified",
    stack_count: 0,
    best_for: ["SEO and search visibility", "Search marketing research"],
    is_published: true,
    data_source: "static_fallback",
  },
  {
    id: "fallback-gemini",
    slug: "gemini",
    name: "Gemini",
    tagline: "Google AI assistant for writing, planning, learning, research, and connected workflows",
    description: "Gemini Apps provide direct access to Google AI for tasks such as writing, brainstorming, planning, learning, summarization, research, and work with connected Google services.",
    website_url: "https://gemini.google.com",
    affiliate_url: null,
    pricing_model: "unknown",
    has_free_plan: null,
    starting_price: null,
    freshness: "unverified",
    stack_count: 0,
    best_for: ["General AI assistance", "Writing, planning, and research"],
    is_published: true,
    data_source: "static_fallback",
  },
  {
    id: "fallback-otter",
    slug: "otter",
    name: "Otter",
    tagline: "Meeting transcription, searchable notes, summaries, and meeting knowledge",
    description: "Otter turns voice interactions and meetings into searchable, shareable transcripts and notes, with meeting summaries and AI-assisted access to conversation knowledge.",
    website_url: "https://otter.ai",
    affiliate_url: null,
    pricing_model: "unknown",
    has_free_plan: null,
    starting_price: null,
    freshness: "unverified",
    stack_count: 0,
    best_for: ["Meeting transcription and notes", "Meeting summaries and searchable conversation knowledge"],
    is_published: true,
    data_source: "static_fallback",
  },
  {
    id: "fallback-opusclip",
    slug: "opusclip",
    name: "OpusClip",
    tagline: "AI video clipping and short-form repurposing",
    description: "OpusClip turns long-form video into short clips and supports AI clipping, captioning, reframing, B-roll, and social publishing workflows.",
    website_url: "https://www.opus.pro",
    affiliate_url: null,
    pricing_model: "unknown",
    has_free_plan: null,
    starting_price: null,
    freshness: "unverified",
    stack_count: 0,
    best_for: ["Long video to short clips", "Short-form video repurposing"],
    is_published: true,
    data_source: "static_fallback",
  },
  {
    id: "fallback-elevenlabs",
    slug: "elevenlabs",
    name: "ElevenLabs",
    tagline: "AI voice generation, narration, dubbing, and audio creation",
    description: "ElevenLabs provides AI voice generation and creative audio tools for narration, speech, dubbing, sound, and related creator workflows.",
    website_url: "https://elevenlabs.io",
    affiliate_url: null,
    pricing_model: "unknown",
    has_free_plan: null,
    starting_price: null,
    freshness: "unverified",
    stack_count: 0,
    best_for: ["AI narration and voice generation", "Creator audio workflows"],
    is_published: true,
    data_source: "static_fallback",
  },
  {
    id: "fallback-murf",
    slug: "murf",
    name: "Murf",
    tagline: "AI voiceovers, dubbing, and text-to-speech workflows",
    description: "Murf provides AI voiceover, dubbing, text-to-speech, and conversational voice tools for creator and business workflows.",
    website_url: "https://murf.ai",
    affiliate_url: null,
    pricing_model: "unknown",
    has_free_plan: null,
    starting_price: null,
    freshness: "unverified",
    stack_count: 0,
    best_for: ["Business voiceovers", "Text-to-speech and dubbing"],
    is_published: true,
    data_source: "static_fallback",
  },
  {
    id: "fallback-play-ht",
    slug: "play-ht",
    name: "PlayHT",
    tagline: "AI text-to-speech and voice API workflows",
    description: "PlayHT provides AI text-to-speech models and APIs for generating and integrating voice output.",
    website_url: "https://play.ht",
    affiliate_url: null,
    pricing_model: "unknown",
    has_free_plan: null,
    starting_price: null,
    freshness: "unverified",
    stack_count: 0,
    best_for: ["Text-to-speech generation", "Voice API integrations"],
    is_published: true,
    data_source: "static_fallback",
  },
];

export function getFallbackTool(slug: string): FallbackTool | null {
  return FALLBACK_TOOLS.find((tool) => tool.slug === slug) ?? null;
}

export type RolePage = {
  slug: string;
  label: string;
  headline: string;
  subhead: string;
  primaryWorkflow: string;
  searchTerms: string[];
  pains: string[];
  stackSteps: Array<{ step: string; role: string; examples: string[] }>;
  starterStack: string[];
  seoQueries: string[];
};

export const ROLE_PAGES: RolePage[] = [
  {
    slug: "creators",
    label: "Creators",
    headline: "AI stacks for creators who need to publish more without lowering quality.",
    subhead: "Find the right combination of research, scripting, voice, video, editing, thumbnail, and repurposing tools for YouTube, shorts, podcasts, newsletters, and social content.",
    primaryWorkflow: "Content repurposing and short-form production",
    searchTerms: ["creator", "youtube", "shorts", "video", "podcast", "content"],
    pains: ["Too many AI tools that do the same thing", "Unclear which tools work together", "Expensive subscriptions with overlap", "Generic outputs that still need human finishing"],
    stackSteps: [
      { step: "Research", role: "Find the angle and source material", examples: ["Perplexity", "ChatGPT", "Claude"] },
      { step: "Script", role: "Turn the idea into a hook-driven draft", examples: ["Claude", "ChatGPT", "Jasper"] },
      { step: "Voice / Audio", role: "Create narration, cleanup, or music", examples: ["ElevenLabs", "Descript", "Suno"] },
      { step: "Visuals", role: "Generate clips, images, or b-roll", examples: ["Runway", "Pika", "Midjourney"] },
      { step: "Edit + Package", role: "Cut, caption, thumbnail, publish", examples: ["CapCut", "Descript", "Canva AI"] },
    ],
    starterStack: ["Perplexity", "Claude", "ElevenLabs", "Runway", "CapCut", "Canva AI"],
    seoQueries: ["best AI tools for creators", "AI stack for YouTube Shorts", "AI tools for faceless YouTube"],
  },
  {
    slug: "solopreneurs",
    label: "Solopreneurs",
    headline: "AI stacks for solopreneurs building lean businesses without a large team.",
    subhead: "Map the tools you need for research, offers, landing pages, content, automation, email, support, and lightweight operations.",
    primaryWorkflow: "Lean business launch and operations",
    searchTerms: ["solo", "solopreneur", "business", "startup", "automation", "landing"],
    pains: ["No time to test every tool", "Need a stack that replaces a small team", "Subscription sprawl", "Hard to know what is worth paying for"],
    stackSteps: [
      { step: "Plan", role: "Research market, offer, and positioning", examples: ["Perplexity", "Claude", "ChatGPT"] },
      { step: "Build", role: "Create website, product, or app", examples: ["Lovable", "v0", "Cursor"] },
      { step: "Market", role: "Create content and landing-page copy", examples: ["Jasper", "Copy.ai", "Canva AI"] },
      { step: "Automate", role: "Connect leads, forms, email, and ops", examples: ["Zapier", "Make", "Airtable AI"] },
      { step: "Measure", role: "Track analytics, feedback, and repeatable workflows", examples: ["Notion AI", "Airtable AI", "PostHog"] },
    ],
    starterStack: ["Claude", "Perplexity", "Lovable", "Canva AI", "Zapier", "Notion AI"],
    seoQueries: ["best AI tools for solopreneurs", "AI stack for small business", "AI workflow builder for solopreneurs"],
  },
  {
    slug: "marketers",
    label: "Marketers",
    headline: "AI stacks for marketers turning strategy into campaigns, content, and measurable growth.",
    subhead: "Compare tools for research, copy, creative, social repurposing, automation, analytics, and campaign operations.",
    primaryWorkflow: "Campaign research to content distribution",
    searchTerms: ["marketing", "seo", "campaign", "social", "content", "ads"],
    pains: ["AI content still sounds generic", "Hard to compare marketing tools by workflow", "Need speed without losing brand voice", "Creative and analytics live in separate tools"],
    stackSteps: [
      { step: "Research", role: "Audience, keyword, and competitor research", examples: ["Perplexity", "ChatGPT", "Semrush"] },
      { step: "Copy", role: "Ads, emails, posts, and landing-page messaging", examples: ["Claude", "Jasper", "Copy.ai"] },
      { step: "Creative", role: "Images, video, and brand assets", examples: ["Canva AI", "Midjourney", "Runway"] },
      { step: "Distribution", role: "Schedule and repurpose campaigns", examples: ["Buffer", "Hootsuite", "OpusClip"] },
      { step: "Automation", role: "Route leads and campaign data", examples: ["Zapier", "Make", "HubSpot AI"] },
    ],
    starterStack: ["Perplexity", "Claude", "Canva AI", "Buffer", "Zapier", "HubSpot AI"],
    seoQueries: ["best AI tools for marketers", "AI marketing stack", "AI tools for content repurposing"],
  },
  {
    slug: "agencies",
    label: "Agencies",
    headline: "AI stacks for agencies delivering client work faster with clearer tool choices.",
    subhead: "Build repeatable delivery stacks for creative production, reporting, automation, client communication, and campaign execution.",
    primaryWorkflow: "Client delivery and repeatable production systems",
    searchTerms: ["agency", "client", "reporting", "delivery", "workflow", "team"],
    pains: ["Different clients need different stacks", "Team adoption is messy", "Deliverables require multiple handoffs", "Need to show clients why tools were chosen"],
    stackSteps: [
      { step: "Intake", role: "Collect requirements and transform briefs", examples: ["Typeform", "Claude", "Notion AI"] },
      { step: "Production", role: "Create copy, visuals, video, and assets", examples: ["ChatGPT", "Canva AI", "Runway"] },
      { step: "Automation", role: "Move work between systems", examples: ["Zapier", "Make", "Airtable AI"] },
      { step: "Review", role: "Transcribe, summarize, and revise client feedback", examples: ["Fireflies", "Fathom", "Descript"] },
      { step: "Reporting", role: "Package results and next steps", examples: ["Gamma", "Beautiful.ai", "Notion AI"] },
    ],
    starterStack: ["Claude", "Canva AI", "Runway", "Airtable AI", "Zapier", "Gamma"],
    seoQueries: ["AI tools for agencies", "AI agency tech stack", "AI workflow automation for agencies"],
  },
  {
    slug: "recruiters",
    label: "Recruiters",
    headline: "AI stacks for recruiters and sourcers who need better research, outreach, and pipeline workflows.",
    subhead: "Compare AI tools for intake, market mapping, Boolean support, candidate research, outreach drafting, notes, summaries, and pipeline operations.",
    primaryWorkflow: "Sourcing research to outreach and pipeline follow-up",
    searchTerms: ["recruiting", "sourcing", "outreach", "pipeline", "candidate", "talent"],
    pains: ["Generic AI outreach is easy to spot", "Candidate research gets scattered", "Need human-approved workflows", "Compliance and trust matter"],
    stackSteps: [
      { step: "Intake", role: "Turn job descriptions into search strategy", examples: ["Claude", "ChatGPT", "Notion AI"] },
      { step: "Research", role: "Map companies, skills, and source lanes", examples: ["Perplexity", "LinkedIn Recruiter", "GitHub"] },
      { step: "Outreach", role: "Draft personalized messages for human review", examples: ["Claude", "ChatGPT", "Gemini"] },
      { step: "Notes", role: "Summarize calls and candidate conversations", examples: ["Fireflies", "Fathom", "Otter"] },
      { step: "Pipeline", role: "Track follow-ups and sourcing workflows", examples: ["Airtable AI", "Notion AI", "Zapier"] },
    ],
    starterStack: ["Claude", "Perplexity", "Notion AI", "Airtable AI", "Fireflies", "Zapier"],
    seoQueries: ["AI tools for recruiters", "AI sourcing stack", "AI tools for talent sourcers"],
  },
  {
    slug: "operators",
    label: "Operators",
    headline: "AI stacks for operators building internal systems, automations, and repeatable workflows.",
    subhead: "Find tools for documentation, process automation, meeting intelligence, internal apps, dashboards, and cross-tool data movement.",
    primaryWorkflow: "Internal ops automation and documentation",
    searchTerms: ["operations", "ops", "automation", "meetings", "documentation", "internal"],
    pains: ["Manual handoffs between tools", "Undocumented processes", "Too many meetings", "Hard to connect data without engineering"],
    stackSteps: [
      { step: "Document", role: "Turn processes into usable SOPs", examples: ["Notion AI", "Claude", "ChatGPT"] },
      { step: "Capture", role: "Summarize meetings and decisions", examples: ["Fireflies", "Fathom", "Otter"] },
      { step: "Automate", role: "Connect workflows and approvals", examples: ["Zapier", "Make", "Airtable AI"] },
      { step: "Build", role: "Create lightweight internal tools", examples: ["Lovable", "Replit", "v0"] },
      { step: "Report", role: "Show status and metrics", examples: ["Airtable AI", "ClickUp AI", "Gamma"] },
    ],
    starterStack: ["Notion AI", "Fireflies", "Airtable AI", "Zapier", "Lovable", "Gamma"],
    seoQueries: ["AI tools for operations", "AI automation stack", "AI tools for internal workflows"],
  },
];

export function getRolePage(slug: string) {
  return ROLE_PAGES.find((role) => role.slug === slug);
}

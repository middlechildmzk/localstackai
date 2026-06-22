export type CreatorAffiliateTarget = {
  name: string;
  slug: string;
  category: string;
  priority: "P0" | "P1" | "P2";
  workflowFit: string[];
  affiliateStatus: "apply" | "verify" | "no-public-program";
  notes: string;
};

export const creatorAffiliateTargets: CreatorAffiliateTarget[] = [
  { name: "ElevenLabs", slug: "elevenlabs", category: "AI Voice", priority: "P0", workflowFit: ["Faceless YouTube", "AI voiceover", "Story videos"], affiliateStatus: "apply", notes: "High-fit voice tool. Verify current commission, cookie window, and eligible plans before quoting." },
  { name: "Descript", slug: "descript", category: "Audio/video editing", priority: "P0", workflowFit: ["Podcast clips", "Transcript editing", "Repurposing"], affiliateStatus: "apply", notes: "Strong creator workflow tool. Verify current affiliate terms before publishing rates." },
  { name: "OpusClip", slug: "opusclip", category: "Video repurposing", priority: "P0", workflowFit: ["Long video to Shorts", "Podcast clips", "Repurposing"], affiliateStatus: "apply", notes: "Core comparison and buyer-intent target for clipping pages." },
  { name: "Murf", slug: "murf", category: "AI Voice", priority: "P0", workflowFit: ["Explainer voiceover", "Business narration", "Faceless videos"], affiliateStatus: "apply", notes: "Good ElevenLabs comparison target. Verify current terms." },
  { name: "HeyGen", slug: "heygen", category: "AI Avatar Video", priority: "P0", workflowFit: ["Avatar video", "Faceless talking-head", "Business explainers"], affiliateStatus: "apply", notes: "Good comparison target against Synthesia. Verify current partner terms." },
  { name: "Pictory", slug: "pictory", category: "Text-to-video", priority: "P1", workflowFit: ["Blog to video", "Faceless videos", "Repurposing"], affiliateStatus: "apply", notes: "Useful for blog-to-video and faceless workflows." },
  { name: "Jasper", slug: "jasper", category: "AI Writing", priority: "P1", workflowFit: ["Marketing copy", "Affiliate content", "SEO writing"], affiliateStatus: "apply", notes: "High buyer-intent writing tool. Verify current program details." },
  { name: "Surfer SEO", slug: "surfer", category: "SEO", priority: "P1", workflowFit: ["Affiliate blogs", "SEO content", "Research-to-content"], affiliateStatus: "apply", notes: "Strong monetization fit for SEO and affiliate content clusters." },
  { name: "Canva", slug: "canva", category: "Design", priority: "P1", workflowFit: ["Thumbnails", "Social assets", "Digital products"], affiliateStatus: "verify", notes: "Ubiquitous creator tool. Verify current creator/affiliate availability." },
  { name: "Buffer", slug: "buffer", category: "Scheduling", priority: "P1", workflowFit: ["Social scheduling", "Repurposing", "Creator distribution"], affiliateStatus: "verify", notes: "Useful distribution layer for creator stacks." },
  { name: "Metricool", slug: "metricool", category: "Scheduling and analytics", priority: "P1", workflowFit: ["Social analytics", "Scheduling", "Creator reporting"], affiliateStatus: "verify", notes: "Good alternative to Buffer/Later/Hootsuite for creator workflows." },
  { name: "vidIQ", slug: "vidiq", category: "YouTube SEO", priority: "P1", workflowFit: ["Faceless YouTube", "YouTube Shorts", "Channel research"], affiliateStatus: "verify", notes: "Strong fit for faceless channel and YouTube stack pages." },
  { name: "TubeBuddy", slug: "tubebuddy", category: "YouTube SEO", priority: "P1", workflowFit: ["YouTube SEO", "Faceless YouTube", "Channel optimization"], affiliateStatus: "verify", notes: "Useful vidIQ comparison target." },
  { name: "Klap", slug: "klap", category: "Video repurposing", priority: "P1", workflowFit: ["YouTube to Shorts", "Talking-head clips"], affiliateStatus: "verify", notes: "Important OpusClip comparison target." },
  { name: "Vizard", slug: "vizard", category: "Video repurposing", priority: "P1", workflowFit: ["Long video to Shorts", "Captions", "Team repurposing"], affiliateStatus: "verify", notes: "Important OpusClip/Klap comparison target." },
  { name: "Submagic", slug: "submagic", category: "Captions", priority: "P1", workflowFit: ["Short-form captions", "Reels", "TikTok", "Shorts"], affiliateStatus: "verify", notes: "Caption-tool article target. Verify current partner availability." }
];

export const firstAffiliateApplications = creatorAffiliateTargets.filter((target) => target.affiliateStatus === "apply");

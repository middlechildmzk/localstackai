-- ═══════════════════════════════════════════════════════════════════════════════
-- StackBuilder AI V21.6b — Tools data expansion (100+ real tools)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Purpose: grow the tools table from 12 seed tools to 100+ real, well-known AI
-- products across all priority categories (chat, writing, image, video,
-- audio/voice/music, automation, research/search, coding/app builders, design,
-- marketing/social, sales, recruiting/HR, productivity).
--
-- REAL DATA ONLY (boundary 5/7):
--   * Every entry is a real product that exists as of Oct 2026 knowledge.
--   * Taglines/descriptions avoid unverifiable claims ("best", "#1", user counts).
--   * pricing_model uses only the real enum values; has_free_plan is true ONLY
--     where a free tier is confidently known. Uncertain pricing falls back to
--     conservative fields + a `-- VERIFY:` comment.
--   * All rows land with freshness='unverified' — the freshness agent loop
--     populates verified checks later. is_published=true.
--
-- RE-RUNNABLE: every INSERT uses ON CONFLICT ... DO NOTHING.
-- Run via: psql $DATABASE_URL -f data/tools-expansion.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── New categories (inserted before tool↔category joins) ─────────────────────
INSERT INTO categories (name, slug, description, icon, color, sort_order)
VALUES
  ('AI Design',     'ai-design',     'AI-assisted design, prototyping, presentations, and website builders', '🖌️', '#a78bfa', 11),
  ('AI Marketing',  'ai-marketing',  'AI tools for marketing, social media, and content distribution',        '📣', '#ef4444', 12),
  ('AI Sales',      'ai-sales',      'AI prospecting, outreach, and sales enablement',                      '🤝', '#14b8a6', 13),
  ('AI Recruiting', 'ai-recruiting', 'AI hiring, screening, and talent sourcing',                            '🧲', '#f472b6', 14)
ON CONFLICT (slug) DO NOTHING;

-- ─── Tools: AI Chat (11) ─────────────────────────────────────────────────────
INSERT INTO tools (slug, name, tagline, description, website_url, pricing_model, has_free_plan, best_for, freshness, is_published)
VALUES
  ('google-gemini', 'Google Gemini', $$Google's AI assistant$$,
   $$Gemini is Google's conversational AI assistant, integrated with Search, Gmail, Docs, and Android. It handles text, images, audio, and video inputs.$$,
   'https://gemini.google.com', 'freemium', true,
   ARRAY['Everyday questions and research','Working with Google Workspace','Multimodal tasks with images or audio'], 'unverified', true),
  ('microsoft-copilot', 'Microsoft Copilot', $$Microsoft's AI companion for work and the web$$,
   $$Microsoft Copilot is an AI assistant built into Windows, Edge, and Microsoft 365. It answers questions, drafts content, and works across Office apps.$$,
   'https://copilot.microsoft.com', 'freemium', true,
   ARRAY['Microsoft 365 users','Web-grounded answers','Windows and Edge workflows'], 'unverified', true),
  ('grok', 'Grok', $$xAI's AI assistant with real-time X data$$,
   $$Grok is xAI's conversational assistant, available on X and as a standalone app. It draws on real-time posts and web data for current topics.$$,
   'https://grok.com', 'freemium', true,
   ARRAY['Real-time topics and news','X-native conversations','Casual Q&A'], 'unverified', true),
  ('deepseek', 'DeepSeek', $$Open-weight reasoning models with a free chat app$$,
   $$DeepSeek is an AI lab whose chat app and API offer strong reasoning performance. The chat app is free; the API is priced per token.$$,
   'https://chat.deepseek.com', 'freemium', true,
   ARRAY['Free advanced reasoning','Math and coding help','API experimentation'], 'unverified', true),
  ('character-ai', 'Character.AI', $$Chat with AI characters created by the community$$,
   $$Character.AI lets users chat with AI personas created by the community or build their own. Popular for roleplay, storytelling, and entertainment.$$,
   'https://character.ai', 'freemium', true,
   ARRAY['Roleplay and storytelling','Entertainment chat','Building custom personas'], 'unverified', true),
  ('poe', 'Poe', $$One app for many AI models$$,
   $$Poe by Quora provides access to multiple AI models through a single subscription and chat interface, plus tools to build custom bots.$$,
   'https://poe.com', 'freemium', true,
   ARRAY['Trying many models in one place','Comparing model answers','Bot building'], 'unverified', true),
  ('le-chat', 'Le Chat', $$Mistral's AI assistant$$,
   $$Le Chat is Mistral AI's conversational assistant, with web search, document analysis, and image generation built in.$$,
   'https://chat.mistral.ai', 'freemium', true,
   ARRAY['European-hosted AI chat','Document Q&A','Web-grounded answers'], 'unverified', true),
  ('meta-ai', 'Meta AI', $$Meta's free AI assistant across its apps$$,
   $$Meta AI is built into Facebook, Instagram, WhatsApp, and Messenger, and available on the web. It answers questions and generates images for free.$$,
   'https://www.meta.ai', 'free', true,
   ARRAY['Chatting inside Meta apps','Free image generation','Quick everyday questions'], 'unverified', true),
  ('chatbase', 'Chatbase', $$AI chatbots trained on your website content$$,
   $$Chatbase lets businesses build AI support chatbots trained on their own docs and website, embeddable without code.$$,
   'https://www.chatbase.co', 'freemium', false,
   ARRAY['Customer support automation','Website chatbots','No-code bot building'], 'unverified', true),
  ('voiceflow', 'Voiceflow', $$Design and deploy conversational AI agents$$,
   $$Voiceflow is a no-code platform for designing chat and voice agents, with team collaboration and one-click deployment.$$,
   'https://www.voiceflow.com', 'freemium', true,
   ARRAY['Customer support bots','Voice assistants','Prototyping conversational flows'], 'unverified', true),
  ('botpress', 'Botpress', $$Open-source platform for building AI chatbots$$,
   $$Botpress is an open-source platform for building and deploying AI chatbots and agents, with visual flow building and integrations.$$,
   'https://botpress.com', 'open_source', true,
   ARRAY['Self-hosted chatbots','Developer-built agents','Support automation'], 'unverified', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Tools: AI Writing (9) ───────────────────────────────────────────────────
INSERT INTO tools (slug, name, tagline, description, website_url, pricing_model, has_free_plan, best_for, freshness, is_published)
VALUES
  ('jasper', 'Jasper', $$AI writing platform for marketing teams$$,
   $$Jasper is an AI content platform aimed at marketing teams, with brand voice controls, templates, and campaign workflows.$$,
   'https://www.jasper.ai', 'subscription', false,
   ARRAY['Marketing copy at scale','Brand-consistent content','Campaign workflows'], 'unverified', true),
  ('copy-ai', 'Copy.ai', $$AI workflows for go-to-market teams$$,
   $$Copy.ai provides AI workflows and agents for sales and marketing tasks like prospecting, content, and lead enrichment.$$,
   'https://www.copy.ai', 'freemium', true,
   ARRAY['GTM workflows','Sales prospecting copy','Marketing content drafts'], 'unverified', true),
  ('writesonic', 'Writesonic', $$AI writing and SEO content platform$$,
   $$Writesonic offers AI article writing, SEO tools, and a chatbot builder, aimed at content marketers and SEO teams.$$,
   'https://writesonic.com', 'freemium', true,
   ARRAY['SEO articles','Ad copy','Chatbot building'], 'unverified', true),
  ('rytr', 'Rytr', $$Affordable AI writing assistant$$,
   $$Rytr is a budget-friendly AI writing tool with templates for emails, ads, and blog posts across many tones and languages.$$,
   'https://rytr.me', 'freemium', true,
   ARRAY['Budget AI writing','Short-form copy','Multilingual drafts'], 'unverified', true),
  ('grammarly', 'Grammarly', $$AI writing assistance for clarity and correctness$$,
   $$Grammarly checks grammar, tone, and clarity across the web and in documents, with generative AI features for drafting and rewriting.$$,
   'https://www.grammarly.com', 'freemium', true,
   ARRAY['Grammar and style checks','Email polishing','Tone adjustments'], 'unverified', true),
  ('sudowrite', 'Sudowrite', $$AI writing partner for fiction authors$$,
   $$Sudowrite is built for novelists and fiction writers, with tools for brainstorming, expanding scenes, and overcoming writer's block.$$,
   'https://www.sudowrite.com', 'subscription', false,
   ARRAY['Fiction drafting','Scene expansion','Story brainstorming'], 'unverified', true),
  ('quillbot', 'Quillbot', $$AI paraphrasing and writing tools$$,
   $$Quillbot offers paraphrasing, grammar checking, summarizing, and citation tools used widely by students and professionals.$$,
   'https://quillbot.com', 'freemium', true,
   ARRAY['Paraphrasing','Summarizing articles','Academic writing help'], 'unverified', true),
  ('wordtune', 'Wordtune', $$AI rewriting for clearer sentences$$,
   $$Wordtune rewrites sentences for clarity, tone, and style as you type, integrated into browsers and editors.$$,
   'https://www.wordtune.com', 'freemium', true,
   ARRAY['Rewriting sentences','Tone matching','Shortening text'], 'unverified', true),
  ('prowritingaid', 'ProWritingAid', $$Writing analysis for authors and professionals$$,
   $$ProWritingAid analyzes style, grammar, and readability with detailed reports, popular with novelists and long-form writers.$$,
   'https://prowritingaid.com', 'freemium', true,
   ARRAY['Long-form editing','Style reports','Fiction manuscripts'], 'unverified', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Tools: AI Video (11) ────────────────────────────────────────────────────
INSERT INTO tools (slug, name, tagline, description, website_url, pricing_model, has_free_plan, best_for, freshness, is_published)
VALUES
  ('descript', 'Descript', $$Edit video and audio by editing text$$,
   $$Descript transcribes recordings and lets you edit media by editing the transcript. Includes AI voices, filler-word removal, and screen recording.$$,
   'https://www.descript.com', 'freemium', true,
   ARRAY['Podcast editing','Talking-head videos','Removing filler words'], 'unverified', true),
  ('opus-clip', 'Opus Clip', $$Turn long videos into viral short clips$$,
   $$Opus Clip uses AI to find highlight moments in long videos and reformat them as vertical shorts for TikTok, Reels, and Shorts.$$,
   'https://www.opus.pro', 'freemium', true,
   ARRAY['Repurposing podcasts','Short-form clips','Talking-head highlights'], 'unverified', true),
  ('capcut', 'CapCut', $$Free video editor with AI features$$,
   $$CapCut is ByteDance's video editor for desktop and mobile, with AI captions, background removal, and templates for social video.$$,
   'https://www.capcut.com', 'freemium', true,
   ARRAY['TikTok and Reels editing','Auto captions','Quick social edits'], 'unverified', true),
  ('invideo', 'InVideo', $$AI video creation from text prompts$$,
   $$InVideo generates videos from text prompts and scripts, with stock media, voiceovers, and templates for marketing content.$$,
   'https://invideo.io', 'freemium', true,
   ARRAY['Script-to-video','Marketing videos','Faceless content'], 'unverified', true),
  ('synthesia', 'Synthesia', $$AI avatar videos from text$$,
   $$Synthesia creates presenter-led videos from text using AI avatars, with 160+ languages for training and corporate video. A free Basic plan is available.$$,
   'https://www.synthesia.io', 'freemium', true,
   ARRAY['Training videos','Corporate explainers','Multilingual video'], 'unverified', true),
  ('heygen', 'HeyGen', $$AI avatar and video translation platform$$,
   $$HeyGen generates avatar videos and translates existing videos into 175+ languages with lip-synced dubbing.$$,
   'https://www.heygen.com', 'freemium', true,
   ARRAY['Video translation','Avatar presenters','Personalized outreach video'], 'unverified', true),
  ('lumen5', 'Lumen5', $$Turn blog posts into videos$$,
   $$Lumen5 converts text content like blog posts into social videos automatically, with templates and stock media.$$,
   'https://lumen5.com', 'freemium', true,
   ARRAY['Blog-to-video','Social video','Content repurposing'], 'unverified', true),
  ('pictory', 'Pictory', $$AI video from scripts and articles$$,
   $$Pictory turns scripts, blog posts, and long videos into short shareable videos with AI voices and captions.$$,
   'https://pictory.ai', 'subscription', false,
   ARRAY['Script-to-video','Article summaries as video','Automated captions'], 'unverified', true),
  ('fliki', 'Fliki', $$Text-to-video with AI voices$$,
   $$Fliki converts text into videos with lifelike AI voiceovers, aimed at faceless YouTube and social content creators.$$,
   'https://fliki.ai', 'freemium', true,
   ARRAY['Faceless YouTube','Text-to-speech video','Social clips'], 'unverified', true),
  ('veed', 'VEED', $$Online video editor with AI tools$$,
   $$VEED is a browser-based video editor with auto-subtitles, background removal, and AI avatars for quick edits.$$,
   'https://www.veed.io', 'freemium', true,
   ARRAY['Subtitled social video','Quick browser editing','Screen recordings'], 'unverified', true),
  ('colossyan', 'Colossyan', $$AI avatar videos for workplace learning$$,
   $$Colossyan creates training and onboarding videos with AI presenters and automatic translation.$$,
   'https://www.colossyan.com', 'subscription', false,
   ARRAY['Employee training','Onboarding videos','Compliance content'], 'unverified', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Tools: AI Image (7) ─────────────────────────────────────────────────────
INSERT INTO tools (slug, name, tagline, description, website_url, pricing_model, has_free_plan, best_for, freshness, is_published)
VALUES
  ('leonardo-ai', 'Leonardo.ai', $$AI image generation with fine control$$,
   $$Leonardo.ai offers image generation with fine-tuned models, canvas editing, and game-asset tools for creators.$$,
   'https://leonardo.ai', 'freemium', true,
   ARRAY['Game assets','Stylized illustrations','Iterative image editing'], 'unverified', true),
  ('ideogram', 'Ideogram', $$AI images with readable text$$,
   $$Ideogram generates images with notably better text rendering than most competitors, useful for posters, logos, and memes.$$,
   'https://ideogram.ai', 'freemium', true,
   ARRAY['Posters with text','Logo concepts','Social graphics'], 'unverified', true),
  ('adobe-firefly', 'Adobe Firefly', $$Adobe's commercially-safe image AI$$,
   $$Adobe Firefly generates images trained on licensed content, built into Photoshop, Illustrator, and Express.$$,
   'https://www.adobe.com/products/firefly.html', 'freemium', true,
   ARRAY['Commercial-safe imagery','Photoshop workflows','Brand content'], 'unverified', true),
  ('playground', 'Playground', $$AI image studio in the browser$$,
   $$Playground is a browser-based AI image tool with canvas editing, filters, and community templates.$$,
   'https://playground.com', 'freemium', true,
   ARRAY['Quick image experiments','Social graphics','Template remixes'], 'unverified', true),
  ('photoroom', 'PhotoRoom', $$AI product photos and background removal$$,
   $$PhotoRoom removes backgrounds and generates studio-style product shots from phone photos, aimed at sellers.$$,
   'https://www.photoroom.com', 'freemium', true,
   ARRAY['Product listings','Background removal','E-commerce imagery'], 'unverified', true),
  ('topaz-photo-ai', 'Topaz Photo AI', $$AI photo enhancement and upscaling$$,
   $$Topaz Photo AI sharpens, denoises, and upscales photos with machine-learning models, as desktop software.$$,
   'https://www.topazlabs.com', 'paid', false,
   ARRAY['Photo restoration','Upscaling old photos','Noise reduction'], 'unverified', true),
  ('krea-ai', 'Krea', $$Real-time AI image generation and enhancement$$,
   $$Krea offers real-time generative visuals, upscaling, and design tools in a fast browser canvas.$$,
   'https://www.krea.ai', 'freemium', true,
   ARRAY['Real-time generation','Image upscaling','Design exploration'], 'unverified', true)
ON CONFLICT (slug) DO NOTHING;
-- ─── Tools: AI Audio (6) ─────────────────────────────────────────────────────
INSERT INTO tools (slug, name, tagline, description, website_url, pricing_model, has_free_plan, best_for, freshness, is_published)
VALUES
  ('otter-ai', 'Otter.ai', $$AI meeting notes and transcription$$,
   $$Otter.ai transcribes meetings in real time, generates summaries, and integrates with Zoom, Meet, and Teams.$$,
   'https://otter.ai', 'freemium', true,
   ARRAY['Meeting transcription','Action-item summaries','Interview notes'], 'unverified', true),
  ('murf-ai', 'Murf', $$AI voice generator for studio-quality voiceovers$$,
   $$Murf converts text to speech with a library of AI voices for videos, e-learning, and ads.$$,
   'https://murf.ai', 'freemium', true,
   ARRAY['Video voiceovers','E-learning narration','Ad reads'], 'unverified', true),
  ('play-ht', 'Play.ht', $$AI voice generation and cloning$$,
   $$Play.ht offers text-to-speech with hundreds of voices and voice cloning for podcasts and video.$$,
   'https://play.ht', 'freemium', true,
   ARRAY['Podcast narration','Voice cloning','Audiobook drafts'], 'unverified', true),
  ('krisp', 'Krisp', $$AI noise cancellation for calls$$,
   $$Krisp removes background noise, voices, and echoes from calls in real time, working with any conferencing app.$$,
   'https://krisp.ai', 'freemium', true,
   ARRAY['Noisy call environments','Remote meetings','Call centers'], 'unverified', true),
  ('rev', 'Rev', $$Transcription and caption services$$,
   $$Rev provides AI and human transcription, captions, and subtitles for media professionals, priced per minute.$$,
   'https://www.rev.com', 'usage_based', false,
   ARRAY['Accurate transcripts','Video captions','Legal transcription'], 'unverified', true),
  ('speechify', 'Speechify', $$Text-to-speech reading app$$,
   $$Speechify reads articles, PDFs, and books aloud with natural voices, popular for accessibility and speed-listening.$$,
   'https://speechify.com', 'freemium', true,
   ARRAY['Listening to articles','Accessibility','Studying on the go'], 'unverified', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Tools: AI Music (5) ─────────────────────────────────────────────────────
INSERT INTO tools (slug, name, tagline, description, website_url, pricing_model, has_free_plan, best_for, freshness, is_published)
VALUES
  ('udio', 'Udio', $$AI music studio for full songs$$,
   $$Udio generates complete songs with vocals from text prompts, with remixing and extension tools for creators.$$,
   'https://www.udio.com', 'freemium', true,
   ARRAY['Original songs','Remixing ideas','Content soundtracks'], 'unverified', true),
  -- VERIFY: confirm current free-trial availability and entry pricing
  ('soundraw', 'Soundraw', $$Royalty-free AI music for creators$$,
   $$Soundraw generates royalty-free background music you can customize by mood, genre, and length for video.$$,
   'https://soundraw.io', 'subscription', false,
   ARRAY['YouTube background music','Customizable tracks','Commercial-safe music'], 'unverified', true),
  ('boomy', 'Boomy', $$Make songs in seconds, release them$$,
   $$Boomy lets anyone create songs with AI and distribute them to streaming platforms, sharing royalties with creators.$$,
   'https://boomy.com', 'freemium', true,
   ARRAY['Quick song ideas','Streaming releases','Music experiments'], 'unverified', true),
  -- VERIFY: confirm whether a free tier still exists
  ('mubert', 'Mubert', $$AI-generated royalty-free music streams$$,
   $$Mubert generates adaptive, royalty-free music streams and tracks for videos, apps, and businesses.$$,
   'https://mubert.com', 'freemium', false,
   ARRAY['Background streams','App soundtracks','Video music'], 'unverified', true),
  ('aiva', 'AIVA', $$AI composer for soundtracks$$,
   $$AIVA composes original music for films, games, and ads, with editable scores and licensing options.$$,
   'https://www.aiva.ai', 'freemium', true,
   ARRAY['Film scores','Game music','Custom compositions'], 'unverified', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Tools: AI Coding / App Builders (8) ─────────────────────────────────────
INSERT INTO tools (slug, name, tagline, description, website_url, pricing_model, has_free_plan, best_for, freshness, is_published)
VALUES
  ('github-copilot', 'GitHub Copilot', $$AI pair programmer in your editor$$,
   $$GitHub Copilot suggests code completions and chat help inside VS Code, JetBrains, and Neovim. A limited free tier is available.$$,
   'https://github.com/features/copilot', 'freemium', true,
   ARRAY['Code autocompletion','Boilerplate generation','Learning new APIs'], 'unverified', true),
  ('replit', 'Replit', $$Build and deploy apps in the browser$$,
   $$Replit is a browser IDE with AI agent-assisted app building, hosting, and deployment built in.$$,
   'https://replit.com', 'freemium', true,
   ARRAY['Prototyping apps','Learning to code','Hobby projects'], 'unverified', true),
  ('v0', 'v0', $$Generate UI with prompts, by Vercel$$,
   $$v0 by Vercel generates React and Next.js interfaces from text prompts, with copyable, deployable code.$$,
   'https://v0.dev', 'freemium', true,
   ARRAY['Landing pages','UI prototypes','React components'], 'unverified', true),
  ('bolt', 'Bolt', $$Prompt-to-app builder in the browser$$,
   $$Bolt.new by StackBlitz turns prompts into full-stack web apps you can edit and deploy, running in the browser.$$,
   'https://bolt.new', 'freemium', true,
   ARRAY['Full-stack prototypes','Hackathon builds','Non-coder app ideas'], 'unverified', true),
  ('lovable', 'Lovable', $$AI app builder for non-developers$$,
   $$Lovable turns plain-language descriptions into working web apps with databases and auth, aimed at founders.$$,
   'https://lovable.dev', 'freemium', true,
   ARRAY['MVP building','Founder prototypes','Internal tools'], 'unverified', true),
  ('windsurf', 'Windsurf', $$Agentic AI IDE$$,
   $$Windsurf is an AI-native code editor with agent mode, multi-file edits, and codebase-aware chat.$$,
   'https://windsurf.com', 'freemium', true,
   ARRAY['Agentic coding','Codebase refactors','Multi-file changes'], 'unverified', true),
  ('tabnine', 'Tabnine', $$Private AI code completion$$,
   $$Tabnine provides AI code completions with a focus on privacy and enterprise deployment options.$$,
   'https://www.tabnine.com', 'freemium', true,
   ARRAY['Team code completion','Private deployments','Enterprise compliance'], 'unverified', true),
  ('cline', 'Cline', $$Open-source AI coding agent for VS Code$$,
   $$Cline is an open-source autonomous coding agent that runs inside VS Code, planning and executing multi-step tasks.$$,
   'https://cline.bot', 'open_source', true,
   ARRAY['Autonomous coding tasks','Self-hosted agents','VS Code workflows'], 'unverified', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Tools: AI Automation (6) ────────────────────────────────────────────────
INSERT INTO tools (slug, name, tagline, description, website_url, pricing_model, has_free_plan, best_for, freshness, is_published)
VALUES
  ('n8n', 'n8n', $$Open-source workflow automation$$,
   $$n8n is a self-hostable workflow automation platform with 400+ integrations and AI agent nodes.$$,
   'https://n8n.io', 'open_source', true,
   ARRAY['Self-hosted automation','AI agent workflows','API orchestration'], 'unverified', true),
  ('lindy', 'Lindy', $$AI employees for repetitive work$$,
   $$Lindy provides AI agents that handle tasks like scheduling, inbox triage, and sales follow-up autonomously.$$,
   'https://www.lindy.ai', 'freemium', true,
   ARRAY['Inbox triage','Meeting scheduling','Sales follow-up'], 'unverified', true),
  ('relay', 'Relay', $$AI-assisted workflow automation$$,
   $$Relay.app combines human-in-the-loop steps with AI in no-code automations across popular apps.$$,
   'https://www.relay.app', 'freemium', true,
   ARRAY['Approval workflows','AI-assisted ops','Team automations'], 'unverified', true),
  ('gumloop', 'Gumloop', $$AI automation for non-technical teams$$,
   $$Gumloop is a no-code platform for building AI-powered automations with drag-and-drop nodes.$$,
   'https://www.gumloop.com', 'freemium', true,
   ARRAY['No-code AI workflows','Data enrichment','Lead processing'], 'unverified', true),
  ('activepieces', 'Activepieces', $$Open-source Zapier alternative$$,
   $$Activepieces is an open-source automation platform with AI pieces, self-hostable for teams.$$,
   'https://www.activepieces.com', 'open_source', true,
   ARRAY['Self-hosted automations','Open-source stack','Team workflows'], 'unverified', true),
  ('bardeen', 'Bardeen', $$AI automation inside your browser$$,
   $$Bardeen automates repetitive browser tasks and connects web apps with AI playbooks.$$,
   'https://www.bardeen.ai', 'freemium', true,
   ARRAY['Web scraping','CRM updates','Repetitive browser work'], 'unverified', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Tools: AI Research / Search (8) ─────────────────────────────────────────
INSERT INTO tools (slug, name, tagline, description, website_url, pricing_model, has_free_plan, best_for, freshness, is_published)
VALUES
  ('consensus', 'Consensus', $$AI search over research papers$$,
   $$Consensus searches 200M+ research papers and answers questions with cited evidence.$$,
   'https://consensus.app', 'freemium', true,
   ARRAY['Literature reviews','Evidence-backed answers','Academic research'], 'unverified', true),
  ('elicit', 'Elicit', $$AI research assistant for papers$$,
   $$Elicit helps researchers find papers, extract data, and synthesize findings across studies.$$,
   'https://elicit.com', 'freemium', true,
   ARRAY['Systematic reviews','Data extraction','Research synthesis'], 'unverified', true),
  ('scite', 'Scite', $$Citation context and Smart Citations$$,
   $$Scite.ai shows how papers cite each other — supporting, mentioning, or contrasting — for trustworthy research.$$,
   'https://scite.ai', 'paid', false,
   ARRAY['Citation analysis','Verifying claims','Academic rigor'], 'unverified', true),
  ('semantic-scholar', 'Semantic Scholar', $$Free AI-powered academic search$$,
   $$Semantic Scholar is a free AI search engine over 200M+ scientific papers from the Allen Institute for AI.$$,
   'https://www.semanticscholar.org', 'free', true,
   ARRAY['Free paper search','Citation graphs','Research discovery'], 'unverified', true),
  ('you-com', 'You.com', $$AI search with customizable sources$$,
   $$You.com is an AI search engine with cited answers, agents, and customizable preferred sources.$$,
   'https://you.com', 'freemium', true,
   ARRAY['Cited web answers','Custom sources','Research agents'], 'unverified', true),
  ('phind', 'Phind', $$AI answers for developers$$,
   $$Phind is an AI search engine tuned for developers, answering coding questions with cited sources.$$,
   'https://www.phind.com', 'freemium', true,
   ARRAY['Coding questions','Technical research','Debugging help'], 'unverified', true),
  ('notebooklm', 'NotebookLM', $$Google's AI research notebook$$,
   $$NotebookLM grounds AI answers in your own documents, with audio overviews and cited responses.$$,
   'https://notebooklm.google.com', 'free', true,
   ARRAY['Studying documents','Research notes','Audio summaries'], 'unverified', true),
  ('chatpdf', 'ChatPDF', $$Chat with your PDF documents$$,
   $$ChatPDF lets you upload PDFs and ask questions about their contents, with cited page references.$$,
   'https://www.chatpdf.com', 'freemium', true,
   ARRAY['Reading papers','Contract review','Studying textbooks'], 'unverified', true)
ON CONFLICT (slug) DO NOTHING;
-- ─── Tools: AI Design (11) — new category 'ai-design' ───────────────────────────
INSERT INTO tools (slug, name, tagline, description, website_url, pricing_model, has_free_plan, best_for, freshness, is_published)
VALUES
  ('canva', 'Canva', $$Design anything with drag-and-drop AI$$,
   $$Canva's Magic Studio adds AI image generation, background editing, and design suggestions to its popular editor.$$,
   'https://www.canva.com', 'freemium', true,
   ARRAY['Social graphics','Presentations','Quick brand assets'], 'unverified', true),
  ('figma', 'Figma', $$Collaborative design with built-in AI$$,
   $$Figma's AI features help generate UI drafts, rename layers, and create prototypes in the browser-based design tool.$$,
   'https://www.figma.com', 'freemium', true,
   ARRAY['UI design','Design systems','Team collaboration'], 'unverified', true),
  ('uizard', 'Uizard', $$AI UI design for non-designers$$,
   $$Uizard turns text prompts and hand-drawn sketches into editable app and website prototypes. It operates under Miro Labs and offers a free plan.$$,
   'https://uizard.io', 'freemium', true,
   ARRAY['Rapid prototyping','Founder mockups','Sketch-to-wireframe'], 'unverified', true),
  ('relume', 'Relume', $$AI website wireframes and components$$,
   $$Relume generates sitemaps and wireframes for Webflow and Figma projects from text prompts.$$,
   'https://www.relume.io', 'freemium', true,
   ARRAY['Webflow sites','Sitemaps','Wireframing'], 'unverified', true),
  ('khroma', 'Khroma', $$AI color palette generator$$,
   $$Khroma learns your color preferences and generates unlimited palettes for design projects.$$,
   'https://www.khroma.co', 'free', true,
   ARRAY['Brand palettes','Color exploration','Design inspiration'], 'unverified', true),
  ('gamma', 'Gamma', $$AI presentations and websites$$,
   $$Gamma generates polished presentations, docs, and websites from a prompt, with one-click restyling.$$,
   'https://gamma.app', 'freemium', true,
   ARRAY['Pitch decks','Quick websites','Client presentations'], 'unverified', true),
  ('beautiful-ai', 'Beautiful.ai', $$AI slide design automation$$,
   $$Beautiful.ai auto-formats slides as you add content, keeping presentations on-brand.$$,
   'https://www.beautiful.ai', 'subscription', false,
   ARRAY['Investor decks','Team updates','Branded slides'], 'unverified', true),
  ('pitch', 'Pitch', $$Collaborative presentation software$$,
   $$Pitch combines collaborative editing with AI assistance for modern team presentations.$$,
   'https://pitch.com', 'freemium', true,
   ARRAY['Team decks','Startup pitches','Async presentations'], 'unverified', true),
  ('durable', 'Durable', $$AI website builder for service businesses$$,
   $$Durable generates a business website with CRM and invoicing in under a minute from a short description. A free plan is available.$$,
   'https://durable.co', 'freemium', true,
   ARRAY['Service business sites','Fast online presence','Built-in CRM'], 'unverified', true),
  ('framer', 'Framer', $$Design and publish sites with AI$$,
   $$Framer is a design tool that publishes real websites, with AI generation for pages and sections.$$,
   'https://www.framer.com', 'freemium', true,
   ARRAY['Portfolio sites','Landing pages','Design-to-site'], 'unverified', true),
  -- VERIFY: confirm whether a free tier exists (sources conflict)
  ('10web', '10Web', $$AI WordPress website builder$$,
   $$10Web uses AI to build and host WordPress sites, with automated PageSpeed optimization.$$,
   'https://10web.io', 'freemium', false,
   ARRAY['WordPress sites','Agency builds','Speed optimization'], 'unverified', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Tools: AI Marketing (6) — new category 'ai-marketing' ────────────────────
INSERT INTO tools (slug, name, tagline, description, website_url, pricing_model, has_free_plan, best_for, freshness, is_published)
VALUES
  ('buffer', 'Buffer', $$Social media scheduling with AI assistant$$,
   $$Buffer schedules posts across social platforms, with AI help drafting and repurposing content.$$,
   'https://buffer.com', 'freemium', true,
   ARRAY['Social scheduling','Small teams','Content repurposing'], 'unverified', true),
  ('hootsuite', 'Hootsuite', $$Social media management at scale$$,
   $$Hootsuite manages publishing, listening, and analytics across social networks, with OwlyWriter AI.$$,
   'https://www.hootsuite.com', 'subscription', false,
   ARRAY['Enterprise social','Social listening','Team publishing'], 'unverified', true),
  ('later', 'Later', $$Visual social media planner$$,
   $$Later is a visual-first scheduler for Instagram, TikTok, and Pinterest with AI caption help.$$,
   'https://later.com', 'freemium', true,
   ARRAY['Instagram planning','Visual calendars','Creator scheduling'], 'unverified', true),
  ('hypefury', 'Hypefury', $$Grow on X with AI-assisted posting$$,
   $$Hypefury schedules posts, auto-retweets evergreen content, and helps grow audiences on X.$$,
   'https://hypefury.com', 'subscription', false,
   ARRAY['X growth','Evergreen reposting','Audience building'], 'unverified', true),
  ('typefully', 'Typefully', $$Distraction-free writing for X and LinkedIn$$,
   $$Typefully is a clean editor for drafting, scheduling, and analyzing posts on X and LinkedIn.$$,
   'https://typefully.com', 'freemium', true,
   ARRAY['X threads','LinkedIn posts','Content analytics'], 'unverified', true),
  ('taplio', 'Taplio', $$AI for LinkedIn growth$$,
   $$Taplio helps build a LinkedIn presence with AI post writing, scheduling, and lead lists.$$,
   'https://taplio.com', 'subscription', false,
   ARRAY['LinkedIn content','Personal branding','B2B leads'], 'unverified', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Tools: AI Sales (4) — new category 'ai-sales' ────────────────────────────
INSERT INTO tools (slug, name, tagline, description, website_url, pricing_model, has_free_plan, best_for, freshness, is_published)
VALUES
  -- VERIFY: confirm current pricing tiers
  ('regie-ai', 'Regie.ai', $$AI sales prospecting platform$$,
   $$Regie.ai builds personalized outreach sequences and messaging for sales teams.$$,
   'https://www.regie.ai', 'subscription', false,
   ARRAY['Outbound sequences','Personalized outreach','Sales messaging'], 'unverified', true),
  ('lavender', 'Lavender', $$AI email coach for sellers$$,
   $$Lavender analyzes sales emails in real time and suggests improvements to boost reply rates.$$,
   'https://www.lavender.ai', 'freemium', true,
   ARRAY['Cold email','Reply-rate coaching','Inbox writing'], 'unverified', true),
  ('apollo', 'Apollo', $$Sales prospecting with AI$$,
   $$Apollo.io combines a B2B contact database with AI sequencing and engagement tools.$$,
   'https://www.apollo.io', 'freemium', true,
   ARRAY['Prospect lists','Outbound sequences','Contact data'], 'unverified', true),
  -- VERIFY: confirm pricing model and whether a free tier exists
  ('clay', 'Clay', $$AI data enrichment for GTM$$,
   $$Clay enriches lead lists with 100+ data sources and AI agents for personalized outreach.$$,
   'https://clay.com', 'freemium', false,
   ARRAY['Lead enrichment','Personalized outreach','Data waterfalls'], 'unverified', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Tools: AI Recruiting (4) — new category 'ai-recruiting' ──────────────────
INSERT INTO tools (slug, name, tagline, description, website_url, pricing_model, has_free_plan, best_for, freshness, is_published)
VALUES
  ('paradox', 'Paradox', $$Conversational AI for hiring$$,
   $$Paradox's Olivia screens candidates, schedules interviews, and answers applicant questions via chat.$$,
   'https://www.paradox.ai', 'enterprise', false,
   ARRAY['High-volume hiring','Interview scheduling','Candidate screening'], 'unverified', true),
  ('hirevue', 'HireVue', $$AI video interviewing$$,
   $$HireVue offers video interviews and assessments to screen candidates at scale.$$,
   'https://www.hirevue.com', 'enterprise', false,
   ARRAY['Video interviews','Skills assessments','Enterprise hiring'], 'unverified', true),
  ('eightfold', 'Eightfold', $$AI talent intelligence platform$$,
   $$Eightfold.ai matches candidates to roles with skills-based AI for recruiting and internal mobility.$$,
   'https://eightfold.ai', 'enterprise', false,
   ARRAY['Talent matching','Internal mobility','Skills-based hiring'], 'unverified', true),
  ('seekout', 'SeekOut', $$AI talent search and sourcing$$,
   $$SeekOut searches across public profiles to find and engage technical and diverse talent.$$,
   'https://www.seekout.com', 'subscription', false,
   ARRAY['Tech sourcing','Diverse pipelines','Talent rediscovery'], 'unverified', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Tools: AI Productivity (10) ─────────────────────────────────────────────
INSERT INTO tools (slug, name, tagline, description, website_url, pricing_model, has_free_plan, best_for, freshness, is_published)
VALUES
  ('motion', 'Motion', $$AI calendar that plans your day$$,
   $$Motion auto-schedules tasks, meetings, and projects into your calendar with AI prioritization.$$,
   'https://www.usemotion.com', 'subscription', false,
   ARRAY['Auto-scheduling','Task prioritization','Team planning'], 'unverified', true),
  ('reclaim-ai', 'Reclaim.ai', $$Smart calendar for focus time$$,
   $$Reclaim.ai automatically defends focus time, schedules habits, and balances meetings.$$,
   'https://reclaim.ai', 'freemium', true,
   ARRAY['Focus time','Habit scheduling','Meeting balance'], 'unverified', true),
  ('mem', 'Mem', $$AI notes that organize themselves$$,
   $$Mem is a note-taking app with AI search and automatic organization of your notes.$$,
   'https://mem.ai', 'freemium', true,
   ARRAY['Personal knowledge','Meeting notes','Quick capture'], 'unverified', true),
  ('fireflies', 'Fireflies', $$AI notetaker for meetings$$,
   $$Fireflies.ai joins calls to transcribe, summarize, and extract action items automatically.$$,
   'https://fireflies.ai', 'freemium', true,
   ARRAY['Meeting summaries','Action items','Call search'], 'unverified', true),
  ('tldv', 'tl;dv', $$Record and summarize meetings$$,
   $$tl;dv records Zoom, Meet, and Teams calls with AI summaries and shareable highlights.$$,
   'https://tldv.io', 'freemium', true,
   ARRAY['Call recordings','Shareable clips','Meeting recaps'], 'unverified', true),
  ('meetgeek', 'MeetGeek', $$AI meeting assistant$$,
   $$MeetGeek auto-joins meetings to record, transcribe, and summarize with searchable highlights.$$,
   'https://meetgeek.ai', 'freemium', true,
   ARRAY['Auto meeting notes','Transcripts','Team sharing'], 'unverified', true),
  ('fathom', 'Fathom', $$AI meeting notes for Zoom, Meet, and Teams$$,
   $$Fathom records, transcribes, and summarizes video calls, with AI action items and CRM sync.$$,
   'https://fathom.video', 'freemium', true,
   ARRAY['Call summaries','Zoom and Meet','CRM sync'], 'unverified', true),
  ('granola', 'Granola', $$AI notepad for meetings$$,
   $$Granola blends your typed notes with AI-generated transcripts and summaries after calls.$$,
   'https://www.granola.so', 'freemium', true,
   ARRAY['Human plus AI notes','Post-call summaries','Mac workflows'], 'unverified', true),
  ('superhuman', 'Superhuman', $$Fast email with AI triage$$,
   $$Superhuman is a speed-focused email client with AI triage, drafting, and keyboard-first workflows.$$,
   'https://superhuman.com', 'subscription', false,
   ARRAY['Inbox zero','Fast email','Executive workflows'], 'unverified', true),
  ('shortwave', 'Shortwave', $$AI-powered email client$$,
   $$Shortwave organizes Gmail with AI summaries, smart search, and scheduled sends.$$,
   'https://www.shortwave.com', 'freemium', true,
   ARRAY['Gmail power users','Email summaries','Smart search'], 'unverified', true)
ON CONFLICT (slug) DO NOTHING;
-- ─── Tool ↔ Category joins ─────────────────────────────────────────────────────
-- Idempotent: PK conflict (tool_id, category_id) is ignored on re-runs.
-- Existing seed categories (ai-chat, ai-writing, ai-video, ai-image, ai-audio,
-- ai-coding, ai-automation, ai-research, ai-productivity, ai-music) are reused;
-- new categories (ai-design, ai-marketing, ai-sales, ai-recruiting) were inserted
-- above. Jasper/Copy.ai also join ai-marketing (seed keeps them in ai-writing).
INSERT INTO tool_categories (tool_id, category_id)
SELECT t.id, c.id
FROM (VALUES
  -- AI Chat
  ('google-gemini','ai-chat'), ('microsoft-copilot','ai-chat'), ('grok','ai-chat'),
  ('deepseek','ai-chat'), ('character-ai','ai-chat'), ('poe','ai-chat'),
  ('le-chat','ai-chat'), ('meta-ai','ai-chat'), ('chatbase','ai-chat'),
  ('voiceflow','ai-chat'), ('botpress','ai-chat'),
  -- AI Writing
  ('jasper','ai-writing'), ('copy-ai','ai-writing'), ('writesonic','ai-writing'),
  ('rytr','ai-writing'), ('grammarly','ai-writing'), ('sudowrite','ai-writing'),
  ('quillbot','ai-writing'), ('wordtune','ai-writing'), ('prowritingaid','ai-writing'),
  -- AI Video
  ('descript','ai-video'), ('opus-clip','ai-video'), ('capcut','ai-video'),
  ('invideo','ai-video'), ('synthesia','ai-video'), ('heygen','ai-video'),
  ('lumen5','ai-video'), ('pictory','ai-video'), ('fliki','ai-video'),
  ('veed','ai-video'), ('colossyan','ai-video'),
  -- AI Image
  ('leonardo-ai','ai-image'), ('ideogram','ai-image'), ('adobe-firefly','ai-image'),
  ('playground','ai-image'), ('photoroom','ai-image'), ('topaz-photo-ai','ai-image'),
  ('krea-ai','ai-image'),
  -- AI Audio (+ productivity crossover)
  ('otter-ai','ai-audio'), ('otter-ai','ai-productivity'),
  ('murf-ai','ai-audio'), ('play-ht','ai-audio'),
  ('krisp','ai-audio'), ('krisp','ai-productivity'),
  ('rev','ai-audio'), ('speechify','ai-audio'),
  -- AI Music
  ('udio','ai-music'), ('soundraw','ai-music'), ('boomy','ai-music'),
  ('mubert','ai-music'), ('aiva','ai-music'),
  -- AI Coding
  ('github-copilot','ai-coding'), ('replit','ai-coding'), ('v0','ai-coding'),
  ('bolt','ai-coding'), ('lovable','ai-coding'), ('windsurf','ai-coding'),
  ('tabnine','ai-coding'), ('cline','ai-coding'),
  -- AI Automation
  ('n8n','ai-automation'), ('lindy','ai-automation'), ('relay','ai-automation'),
  ('gumloop','ai-automation'), ('activepieces','ai-automation'), ('bardeen','ai-automation'),
  -- AI Research
  ('consensus','ai-research'), ('elicit','ai-research'), ('scite','ai-research'),
  ('semantic-scholar','ai-research'), ('you-com','ai-research'), ('phind','ai-research'),
  ('notebooklm','ai-research'), ('chatpdf','ai-research'),
  -- AI Design (new category)
  ('canva','ai-design'), ('figma','ai-design'), ('uizard','ai-design'),
  ('relume','ai-design'), ('khroma','ai-design'), ('gamma','ai-design'),
  ('beautiful-ai','ai-design'), ('pitch','ai-design'), ('durable','ai-design'),
  ('framer','ai-design'), ('10web','ai-design'),
  -- AI Marketing (new category)
  ('buffer','ai-marketing'), ('hootsuite','ai-marketing'), ('later','ai-marketing'),
  ('hypefury','ai-marketing'), ('typefully','ai-marketing'), ('taplio','ai-marketing'),
  ('jasper','ai-marketing'), ('copy-ai','ai-marketing'),
  -- AI Sales (new category)
  ('regie-ai','ai-sales'), ('lavender','ai-sales'), ('apollo','ai-sales'), ('clay','ai-sales'),
  -- AI Recruiting (new category)
  ('paradox','ai-recruiting'), ('hirevue','ai-recruiting'),
  ('eightfold','ai-recruiting'), ('seekout','ai-recruiting'),
  -- AI Productivity
  ('motion','ai-productivity'), ('reclaim-ai','ai-productivity'), ('mem','ai-productivity'),
  ('fireflies','ai-productivity'), ('tldv','ai-productivity'), ('meetgeek','ai-productivity'),
  ('fathom','ai-productivity'), ('granola','ai-productivity'),
  ('superhuman','ai-productivity'), ('shortwave','ai-productivity')
) AS v(tool_slug, cat_slug)
JOIN tools t      ON t.slug = v.tool_slug
JOIN categories c ON c.slug = v.cat_slug
ON CONFLICT DO NOTHING;

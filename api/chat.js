export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY is not configured. Add it in Vercel Project Settings > Environment Variables, then redeploy.'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { message = '', context = {}, mode = 'sourcing' } = body;

    if (!message || typeof message !== 'string' || message.trim().length < 2) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const combined = `${message}\n\n${JSON.stringify(context || {})}`;
    const riskHits = [];
    if (/\b\d{3}-\d{2}-\d{4}\b/.test(combined)) riskHits.push('possible SSN');
    if (/\b\d{1,2}\/\d{1,2}\/(19|20)\d{2}\b/.test(combined)) riskHits.push('possible DOB');
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(combined)) riskHits.push('email address');
    if (/\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(combined)) riskHits.push('phone number');
    if (riskHits.length) {
      return res.status(400).json({ error: `Blocked possible sensitive data: ${riskHits.join(', ')}. Redact before sending to AI.` });
    }

    const safeContext = JSON.stringify(context || {}, null, 2).slice(0, 24000);

    const instructions = `You are SourcingOS Copilot inside a daily-use sourcing command center for a senior sourcer. The user's stack is Avature as ATS/system of record, LinkedIn Recruiter, ClearanceJobs, Indeed, GitHub/Web, and Google X-Ray. SourcingOS is the brain layer: search strategy, platform-specific Boolean/search cards, profile evidence review, outreach drafts, HM updates, and project memory.

Core behavior:
- Help with JD analysis, source strategy, LinkedIn/ClearanceJobs/Indeed/GitHub/Web/Avature search strings, evidence cards, missing-info checklists, outreach drafts, HM updates, and next search moves.
- Keep outputs concise, practical, copy-ready, and editable.
- Use recruiter language, not developer language.
- Always distinguish evidence from inference.

Safety and compliance rules:
- Never scrape, bypass, or suggest automation against LinkedIn, ClearanceJobs, Indeed, Avature, or restricted/login-only sites.
- Never auto-send outreach or imply SourcingOS can take actions in external platforms.
- Never infer protected traits such as race, gender, age, religion, disability, health status, pregnancy, national origin, or political views.
- Never claim to verify a security clearance. Clearance terms from profiles/resumes/search results must be labeled candidate-stated/unverified unless the user explicitly states it was verified through an approved process.
- Do not make hiring decisions, reject candidates, rank candidates for employment, or imply automated decisioning. Use terms like evidence coverage, fit signal, missing info, and human review required.
- If the user includes sensitive PII, classified information, CUI, export-controlled content, or private candidate data, ask them to redact before proceeding.`;

    const prompt = `Mode: ${mode}\n\nCurrent SourcingOS context, redacted/synthetic only:\n${safeContext}\n\nUser request:\n${message}`;

    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.5',
        instructions,
        input: prompt,
        max_output_tokens: 2200
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data?.error?.message || 'OpenAI API error',
        details: data?.error || data
      });
    }

    const text = data.output_text ||
      (Array.isArray(data.output)
        ? data.output.flatMap(item => item.content || []).map(c => c.text || '').join('\n')
        : '');

    return res.status(200).json({ text, raw: { id: data.id, model: data.model } });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}

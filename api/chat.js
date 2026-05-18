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

    const safeContext = JSON.stringify(context || {}, null, 2).slice(0, 24000);

    const instructions = `You are ChatGPT inside Cleared Sourcing Copilot, a local-first sourcing strategy workbench for cleared, GovCon, defense, cyber, cloud, software engineering, AI, and federal technical recruiting.

Safety and compliance rules:
- Never claim to verify a security clearance.
- Treat public profile, resume, military, company, and keyword text as unverified signals only.
- Do not make hiring decisions, reject candidates, rank candidates for employment, or imply automated decisioning.
- Use language like evidence completeness, search strategy, sourcing signals, manual verification, and human review required.
- Warn if the user appears to include classified information, CUI, export-controlled data, SSNs, DOBs, personal contact information, or sensitive candidate PII.
- Help with role intake, Boolean/X-Ray strings, search lanes, target companies, screening questions, outreach drafts, hiring-manager notes, and sourcing strategy.
- Be concise, practical, and copy-ready.`;

    const prompt = `Mode: ${mode}\n\nCurrent app context, redacted/synthetic only:\n${safeContext}\n\nUser request:\n${message}`;

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

    return res.status(200).json({ text, raw: data });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}

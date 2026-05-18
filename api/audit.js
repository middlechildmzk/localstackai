export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY is not configured. Add it in Vercel Project Settings > Environment Variables, then redeploy.'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const sections = Array.isArray(body.sections) && body.sections.length ? body.sections : ['final_recommendations'];
    const appVersion = body.appVersion || 'V9 Internal Workbench';
    const extraContext = String(body.context || '').slice(0, 18000);

    const sectionList = sections.join(', ');
    const prompt = `You are an internal AI product review board for Dan Larson's Cleared SourcingOS Lite.

App under review: https://localstackai.vercel.app
Version: ${appVersion}
Repo: middlechildmzk/localstackai
Purpose: internal, local-first cleared/federal technical sourcing workbench.

Critical rules:
- Never claim the tool verifies security clearance.
- Treat clearance language as unverified breadcrumbs only.
- Keep it assistive, auditable, and human-in-the-loop.
- Focus on internal use, not public SaaS.
- Use synthetic examples only.

Requested review sections: ${sectionList}

Extra context:
${extraContext}

Return a concise but rigorous markdown audit with priorities, risks, and exact implementation recommendations.`;

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data?.error?.message || 'Anthropic API error', details: data?.error || data });
    }

    const text = Array.isArray(data.content) ? data.content.map(c => c.text || '').join('\n') : '';
    return res.status(200).json({ text, raw: data });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}

/* Sourcing Intelligence Workspace backend bridge
   Connects the existing SourcingOS frontend to the FastAPI backend when available.
   Safe behavior: if the backend is offline, the UI shows an offline state and uses no hidden network calls. */
(function () {
  const DEFAULT_API_BASE = 'http://localhost:8000';
  const API_KEY = 'sourcingos_siw_api_base';

  function $(id) { return document.getElementById(id); }
  function esc(value) { return String(value || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m])); }
  function toastSafe(message) { if (typeof toast === 'function') toast(message); }

  function getApiBase() {
    return localStorage.getItem(API_KEY) || DEFAULT_API_BASE;
  }

  function setApiBase(value) {
    const clean = String(value || '').trim().replace(/\/$/, '');
    localStorage.setItem(API_KEY, clean || DEFAULT_API_BASE);
    return getApiBase();
  }

  async function fetchJson(path, options = {}) {
    const base = getApiBase();
    const url = path.startsWith('http') ? path : `${base}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`${response.status} ${response.statusText}${detail ? ` - ${detail.slice(0, 240)}` : ''}`);
    }
    return response.json();
  }

  function roleQueryFromInputs() {
    const role = $('roleTitle')?.value || '';
    const skills = ($('mustHaves')?.value || '')
      .split(/[,;\n]+/)
      .map(x => x.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 6)
      .join(',');
    const location = $('location')?.value || '';
    return { role, skills, location };
  }

  function renderStatus(status, details = '') {
    const el = $('siwBackendStatus');
    if (!el) return;
    const cls = status === 'online' ? 'good' : status === 'degraded' ? 'warn' : 'red';
    const label = status === 'online' ? 'Backend online' : status === 'degraded' ? 'Backend degraded' : 'Backend offline';
    el.innerHTML = `<span class="badge ${cls}">${label}</span>${details ? `<span class="subtle">${esc(details)}</span>` : ''}`;
  }

  function renderPanel(html) {
    const el = $('siwBackendResults');
    if (el) el.innerHTML = html;
  }

  function candidateToLocalCard(hit) {
    const sourceList = (hit.sources || []).map(s => typeof s === 'string' ? s : s.source).filter(Boolean).join(', ');
    const skills = hit.skills || [];
    return {
      id: `siw_${hit.candidate_id || Date.now()}`,
      name: hit.canonical_name || hit.name || 'Backend Candidate',
      title: hit.current_role || hit.headline || 'Backend identity record',
      company: hit.current_company || sourceList || 'SIW Backend',
      location: hit.location || hit.primary_location || '',
      source: sourceList || 'SIW Backend',
      matched: skills.slice(0, 8),
      missing: [],
      evidence: [
        hit.headline || hit.summary_bio || 'Imported from Sourcing Intelligence Workspace backend.',
        skills.length ? `Skills: ${skills.slice(0, 10).join(', ')}` : '',
        sourceList ? `Sources: ${sourceList}` : ''
      ].filter(Boolean),
      confidence: skills.length >= 3 ? 'High' : skills.length ? 'Medium' : 'Review',
      caveats: ['Backend record. Verify fit, identity, source URLs, and contactability manually.'],
      createdAt: new Date().toISOString()
    };
  }

  function importCandidate(hit) {
    if (!window.state || !Array.isArray(window.state.candidates)) {
      toastSafe('Local candidate state not available yet');
      return;
    }
    const candidate = candidateToLocalCard(hit);
    const exists = window.state.candidates.some(c => c.id === candidate.id || (c.name === candidate.name && c.source === candidate.source));
    if (!exists) window.state.candidates.unshift(candidate);
    if (typeof saveState === 'function') saveState();
    if (typeof renderCandidates === 'function') renderCandidates();
    toastSafe(`Imported ${candidate.name}`);
  }

  async function testBackend() {
    const input = $('siwApiBase');
    if (input) setApiBase(input.value);
    renderStatus('degraded', 'Checking...');
    try {
      const ready = await fetchJson('/ready');
      if (ready.status === 'ready') renderStatus('online', `DB ${ready.database}, search ${ready.opensearch}`);
      else renderStatus('degraded', JSON.stringify(ready));
      await loadResearchSummary();
    } catch (error) {
      renderStatus('offline', error.message);
      renderPanel(`<div class="empty-state">Backend is not reachable at <strong>${esc(getApiBase())}</strong>. Run the Docker backend locally or set a deployed API URL.</div>`);
    }
  }

  async function loadResearchSummary() {
    try {
      const summary = await fetchJson('/api/v1/research/summary');
      const roles = await fetchJson('/api/v1/scores/roles').catch(() => ({ roles: [] }));
      renderPanel(`
        <div class="siw-mini-grid">
          <div class="siw-stat"><strong>${summary.candidate_count || 0}</strong><span>Candidates</span></div>
          <div class="siw-stat"><strong>${summary.source_profile_count || 0}</strong><span>Source profiles</span></div>
          <div class="siw-stat"><strong>${summary.skill_count || 0}</strong><span>Skills</span></div>
          <div class="siw-stat"><strong>${summary.publication_count || 0}</strong><span>Publications</span></div>
        </div>
        <p class="subtle">Role score models: ${(roles.roles || []).map(r => esc(r.role_key)).join(', ') || 'not loaded'}</p>
      `);
    } catch (error) {
      renderPanel(`<div class="empty-state">Could not load research summary: ${esc(error.message)}</div>`);
    }
  }

  async function loadBackendCandidates() {
    renderPanel('<div class="empty-state">Loading backend candidates...</div>');
    try {
      const data = await fetchJson('/db/candidates?size=50');
      const candidates = data.candidates || [];
      renderPanel(candidates.length ? candidates.map(c => renderCandidateRow(c)).join('') : '<div class="empty-state">No backend candidates yet. Seed or sync records first.</div>');
      renderStatus('online', `${candidates.length} backend candidates loaded`);
    } catch (error) {
      renderStatus('offline', error.message);
      renderPanel(`<div class="empty-state">Could not load backend candidates: ${esc(error.message)}</div>`);
    }
  }

  async function searchBackend() {
    const { role, skills, location } = roleQueryFromInputs();
    const params = new URLSearchParams();
    if (skills) params.set('skills', skills);
    if (location) params.set('location', location);
    if (role) params.set('q', role);
    params.set('size', '25');
    renderPanel('<div class="empty-state">Searching backend...</div>');
    try {
      const data = await fetchJson(`/search?${params.toString()}`);
      const results = data.results || [];
      renderPanel(results.length ? results.map(c => renderCandidateRow(c)).join('') : '<div class="empty-state">No backend matches yet. Seed records or broaden skills.</div>');
      renderStatus('online', `${results.length} backend matches`);
    } catch (error) {
      renderStatus('offline', error.message);
      renderPanel(`<div class="empty-state">Backend search failed: ${esc(error.message)}</div>`);
    }
  }

  async function scoreFirstVisible(roleKey = 'devops_engineer') {
    const firstButton = document.querySelector('[data-siw-candidate-id]');
    const candidateId = firstButton?.getAttribute('data-siw-candidate-id');
    if (!candidateId) return toastSafe('Load backend candidates first');
    try {
      const score = await fetchJson(`/api/v1/scores/${encodeURIComponent(candidateId)}?role=${encodeURIComponent(roleKey)}`);
      renderPanel(`<pre>${esc(JSON.stringify(score, null, 2))}</pre>`);
    } catch (error) {
      renderPanel(`<div class="empty-state">Score request failed: ${esc(error.message)}</div>`);
    }
  }

  function renderCandidateRow(c) {
    const candidateId = c.candidate_id || c.id || '';
    const name = c.canonical_name || c.name || 'Unnamed backend record';
    const skills = c.skills || [];
    const sources = c.sources || [];
    const sourceText = sources.map(s => typeof s === 'string' ? s : [s.source, s.handle].filter(Boolean).join(': ')).filter(Boolean).join(', ');
    const payload = encodeURIComponent(JSON.stringify(c));
    return `
      <article class="siw-backend-row">
        <div>
          <strong>${esc(name)}</strong>
          <p class="subtle">${esc(c.current_role || c.headline || '')}${c.location ? ` · ${esc(c.location)}` : ''}</p>
          <div>${skills.slice(0, 8).map(s => `<span class="badge good">${esc(s)}</span>`).join('')} ${sourceText ? `<span class="badge">${esc(sourceText)}</span>` : ''}</div>
        </div>
        <div class="card-actions">
          <button class="small-btn primary" data-siw-candidate-id="${esc(candidateId)}" onclick="SourcingOSBackend.importEncoded('${payload}')">Import</button>
          ${candidateId ? `<button class="small-btn" onclick="SourcingOSBackend.showIdentity('${esc(candidateId)}')">360</button>` : ''}
        </div>
      </article>`;
  }

  async function showIdentity(candidateId) {
    try {
      const identity = await fetchJson(`/api/v1/identities/${encodeURIComponent(candidateId)}`);
      renderPanel(`<pre>${esc(JSON.stringify(identity, null, 2))}</pre>`);
    } catch (error) {
      renderPanel(`<div class="empty-state">Identity load failed: ${esc(error.message)}</div>`);
    }
  }

  function importEncoded(encoded) {
    try { importCandidate(JSON.parse(decodeURIComponent(encoded))); }
    catch (error) { toastSafe('Import failed'); }
  }

  function openBackendViewer() {
    window.open(`${getApiBase()}/db/view`, '_blank', 'noreferrer');
  }

  function init() {
    const input = $('siwApiBase');
    if (input) input.value = getApiBase();
    renderStatus('degraded', `Configured: ${getApiBase()}`);
  }

  window.SourcingOSBackend = {
    getApiBase,
    setApiBase,
    testBackend,
    loadResearchSummary,
    loadBackendCandidates,
    searchBackend,
    scoreFirstVisible,
    showIdentity,
    importEncoded,
    openBackendViewer
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

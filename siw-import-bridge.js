/* Approved text/profile import and sweep companion for SIW backend bridge */
(function () {
  function $(id) { return document.getElementById(id); }
  function esc(value) { return String(value || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m])); }
  function toastSafe(message) { if (typeof toast === 'function') toast(message); }

  function apiBase() {
    return (window.SourcingOSBackend && window.SourcingOSBackend.getApiBase && window.SourcingOSBackend.getApiBase()) || 'http://localhost:8000';
  }

  async function postJson(path, payload) {
    const response = await fetch(apiBase().replace(/\/$/, '') + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  async function getJson(path) {
    const response = await fetch(apiBase().replace(/\/$/, '') + path);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  function render(html) {
    const el = $('siwBackendResults');
    if (el) el.innerHTML = html;
  }

  function rolePayload(dryRun) {
    const skillText = $('mustHaves')?.value || '';
    const skills = skillText.split(/[,;\n]+/).map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 8);
    const locationText = $('location')?.value || '';
    const locations = locationText
      ? locationText.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean).slice(0, 8)
      : ['Washington DC', 'Arlington VA', 'Reston VA', 'Chantilly VA', 'Fort Meade MD'];
    return {
      role: $('roleTitle')?.value || 'Senior DevOps Engineer',
      location_cluster: locations,
      skills: skills.length ? skills : ['kubernetes', 'terraform', 'aws', 'govcloud', 'ci/cd', 'devsecops'],
      clearance_target: $('clearance')?.value || 'TS/SCI',
      max_per_source: 10,
      dry_run: Boolean(dryRun),
      include_github: true,
      include_resume_text_blocks: false,
      resume_text_blocks: []
    };
  }

  function renderSweepResult(result, modeLabel) {
    const summary = result.summary || {};
    const candidates = result.candidate_records || [];
    const evidence = result.evidence_items || [];
    const skipped = result.skipped_items || [];
    const rows = candidates.slice(0, 12).map(c => `
      <article class="siw-backend-row">
        <div>
          <strong>${esc(c.full_name || c.name || 'Unnamed lead')}</strong>
          <p class="subtle">${esc(c.headline || c.bio_summary || '')}${c.location ? ` · ${esc(c.location)}` : ''}</p>
          <div>${(c.extracted_skills || []).slice(0, 8).map(s => `<span class="badge good">${esc(s)}</span>`).join('')} <span class="badge">${esc(c.source_name || 'source')}</span></div>
        </div>
      </article>`).join('');
    render(`
      <div class="siw-mini-grid">
        <div class="siw-stat"><strong>${summary.candidate_count || candidates.length || 0}</strong><span>Candidate leads</span></div>
        <div class="siw-stat"><strong>${summary.evidence_count || evidence.length || 0}</strong><span>Evidence-only</span></div>
        <div class="siw-stat"><strong>${summary.skipped_count || skipped.length || 0}</strong><span>Skipped/noise</span></div>
        <div class="siw-stat"><strong>${esc(modeLabel)}</strong><span>Mode</span></div>
      </div>
      <p class="subtle">Guardrail: person-profile evidence is required before creating candidate leads. Clearance is an unverified breadcrumb only.</p>
      ${rows || '<div class="empty-state">No candidate leads returned yet. Evidence-only items were not upgraded into candidates.</div>'}
      <details style="margin-top:10px"><summary class="subtle">Show raw result</summary><pre>${esc(JSON.stringify(result, null, 2))}</pre></details>
    `);
  }

  async function importCommandTextToBackend() {
    const text = $('commandInput')?.value || '';
    if (!text.trim() || text.trim().length < 10) {
      toastSafe('Paste a profile or resume first');
      return;
    }
    const sourceName = prompt('Source label for this approved import?', 'manual_import') || 'manual_import';
    render('<div class="empty-state">Queueing approved profile/resume text into SIW backend...</div>');
    try {
      const result = await postJson('/tasks/import/text', { text, source_name: sourceName, queue: true });
      render(`<pre>${esc(JSON.stringify(result, null, 2))}</pre><p class="subtle">Queued. After the worker finishes, click <strong>Load DB</strong>.</p>`);
      toastSafe('Approved import queued');
    } catch (error) {
      render(`<div class="empty-state">Import failed: ${esc(error.message)}</div>`);
    }
  }

  async function runDcDevopsSweep(dryRun) {
    render(`<div class="empty-state">Running ${dryRun ? 'dry-run' : 'review-gated queue'} DC DevOps sweep...</div>`);
    try {
      const result = await postJson(`/tasks/sweep/dc-devops?dry_run=${dryRun ? 'true' : 'false'}&max_per_source=10`, {});
      renderSweepResult(result, dryRun ? 'Dry run' : 'Queued');
      toastSafe(dryRun ? 'DC sweep dry-run complete' : 'DC sweep queued');
    } catch (error) {
      render(`<div class="empty-state">Sweep failed: ${esc(error.message)}</div>`);
    }
  }

  async function runRoleSweep(dryRun) {
    const payload = rolePayload(dryRun);
    render(`<div class="empty-state">Running ${dryRun ? 'dry-run' : 'review-gated queue'} role sweep for ${esc(payload.role)}...</div>`);
    try {
      const result = await postJson('/tasks/sweep/public-candidates', payload);
      renderSweepResult(result, dryRun ? 'Dry run' : 'Queued');
      toastSafe(dryRun ? 'Role sweep dry-run complete' : 'Role sweep queued');
    } catch (error) {
      render(`<div class="empty-state">Role sweep failed: ${esc(error.message)}</div>`);
    }
  }

  async function loadGrowthStats() {
    render('<div class="empty-state">Loading growth stats...</div>');
    try {
      const result = await getJson('/growth/stats');
      render(`<pre>${esc(JSON.stringify(result, null, 2))}</pre>`);
    } catch (error) {
      render(`<div class="empty-state">Growth stats failed: ${esc(error.message)}</div>`);
    }
  }

  function openCandidateUpload() {
    window.open('/candidate-upload.html', '_blank', 'noreferrer');
  }

  window.SourcingOSImport = {
    importCommandTextToBackend,
    runDcDevopsSweep,
    runRoleSweep,
    loadGrowthStats,
    openCandidateUpload
  };
})();

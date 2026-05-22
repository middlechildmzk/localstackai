/* Approved text/profile import companion for SIW backend bridge */
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
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  function render(html) {
    const el = $('siwBackendResults');
    if (el) el.innerHTML = html;
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

  window.SourcingOSImport = { importCommandTextToBackend };
})();

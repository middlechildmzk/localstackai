let __renderedSearchCards = [];
let __renderedCandidateCards = [];

function renderSearchCards(cards = state.searches) {
  __renderedSearchCards = cards || [];
  const el = $('searchCards');
  if (!el) return;
  if (!__renderedSearchCards.length) {
    el.innerHTML = '<div class="empty-state">Build searches to see platform cards.</div>';
    return;
  }
  el.innerHTML = __renderedSearchCards.map((c, i) => `
    <article class="search-card">
      <div class="card-top"><div><div class="platform-name">${esc(c.platform)}</div><div class="subtle">Copy/paste into native platform</div></div><span class="badge ${c.source==='clearancejobs'?'warn':'good'}">${esc(c.source)}</span></div>
      <pre>${esc(c.query)}</pre>
      <div class="badge-row">${(c.filters||[]).map(f => `<span class="badge">${esc(f)}</span>`).join('')}</div>
      <p class="subtle">${esc(c.why)}</p>
      <div class="card-actions"><button class="small-btn primary" onclick="copySearchCard(${i})">Copy</button><button class="small-btn" onclick="saveSearchCard(${i})">Save Search</button><button class="small-btn" onclick="explainSearchCard(${i})">Explain</button></div>
    </article>`).join('');
}

function copySearchCard(i) {
  const c = __renderedSearchCards[i];
  if (!c) return;
  copyRaw(c.query || '');
}

function saveSearchCard(i) {
  const c = __renderedSearchCards[i];
  if (!c) return;
  saveSearch(c);
}

function explainSearchCard(i) {
  const c = __renderedSearchCards[i];
  if (!c) return;
  explainSearch(c);
}

function renderCandidateCards() {
  renderProjectDropdown();
  const el = $('candidateCards');
  if (!el) return;
  __renderedCandidateCards = state.candidates.filter(c => !state.activeProjectId || !c.projectId || c.projectId === state.activeProjectId);
  if (!__renderedCandidateCards.length) {
    el.innerHTML = '<div class="empty-state">Paste profile/resume text into the command bar and click <strong>Review Profile</strong>.</div>';
    return;
  }
  el.innerHTML = __renderedCandidateCards.map((c, i) => `
    <article class="candidate-card">
      <div class="card-top"><div><div class="platform-name">${esc(c.name)}</div><div class="subtle">${esc(c.title)} · ${esc(c.company)}</div></div><span class="badge good">${esc(c.source)}</span></div>
      <div class="badge-row"><span class="badge">${esc(c.confidence)} fit signal</span>${(c.clearanceMentions||[]).map(x => `<span class="badge warn">${esc(x)} · candidate-stated/not verified</span>`).join('')}</div>
      <strong>Matched skills</strong><div class="badge-row">${((c.matched&&c.matched.length)?c.matched:['No direct must-have matches detected']).map(x => `<span class="badge good">${esc(x)}</span>`).join('')}</div>
      <strong>Missing / verify</strong><div class="badge-row">${((c.missing&&c.missing.length)?c.missing:['Verify details manually']).map(x => `<span class="badge red">${esc(x)}</span>`).join('')}</div>
      <strong>Evidence</strong><ul class="evidence-list">${((c.evidence&&c.evidence.length)?c.evidence:['No specific evidence extracted from pasted text.']).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="subtle"><strong>Outreach angle:</strong> ${esc(c.outreachAngle)}</p>
      <div class="card-actions"><button class="small-btn primary" onclick="draftOutreach('${c.id}')">Draft Outreach</button><button class="small-btn" onclick="markCandidate('${c.id}','Shortlisted')">Shortlist</button><button class="small-btn" onclick="markCandidate('${c.id}','Not Relevant')">Not Relevant</button><button class="small-btn" onclick="copyCandidateCard(${i})">Copy Summary</button></div>
    </article>`).join('');
}

function copyCandidateCard(i) {
  const c = __renderedCandidateCards[i];
  if (!c) return;
  copyRaw(candidateSummary(c));
}

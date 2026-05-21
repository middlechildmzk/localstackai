/* SourcingOS 14.5.1 UX rescue layer. Loaded after state + live-source runner. */
(function(){
  const $ = id => document.getElementById(id);
  const clearanceRe = /(TS\/SCI|Top Secret|Secret|Public Trust|polygraph|CI Poly|FSP|Full Scope|security clearance|active clearance)/i;
  const STAGES = ['Sourced','Saved','Reviewing','Contacted','Responded','Screen','Submitted','Interview','Offer','Hired','Rejected','Nurture','Do Not Contact'];
  const uid = prefix => `${prefix}_${(crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)+Date.now()).replace(/-/g,'').slice(0,12)}`;
  const now = () => new Date().toISOString();
  const cleanText = s => String(s||'').replace(/[\u201C\u201D]/g,'"').replace(/[\u2018\u2019]/g,"'").replace(/[\u2013\u2014]/g,'-').trim();
  const html = s => String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  function save(){ if(typeof window.saveLocal === 'function') window.saveLocal(); }
  function fitFor(candidateId){ return state.pipelineEntries?.find(p => p.candidateId===candidateId && (!state.activeProjectId || p.projectId===state.activeProjectId)) || state.pipelineEntries?.find(p=>p.candidateId===candidateId) || null; }
  function currentProjectId(){ if(state.activeProjectId) return state.activeProjectId; if(typeof window.saveProject==='function') window.saveProject(); return state.activeProjectId || ''; }
  function inferCandidateNameFromText(text){
    const lines = cleanText(text).split('\n').map(x=>x.trim()).filter(Boolean);
    const explicit = lines.find(l => /^(name|candidate|profile)\s*[:\-]/i.test(l));
    if(explicit) return explicit.replace(/^(name|candidate|profile)\s*[:\-]\s*/i,'').slice(0,72);
    const first = lines.find(l => !/^(source|type|class|url|summary|evidence|caveat)\s*:/i.test(l) && !/^[-•]/.test(l) && l.length <= 80);
    if(first) return first.replace(/^candidate\s+lead\s*[-:]\s*/i,'').slice(0,72);
    return '';
  }
  function inferCompanyBetter(text){
    const companyLine = cleanText(text).split('\n').find(l=>/^(company|current company|employer)\s*[:\-]/i.test(l));
    if(companyLine) return companyLine.replace(/^(company|current company|employer)\s*[:\-]\s*/i,'').slice(0,90);
    if(typeof window.inferCandidateCompany === 'function') return window.inferCandidateCompany(text);
    return 'Company not detected';
  }
  function buildEvidenceBetter(text, matched){
    const lines = cleanText(text).split(/[\n\.]/).map(x=>x.trim()).filter(Boolean);
    const ev = [];
    matched.forEach(skill => { const line = lines.find(l=>l.toLowerCase().includes(skill.toLowerCase())); if(line) ev.push(`${skill}: ${line.slice(0,160)}`); });
    if(!ev.length){
      const summary = lines.find(l=>/^summary\s*:/i.test(l));
      if(summary) ev.push(summary.replace(/^summary\s*:\s*/i,'').slice(0,180));
    }
    return ev.slice(0,5);
  }

  function injectModeBar(){
    if($('uxModeBar')) return;
    document.body.classList.add('ux-focused');
    const command = document.querySelector('.command-card');
    if(!command) return;
    const bar = document.createElement('section');
    bar.id = 'uxModeBar';
    bar.innerHTML = `<div class="ux-tabs"><button class="ux-tab active" data-mode="search">1. Search</button><button class="ux-tab" data-mode="review">2. Review Leads</button><button class="ux-tab" data-mode="pipeline">3. Pipeline + Memory</button><button class="ux-tab" data-mode="outreach">4. Outreach + HM</button></div><div class="ux-quick-actions"><button class="small-btn" id="uxToggleRole">Show Role Context</button><button class="small-btn" id="uxToggleCopilot">Show Copilot</button><button class="small-btn" onclick="buildSearches()">Build Searches</button><button class="small-btn" onclick="reviewProfile()">Review Profile</button></div>`;
    command.insertAdjacentElement('afterend', bar);
    bar.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
    $('uxToggleRole')?.addEventListener('click',()=>{ document.body.classList.toggle('show-role'); $('uxToggleRole').textContent = document.body.classList.contains('show-role') ? 'Hide Role Context' : 'Show Role Context'; });
    $('uxToggleCopilot')?.addEventListener('click',()=>{ document.body.classList.toggle('show-copilot'); $('uxToggleCopilot').textContent = document.body.classList.contains('show-copilot') ? 'Hide Copilot' : 'Show Copilot'; });
    setMode('search');
  }
  function setMode(mode){
    document.querySelectorAll('.ux-tab').forEach(b=>b.classList.toggle('active', b.dataset.mode===mode));
    const live = $('liveSourceRunner');
    const sourceToggle = document.querySelector('.source-toggle');
    const searchCards = $('searchCards');
    const candidates = $('candidates');
    const memory = $('projectMemoryCard');
    const pipeline = $('pipelineCard');
    const outreach = $('outreach');
    const show = (el,on)=>{ if(el) el.classList.toggle('ux-hide', !on); };
    show(live, mode==='search');
    show(sourceToggle, mode==='search');
    show(searchCards, mode==='search');
    show(candidates, mode==='review' || mode==='outreach');
    show(memory, mode==='pipeline');
    show(pipeline, mode==='pipeline');
    show(outreach, mode==='outreach');
    if(mode==='outreach') document.body.classList.add('show-copilot');
  }
  window.setSourcingOSMode = setMode;

  const originalReviewProfile = window.reviewProfile;
  window.reviewProfile = function reviewProfileUX(){
    const text = cleanText($('commandInput')?.value || '');
    if(!text){ return originalReviewProfile ? originalReviewProfile() : null; }
    const risks = typeof window.piiRisk === 'function' ? window.piiRisk(text) : [];
    if(risks.length){ if(typeof window.setCopilotCard14 === 'function') window.setCopilotCard14('Redaction needed',`Blocked possible sensitive data: ${risks.join(', ')}. Redact before saving or reviewing.`,'high'); else alert('Redact possible sensitive data first.'); return; }
    const r = typeof window.role === 'function' ? window.role() : {mustHaves:[]};
    const projectId = currentProjectId();
    const matched = (r.mustHaves||[]).filter(s => text.toLowerCase().includes(s.toLowerCase()));
    const missing = (r.mustHaves||[]).filter(s => !text.toLowerCase().includes(s.toLowerCase())).slice(0,8);
    const clearanceMentions = typeof window.findClearanceMentions === 'function' ? window.findClearanceMentions(text) : (clearanceRe.test(text) ? ['clearance mention'] : []);
    const confidence = matched.length >= Math.max(3, Math.ceil((r.mustHaves||[]).length*.55)) ? 'High' : matched.length >= 2 ? 'Medium' : 'Review';
    const name = inferCandidateNameFromText(text) || `Candidate ${state.candidates.length+1}`;
    const c = { id:uid('cand'), projectId, source:typeof window.inferSource==='function'?window.inferSource(text):'Manual / pasted profile', name, title:typeof window.inferCandidateTitle==='function'?window.inferCandidateTitle(text):'Role not detected', company:inferCompanyBetter(text), location:typeof window.inferLocation==='function'?window.inferLocation(text):'', notes:'', createdAt:now(), updatedAt:now() };
    state.candidates.unshift(c);
    state.pipelineEntries.unshift({ id:uid('pipe'), candidateId:c.id, projectId, stage:'Reviewing', fitConfidence:confidence, fitScore:confidence, matchedRequirements:matched, missingRequirements:missing, risks:[], clearanceMentions, clearanceCaveat:clearanceMentions.length?'Candidate-stated/public mention only. Not verified clearance.':'', nextAction:'Review manually and verify requirements', lastAction:'Reviewed candidate lead', createdAt:now(), updatedAt:now() });
    buildEvidenceBetter(text, matched).forEach(e=>state.evidenceItems.unshift({ id:uid('ev'), candidateId:c.id, projectId, evidenceType:'profile_text', evidenceText:e, sourceName:c.source, confidence:'medium', caveat:'Evidence from pasted/redacted source. Verify manually.', createdAt:now() }));
    save();
    if(typeof window.render14_5 === 'function') window.render14_5(); else { window.renderCandidateCards?.(); }
    window.setSourcingOSMode?.('review');
    if(typeof window.setCopilotCard14 === 'function') window.setCopilotCard14('Candidate lead reviewed',`Saved ${name}. Matched: ${matched.join(', ') || 'No direct must-have matches detected'}. Missing/verify: ${missing.join(', ') || 'Verify manually'}.`,'medium',['Clearance language, if present, is candidate-stated only and not verification.']);
  };

  window.renderCandidateCards = function renderCandidateCardsUX(){
    const el=$('candidateCards'); if(!el) return;
    const rows=(state.candidates||[]).filter(c=>!state.activeProjectId || (state.pipelineEntries||[]).some(p=>p.candidateId===c.id && p.projectId===state.activeProjectId));
    if(!rows.length){ el.innerHTML='<div class="empty-state">No reviewed leads yet. Use <strong>Search Public Sources</strong>, then click <strong>Review as Candidate</strong>, or paste a redacted profile and click <strong>Review Profile</strong>.</div>'; return; }
    el.innerHTML=rows.map(c=>{
      const fit=fitFor(c.id)||{};
      const ev=(state.evidenceItems||[]).filter(e=>e.candidateId===c.id && (!state.activeProjectId || e.projectId===state.activeProjectId)).slice(0,4);
      return `<article class="lead-card"><div class="card-top"><div><div class="lead-name">${html(c.name || 'Unnamed lead')}</div><div class="lead-meta">${html(c.title || 'Role not detected')} · ${html(c.company || 'Company not detected')}</div></div><span class="badge good">${html(c.source || 'Source')}</span></div><div class="lead-score"><span class="badge ${fit.fitConfidence==='High'?'good':''}">${html(fit.fitConfidence || 'Review')} fit signal</span><span class="badge">${html(fit.stage || 'Reviewing')}</span>${(fit.clearanceMentions||[]).map(x=>`<span class="badge warn">${html(x)} · not verified</span>`).join('')}</div><ul class="lead-evidence">${(ev.length?ev.map(e=>e.evidenceText):['No specific evidence extracted yet.']).map(x=>`<li>${html(x)}</li>`).join('')}</ul><div class="lead-caveat">${fit.clearanceCaveat ? html(fit.clearanceCaveat) : 'Evidence signal only. Verify manually before outreach or submission.'}</div><div class="card-actions"><button class="small-btn primary" onclick="openCandidate360('${c.id}')">Open Candidate 360</button><button class="small-btn" onclick="draftOutreach('${c.id}')">Draft Outreach</button><button class="small-btn" onclick="markCandidate('${c.id}','Reviewing')">Keep</button><button class="small-btn" onclick="markCandidate('${c.id}','Rejected')">Reject</button><button class="small-btn" onclick="copyRaw(candidateSummary14('${c.id}'))">Copy</button></div></article>`;
    }).join('');
  };

  function boot(){ injectModeBar(); if(typeof window.renderCandidateCards === 'function') window.renderCandidateCards(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* SourcingOS 14.5 stabilization layer. Loaded after talent-search.js. */
(function(){
  const UNIFIED_KEY = 'sourcingos_unified_v145';
  const LEGACY_KEY = 'sourcingos_talent_search_v1';
  const WORKBENCH_KEY = 'clearedSourcingOSV9';
  const STAGES = ['Sourced','Saved','Reviewing','Contacted','Responded','Screen','Submitted','Interview','Offer','Hired','Rejected','Nurture','Do Not Contact'];
  const clearanceRe = /(TS\/SCI|Top Secret|Secret|Public Trust|polygraph|CI Poly|FSP|Full Scope|security clearance|active clearance)/i;

  function now(){ return new Date().toISOString(); }
  function uid(prefix='id'){ return `${prefix}_${(crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)+Date.now()).replace(/-/g,'').slice(0,12)}`; }
  function safeParse(raw){ try { return raw ? JSON.parse(raw) : null; } catch(e){ return null; } }
  function ensureArrays(){ ['projects','searches','candidates','outreachDrafts','hmUpdates','feedbackEvents','candidateSources','evidenceItems','pipelineEntries','searchSessions','projectMemories','doNotContact'].forEach(k=>{ if(!Array.isArray(state[k])) state[k]=[]; }); state.version='14.5.0'; state.settings = Object.assign({ recruiterName:'', complianceMode:true }, state.settings || {}); }
  function hasClearance(text=''){ return clearanceRe.test(String(text)); }
  function fitFor(candidateId){ return state.pipelineEntries.find(p => p.candidateId===candidateId && (!state.activeProjectId || p.projectId===state.activeProjectId)) || state.pipelineEntries.find(p=>p.candidateId===candidateId); }
  function currentProjectId(){ if(state.activeProjectId) return state.activeProjectId; saveProject(); return state.activeProjectId; }

  window.saveLocal = function saveLocal(){ ensureArrays(); localStorage.setItem(UNIFIED_KEY, JSON.stringify(state)); localStorage.setItem(LEGACY_KEY, JSON.stringify(state)); };

  window.loadLocal = function loadLocal(){
    ensureArrays();
    const unified = safeParse(localStorage.getItem(UNIFIED_KEY));
    const legacy = safeParse(localStorage.getItem(LEGACY_KEY));
    const workbench = safeParse(localStorage.getItem(WORKBENCH_KEY));
    if(unified) Object.assign(state, unified);
    else if(legacy) Object.assign(state, legacy);
    ensureArrays();
    migrateOldCandidates();
    if(workbench && Array.isArray(workbench.projects)) importWorkbenchProjects(workbench);
    saveLocal();
    render14_5();
  };

  function migrateOldCandidates(){
    state.candidates.forEach(c=>{
      if(!state.pipelineEntries.some(p=>p.candidateId===c.id)){
        state.pipelineEntries.push({ id:uid('pipe'), candidateId:c.id, projectId:c.projectId || state.activeProjectId || '', stage: mapStage(c.stage || 'Reviewing'), fitConfidence:c.confidence || 'Medium', fitScore:c.confidence || 'Medium', matchedRequirements:c.matched || [], missingRequirements:c.missing || [], clearanceMentions:c.clearanceMentions || [], clearanceCaveat:(c.clearanceMentions||[]).length?'Candidate-stated/public mention only. Not verified clearance.':'', nextAction:'Review manually', lastAction:'Migrated from 14.4 candidate card', createdAt:c.createdAt || now(), updatedAt:now() });
      }
      (c.evidence||[]).forEach(e=>{ if(!state.evidenceItems.some(x=>x.candidateId===c.id && x.evidenceText===e)) state.evidenceItems.push({id:uid('ev'), candidateId:c.id, projectId:c.projectId || state.activeProjectId || '', evidenceType:'profile_text', evidenceText:String(e), sourceName:c.source || 'Migrated profile', confidence:'medium', caveat:'Migrated evidence. Verify manually.', createdAt:now()}); });
    });
  }
  function importWorkbenchProjects(w){
    w.projects.forEach(p=>{ const id=p.id || p.projectId || uid('proj'); if(!state.projects.some(x=>x.id===id)) state.projects.push({ id, name:p.name || p.roleName || 'Imported workbench project', role:{ roleTitle:p.roleName || p.name || '', mustHaves:splitList(p.must||''), niceHaves:[], clearance:p.clearance || 'Non-cleared / not required', location:p.location || '', targetCompanies:splitList(p.companies||''), feedback:p.notes || '' }, createdAt:p.createdAt || now(), updatedAt:p.updatedAt || now(), legacySource:'clearedSourcingOSV9' }); });
  }
  function mapStage(s){ if(s==='Shortlisted') return 'Reviewing'; if(s==='Not Relevant') return 'Rejected'; return STAGES.includes(s) ? s : 'Reviewing'; }

  window.saveProject = function saveProject(){
    ensureArrays();
    const r = role();
    const idv = state.activeProjectId || uid('proj');
    const existing = state.projects.find(p=>p.id===idv);
    const project = Object.assign({}, existing || {}, { id:idv, name:r.roleTitle || 'Untitled sourcing project', role:r, updatedAt:now(), createdAt:(existing && existing.createdAt) || now() });
    const idx = state.projects.findIndex(p=>p.id===idv);
    if(idx>=0) state.projects[idx]=project; else state.projects.unshift(project);
    state.activeProjectId=idv;
    saveLocal(); render14_5(); toast('Project saved');
  };

  window.renderSearchCards = function renderSearchCards(cards){
    const el=$('searchCards'); if(!el) return;
    const rows = cards || state.searches.filter(s=>!state.activeProjectId || s.projectId===state.activeProjectId).slice(-12);
    if(!rows.length){ el.innerHTML='<div class="empty-state">Build searches to see platform cards.</div>'; return; }
    el.innerHTML = rows.map(c=>`<article class="search-card"><div class="card-top"><div><div class="platform-name">${esc(c.platform)}</div><div class="subtle">${esc(c.lane || 'Search lane')} · copy/paste into native platform</div></div><span class="badge ${c.source==='clearancejobs'?'warn':'good'}">${esc(c.source)}</span></div><pre>${esc(c.query)}</pre><div class="badge-row">${(c.filters||[]).map(f=>`<span class="badge">${esc(f)}</span>`).join('')}<span class="badge warn">No scraping</span></div><p class="subtle">${esc(c.why)}</p><div class="card-actions"><button class="small-btn primary" onclick="copySearch14('${c.id}')">Copy</button><button class="small-btn" onclick="markSearchTried14('${c.id}')">Mark Tried</button><button class="small-btn" onclick="saveSearchMemory14('${c.id}')">Save Memory</button><button class="small-btn" onclick="explainSearch14('${c.id}')">Explain</button></div></article>`).join('');
  };

  const oldMakeSearchCard = window.makeSearchCard || makeSearchCard;
  window.buildSearches = function buildSearches(){
    const r=role();
    if(!r.roleTitle && !r.mustHaves.length){ setCopilotCard14('Need role context','Add a role title or paste a JD/request first, then I can build platform-specific searches.','high'); return; }
    const projectId=currentProjectId();
    const cards=selectedSources().map(src=>Object.assign({ id:uid('search'), projectId, createdAt:now(), lane:laneFor(src), tried:false }, oldMakeSearchCard(src,r)));
    state.searches = state.searches.filter(s=>s.projectId!==projectId).concat(cards);
    state.searchSessions.unshift({id:uid('session'), projectId, source:'generated_platform_searches', query:r.roleTitle, platforms:cards.map(c=>c.platform), createdAt:now()});
    addProjectMemory14('search_lane',`Built ${cards.length} platform searches for ${r.roleTitle || 'current req'}.`,'buildSearches',false);
    saveLocal(); render14_5(); setCopilotCard14('Platform searches built',`Built ${cards.length} platform search cards. Copy these into native platforms. SourcingOS does not scrape or run searches inside paid/restricted tools.`,'high',['Run LinkedIn, ClearanceJobs, Indeed, and Avature manually inside approved systems.']);
  };
  function laneFor(src){ return ({linkedin:'LinkedIn recruiter lane',clearancejobs:'ClearanceJobs compact keyword lane',indeed:'Indeed broad resume lane',github:'Public technical evidence lane',xray:'Google X-Ray lane',avature:'Avature rediscovery lane'})[src] || 'Search lane'; }

  window.reviewProfile = function reviewProfile(){
    const text=clean($('commandInput')?.value || ''); if(!text){ setCopilotCard14('Paste profile first','Paste redacted profile/resume notes into the command bar first.','high'); return; }
    if(blockPii14(text)) return;
    const r=role(), projectId=currentProjectId();
    const matched=r.mustHaves.filter(s=>text.toLowerCase().includes(s.toLowerCase()));
    const missing=r.mustHaves.filter(s=>!text.toLowerCase().includes(s.toLowerCase())).slice(0,8);
    const clearanceMentions=findClearanceMentions(text);
    const confidence=matched.length>=Math.max(3,Math.ceil(r.mustHaves.length*.55))?'High':matched.length>=2?'Medium':'Low';
    const c={ id:uid('cand'), projectId, source:inferSource(text), name:'Candidate '+(state.candidates.length+1), title:inferCandidateTitle(text), company:inferCandidateCompany(text), location:inferLocation(text), notes:'', createdAt:now(), updatedAt:now() };
    state.candidates.unshift(c);
    state.pipelineEntries.unshift({ id:uid('pipe'), candidateId:c.id, projectId, stage:'Reviewing', fitConfidence:confidence, fitScore:confidence, matchedRequirements:matched, missingRequirements:missing, risks:[], clearanceMentions, clearanceCaveat:clearanceMentions.length?'Candidate-stated/public mention only. Not verified clearance.':'', nextAction:'Review manually and verify requirements', lastAction:'Reviewed redacted profile text', createdAt:now(), updatedAt:now() });
    buildEvidence(text, matched).forEach(e=>state.evidenceItems.unshift({ id:uid('ev'), candidateId:c.id, projectId, evidenceType:'profile_text', evidenceText:e, sourceName:c.source, confidence:'medium', caveat:'Evidence from pasted/redacted profile text. Verify manually.', createdAt:now() }));
    saveLocal(); render14_5(); setCopilotCard14('Profile reviewed',`Saved ${c.name}. Matched: ${matched.join(', ') || 'No direct must-have matches detected'}. Missing/verify: ${missing.join(', ') || 'Verify manually'}.`,'medium',['Clearance language, if present, is candidate-stated only and not verification.']);
  };

  window.renderCandidateCards = function renderCandidateCards(){
    const el=$('candidateCards'); if(!el) return;
    const rows=state.candidates.filter(c=>!state.activeProjectId || state.pipelineEntries.some(p=>p.candidateId===c.id && p.projectId===state.activeProjectId));
    if(!rows.length){ el.innerHTML='<div class="empty-state">Paste redacted profile/resume text into the command bar and click <strong>Review Profile</strong>.</div>'; return; }
    el.innerHTML=rows.map(c=>{ const fit=fitFor(c.id)||{}; const ev=state.evidenceItems.filter(e=>e.candidateId===c.id && (!state.activeProjectId || e.projectId===state.activeProjectId)).slice(0,4); return `<article class="candidate-card"><div class="card-top"><div><div class="platform-name">${esc(c.name)}</div><div class="subtle">${esc(c.title)} · ${esc(c.company)}</div></div><span class="badge good">${esc(c.source)}</span></div><div class="badge-row"><span class="badge">${esc(fit.fitConfidence || 'Review')} fit signal</span><span class="badge">${esc(fit.stage || 'Reviewing')}</span>${(fit.clearanceMentions||[]).map(x=>`<span class="badge warn">${esc(x)} · candidate-stated/not verified</span>`).join('')}</div><strong>Matched skills</strong><div class="badge-row">${((fit.matchedRequirements||[]).length?fit.matchedRequirements:['No direct must-have matches detected']).map(x=>`<span class="badge good">${esc(x)}</span>`).join('')}</div><strong>Missing / verify</strong><div class="badge-row">${((fit.missingRequirements||[]).length?fit.missingRequirements:['Verify details manually']).map(x=>`<span class="badge red">${esc(x)}</span>`).join('')}</div><strong>Evidence</strong><ul class="evidence-list">${(ev.length?ev.map(e=>e.evidenceText):['No specific evidence extracted from pasted text.']).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="card-actions"><button class="small-btn primary" onclick="openCandidate360('${c.id}')">Candidate 360</button><button class="small-btn" onclick="draftOutreach('${c.id}')">Draft Outreach</button><button class="small-btn" onclick="markCandidate('${c.id}','Reviewing')">Shortlist</button><button class="small-btn" onclick="markCandidate('${c.id}','Rejected')">Reject</button><button class="small-btn" onclick="copyRaw(candidateSummary14('${c.id}'))">Copy Summary</button></div></article>`; }).join('');
  };

  window.markCandidate = function markCandidate(candidateId, stage){
    stage = STAGES.includes(stage) ? stage : 'Reviewing';
    if(!confirm(`Mark this candidate as "${stage}"?`)) return;
    let fit=fitFor(candidateId);
    if(!fit){ fit={id:uid('pipe'), candidateId, projectId:currentProjectId(), createdAt:now()}; state.pipelineEntries.unshift(fit); }
    fit.stage=stage; fit.lastAction=`Stage changed to ${stage}`; fit.updatedAt=now();
    state.feedbackEvents.unshift({id:uid('feedback'), projectId:fit.projectId, candidateId, eventType:'stage_change', eventText:`Stage changed to ${stage}`, createdAt:now()});
    saveLocal(); render14_5(); toast(stage);
  };

  window.draftOutreach = function draftOutreach(candidateId){
    const r=role(); const c=candidateId ? state.candidates.find(x=>x.id===candidateId) : state.candidates[0];
    if(!c){ $('outreachText').textContent='Review or save a profile first, then draft outreach.'; return; }
    const fit=fitFor(c.id)||{}; const name=state.settings.recruiterName || '[Your name]'; const matched=(fit.matchedRequirements||[]).slice(0,3).join(', ') || 'relevant technical work';
    const text=`Hi [Name],\n\nI came across your background and thought it may line up with a ${r.roleTitle || 'role'} I am supporting. I noticed evidence around ${matched}${c.company !== 'Company not detected' ? ' and your work connected to ' + c.company : ''}.\n\nI do not want to assume fit from keywords, but it looked worth a quick conversation. Open to comparing the role against your interests, location/work model, and any required verification steps?\n\nBest,\n${name}`;
    $('outreachText').textContent=text; state.outreachDrafts.unshift({id:uid('outreach'), candidateId:c.id, projectId:fit.projectId || state.activeProjectId, text, createdAt:now(), approvalStatus:'draft'}); saveLocal(); setCopilotCard14('Outreach drafted','Drafted outreach from evidence only. Copy it manually after editing.','medium',['Draft only. Do not auto-send. Does not claim verified clearance.']);
  };

  window.saveLearning = function saveLearning(){ const note=clean($('commandInput')?.value || $('feedback')?.value || ''); if(!note){ setCopilotCard14('Type a learning first','Type feedback or a learning into the command bar first.','high'); return; } addProjectMemory14('hm_preference',note,'saveLearning'); if($('feedback')) $('feedback').value=($('feedback').value?$('feedback').value+'\n':'')+note; saveLocal(); render14_5(); toast('Learning saved'); };

  window.exportJSONBackup = function exportJSONBackup(){ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); downloadBlob14(blob,`sourcingos-14-5-backup-${new Date().toISOString().slice(0,10)}.json`); };
  window.exportCandidateCSV = function exportCandidateCSV(){ const rows=[['Candidate','Project','Source','Stage','Fit','Matched','Missing','Clearance Caveat','Next Action','Updated']]; state.pipelineEntries.forEach(p=>{ const c=state.candidates.find(x=>x.id===p.candidateId)||{}; const proj=state.projects.find(x=>x.id===p.projectId)||{}; rows.push([c.name||'',proj.name||'',c.source||'',p.stage||'',p.fitConfidence||'',(p.matchedRequirements||[]).join('; '),(p.missingRequirements||[]).join('; '),p.clearanceCaveat||'',p.nextAction||'',p.updatedAt||'']); }); const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n'); downloadBlob14(new Blob([csv],{type:'text/csv'}),'sourcingos-pipeline.csv'); };
  window.importJSONBackup = function importJSONBackup(){ const input=document.createElement('input'); input.type='file'; input.accept='.json,application/json'; input.onchange=e=>{ const file=e.target.files[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{ const parsed=safeParse(reader.result); if(!parsed){ toast('Import failed'); return; } if(!confirm('Import this backup and replace current SourcingOS local state?')) return; Object.keys(state).forEach(k=>delete state[k]); Object.assign(state,parsed); ensureArrays(); saveLocal(); render14_5(); toast('Backup imported'); }; reader.readAsText(file); }; input.click(); };
  window.runDataHealthCheck = function runDataHealthCheck(){ const issues=[]; state.pipelineEntries.forEach(p=>{ if(!state.candidates.some(c=>c.id===p.candidateId)) issues.push(`Pipeline entry missing candidate: ${p.id}`); if((p.clearanceMentions||[]).length && !p.clearanceCaveat) issues.push(`Missing clearance caveat: ${p.id}`); }); setCopilotCard14('Data health check',issues.length?issues.join('\n'):'No obvious local data issues found.','high',['This checks local browser state only.']); };

  window.openCandidate360 = function openCandidate360(candidateId){ const c=state.candidates.find(x=>x.id===candidateId); if(!c) return; const fit=fitFor(candidateId)||{}; const ev=state.evidenceItems.filter(e=>e.candidateId===candidateId); const m=ensureModal14(); m.innerHTML=`<div class="modal-card"><div class="section-title"><span>Candidate 360</span><button class="linkbtn" onclick="closeCandidate360()">Close</button></div><h2>${esc(c.name)}</h2><p class="subtle">${esc(c.title)} · ${esc(c.company)} · ${esc(c.source)}</p><div class="modal-grid"><div><h3>Global identity</h3><p><strong>Location:</strong> ${esc(c.location || 'Unknown')}</p><label>Notes</label><textarea id="candidateNoteBox">${esc(c.notes || '')}</textarea><button class="small-btn primary" onclick="saveCandidateNote14('${c.id}')">Save Note</button></div><div><h3>Project-specific fit</h3><div class="badge-row"><span class="badge">${esc(fit.stage || 'Reviewing')}</span><span class="badge good">${esc(fit.fitConfidence || 'Review')} signal</span>${(fit.clearanceMentions||[]).map(x=>`<span class="badge warn">${esc(x)} · not verified</span>`).join('')}</div><p><strong>Matched:</strong> ${(fit.matchedRequirements||[]).map(esc).join(', ') || 'None detected'}</p><p><strong>Missing / verify:</strong> ${(fit.missingRequirements||[]).map(esc).join(', ') || 'Verify manually'}</p></div></div><h3>Evidence</h3><ul class="evidence-list">${(ev.length?ev.map(e=>`${e.evidenceText} (${e.sourceName || 'source'})`):['No evidence yet.']).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p class="subtle">Public-source evidence is not verification. Clearance mentions are candidate-stated/public breadcrumbs only.</p></div>`; m.classList.add('show'); };
  window.closeCandidate360 = function closeCandidate360(){ $('candidate360Modal')?.classList.remove('show'); };
  window.saveCandidateNote14 = function saveCandidateNote14(candidateId){ const c=state.candidates.find(x=>x.id===candidateId); if(!c) return; c.notes=$('candidateNoteBox')?.value || ''; c.updatedAt=now(); saveLocal(); toast('Note saved'); };
  window.candidateSummary14 = function candidateSummary14(candidateId){ const c=state.candidates.find(x=>x.id===candidateId); if(!c) return ''; const fit=fitFor(candidateId)||{}; const ev=state.evidenceItems.filter(e=>e.candidateId===candidateId).slice(0,5).map(e=>e.evidenceText); return `${c.name}\nSource: ${c.source}\nCurrent: ${c.title} · ${c.company}\nStage: ${fit.stage || 'Reviewing'}\nFit signal: ${fit.fitConfidence || 'Review'}\nMatched: ${(fit.matchedRequirements||[]).join(', ')}\nMissing/verify: ${(fit.missingRequirements||[]).join(', ')}\nClearance mention: ${(fit.clearanceMentions||[]).join(', ') || 'None'} (candidate-stated/not verified)\nEvidence:\n- ${ev.join('\n- ')}`; };

  window.copySearch14=function(id){ const s=state.searches.find(x=>x.id===id); if(s) copyRaw(s.query || ''); };
  window.markSearchTried14=function(id){ const s=state.searches.find(x=>x.id===id); if(!s) return; const note=prompt('Result count or quality note?'); s.tried=true; s.resultCount=note || s.resultCount; s.updatedAt=now(); addProjectMemory14('search_tried',`Tried ${s.platform}: ${s.query}${note?' | '+note:''}`,'markSearchTried'); saveLocal(); render14_5(); };
  window.saveSearchMemory14=function(id){ const s=state.searches.find(x=>x.id===id); if(!s) return; addProjectMemory14('saved_search',`${s.platform} / ${s.lane || 'lane'}: ${s.query}`,'saveSearchMemory'); saveLocal(); renderProjectMemory14(); toast('Saved to memory'); };
  window.explainSearch14=function(id){ const s=state.searches.find(x=>x.id===id); if(s) setCopilotCard14(`${s.platform} search explained`,`Lane: ${s.lane || 'Search lane'}\n\nWhy this search works:\n${s.why}\n\nRecommended filters:\n- ${(s.filters||[]).join('\n- ')}`,'high',['Tune based on result quality and HM feedback.']); };

  function addProjectMemory14(type,text,source='manual',persist=true){ if(!text) return; state.projectMemories.unshift({id:uid('mem'),projectId:state.activeProjectId || '',memoryType:type,memoryText:text,source,confidence:'medium',active:true,createdAt:now(),updatedAt:now()}); if(persist) saveLocal(); }
  function renderProjectMemory14(){ const el=$('projectMemoryList'); if(!el) return; const rows=state.projectMemories.filter(m=>!state.activeProjectId || m.projectId===state.activeProjectId).slice(0,8); el.innerHTML=rows.length?rows.map(m=>`<div class="memory-row"><span class="badge">${esc(m.memoryType)}</span><p>${esc(m.memoryText)}</p></div>`).join(''):'<p class="subtle">No project memory yet. Save HM feedback, tried searches, or candidate patterns.</p>'; }
  function renderPipelineTable14(){ const el=$('pipelineTable'); if(!el) return; const rows=state.pipelineEntries.filter(p=>!state.activeProjectId || p.projectId===state.activeProjectId); if(!rows.length){ el.innerHTML='<div class="empty-state">No pipeline entries yet. Review a candidate to start the pipeline.</div>'; return; } el.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Candidate</th><th>Source</th><th>Stage</th><th>Fit</th><th>Matched</th><th>Missing</th><th>Clearance</th><th>Next action</th></tr></thead><tbody>${rows.map(p=>{ const c=state.candidates.find(x=>x.id===p.candidateId)||{}; return `<tr><td>${esc(c.name||'Candidate')}</td><td>${esc(c.source||'')}</td><td>${esc(p.stage||'')}</td><td>${esc(p.fitConfidence||'')}</td><td>${esc((p.matchedRequirements||[]).join(', '))}</td><td>${esc((p.missingRequirements||[]).join(', '))}</td><td>${p.clearanceCaveat?'<span class="badge warn">Not verified</span>':''}</td><td>${esc(p.nextAction||'')}</td></tr>`;}).join('')}</tbody></table></div>`; }
  function setCopilotCard14(title,content,confidence='medium',caveats=[]){ const el=$('copilotOutput'); if(!el) return; el.innerHTML=`<div class="copilot-card"><div class="section-title"><span>${esc(title)}</span><span class="badge ${confidence==='high'?'good':confidence==='low'?'warn':''}">${esc(confidence)} confidence</span></div><pre>${esc(content)}</pre>${caveats.length?`<ul class="evidence-list">${caveats.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`:''}</div>`; }
  function injectUi14(){ if($('projectMemoryCard')) return; const sidebar=document.querySelector('.sidebar'); if(sidebar){ const controls=document.createElement('div'); controls.className='sidebar-card'; controls.innerHTML=`<div class="tiny-label">14.5 controls</div><label>Your name</label><input id="recruiterName" placeholder="For outreach drafts"><div class="mini-grid"><button class="btn small secondary" onclick="exportJSONBackup()">Export JSON</button><button class="btn small secondary" onclick="importJSONBackup()">Import JSON</button><button class="btn small secondary" onclick="exportCandidateCSV()">Export CSV</button><button class="btn small secondary" onclick="runDataHealthCheck()">Health</button></div>`; sidebar.insertBefore(controls, sidebar.querySelector('.muted-card')); }
    const center=document.querySelector('.center-panel'); if(center){ const mem=document.createElement('div'); mem.className='card'; mem.id='projectMemoryCard'; mem.innerHTML=`<div class="section-title"><span>Project memory</span><button class="linkbtn" onclick="saveLearning()">Save learning</button></div><div id="projectMemoryList"></div>`; center.appendChild(mem); const pipe=document.createElement('div'); pipe.className='card'; pipe.id='pipelineCard'; pipe.innerHTML=`<div class="section-title"><span>Pipeline table</span><button class="linkbtn" onclick="exportCandidateCSV()">Export CSV</button></div><div id="pipelineTable"></div>`; center.appendChild(pipe); }
    document.addEventListener('input',e=>{ if(e.target?.id==='recruiterName'){ state.settings.recruiterName=e.target.value; saveLocal(); } }); }
  function render14_5(){ ensureArrays(); renderProjectDropdown(); if($('recruiterName')) $('recruiterName').value=state.settings.recruiterName || ''; renderSearchCards(); renderCandidateCards(); renderProjectMemory14(); renderPipelineTable14(); updateIntent(); }
  function ensureModal14(){ let m=$('candidate360Modal'); if(!m){ m=document.createElement('div'); m.id='candidate360Modal'; m.className='modal'; document.body.appendChild(m); } return m; }
  function blockPii14(text){ const risks=piiRisk(text); if(!risks.length) return false; setCopilotCard14('Redaction needed',`Blocked possible sensitive data: ${risks.join(', ')}. Redact before saving or reviewing.`,'high',['Do not store SSNs, DOBs, personal contact info, CUI, classified, or export-controlled content.']); toast('Redact first'); return true; }
  function downloadBlob14(blob,filename){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href); }
  function setUp(){ injectUi14(); loadLocal(); window.SourcingOS14_5={state, addProjectMemory:addProjectMemory14, render:render14_5}; setCopilotCard14('SourcingOS 14.5 ready','Unified 14.5 stabilization is active: project memory, pipeline table, Candidate 360, export/import, confirmation gates, and draft-only outreach.','high',['Use restricted platforms manually. Clearance mentions are not verification.']); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',setUp); else setUp();
})();

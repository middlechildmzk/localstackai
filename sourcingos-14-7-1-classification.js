/* SourcingOS 14.7.1 + 14.7.2: classified source sweep, status cards, structured review handoff. */
(function(){
  const RESULT_CLASSES = ['candidate_lead','evidence_signal','repo_project','package_signal','research_publication','community_discussion','company_signal','license_record','source_note'];
  const MAX_TOTAL = 60;
  const $ = id => document.getElementById(id);
  const clean = s => String(s || '').replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' ').trim();
  const esc = s => String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const uid = p => `${p}_${(crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)+Date.now()).replace(/-/g,'').slice(0,12)}`;
  const now = () => new Date().toISOString();
  const words = s => clean(s).split(/[,;\n\s]+/).map(x => x.trim()).filter(x => x.length > 1);
  const compact = (q,n=10) => words(q).slice(0,n).join(' ');
  const clearanceRe = /(TS\/SCI|Top Secret|Secret|Public Trust|polygraph|CI Poly|FSP|Full Scope|security clearance|active clearance)/i;

  const SOURCE_LABELS = {
    github_users: 'GitHub Users',
    github_repos: 'GitHub Repos',
    stackoverflow: 'Stack Overflow',
    hackernews: 'Hacker News',
    openalex: 'OpenAlex',
    npm: 'npm',
    huggingface: 'Hugging Face'
  };

  let sweep = {
    running: false,
    query: '',
    statuses: {},
    errors: {},
    counts: {},
    startedAt: '',
    completedAt: ''
  };

  function app(){ return window.SourcingOS && window.SourcingOS.state ? window.SourcingOS : null; }
  function state(){ return app()?.state; }
  function save(){ const st = state(); if(st) localStorage.setItem('sourcingos_unified_v146', JSON.stringify(st)); }
  function toast(msg){ let el=$('toast'); if(!el){ el=document.createElement('div'); el.id='toast'; el.className='toast'; document.body.appendChild(el); } el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),1800); }
  function roleQuery(){
    const st = state();
    const command = clean($('commandInput')?.value || '');
    if(command.length > 3) return command;
    const r = st?.role || {};
    return clean([r.roleTitle, (r.mustHaves||[]).join(' '), r.location, (r.targetCompanies||[]).join(' ')].join(' '));
  }
  function projectId(){
    const st = state();
    if(!st) return '';
    if(st.activeProjectId) return st.activeProjectId;
    const p = {id:uid('proj'), name:st.role?.roleTitle || 'Untitled sourcing project', role:st.role || {}, createdAt:now(), updatedAt:now()};
    st.projects = Array.isArray(st.projects) ? st.projects : [];
    st.projects.unshift(p);
    st.activeProjectId = p.id;
    save();
    return p.id;
  }
  function matchedTerms(obj){
    const st = state();
    const terms = [...(st?.role?.mustHaves || []), ...(st?.role?.niceHaves || [])].filter(Boolean);
    const blob = JSON.stringify(obj).toLowerCase();
    return [...new Set(terms.filter(t => blob.includes(String(t).toLowerCase())))];
  }
  function caveatsFor(obj, resultClass){
    const caveats = ['Public-source data only. Verify manually.'];
    if(resultClass !== 'candidate_lead') caveats.push('Evidence signal. Do not treat as a candidate unless anchored to a clear person profile.');
    if(clearanceRe.test(JSON.stringify(obj))) caveats.push('Candidate-stated/public clearance mention only. Not verified clearance.');
    return caveats;
  }
  function confidenceFor(obj, resultClass){
    const m = matchedTerms(obj).length;
    let c = resultClass === 'candidate_lead' ? 0.62 : 0.42;
    c += Math.min(0.25, m * 0.05);
    if(obj.url) c += 0.05;
    if(obj.displayName || obj.handle) c += 0.04;
    return Math.max(0, Math.min(0.95, Number(c.toFixed(2))));
  }
  function canonical(x){
    const resultClass = RESULT_CLASSES.includes(x.resultClass) ? x.resultClass : 'evidence_signal';
    const base = {
      id: x.id || uid('result'),
      resultClass,
      source: x.source || 'unknown',
      sourceType: x.sourceType || 'public_api',
      sourceId: String(x.sourceId || x.handle || x.url || x.title || ''),
      displayName: clean(x.displayName || x.name || x.author || x.handle || x.title || 'Unnamed Result'),
      handle: clean(x.handle || ''),
      title: clean(x.title || ''),
      organization: clean(x.organization || x.company || ''),
      location: clean(x.location || ''),
      url: x.url || '',
      snippet: clean(x.snippet || x.bio || ''),
      evidence: Array.isArray(x.evidence) ? x.evidence.filter(Boolean).slice(0,8) : [],
      matchedTerms: [],
      identitySignals: Array.isArray(x.identitySignals) ? x.identitySignals : [],
      fitSignals: Array.isArray(x.fitSignals) ? x.fitSignals : [],
      confidence: 0,
      caveats: [],
      raw: x.raw || {},
      createdAt: now(),
      projectId: projectId()
    };
    base.matchedTerms = matchedTerms(base);
    base.confidence = confidenceFor(base, resultClass);
    base.caveats = caveatsFor(base, resultClass);
    if(clearanceRe.test(JSON.stringify(base))) base.clearanceMentions = ['clearance mention'];
    else base.clearanceMentions = [];
    return base;
  }
  function dedupe(results){
    const seen = new Set();
    return results.filter(r => {
      const key = [r.source, r.url || r.sourceId || r.displayName].join('|').toLowerCase();
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function setStatus(src, status, count=0, err=''){
    sweep.statuses[src] = status;
    sweep.counts[src] = count;
    if(err) sweep.errors[src] = err;
    renderIfLeads();
  }
  function renderIfLeads(){ if(state()?.mode === 'leads') renderClassifiedLeads(); }

  async function withTimeout(promise, ms=12000){
    let timer;
    const timeout = new Promise((_, reject) => timer = setTimeout(() => reject(new Error('timeout')), ms));
    try { return await Promise.race([promise, timeout]); }
    finally { clearTimeout(timer); }
  }

  async function fetchSource(src, fn, q){
    setStatus(src, 'loading', 0);
    try {
      const rows = await withTimeout(fn(q), 14000);
      const list = (rows || []).map(canonical);
      setStatus(src, list.length ? 'success' : 'empty', list.length);
      return list;
    } catch(err){
      const message = String(err && err.message || err || 'error');
      setStatus(src, /rate|limit|403|429/i.test(message) ? 'rate_limited' : 'error', 0, message);
      return [];
    }
  }

  async function githubUsers(q){
    const res = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(compact(q,8)+' in:login in:name in:bio')}&per_page=12`, {headers:{Accept:'application/vnd.github+json'}});
    if(!res.ok) throw new Error(`GitHub users ${res.status}`);
    const data = await res.json();
    const users = await Promise.all((data.items||[]).slice(0,10).map(async u => {
      try {
        const r = await fetch(u.url, {headers:{Accept:'application/vnd.github+json'}});
        if(!r.ok) throw new Error('profile fetch failed');
        const d = await r.json();
        return {source:'github', sourceType:'public_api', sourceId:String(u.id), resultClass:'candidate_lead', displayName:d.name || u.login, handle:u.login, title:'Public developer profile', organization:d.company || 'GitHub', location:d.location || '', url:u.html_url, snippet:d.bio || '', evidence:[d.bio, d.company?`Company: ${d.company}`:'', d.location?`Location: ${d.location}`:'', d.public_repos?`${d.public_repos} public repos`:'', d.followers?`${d.followers} followers`:''].filter(Boolean), identitySignals:[`github:${u.login}`], raw:d};
      } catch(e){ return null; }
    }));
    return users.filter(Boolean);
  }
  async function githubRepos(q){
    const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(compact(q,8))}&sort=stars&order=desc&per_page=10`, {headers:{Accept:'application/vnd.github+json'}});
    if(!res.ok) throw new Error(`GitHub repos ${res.status}`);
    const data = await res.json();
    return (data.items||[]).slice(0,10).map(repo => ({source:'github',sourceType:'public_api',sourceId:String(repo.id),resultClass:'repo_project',displayName:repo.full_name,title:'Repository / project evidence',organization:repo.owner?.login || 'GitHub',url:repo.html_url,snippet:repo.description || '',evidence:[repo.description,repo.language?`Language: ${repo.language}`:'',repo.stargazers_count?`${repo.stargazers_count} stars`:'',repo.owner?.login?`Owner: ${repo.owner.login}`:''].filter(Boolean),fitSignals:[repo.language || ''].filter(Boolean),raw:repo}));
  }
  async function stackoverflow(q){
    const res = await fetch(`https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(compact(q,10))}&site=stackoverflow&pagesize=12`);
    if(!res.ok) throw new Error(`Stack Overflow ${res.status}`);
    const data = await res.json();
    return (data.items||[]).slice(0,12).map(item => ({source:'stackoverflow',sourceType:'public_api',sourceId:String(item.question_id),resultClass:'community_discussion',displayName:item.owner?.display_name || item.title,title:item.title || 'Technical Q&A evidence',organization:'Stack Overflow',url:item.link,snippet:'Technical Q&A result. Use as evidence or contributor lead after manual review.',evidence:[item.owner?.display_name?`Author: ${item.owner.display_name}`:'',item.tags?.length?`Tags: ${item.tags.slice(0,6).join(', ')}`:'',typeof item.score==='number'?`Score: ${item.score}`:'',typeof item.answer_count==='number'?`${item.answer_count} answers`:''].filter(Boolean),identitySignals:item.owner?.user_id?[`stackoverflow:${item.owner.user_id}`]:[],raw:item}));
  }
  async function hackernews(q){
    const res = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(compact(q,8))}&tags=story&hitsPerPage=10`);
    if(!res.ok) throw new Error(`HN ${res.status}`);
    const data = await res.json();
    return (data.hits||[]).slice(0,10).map(h => ({source:'hackernews',sourceType:'public_api',sourceId:String(h.objectID),resultClass:'community_discussion',displayName:h.author || h.title || 'HN result',title:h.title || h.story_title || 'HN story/discussion',organization:'Hacker News',url:h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,snippet:'Community discussion/source signal. Review manually.',evidence:[h.author?`Author: ${h.author}`:'',h.points?`${h.points} points`:'',h.num_comments?`${h.num_comments} comments`:''].filter(Boolean),identitySignals:h.author?[`hn:${h.author}`]:[],raw:h}));
  }
  async function openalex(q){
    const res = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(compact(q,10))}&per-page=10`);
    if(!res.ok) throw new Error(`OpenAlex ${res.status}`);
    const data = await res.json();
    return (data.results||[]).slice(0,10).map(w => {
      const authors = (w.authorships||[]).slice(0,4).map(a=>a.author?.display_name).filter(Boolean);
      return {source:'openalex',sourceType:'public_api',sourceId:String(w.id || ''),resultClass:'research_publication',displayName:authors[0] || w.title || 'Research work',title:w.title || 'Research/publication evidence',organization:authors.join(', ') || 'OpenAlex',url:w.doi?`https://doi.org/${String(w.doi).replace('https://doi.org/','')}`:w.id,snippet:'Research/publication evidence. Save as evidence unless manually converted after review.',evidence:[authors.length?`Authors: ${authors.join(', ')}`:'',w.publication_year?`Year: ${w.publication_year}`:'',w.cited_by_count?`${w.cited_by_count} citations`:''].filter(Boolean),identitySignals:authors.map(a=>`author:${a}`),raw:w};
    });
  }
  async function npmSearch(q){
    const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(compact(q,8))}&size=10`);
    if(!res.ok) throw new Error(`npm ${res.status}`);
    const data = await res.json();
    return (data.objects||[]).slice(0,10).map(o => {
      const user = o.package.publisher?.username || o.package.maintainers?.[0]?.username || '';
      return {source:'npm',sourceType:'public_api',sourceId:o.package.name,resultClass:user?'candidate_lead':'package_signal',displayName:user || o.package.name,handle:user,title:user?'Open-source maintainer':'Package evidence',organization:'npm',url:user?`https://www.npmjs.com/~${user}`:(o.package.links?.npm || `https://www.npmjs.com/package/${o.package.name}`),snippet:o.package.description || '',evidence:[`Package: ${o.package.name}`,o.package.description || '',o.package.version?`Version: ${o.package.version}`:'',o.score?.final?`Score: ${Math.round(o.score.final*100)}%`:''].filter(Boolean),identitySignals:user?[`npm:${user}`]:[],raw:o};
    });
  }
  async function huggingface(q){
    const res = await fetch(`https://huggingface.co/api/models?search=${encodeURIComponent(compact(q,8))}&limit=10`);
    if(!res.ok) throw new Error(`Hugging Face ${res.status}`);
    const data = await res.json();
    return (Array.isArray(data)?data:[]).slice(0,10).map(m => ({source:'huggingface',sourceType:'public_api',sourceId:String(m.id),resultClass:m.author?'candidate_lead':'evidence_signal',displayName:m.author || m.id,title:m.author?'AI/ML model author':'AI/ML model evidence',organization:'Hugging Face',url:m.author?`https://huggingface.co/${m.author}`:`https://huggingface.co/${m.id}`,snippet:m.pipeline_tag?`Pipeline: ${m.pipeline_tag}`:'Hugging Face model/public work signal.',evidence:[`Model: ${m.id}`,m.pipeline_tag?`Pipeline: ${m.pipeline_tag}`:'',m.downloads?`${m.downloads} downloads`:'',m.likes?`${m.likes} likes`:'',m.tags?.length?`Tags: ${m.tags.slice(0,5).join(', ')}`:''].filter(Boolean),identitySignals:m.author?[`huggingface:${m.author}`]:[],raw:m}));
  }

  async function runClassifiedSweep(){
    const a = app();
    if(!a) return toast('SourcingOS not ready');
    const q = roleQuery();
    if(!q || q.length < 2) return toast('Paste a JD or type a source search first');
    sweep = {running:true, query:q, statuses:{}, errors:{}, counts:{}, startedAt:now(), completedAt:''};
    Object.keys(SOURCE_LABELS).forEach(s => setStatus(s, 'loading', 0));
    renderClassifiedLeads();
    const jobs = [
      fetchSource('github_users', githubUsers, q),
      fetchSource('github_repos', githubRepos, q),
      fetchSource('stackoverflow', stackoverflow, q),
      fetchSource('hackernews', hackernews, q),
      fetchSource('openalex', openalex, q),
      fetchSource('npm', npmSearch, q),
      fetchSource('huggingface', huggingface, q)
    ];
    const settled = await Promise.allSettled(jobs);
    const results = dedupe(settled.flatMap(x => x.status === 'fulfilled' ? x.value : [])).slice(0, MAX_TOTAL);
    a.state.publicResults = results;
    a.state.searchSessions = Array.isArray(a.state.searchSessions) ? a.state.searchSessions : [];
    a.state.searchSessions.unshift({id:uid('session'), projectId:projectId(), queryUsed:q, sourceLane:'classified_public_sweep', resultsCount:results.length, statuses:sweep.statuses, errors:sweep.errors, startedAt:sweep.startedAt, completedAt:now()});
    sweep.running = false;
    sweep.completedAt = now();
    save();
    if(a.setMode) a.setMode('leads');
    renderClassifiedLeads();
    toast(`Found ${results.length} classified public-source results`);
  }

  function groupResults(){
    const rows = state()?.publicResults || [];
    return {
      candidate_lead: rows.filter(r=>r.resultClass==='candidate_lead'),
      repo_project: rows.filter(r=>r.resultClass==='repo_project'),
      package_signal: rows.filter(r=>r.resultClass==='package_signal'),
      research_publication: rows.filter(r=>r.resultClass==='research_publication'),
      community_discussion: rows.filter(r=>r.resultClass==='community_discussion'),
      evidence_signal: rows.filter(r=>['evidence_signal','company_signal','license_record','source_note'].includes(r.resultClass))
    };
  }
  function statusBadge(s){
    const status = sweep.statuses[s] || 'idle';
    const cls = status==='success' ? 'good' : (status==='error' || status==='rate_limited') ? 'red' : status==='empty' ? 'warn' : '';
    return `<span class="badge ${cls}">${esc(SOURCE_LABELS[s])}: ${esc(status)}${typeof sweep.counts[s]==='number' ? ` (${sweep.counts[s]})` : ''}</span>`;
  }
  function renderClassifiedLeads(){
    if(state()?.mode !== 'leads') return;
    const workspace = $('workspace');
    if(!workspace) return;
    const groups = groupResults();
    const total = (state()?.publicResults || []).length;
    workspace.innerHTML = `<div class="card"><div class="section-title"><span>Classified public-source sweep</span><button class="small-btn primary" id="runClassifiedSweepBtn">Run 7-source sweep</button></div><p class="subtle">Searches GitHub users/repos, Stack Overflow, Hacker News, OpenAlex, npm, and Hugging Face. Candidate-like records stay separate from evidence-only records.</p><div class="summary">${Object.keys(SOURCE_LABELS).map(statusBadge).join('')}</div><div class="summary"><span class="badge good">${total} total</span><span class="badge">${groups.candidate_lead.length} candidate leads</span><span class="badge">${groups.repo_project.length} repos</span><span class="badge">${groups.package_signal.length} packages</span><span class="badge">${groups.research_publication.length} research</span><span class="badge">${groups.community_discussion.length} community</span></div>${Object.keys(sweep.errors).length?`<pre>${esc(Object.entries(sweep.errors).map(([k,v])=>`${SOURCE_LABELS[k]}: ${v}`).join('\n'))}</pre>`:''}</div>${section('Candidate Leads', groups.candidate_lead, true)}${section('Repositories / Projects', groups.repo_project, false)}${section('Packages / Maintainers', groups.package_signal, false)}${section('Research / Publications', groups.research_publication, false)}${section('Community Discussions', groups.community_discussion, false)}${section('Evidence Signals', groups.evidence_signal, false)}`;
    const btn = $('runClassifiedSweepBtn');
    if(btn) btn.onclick = runClassifiedSweep;
    workspace.querySelectorAll('[data-review-classified]').forEach(b=>b.onclick=()=>reviewClassifiedLead(b.dataset.reviewClassified));
    workspace.querySelectorAll('[data-save-evidence]').forEach(b=>b.onclick=()=>saveEvidence(b.dataset.saveEvidence));
    workspace.querySelectorAll('[data-copy-result]').forEach(b=>b.onclick=()=>copySummary(b.dataset.copyResult));
  }
  function section(title, rows, reviewable){
    if(!rows.length) return `<div class="card"><div class="section-title"><span>${esc(title)}</span><span class="badge">0</span></div><div class="empty">No ${esc(title.toLowerCase())} yet.</div></div>`;
    return `<div class="card"><div class="section-title"><span>${esc(title)}</span><span class="badge">${rows.length}</span></div><div class="grid2">${rows.map(r => card(r, reviewable && r.resultClass==='candidate_lead')).join('')}</div></div>`;
  }
  function card(r, reviewable){
    const badgeClass = r.resultClass === 'candidate_lead' ? 'good' : r.resultClass === 'research_publication' ? 'warn' : '';
    return `<article class="lead-card"><div class="card-top"><div><div class="name">${esc(r.displayName)}</div><div class="meta">${esc(r.title || r.resultClass)} · ${esc(r.organization || r.source)}</div></div><span class="badge ${badgeClass}">${esc(r.resultClass)}</span></div><div class="summary"><span class="badge">${esc(r.source)}</span><span class="badge">${Math.round((r.confidence||0)*100)}% signal</span>${(r.matchedTerms||[]).slice(0,5).map(t=>`<span class="badge good">${esc(t)}</span>`).join('')}</div><ul class="evidence">${(r.evidence && r.evidence.length ? r.evidence.slice(0,5) : [r.snippet || 'No snippet']).map(e=>`<li>${esc(e)}</li>`).join('')}</ul><p class="subtle">${esc((r.caveats||[]).join(' '))}</p><div class="card-actions"><a class="small-btn primary" href="${esc(r.url)}" target="_blank" rel="noreferrer">Open Source</a>${reviewable?`<button class="small-btn" data-review-classified="${r.id}">Review as Candidate</button>`:`<button class="small-btn" data-save-evidence="${r.id}">Save Evidence</button>`}<button class="small-btn" data-copy-result="${r.id}">Copy</button></div></article>`;
  }
  function getResult(id){ return (state()?.publicResults || []).find(r=>r.id===id); }
  function reviewClassifiedLead(id){
    const st = state();
    const r = getResult(id);
    if(!st || !r) return toast('Result missing');
    if(r.resultClass !== 'candidate_lead') return toast('Evidence-only results must be saved as evidence first');
    const pid = projectId();
    const cand = {id:uid('cand'), projectId:pid, name:r.displayName || r.handle || 'Unnamed Lead', title:r.title || 'Public candidate lead', company:r.organization || r.source, location:r.location || '', source:r.source, sourceUrl:r.url, notes:r.snippet || '', createdAt:now(), updatedAt:now(), identifiers:r.identitySignals || []};
    st.candidates = Array.isArray(st.candidates) ? st.candidates : [];
    st.pipelineEntries = Array.isArray(st.pipelineEntries) ? st.pipelineEntries : [];
    st.evidenceItems = Array.isArray(st.evidenceItems) ? st.evidenceItems : [];
    st.candidates.unshift(cand);
    const must = st.role?.mustHaves || [];
    const matched = must.filter(s => JSON.stringify(r).toLowerCase().includes(String(s).toLowerCase()));
    const missing = must.filter(s => !matched.includes(s)).slice(0,8);
    st.pipelineEntries.unshift({id:uid('pipe'), candidateId:cand.id, projectId:pid, stage:'Reviewing', fitConfidence:matched.length>=3?'High':matched.length?'Medium':'Review', matchedRequirements:matched, missingRequirements:missing, clearanceMentions:r.clearanceMentions || [], clearanceCaveat:(r.caveats||[]).find(c=>/clearance/i.test(c)) || '', nextAction:'Open Candidate 360 and verify manually', createdAt:now(), updatedAt:now()});
    (r.evidence||[]).forEach(e => st.evidenceItems.unshift({id:uid('ev'), candidateId:cand.id, projectId:pid, resultId:r.id, resultClass:r.resultClass, evidenceText:e, sourceName:r.source, sourceUrl:r.url, caveat:(r.caveats||[]).join(' '), createdAt:now()}));
    save();
    if(app()?.setMode) app().setMode('review');
    toast(`Reviewed ${cand.name}`);
  }
  function saveEvidence(id){
    const st = state();
    const r = getResult(id);
    if(!st || !r) return toast('Result missing');
    st.evidenceItems = Array.isArray(st.evidenceItems) ? st.evidenceItems : [];
    st.evidenceItems.unshift({id:uid('ev'), candidateId:null, projectId:projectId(), resultId:r.id, resultClass:r.resultClass, evidenceText:`${r.displayName}: ${r.snippet || (r.evidence||[]).join(' | ')}`, sourceName:r.source, sourceUrl:r.url, caveat:(r.caveats||[]).join(' '), createdAt:now()});
    save();
    toast('Evidence saved');
  }
  function copySummary(id){
    const r = getResult(id);
    if(!r) return;
    const text = `${r.displayName}\nClass: ${r.resultClass}\nSource: ${r.source}\nURL: ${r.url}\nMatched: ${(r.matchedTerms||[]).join(', ')}\nEvidence:\n- ${(r.evidence||[]).join('\n- ')}\nCaveats: ${(r.caveats||[]).join(' ')}`;
    navigator.clipboard?.writeText(text).then(()=>toast('Copied')).catch(()=>toast('Copy failed'));
  }

  document.addEventListener('click', function(e){
    const btn = e.target && e.target.closest && e.target.closest('button');
    if(!btn) return;
    if(btn.id === 'searchPublic' || btn.id === 'runClassifiedSweepBtn' || /Search Public Sources|Find Public Leads|Source Sweep|Run 7-source sweep/i.test(btn.textContent || '')){
      e.preventDefault();
      e.stopImmediatePropagation();
      runClassifiedSweep();
    }
    if(btn.dataset?.mode === 'leads') setTimeout(renderClassifiedLeads, 0);
  }, true);
  window.runClassifiedSweep = runClassifiedSweep;
  window.reviewClassifiedLead = reviewClassifiedLead;
  window.renderClassifiedLeads = renderClassifiedLeads;
})();

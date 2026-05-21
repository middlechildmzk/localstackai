(function(){
  const SOURCES = [
    { id:'github', label:'GitHub', enabled:true },
    { id:'hn', label:'Hacker News', enabled:true },
    { id:'stackoverflow', label:'Stack Overflow', enabled:true },
    { id:'openalex', label:'OpenAlex', enabled:true },
    { id:'npm', label:'npm', enabled:true },
    { id:'huggingface', label:'Hugging Face', enabled:true }
  ];

  const state = { results: [], loading:false, lastQuery:'', activeSources: SOURCES.map(s=>s.id) };
  const $ = (id) => document.getElementById(id);
  const esc = (s='') => String(s).replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  const clean = (s='') => String(s || '').replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' ').trim();
  const words = (s='') => clean(s).split(/[,;\n\s]+/).map(x=>x.trim()).filter(x=>x.length>1);
  const uniq = (arr) => [...new Map(arr.filter(Boolean).map(x => [String(x.url || x.id || x.title || Math.random()), x])).values()];

  function toast(msg){
    const existing = $('toast');
    if (existing) { existing.textContent = msg; existing.classList.add('show'); setTimeout(()=>existing.classList.remove('show'),1600); return; }
    console.log(msg);
  }

  function injectStyles(){
    if ($('liveRunnerStyles')) return;
    const style = document.createElement('style');
    style.id = 'liveRunnerStyles';
    style.textContent = `
      .live-runner-card{border:1px solid var(--line,#29405f);border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.025));box-shadow:0 18px 60px rgba(0,0,0,.28);padding:15px;margin-bottom:16px}
      .live-runner-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}
      .live-runner-head h2{margin:0;font-size:18px;letter-spacing:-.02em}.live-runner-head p{margin:4px 0 0;color:var(--muted,#bfd0e8);font-size:13px}
      .live-runner-actions{display:flex;gap:8px;flex-wrap:wrap}.live-source-toggles{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
      .live-source-chip{border:1px solid var(--line,#29405f);border-radius:999px;background:rgba(3,9,20,.34);color:var(--muted,#bfd0e8);padding:7px 10px;font-size:12px;cursor:pointer}
      .live-source-chip.on{border-color:rgba(88,199,243,.42);background:rgba(88,199,243,.12);color:#d4f2ff}.live-source-chip input{margin-right:6px}
      .live-result-list{display:grid;gap:10px;margin-top:12px}.live-result-card{border:1px solid var(--line,#29405f);border-radius:17px;background:rgba(3,9,20,.52);padding:13px}
      .live-result-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.live-result-title{font-weight:900;font-size:15px;color:var(--text,#f2f7ff)}
      .live-result-meta{font-size:12px;color:var(--faint,#8aa0bb);margin-top:3px}.live-result-snippet{font-size:13px;color:var(--muted,#bfd0e8);margin:9px 0;line-height:1.5}
      .live-badge{font-size:11px;border:1px solid rgba(88,199,243,.27);background:rgba(88,199,243,.09);color:#d4f2ff;border-radius:999px;padding:5px 8px;display:inline-flex;align-items:center;gap:4px}
      .live-badge.warn{border-color:rgba(255,209,102,.32);background:rgba(255,209,102,.09);color:#ffe6a8}.live-badge.good{border-color:rgba(82,210,115,.32);background:rgba(82,210,115,.09);color:#d5ffe0}
      .live-card-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.live-small-btn{border:1px solid var(--line,#29405f);background:rgba(255,255,255,.055);color:var(--text,#f2f7ff);border-radius:11px;padding:8px 9px;font-size:12px;cursor:pointer;text-decoration:none}.live-small-btn.primary{background:rgba(88,199,243,.14);border-color:rgba(88,199,243,.35)}
      .live-empty{border:1px dashed var(--line,#29405f);border-radius:16px;padding:18px;color:var(--muted,#bfd0e8);text-align:center;background:rgba(3,9,20,.34)}
    `;
    document.head.appendChild(style);
  }

  function buildUi(){
    if ($('liveSourceRunner')) return;
    const command = document.querySelector('.command-card');
    if (!command || !command.parentNode) return;
    const card = document.createElement('section');
    card.id = 'liveSourceRunner';
    card.className = 'live-runner-card';
    card.innerHTML = `
      <div class="live-runner-head">
        <div><h2>Live Source Search</h2><p>Run safe public sources directly. This restores the older SourcingOS behavior where results appear inside the app. Use LinkedIn/ClearanceJobs/Indeed manually.</p></div>
        <div class="live-runner-actions"><button class="btn secondary" id="liveRunBtn">Search Live Sources</button><button class="btn ghost" id="liveClearBtn">Clear Results</button></div>
      </div>
      <div class="live-source-toggles" id="liveSourceToggles"></div>
      <div id="liveResultStatus" class="subtle">Type a role, skill, company, or natural-language search in the command bar, then click Search Live Sources.</div>
      <div id="liveResults" class="live-result-list"><div class="live-empty">No live results yet. Try: <strong>kubernetes terraform govcloud devsecops</strong> or <strong>machine learning healthcare researcher</strong>.</div></div>
    `;
    command.insertAdjacentElement('afterend', card);
    renderToggles();
    $('liveRunBtn').addEventListener('click', runLiveSearch);
    $('liveClearBtn').addEventListener('click', () => { state.results=[]; renderResults(); setStatus('Results cleared.'); });
  }

  function renderToggles(){
    const el = $('liveSourceToggles');
    if (!el) return;
    el.innerHTML = SOURCES.map(s => `<label class="live-source-chip ${state.activeSources.includes(s.id)?'on':''}"><input type="checkbox" data-live-source="${s.id}" ${state.activeSources.includes(s.id)?'checked':''}>${s.label}</label>`).join('');
    el.querySelectorAll('input[data-live-source]').forEach(input => input.addEventListener('change', e => {
      const id = e.target.dataset.liveSource;
      state.activeSources = e.target.checked ? [...state.activeSources, id] : state.activeSources.filter(x=>x!==id);
      renderToggles();
    }));
  }

  function setStatus(msg){ const el=$('liveResultStatus'); if(el) el.textContent = msg; }
  function commandText(){ return clean(($('commandInput') && $('commandInput').value) || ($('roleTitle') && $('roleTitle').value) || ''); }
  function roleContextTerms(){
    const vals = ['roleTitle','mustHaves','niceHaves','targetCompanies','location','feedback'].map(id => $(id)?.value || '').join(' ');
    return clean(vals);
  }
  function searchQuery(){
    const cmd = commandText();
    if (cmd && cmd.length > 2) return cmd;
    return roleContextTerms();
  }
  function compactQuery(q, maxWords=10){ return words(q).slice(0,maxWords).join(' '); }

  async function runLiveSearch(){
    const q = searchQuery();
    if (!q || q.length < 2) { toast('Add a search first'); return; }
    state.loading = true; state.lastQuery = q; state.results = [];
    renderResults(); setStatus('Searching public sources...');
    const active = state.activeSources;
    const jobs = [];
    if (active.includes('github')) jobs.push(searchGitHub(q));
    if (active.includes('hn')) jobs.push(searchHN(q));
    if (active.includes('stackoverflow')) jobs.push(searchStackOverflow(q));
    if (active.includes('openalex')) jobs.push(searchOpenAlex(q));
    if (active.includes('npm')) jobs.push(searchNpm(q));
    if (active.includes('huggingface')) jobs.push(searchHuggingFace(q));
    const settled = await Promise.allSettled(jobs);
    const results = settled.flatMap(x => x.status === 'fulfilled' ? x.value : []);
    state.results = uniq(results).slice(0, 60);
    state.loading = false;
    renderResults();
    setStatus(`Found ${state.results.length} public-source results for: ${compactQuery(q, 14)}`);
  }

  async function searchGitHub(q){
    const query = encodeURIComponent(`${compactQuery(q, 8)} in:login in:name in:bio`);
    const res = await fetch(`https://api.github.com/search/users?q=${query}&per_page=10`, { headers:{'Accept':'application/vnd.github+json'} });
    if (!res.ok) throw new Error('GitHub rate limit or API error');
    const data = await res.json();
    const items = data.items || [];
    const hydrated = await Promise.all(items.slice(0,8).map(async u => {
      try {
        const r = await fetch(u.url, { headers:{'Accept':'application/vnd.github+json'} });
        const d = await r.json();
        return {
          id:'gh_'+u.id, source:'GitHub', type:'Public developer profile', title:d.name || u.login, subtitle:u.login,
          url:u.html_url, snippet:[d.bio, d.company, d.location, d.blog].filter(Boolean).join(' · ') || 'Public GitHub profile. Review repos/activity manually.',
          evidence:[d.public_repos ? `${d.public_repos} public repos` : '', d.followers ? `${d.followers} followers` : '', d.location ? `Location: ${d.location}` : ''].filter(Boolean),
          confidence:'Public profile signal'
        };
      } catch { return null; }
    }));
    return hydrated.filter(Boolean);
  }

  async function searchHN(q){
    const res = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(compactQuery(q, 8))}&tags=story&hitsPerPage=10`);
    if (!res.ok) throw new Error('HN API error');
    const data = await res.json();
    return (data.hits || []).map(h => ({
      id:'hn_'+h.objectID, source:'Hacker News', type:'Public discussion/story', title:h.title || h.story_title || 'HN result', subtitle:h.author ? `by ${h.author}` : '',
      url:h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, snippet:h._highlightResult?.title?.value?.replace(/<[^>]+>/g,'') || 'Public HN result. Review manually for relevance.',
      evidence:[h.points ? `${h.points} points` : '', h.num_comments ? `${h.num_comments} comments` : '', h.author ? `Author: ${h.author}` : ''].filter(Boolean), confidence:'Community/source signal'
    }));
  }

  async function searchStackOverflow(q){
    const tagged = compactQuery(q, 5).replace(/\s+/g,';');
    const url = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(compactQuery(q,10))}&site=stackoverflow&pagesize=10`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('StackExchange API error');
    const data = await res.json();
    return (data.items || []).map(item => ({
      id:'so_'+item.question_id, source:'Stack Overflow', type:'Technical Q&A evidence', title:item.title, subtitle:item.owner?.display_name ? `by ${item.owner.display_name}` : '',
      url:item.link, snippet:'Stack Overflow question/result. Use as technical evidence or sourcing lead only.',
      evidence:[item.tags?.length ? `Tags: ${item.tags.slice(0,5).join(', ')}` : '', item.score ? `Score: ${item.score}` : '', item.answer_count ? `${item.answer_count} answers` : ''].filter(Boolean), confidence:'Technical evidence signal'
    }));
  }

  async function searchOpenAlex(q){
    const res = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(compactQuery(q,10))}&per-page=10`);
    if (!res.ok) throw new Error('OpenAlex API error');
    const data = await res.json();
    return (data.results || []).map(w => {
      const authors = (w.authorships || []).slice(0,3).map(a => a.author?.display_name).filter(Boolean);
      return {
        id:'oa_'+w.id, source:'OpenAlex', type:'Research/publication evidence', title:w.title || 'OpenAlex work', subtitle:authors.length ? authors.join(', ') : '',
        url:w.doi ? `https://doi.org/${w.doi.replace('https://doi.org/','')}` : w.id, snippet:(w.abstract_inverted_index ? 'Research work with indexed abstract. Review publication relevance manually.' : 'Research/publication result.'),
        evidence:[w.publication_year ? `Year: ${w.publication_year}` : '', w.cited_by_count ? `${w.cited_by_count} citations` : '', authors.length ? `Authors: ${authors.join(', ')}` : ''].filter(Boolean), confidence:'Research evidence signal'
      };
    });
  }

  async function searchNpm(q){
    const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(compactQuery(q,8))}&size=10`);
    if (!res.ok) throw new Error('npm API error');
    const data = await res.json();
    return (data.objects || []).map(o => ({
      id:'npm_'+o.package.name, source:'npm', type:'Package/maintainer evidence', title:o.package.name, subtitle:o.package.publisher?.username ? `publisher: ${o.package.publisher.username}` : '',
      url:o.package.links?.npm || `https://www.npmjs.com/package/${o.package.name}`, snippet:o.package.description || 'npm package result. Review maintainers/repo manually.',
      evidence:[o.package.version ? `Version: ${o.package.version}` : '', o.score?.final ? `Score: ${Math.round(o.score.final*100)}%` : '', o.package.keywords?.length ? `Keywords: ${o.package.keywords.slice(0,5).join(', ')}` : ''].filter(Boolean), confidence:'Open-source package signal'
    }));
  }

  async function searchHuggingFace(q){
    const res = await fetch(`https://huggingface.co/api/models?search=${encodeURIComponent(compactQuery(q,8))}&limit=10`);
    if (!res.ok) throw new Error('Hugging Face API error');
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map(m => ({
      id:'hf_'+m.id, source:'Hugging Face', type:'AI/ML model evidence', title:m.id, subtitle:m.author ? `author: ${m.author}` : '',
      url:`https://huggingface.co/${m.id}`, snippet:m.pipeline_tag ? `Pipeline: ${m.pipeline_tag}` : 'Hugging Face model result. Review author/profile manually.',
      evidence:[m.downloads ? `${m.downloads} downloads` : '', m.likes ? `${m.likes} likes` : '', m.tags?.length ? `Tags: ${m.tags.slice(0,5).join(', ')}` : ''].filter(Boolean), confidence:'AI/ML public work signal'
    }));
  }

  function renderResults(){
    const el = $('liveResults');
    if (!el) return;
    if (state.loading) { el.innerHTML = '<div class="live-empty">Searching live public sources...</div>'; return; }
    if (!state.results.length) { el.innerHTML = '<div class="live-empty">No live results yet. Run a search to populate public-source profiles, projects, papers, packages, and evidence.</div>'; return; }
    el.innerHTML = state.results.map((r, i) => `
      <article class="live-result-card">
        <div class="live-result-top">
          <div><div class="live-result-title">${esc(r.title)}</div><div class="live-result-meta">${esc(r.source)} · ${esc(r.type)} ${r.subtitle ? '· ' + esc(r.subtitle) : ''}</div></div>
          <span class="live-badge good">${esc(r.source)}</span>
        </div>
        <div class="live-result-snippet">${esc(r.snippet)}</div>
        <div>${(r.evidence || []).map(e => `<span class="live-badge">${esc(e)}</span>`).join(' ')}</div>
        <div class="live-card-actions"><a class="live-small-btn primary" href="${esc(r.url)}" target="_blank" rel="noreferrer">Open Source</a><button class="live-small-btn" data-copy-result="${i}">Copy Summary</button><button class="live-small-btn" data-review-result="${i}">Review as Candidate</button></div>
      </article>
    `).join('');
    el.querySelectorAll('[data-copy-result]').forEach(btn => btn.addEventListener('click', e => {
      const r = state.results[Number(e.target.dataset.copyResult)];
      copy(summary(r));
    }));
    el.querySelectorAll('[data-review-result]').forEach(btn => btn.addEventListener('click', e => {
      const r = state.results[Number(e.target.dataset.reviewResult)];
      const input = $('commandInput');
      if (input) input.value = summary(r);
      if (typeof window.reviewProfile === 'function') window.reviewProfile();
      toast('Loaded into profile review');
    }));
  }

  function summary(r){
    return `${r.title}\nSource: ${r.source}\nType: ${r.type}\nURL: ${r.url}\nSummary: ${r.snippet}\nEvidence:\n- ${(r.evidence||[]).join('\n- ')}\n\nNote: Public-source signal only. Verify manually. Do not infer protected traits or verified clearance.`;
  }
  function copy(text){ navigator.clipboard.writeText(text).then(()=>toast('Copied')).catch(()=>toast('Copy failed')); }

  function init(){ injectStyles(); buildUi(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.runLiveSourceSearch = runLiveSearch;
})();
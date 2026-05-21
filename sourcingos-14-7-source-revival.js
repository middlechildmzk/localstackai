/* SourcingOS 14.7 Source Search Revival: restore 50+ rich multi-source sweep with structured results. */
(function(){
  const MAX_TOTAL = 60;
  const $ = id => document.getElementById(id);
  const clean = s => String(s || '').replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' ').trim();
  const words = s => clean(s).split(/[,;\n\s]+/).map(x=>x.trim()).filter(x=>x.length>1);
  const compact = (q,n=10) => words(q).slice(0,n).join(' ');
  const uid = p => `${p}_${(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now()).replace(/-/g,'').slice(0,12)}`;
  const clearanceRe = /(TS\/SCI|Top Secret|Secret|Public Trust|polygraph|CI Poly|FSP|Full Scope|security clearance|active clearance)/i;
  const sourceDefaults = ['githubUsers','githubRepos','stackoverflowQuestions','hn','openalex','npm','huggingface'];

  function toast(msg){
    let el = $('toast');
    if(!el){ el=document.createElement('div'); el.id='toast'; el.className='toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'),1800);
  }
  function app(){ return window.SourcingOS && window.SourcingOS.state ? window.SourcingOS : null; }
  function roleQuery(){
    const st = app()?.state;
    const command = clean($('commandInput')?.value || '');
    if(command.length > 3) return command;
    if(st?.role){ return clean([st.role.roleTitle, (st.role.mustHaves||[]).join(' '), st.role.location, (st.role.targetCompanies||[]).join(' ')].join(' ')); }
    return '';
  }
  function caveat(obj){ return clearanceRe.test(JSON.stringify(obj)) ? 'Candidate-stated/public mention only. Not verified clearance.' : 'Public-source signal only. Review manually.'; }
  function normalizeResult(x){
    const resultClass = x.resultClass || 'evidence';
    return {
      id: x.id || uid('result'),
      source: x.source || 'Public Source',
      resultClass,
      displayName: x.displayName || x.name || x.author || x.handle || x.title || 'Unnamed Lead',
      handle: x.handle || '',
      title: x.title || (resultClass === 'candidate' ? 'Public candidate lead' : 'Evidence signal'),
      company: x.company || x.subtitle || x.source || 'Public source',
      location: x.location || '',
      url: x.url || '',
      bio: x.bio || x.snippet || '',
      evidence: (x.evidence || []).filter(Boolean).slice(0,8),
      clearanceMentions: clearanceRe.test(JSON.stringify(x)) ? ['clearance mention'] : [],
      clearanceCaveat: x.clearanceCaveat || caveat(x),
      sourceType: x.sourceType || x.type || '',
      createdAt: new Date().toISOString()
    };
  }
  function unique(results){
    const seen = new Set();
    return results.filter(r => {
      const key = [r.source, r.url || r.displayName || r.title].join('|');
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  async function githubUsers(q){
    const res = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(compact(q,8)+' in:login in:name in:bio')}&per_page=12`, {headers:{Accept:'application/vnd.github+json'}});
    if(!res.ok) return [];
    const data = await res.json();
    const users = await Promise.all((data.items||[]).slice(0,10).map(async u => {
      try{
        const r = await fetch(u.url,{headers:{Accept:'application/vnd.github+json'}});
        const d = await r.json();
        return normalizeResult({source:'GitHub',resultClass:'candidate',displayName:d.name || u.login,handle:u.login,title:'Public developer profile',company:d.company || 'GitHub',location:d.location || '',url:u.html_url,bio:d.bio || '',evidence:[d.bio,d.company?`Company: ${d.company}`:'',d.location?`Location: ${d.location}`:'',d.public_repos?`${d.public_repos} public repos`:'',d.followers?`${d.followers} followers`:''].filter(Boolean)});
      }catch(e){ return null; }
    }));
    return users.filter(Boolean);
  }
  async function githubRepos(q){
    const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(compact(q,8))}&sort=stars&order=desc&per_page=10`, {headers:{Accept:'application/vnd.github+json'}});
    if(!res.ok) return [];
    const data = await res.json();
    return (data.items||[]).slice(0,10).map(repo => normalizeResult({source:'GitHub',resultClass:'evidence',displayName:repo.full_name,title:'Repository / project evidence',company:repo.owner?.login || 'GitHub',url:repo.html_url,bio:repo.description || '',evidence:[repo.description,repo.language?`Language: ${repo.language}`:'',repo.stargazers_count?`${repo.stargazers_count} stars`:'',repo.owner?.login?`Owner: ${repo.owner.login}`:''].filter(Boolean)}));
  }
  async function stackoverflowQuestions(q){
    const res = await fetch(`https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(compact(q,10))}&site=stackoverflow&pagesize=12`);
    if(!res.ok) return [];
    const data = await res.json();
    return (data.items||[]).slice(0,12).map(item => normalizeResult({source:'Stack Overflow',resultClass:'evidence',displayName:item.owner?.display_name || item.title,title:'Technical Q&A evidence',company:'Stack Overflow',url:item.link,bio:'Technical Q&A result. Use as evidence or contributor lead after manual review.',evidence:[item.owner?.display_name?`Author: ${item.owner.display_name}`:'',item.tags?.length?`Tags: ${item.tags.slice(0,6).join(', ')}`:'',item.score?`Score: ${item.score}`:'',item.answer_count?`${item.answer_count} answers`:''].filter(Boolean)}));
  }
  async function hackerNews(q){
    const res = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(compact(q,8))}&tags=story&hitsPerPage=10`);
    if(!res.ok) return [];
    const data = await res.json();
    return (data.hits||[]).slice(0,10).map(h => normalizeResult({source:'Hacker News',resultClass:'evidence',displayName:h.author || h.title || 'HN result',title:h.title || h.story_title || 'HN story/discussion',company:'Hacker News',url:h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,bio:'Community discussion/source signal. Review manually.',evidence:[h.author?`Author: ${h.author}`:'',h.points?`${h.points} points`:'',h.num_comments?`${h.num_comments} comments`:''].filter(Boolean)}));
  }
  async function openAlex(q){
    const res = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(compact(q,10))}&per-page=10`);
    if(!res.ok) return [];
    const data = await res.json();
    return (data.results||[]).slice(0,10).map(w => {
      const authors = (w.authorships||[]).slice(0,3).map(a=>a.author?.display_name).filter(Boolean);
      return normalizeResult({source:'OpenAlex',resultClass:'evidence',displayName:authors[0] || w.title || 'Research work',title:w.title || 'Research/publication evidence',company:authors.join(', ') || 'OpenAlex',url:w.doi?`https://doi.org/${String(w.doi).replace('https://doi.org/','')}`:w.id,bio:'Research/publication evidence. Save as evidence unless manually converted after review.',evidence:[authors.length?`Authors: ${authors.join(', ')}`:'',w.publication_year?`Year: ${w.publication_year}`:'',w.cited_by_count?`${w.cited_by_count} citations`:''].filter(Boolean)});
    });
  }
  async function npmSearch(q){
    const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(compact(q,8))}&size=10`);
    if(!res.ok) return [];
    const data = await res.json();
    return (data.objects||[]).slice(0,10).map(o => {
      const user = o.package.publisher?.username || o.package.maintainers?.[0]?.username || '';
      return normalizeResult({source:'npm',resultClass:user?'candidate':'evidence',displayName:user || o.package.name,title:user?'Open-source maintainer':'Package evidence',company:'npm',url:user?`https://www.npmjs.com/~${user}`:(o.package.links?.npm || `https://www.npmjs.com/package/${o.package.name}`),bio:o.package.description || '',evidence:[`Package: ${o.package.name}`,o.package.description || '',o.package.version?`Version: ${o.package.version}`:'',o.score?.final?`Score: ${Math.round(o.score.final*100)}%`:''].filter(Boolean)});
    });
  }
  async function huggingFace(q){
    const res = await fetch(`https://huggingface.co/api/models?search=${encodeURIComponent(compact(q,8))}&limit=10`);
    if(!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data)?data:[]).slice(0,10).map(m => normalizeResult({source:'Hugging Face',resultClass:m.author?'candidate':'evidence',displayName:m.author || m.id,title:m.author?'AI/ML model author':'AI/ML model evidence',company:'Hugging Face',url:m.author?`https://huggingface.co/${m.author}`:`https://huggingface.co/${m.id}`,bio:m.pipeline_tag?`Pipeline: ${m.pipeline_tag}`:'Hugging Face model/public work signal.',evidence:[`Model: ${m.id}`,m.pipeline_tag?`Pipeline: ${m.pipeline_tag}`:'',m.downloads?`${m.downloads} downloads`:'',m.likes?`${m.likes} likes`:'',m.tags?.length?`Tags: ${m.tags.slice(0,5).join(', ')}`:''].filter(Boolean)}));
  }
  async function runSourceRevivalSearch(){
    const a = app();
    if(!a) return toast('SourcingOS not ready');
    const q = roleQuery();
    if(!q || q.length < 2) return toast('Paste a JD or type a source search first');
    toast('Running 6-source sweep');
    const jobs = [githubUsers(q), githubRepos(q), stackoverflowQuestions(q), hackerNews(q), openAlex(q), npmSearch(q), huggingFace(q)];
    const settled = await Promise.allSettled(jobs);
    const results = unique(settled.flatMap(x => x.status === 'fulfilled' ? x.value : [])).slice(0, MAX_TOTAL);
    a.state.publicResults = results;
    try{ localStorage.setItem('sourcingos_unified_v146', JSON.stringify(a.state)); }catch(e){}
    a.setMode ? a.setMode('leads') : null;
    toast(`Found ${results.length} rich public-source results`);
  }
  document.addEventListener('click', function(e){
    const btn = e.target && e.target.closest && e.target.closest('button');
    if(!btn) return;
    if(btn.id === 'searchPublic' || /Search Public Sources|Find Public Leads|Source Sweep/i.test(btn.textContent || '')){
      e.preventDefault();
      e.stopPropagation();
      runSourceRevivalSearch();
    }
  }, true);
  window.runSourceRevivalSearch = runSourceRevivalSearch;
})();

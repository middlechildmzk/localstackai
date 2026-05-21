const $ = id => document.getElementById(id);

const state = {
  projects: [],
  activeProjectId: '',
  searches: [],
  candidates: [],
  outreachDrafts: [],
  hmUpdates: [],
  feedbackEvents: []
};

const templates = {
  devsecops: {
    roleTitle: 'TS/SCI DevSecOps Engineer',
    mustHaves: 'AWS GovCloud, Kubernetes, Terraform, Linux, CI/CD, RMF, STIG, ACAS',
    niceHaves: 'CI Poly, GitLab, Jenkins, Nessus, eMASS, Security+',
    clearance: 'TS/SCI + CI Poly',
    location: 'Fort Meade, Annapolis Junction, Chantilly, Reston, Colorado Springs',
    targetCompanies: 'Booz Allen, Leidos, CACI, Peraton, SAIC, GDIT, Northrop, Lockheed, ManTech',
    feedback: 'Prioritize defense prime/GovCon backgrounds. Verify onsite/SCIF expectations and clearance through approved process.'
  },
  java: {
    roleTitle: 'Cleared Java Software Engineer',
    mustHaves: 'Java, Spring Boot, REST APIs, microservices, AWS, Kubernetes, Linux',
    niceHaves: 'TS/SCI, Agile, CI/CD, Docker, cloud modernization',
    clearance: 'TS/SCI',
    location: 'DMV, Fort Meade, Northern Virginia, remote with clearance caveats',
    targetCompanies: 'Leidos, CACI, Peraton, SAIC, GDIT, Booz Allen, Maximus, Northrop',
    feedback: 'Look for hands-on backend engineering, not only systems support. Avoid commercial-only profiles without federal mission context.'
  },
  cyber: {
    roleTitle: 'Cyber / RMF Analyst',
    mustHaves: 'RMF, eMASS, STIG, ACAS, Nessus, Splunk, Security+, NIST 800-53',
    niceHaves: 'CISSP, CySA+, ISSO, ISSM, FedRAMP, POA&M management',
    clearance: 'Secret',
    location: 'DMV, Colorado Springs, Tampa, Huntsville, San Antonio',
    targetCompanies: 'Booz Allen, Leidos, CACI, Peraton, SAIC, GDIT, ManTech, Amentum',
    feedback: 'Separate compliance-only backgrounds from hands-on vulnerability/security engineering experience.'
  },
  sourcer: {
    roleTitle: 'Cleared Technical Sourcer',
    mustHaves: 'LinkedIn Recruiter, ClearanceJobs, Boolean, X-Ray, ATS rediscovery, technical sourcing, cleared talent mapping',
    niceHaves: 'hireEZ, SeekOut, Avature, GovCon, cyber/cloud sourcing, hiring manager calibration',
    clearance: 'Non-cleared / not required',
    location: 'Remote US, Minnesota hybrid acceptable',
    targetCompanies: 'Maximus, Booz Allen, Leidos, CACI, Peraton, SAIC, GDIT, Lockheed',
    feedback: 'Prioritize sourcers with federal/defense, cyber, cloud, and AI sourcing depth. Avoid purely high-volume nontechnical recruiting profiles.'
  }
};

const platformLabels = {
  linkedin: 'LinkedIn Recruiter',
  clearancejobs: 'ClearanceJobs',
  indeed: 'Indeed',
  github: 'GitHub / Web',
  xray: 'Google X-Ray',
  avature: 'Avature Rediscovery'
};

function toast(text='Done') {
  const el = $('toast');
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1600);
}

function clean(s='') {
  return String(s).replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'").replace(/[\u2013\u2014]/g, '-').replace(/\s{3,}/g, '  ').trim();
}

function esc(s='') {
  return String(s).replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
}

function splitList(s='') {
  return clean(s).split(/[,;\n]+/).map(x => x.trim()).filter(Boolean);
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean).map(x => clean(x)))];
}

function id(prefix='id') {
  return `${prefix}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36)}`;
}

function saveLocal() {
  localStorage.setItem('sourcingos_talent_search_v1', JSON.stringify(state));
}

function loadLocal() {
  try {
    const raw = localStorage.getItem('sourcingos_talent_search_v1');
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch (e) {}
  renderProjectDropdown();
  renderCandidateCards();
}

function role() {
  return {
    roleTitle: clean($('roleTitle').value),
    mustHaves: splitList($('mustHaves').value),
    niceHaves: splitList($('niceHaves').value),
    clearance: $('clearance').value,
    location: clean($('location').value),
    targetCompanies: splitList($('targetCompanies').value),
    feedback: clean($('feedback').value)
  };
}

function fillRole(r) {
  $('roleTitle').value = r.roleTitle || '';
  $('mustHaves').value = (r.mustHaves || []).join(', ');
  $('niceHaves').value = (r.niceHaves || []).join(', ');
  if (r.clearance) $('clearance').value = r.clearance;
  $('location').value = r.location || '';
  $('targetCompanies').value = (r.targetCompanies || []).join(', ');
  $('feedback').value = r.feedback || '';
}

function selectedSources() {
  return [...document.querySelectorAll('.sourceBox:checked')].map(x => x.value);
}

function detectIntent(text) {
  const t = clean(text).toLowerCase();
  if (!t) return 'waiting for input';
  if (/(responsibilities|qualifications|required|preferred|job description|about the role|requirements)/i.test(text) && text.length > 500) return 'JD / role intake';
  if (/(experience|current|previous|skills|education|resume|linkedin|github|clearance|worked at|engineer|analyst|developer)/i.test(text) && text.length > 300) return 'profile / resume review';
  if (/(\bAND\b|\bOR\b|site:|intitle:|inurl:|\(|\))/i.test(text)) return 'Boolean / search string';
  return 'natural-language talent search';
}

function updateIntent() {
  const intent = detectIntent($('commandInput').value);
  $('intentChip').textContent = 'Intent: ' + intent;
}

function piiRisk(text) {
  const risks = [];
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) risks.push('possible SSN');
  if (/\b\d{1,2}\/\d{1,2}\/(19|20)\d{2}\b/.test(text)) risks.push('possible DOB');
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)) risks.push('email');
  if (/\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(text)) risks.push('phone');
  return risks;
}

function handleCommand() {
  const text = clean($('commandInput').value);
  const risks = piiRisk(text);
  if (risks.length) {
    setCopilot(`Blocked possible sensitive data: ${risks.join(', ')}. Redact before using SourcingOS.`);
    toast('Redact first');
    return;
  }
  const intent = detectIntent(text);
  updateIntent();
  if (intent.includes('JD')) analyzeJD();
  else if (intent.includes('profile')) reviewProfile();
  else if (intent.includes('Boolean')) saveSearchFromCommand();
  else buildFromNaturalLanguage();
}

function loadTemplate(key) {
  const t = templates[key];
  if (!t) return;
  fillRole({ ...t, mustHaves: splitList(t.mustHaves), niceHaves: splitList(t.niceHaves), targetCompanies: splitList(t.targetCompanies) });
  buildSearches();
  toast('Template loaded');
}

function buildFromNaturalLanguage() {
  const text = clean($('commandInput').value);
  if (!text) return;
  if (!$('roleTitle').value) $('roleTitle').value = inferRoleTitle(text);
  const skills = extractSkills(text);
  const companies = extractCompanies(text);
  if (skills.length && !$('mustHaves').value) $('mustHaves').value = skills.join(', ');
  if (companies.length && !$('targetCompanies').value) $('targetCompanies').value = companies.join(', ');
  if (!$('location').value) $('location').value = inferLocation(text);
  if (/ts\/sci|poly|secret|public trust/i.test(text)) $('clearance').value = inferClearance(text);
  buildSearches();
  setCopilot('I translated the natural-language request into role context and built platform-specific searches. Review/edit the Role Context panel before running searches in external platforms.');
}

function analyzeJD() {
  const text = clean($('commandInput').value);
  if (!text) {
    setCopilot('Paste a JD or role notes into the command bar first.');
    return;
  }
  const extracted = {
    roleTitle: inferRoleTitle(text),
    mustHaves: extractSkills(text).slice(0, 12),
    niceHaves: extractNice(text).slice(0, 10),
    clearance: inferClearance(text),
    location: inferLocation(text),
    targetCompanies: extractCompanies(text),
    feedback: 'Review exact must-haves with HM. Treat clearance language as stated requirement context, not candidate verification.'
  };
  fillRole(extracted);
  setCopilot(`JD analyzed. I extracted role context and filled the left panel.\n\nMust-haves: ${extracted.mustHaves.join(', ') || 'Add manually'}\nNice-to-haves: ${extracted.niceHaves.join(', ') || 'Add manually'}\nClearance context: ${extracted.clearance}\nLocation: ${extracted.location || 'Not detected'}`);
  buildSearches();
}

function inferRoleTitle(text) {
  const t = text.toLowerCase();
  if (t.includes('devsecops')) return 'DevSecOps Engineer';
  if (t.includes('java')) return 'Java Software Engineer';
  if (t.includes('rmf') || t.includes('cyber')) return 'Cyber / RMF Analyst';
  if (t.includes('data engineer')) return 'Data Engineer';
  if (t.includes('machine learning') || t.includes('ai engineer')) return 'AI / ML Engineer';
  if (t.includes('sourcer') || t.includes('recruiter')) return 'Technical Sourcer';
  const m = text.match(/(?:title|role|position)[:\-]\s*([^\n]{5,80})/i);
  return m ? clean(m[1]) : 'Technical Role';
}

function extractSkills(text) {
  const bank = ['Java','Spring Boot','Python','TypeScript','React','Node','AWS','AWS GovCloud','Azure','Kubernetes','Docker','Terraform','Linux','DevSecOps','CI/CD','GitLab','Jenkins','Splunk','Elastic','RMF','eMASS','STIG','ACAS','Nessus','Security+','CISSP','CySA','FedRAMP','NIST','SIEM','Incident Response','Data Engineering','SQL','Databricks','Machine Learning','AI','LLM','GitHub','Boolean','X-Ray','LinkedIn Recruiter','ClearanceJobs','Avature'];
  const t = text.toLowerCase();
  return uniq(bank.filter(s => t.includes(s.toLowerCase())));
}

function extractNice(text) {
  const bank = ['CI Poly','Full Scope Poly','FSP','DoD 8570','DoD 8140','CISSP','CISA','PMP','Scrum','Agile','GovCon','defense','federal','mission','SCIF'];
  const t = text.toLowerCase();
  return uniq(bank.filter(s => t.includes(s.toLowerCase())));
}

function extractCompanies(text) {
  const bank = ['Booz Allen','Leidos','CACI','Peraton','SAIC','GDIT','Northrop','Lockheed','ManTech','Raytheon','RTX','Boeing','Maximus','Accenture Federal','Deloitte','Guidehouse','Jacobs','Parsons','Amentum','Noblis','MITRE','Palantir','AWS','Microsoft'];
  const t = text.toLowerCase();
  return uniq(bank.filter(s => t.includes(s.toLowerCase())));
}

function inferClearance(text) {
  const t = text.toLowerCase();
  if (t.includes('full scope') || t.includes('fsp')) return 'TS/SCI + FSP';
  if (t.includes('ci poly') || t.includes('poly')) return 'TS/SCI + CI Poly';
  if (t.includes('ts/sci')) return 'TS/SCI';
  if (t.includes('top secret')) return 'Top Secret';
  if (t.includes('secret')) return 'Secret';
  if (t.includes('public trust')) return 'Public Trust';
  return 'Non-cleared / not required';
}

function inferLocation(text) {
  const places = ['Fort Meade','Annapolis Junction','Chantilly','Reston','Herndon','Arlington','McLean','DMV','Northern Virginia','Colorado Springs','Huntsville','Tampa','San Antonio','Remote','Hybrid','Onsite'];
  const t = text.toLowerCase();
  return places.filter(p => t.includes(p.toLowerCase())).join(', ');
}

function quote(items) {
  return uniq(items).map(x => `"${x}"`).join(' OR ');
}

function titleVariants(title) {
  const t = title.toLowerCase();
  if (t.includes('devsecops')) return ['DevSecOps Engineer','Platform Engineer','SRE','Site Reliability Engineer','Cloud Engineer'];
  if (t.includes('java')) return ['Java Developer','Java Engineer','Backend Engineer','Software Engineer'];
  if (t.includes('cyber') || t.includes('rmf')) return ['Cyber Analyst','RMF Analyst','ISSO','ISSM','Security Engineer'];
  if (t.includes('data')) return ['Data Engineer','ETL Developer','Analytics Engineer'];
  if (t.includes('sourcer')) return ['Technical Sourcer','Talent Sourcer','Recruiting Sourcer','Senior Sourcer'];
  return [title || 'Engineer','Specialist','Analyst'];
}

function clearanceTerms(clearance) {
  if (!clearance || clearance.startsWith('Non-cleared')) return [];
  if (clearance.includes('Poly')) return ['TS/SCI','CI Poly','polygraph','security clearance'];
  return [clearance,'security clearance','cleared'];
}

function buildSearches() {
  const r = role();
  if (!r.roleTitle && !r.mustHaves.length) {
    setCopilot('Add a role title or paste a JD/request first, then I can build platform-specific searches.');
    return;
  }
  const sources = selectedSources();
  const cards = sources.map(src => makeSearchCard(src, r));
  state.searches = cards.map(c => ({ id: id('search'), projectId: state.activeProjectId, ...c, createdAt: new Date().toISOString() }));
  saveLocal();
  renderSearchCards(cards);
  setCopilot(`Built ${cards.length} platform search cards. Copy these into the native platforms. SourcingOS does not scrape or run searches inside paid/restricted tools.`);
}

function makeSearchCard(src, r) {
  const titles = titleVariants(r.roleTitle);
  const skills = r.mustHaves.length ? r.mustHaves : ['required skill'];
  const companies = r.targetCompanies;
  const clearance = clearanceTerms(r.clearance);
  const base = `(${quote(titles)}) AND (${quote(skills.slice(0,8))})`;
  const clearanceBlock = clearance.length ? ` AND (${quote(clearance)})` : '';
  const companyBlock = companies.length ? ` AND (${quote(companies.slice(0,10))})` : '';
  let query = base + clearanceBlock + companyBlock;
  let filters = [];
  let why = 'Uses title variants, must-have skills, target companies, and role context.';

  if (src === 'linkedin') {
    filters = ['Use current/past company filters', 'Add location radius if needed', 'Try Spotlights manually', 'Save promising profiles to LinkedIn project'];
  }
  if (src === 'clearancejobs') {
    query = `${r.roleTitle} ${skills.slice(0,8).join(' ')} ${clearance.join(' ')} ${r.location}`.trim();
    filters = ['Run clearance level filter inside ClearanceJobs', 'Treat candidate-stated clearance as unverified', 'Use location/work model filters'];
    why = 'ClearanceJobs works best with compact keyword strings plus platform filters.';
  }
  if (src === 'indeed') {
    query = `${r.roleTitle} ${skills.slice(0,8).join(' ')} ${r.location}`.trim();
    filters = ['Prioritize recent resumes', 'Expect higher noise', 'Use skill/title variants broadly'];
    why = 'Indeed is volume-oriented, so this keeps the query readable and lets you triage manually.';
  }
  if (src === 'github') {
    query = `site:github.com (${quote(skills.slice(0,6))}) (${quote(titles.slice(0,3))}) ${r.location || ''}`;
    filters = ['Review repos/activity manually', 'Look for professional evidence, not personal traits', 'Use GitHub only when technical evidence matters'];
    why = 'GitHub/Web is best for technical proof signals, projects, repos, languages, and public work.';
  }
  if (src === 'xray') {
    query = `site:linkedin.com/in ${base}${clearanceBlock}${companyBlock} ${r.location || ''}`;
    filters = ['Paste into Google', 'Open results manually', 'Do not scrape result pages'];
    why = 'X-Ray helps discover public profile pages and alternate phrasing outside platform search.';
  }
  if (src === 'avature') {
    query = uniq([...titles, ...skills.slice(0,8), ...companies.slice(0,8), ...clearance]).join(' | ');
    filters = ['Run rediscovery before external sourcing', 'Search silver medalists/past applicants', 'Paste notes back into Avature as system of record'];
    why = 'Avature should be checked for rediscovery before creating net-new sourcing work.';
  }
  return { source: src, platform: platformLabels[src], query, filters, why };
}

function renderSearchCards(cards = state.searches) {
  const el = $('searchCards');
  if (!cards.length) {
    el.innerHTML = '<div class="empty-state">Build searches to see platform cards.</div>';
    return;
  }
  el.innerHTML = cards.map(c => `
    <article class="search-card">
      <div class="card-top"><div><div class="platform-name">${esc(c.platform)}</div><div class="subtle">Copy/paste into native platform</div></div><span class="badge ${c.source==='clearancejobs'?'warn':'good'}">${c.source}</span></div>
      <pre id="q-${c.source}">${esc(c.query)}</pre>
      <div class="badge-row">${c.filters.map(f => `<span class="badge">${esc(f)}</span>`).join('')}</div>
      <p class="subtle">${esc(c.why)}</p>
      <div class="card-actions"><button class="small-btn primary" onclick="copyRaw(${JSON.stringify(c.query)})">Copy</button><button class="small-btn" onclick="saveSearch(${JSON.stringify(c).replace(/"/g,'&quot;')})">Save Search</button><button class="small-btn" onclick="explainSearch(${JSON.stringify(c).replace(/"/g,'&quot;')})">Explain</button></div>
    </article>`).join('');
}

function saveSearchFromCommand() {
  const text = clean($('commandInput').value);
  if (!text) return;
  const c = { source: 'manual', platform: 'Manual Search', query: text, filters: ['User-pasted Boolean/search string'], why: 'Saved from command bar.' };
  state.searches.unshift({ id: id('search'), projectId: state.activeProjectId, ...c, createdAt: new Date().toISOString() });
  saveLocal();
  renderSearchCards(state.searches);
  setCopilot('Saved the pasted Boolean/search string. You can use it as a baseline and improve it from the Copilot.');
}

function saveSearch(c) {
  state.searches.unshift({ id: id('search'), projectId: state.activeProjectId, ...c, createdAt: new Date().toISOString() });
  saveLocal();
  toast('Search saved');
}

function explainSearch(c) {
  setCopilot(`${c.platform}\n\nWhy this search works:\n${c.why}\n\nRecommended filters:\n- ${c.filters.join('\n- ')}\n\nUse this as a starting point and tune based on result quality.`);
}

function improveBoolean() {
  const r = role();
  const balanced = makeSearchCard('linkedin', r).query;
  const broad = `(${quote(titleVariants(r.roleTitle))}) AND (${quote(r.mustHaves.slice(0,4))})`;
  const narrow = balanced + (r.location ? ` AND "${r.location.split(',')[0].trim()}"` : '');
  setCopilot(`Boolean options\n\nBroad:\n${broad}\n\nBalanced:\n${balanced}\n\nNarrow:\n${narrow}\n\nRecommendation: start balanced, then use broad if the result count is too thin.`);
}

function reviewProfile() {
  const text = clean($('commandInput').value);
  const risks = piiRisk(text);
  if (risks.length) {
    setCopilot(`Blocked possible sensitive data: ${risks.join(', ')}. Redact before review.`);
    return;
  }
  if (!text) {
    setCopilot('Paste profile/resume notes into the command bar first.');
    return;
  }
  const r = role();
  const matched = r.mustHaves.filter(s => text.toLowerCase().includes(s.toLowerCase()));
  const missing = r.mustHaves.filter(s => !text.toLowerCase().includes(s.toLowerCase())).slice(0, 8);
  const clearanceMentions = findClearanceMentions(text);
  const title = inferCandidateTitle(text);
  const company = inferCandidateCompany(text);
  const evidence = buildEvidence(text, matched);
  const confidence = matched.length >= Math.max(3, Math.ceil(r.mustHaves.length * .55)) ? 'High' : matched.length >= 2 ? 'Medium' : 'Low';
  const cand = {
    id: id('cand'),
    projectId: state.activeProjectId,
    source: inferSource(text),
    name: 'Candidate ' + (state.candidates.length + 1),
    title,
    company,
    matched,
    missing,
    clearanceMentions,
    evidence,
    confidence,
    outreachAngle: outreachAngle(r, matched, company),
    notes: '',
    stage: 'Under Review',
    createdAt: new Date().toISOString()
  };
  state.candidates.unshift(cand);
  saveLocal();
  renderCandidateCards();
  setCopilot(`Profile reviewed. Confidence: ${confidence}. I saved an evidence card locally. Clearance language, if present, is candidate-stated only and not verification.`);
}

function inferCandidateTitle(text) {
  const lines = text.split('\n').map(x => x.trim()).filter(Boolean);
  const hit = lines.find(l => /(engineer|developer|analyst|sourcer|recruiter|architect|manager|administrator|specialist)/i.test(l));
  return hit ? hit.slice(0,90) : 'Role not detected';
}

function inferCandidateCompany(text) {
  const companies = extractCompanies(text);
  return companies[0] || 'Company not detected';
}

function inferSource(text) {
  const t = text.toLowerCase();
  if (t.includes('github')) return 'GitHub/Web';
  if (t.includes('clearancejobs')) return 'ClearanceJobs';
  if (t.includes('linkedin')) return 'LinkedIn';
  if (t.includes('indeed')) return 'Indeed';
  return 'Manual / pasted profile';
}

function findClearanceMentions(text) {
  const patterns = ['TS/SCI + CI Poly','TS/SCI with CI Poly','TS/SCI','Top Secret','Secret','Public Trust','Full Scope Poly','FSP','CI Poly','polygraph','security clearance'];
  const t = text.toLowerCase();
  return uniq(patterns.filter(p => t.includes(p.toLowerCase())));
}

function buildEvidence(text, matched) {
  const lines = text.split(/[\n\.]/).map(x => x.trim()).filter(Boolean);
  const ev = [];
  matched.forEach(skill => {
    const line = lines.find(l => l.toLowerCase().includes(skill.toLowerCase()));
    if (line) ev.push(`${skill}: ${line.slice(0,160)}`);
  });
  return ev.slice(0, 5);
}

function outreachAngle(r, matched, company) {
  const skillPhrase = matched.slice(0,3).join(', ') || r.mustHaves.slice(0,3).join(', ') || 'relevant mission work';
  return `Reference ${skillPhrase}${company !== 'Company not detected' ? ' and background at ' + company : ''}. Keep it brief and ask about role fit rather than assuming interest.`;
}

function renderCandidateCards() {
  renderProjectDropdown();
  const el = $('candidateCards');
  const rows = state.candidates.filter(c => !state.activeProjectId || !c.projectId || c.projectId === state.activeProjectId);
  if (!rows.length) {
    el.innerHTML = '<div class="empty-state">Paste profile/resume text into the command bar and click <strong>Review Profile</strong>.</div>';
    return;
  }
  el.innerHTML = rows.map(c => `
    <article class="candidate-card">
      <div class="card-top"><div><div class="platform-name">${esc(c.name)}</div><div class="subtle">${esc(c.title)} · ${esc(c.company)}</div></div><span class="badge good">${esc(c.source)}</span></div>
      <div class="badge-row"><span class="badge">${esc(c.confidence)} fit signal</span>${c.clearanceMentions.map(x => `<span class="badge warn">${esc(x)} · candidate-stated/not verified</span>`).join('')}</div>
      <strong>Matched skills</strong><div class="badge-row">${(c.matched.length?c.matched:['No direct must-have matches detected']).map(x => `<span class="badge good">${esc(x)}</span>`).join('')}</div>
      <strong>Missing / verify</strong><div class="badge-row">${(c.missing.length?c.missing:['Verify details manually']).map(x => `<span class="badge red">${esc(x)}</span>`).join('')}</div>
      <strong>Evidence</strong><ul class="evidence-list">${(c.evidence.length?c.evidence:['No specific evidence extracted from pasted text.']).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="subtle"><strong>Outreach angle:</strong> ${esc(c.outreachAngle)}</p>
      <div class="card-actions"><button class="small-btn primary" onclick="draftOutreach('${c.id}')">Draft Outreach</button><button class="small-btn" onclick="markCandidate('${c.id}','Shortlisted')">Shortlist</button><button class="small-btn" onclick="markCandidate('${c.id}','Not Relevant')">Not Relevant</button><button class="small-btn" onclick="copyRaw(${JSON.stringify(candidateSummary(c))})">Copy Summary</button></div>
    </article>`).join('');
}

function candidateSummary(c) {
  return `${c.name}\nSource: ${c.source}\nCurrent: ${c.title} · ${c.company}\nFit signal: ${c.confidence}\nMatched: ${c.matched.join(', ')}\nMissing/verify: ${c.missing.join(', ')}\nClearance mention: ${c.clearanceMentions.join(', ') || 'None'} (candidate-stated/not verified)\nEvidence:\n- ${c.evidence.join('\n- ')}\nOutreach angle: ${c.outreachAngle}`;
}

function markCandidate(candidateId, stage) {
  const c = state.candidates.find(x => x.id === candidateId);
  if (!c) return;
  c.stage = stage;
  state.feedbackEvents.unshift({ id: id('fb'), candidateId, stage, at: new Date().toISOString() });
  saveLocal();
  renderCandidateCards();
  toast(stage);
}

function draftOutreach(candidateId) {
  const r = role();
  const c = candidateId ? state.candidates.find(x => x.id === candidateId) : state.candidates[0];
  if (!c) {
    $('outreachText').textContent = 'Review or save a profile first, then draft outreach.';
    return;
  }
  const text = `Hi [Name],\n\nI came across your background and thought it may line up with a ${r.roleTitle || 'role'} I am supporting. I noticed evidence around ${c.matched.slice(0,3).join(', ') || 'relevant technical work'}${c.company !== 'Company not detected' ? ' and your work connected to ' + c.company : ''}.\n\nI do not want to assume fit from keywords, but it looked worth a quick conversation. Open to comparing the role against your interests, location/work model, and any required verification steps?\n\nBest,\nDan`;
  $('outreachText').textContent = text;
  state.outreachDrafts.unshift({ id: id('outreach'), candidateId: c.id, projectId: state.activeProjectId, text, createdAt: new Date().toISOString(), approvalStatus: 'draft' });
  saveLocal();
  setCopilot('Drafted outreach from real evidence only. Copy it into LinkedIn/ClearanceJobs/email manually after editing.');
}

function draftHMUpdate() {
  const r = role();
  const candidates = state.candidates.filter(c => !state.activeProjectId || c.projectId === state.activeProjectId);
  const strong = candidates.filter(c => ['High','Medium'].includes(c.confidence));
  const searches = state.searches.filter(s => !state.activeProjectId || s.projectId === state.activeProjectId);
  const text = `Subject: ${r.roleTitle || 'Role'} sourcing update\n\nQuick sourcing update:\n\n- Searches prepared/run: ${searches.length}\n- Profiles reviewed in SourcingOS: ${candidates.length}\n- Strong/possible fits: ${strong.length}\n- Primary sources: ${uniq(searches.map(s => s.platform)).join(', ') || 'LinkedIn/ClearanceJobs/Indeed/GitHub/Avature'}\n\nCurrent blockers / watch-outs:\n- ${r.feedback || 'No blockers logged yet.'}\n- Clearance-related language is being treated as candidate-stated/unverified until confirmed through the approved process.\n\nNext search moves:\n- Continue target-company lane across ${r.targetCompanies.slice(0,6).join(', ') || 'priority companies'}\n- Recalibrate title/skill terms based on HM feedback\n- Rediscover prior candidates in Avature before expanding externally`;
  $('hmText').textContent = text;
  state.hmUpdates.unshift({ id: id('hm'), projectId: state.activeProjectId, text, createdAt: new Date().toISOString() });
  saveLocal();
  setCopilot('Drafted an HM update. Edit it before sending or pasting into Avature/email.');
}

function suggestNextMove() {
  const r = role();
  const companies = r.targetCompanies.slice(0,8).join(', ') || 'target companies';
  const skills = r.mustHaves.slice(0,6).join(', ') || 'must-have skills';
  setCopilot(`Next search moves:\n\n1. Run Avature rediscovery first using: ${skills}\n2. Run LinkedIn target-company lane against: ${companies}\n3. If ClearanceJobs is thin, broaden title terms and keep must-have skill terms tight.\n4. Review saved candidate misses and add disqualifiers before regenerating Boolean.\n5. Ask HM whether location, clearance level, or nice-to-haves can flex if the pool is too narrow.`);
}

function saveLearning() {
  const note = clean($('commandInput').value) || clean($('feedback').value);
  if (!note) {
    setCopilot('Type feedback or a learning into the command bar first, such as “HM likes defense prime backgrounds, not commercial-only cloud.”');
    return;
  }
  state.feedbackEvents.unshift({ id: id('learn'), projectId: state.activeProjectId, note, at: new Date().toISOString() });
  $('feedback').value = ($('feedback').value ? $('feedback').value + '\n' : '') + note;
  saveLocal();
  setCopilot('Saved this learning to project memory. Future searches should use it as a constraint or preference.');
}

function saveProject() {
  const r = role();
  const project = {
    id: state.activeProjectId || id('proj'),
    name: r.roleTitle || 'Untitled sourcing project',
    role: r,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  const existing = state.projects.findIndex(p => p.id === project.id);
  if (existing >= 0) state.projects[existing] = { ...state.projects[existing], ...project, createdAt: state.projects[existing].createdAt };
  else state.projects.unshift(project);
  state.activeProjectId = project.id;
  saveLocal();
  renderProjectDropdown();
  toast('Project saved');
}

function renderProjectDropdown() {
  const select = $('activeProject');
  if (!select) return;
  const current = state.activeProjectId;
  select.innerHTML = '<option value="">New sourcing project</option>' + state.projects.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
  select.value = current || '';
}

function loadProjectFromSelect() {
  const idv = $('activeProject').value;
  state.activeProjectId = idv;
  const p = state.projects.find(x => x.id === idv);
  if (p) fillRole(p.role);
  renderSearchCards(state.searches.filter(s => !idv || s.projectId === idv));
  renderCandidateCards();
}

function setCopilot(text) {
  $('copilotOutput').textContent = text;
}

function copyRaw(text) {
  navigator.clipboard.writeText(text).then(() => toast('Copied')).catch(() => toast('Copy failed'));
}

function copyText(idv) {
  copyRaw($(idv).innerText || $(idv).textContent || '');
}

window.addEventListener('load', () => {
  loadLocal();
  updateIntent();
  renderSearchCards(state.searches.slice(0, 6));
});

document.addEventListener('input', e => {
  if (e.target && e.target.id === 'commandInput') updateIntent();
});

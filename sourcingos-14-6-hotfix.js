/* SourcingOS 14.6.1 intake hotfix: make pasted JD parsing reliable. */
(function(){
  const skillBank=['Java','Spring Boot','Python','TypeScript','React','Node','AWS','AWS GovCloud','Azure','Kubernetes','Docker','Terraform','Linux','DevSecOps','CI/CD','GitLab','Jenkins','Splunk','Elastic','RMF','eMASS','STIG','ACAS','Nessus','Security+','CISSP','CySA','FedRAMP','NIST','SIEM','Incident Response','Data Engineering','SQL','Databricks','Machine Learning','AI','LLM','GitHub','Boolean','X-Ray','LinkedIn Recruiter','ClearanceJobs','Avature','REST APIs','microservices'];
  const companyBank=['Booz Allen','Leidos','CACI','Peraton','SAIC','GDIT','Northrop','Lockheed','ManTech','Raytheon','RTX','Boeing','Maximus','Accenture Federal','Deloitte','Guidehouse','Jacobs','Parsons','Amentum','Noblis','MITRE','Palantir','AWS','Microsoft'];
  const $=id=>document.getElementById(id);
  const clean=s=>String(s||'').replace(/[\u201C\u201D]/g,'"').replace(/[\u2018\u2019]/g,"'").replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' ').trim();
  const uniq=a=>[...new Set((a||[]).map(clean).filter(Boolean))];
  function toast(msg){let el=$('toast'); if(!el){el=document.createElement('div'); el.id='toast'; el.className='toast'; document.body.appendChild(el)} el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),1600)}
  function inferTitle(text){const t=text.toLowerCase(); const titleLine=text.match(/(?:job title|title|role|position)\s*[:\-]\s*([^\n]{4,100})/i); if(titleLine)return clean(titleLine[1]); if(t.includes('devsecops'))return 'DevSecOps Engineer'; if(t.includes('java'))return 'Java Software Engineer'; if(t.includes('rmf')||t.includes('cyber'))return 'Cyber / RMF Analyst'; if(t.includes('data engineer'))return 'Data Engineer'; if(t.includes('machine learning')||t.includes('ai engineer'))return 'AI / ML Engineer'; if(t.includes('sourcer')||t.includes('recruiter'))return 'Technical Sourcer'; return 'Technical Role'}
  function inferClearance(text){const t=text.toLowerCase(); if(t.includes('full scope')||t.includes('fsp'))return 'TS/SCI + FSP'; if(t.includes('ci poly')||t.includes('polygraph')||t.includes('ci/poly'))return 'TS/SCI + CI Poly'; if(t.includes('ts/sci'))return 'TS/SCI'; if(t.includes('top secret'))return 'Top Secret'; if(t.includes('secret'))return 'Secret'; if(t.includes('public trust'))return 'Public Trust'; return 'Non-cleared / not required'}
  function inferLoc(text){const places=['Fort Meade','Annapolis Junction','Chantilly','Reston','Herndon','Arlington','McLean','DMV','Northern Virginia','Colorado Springs','Huntsville','Tampa','San Antonio','Remote','Hybrid','Onsite','Minnesota','Minneapolis','St Paul']; const t=text.toLowerCase(); return places.filter(p=>t.includes(p.toLowerCase())).join(', ')}
  function extract(text,bank){const t=text.toLowerCase(); return uniq(bank.filter(s=>t.includes(s.toLowerCase())))}
  function parseJD(text){
    const skills=extract(text,skillBank);
    const niceHints=['CI Poly','GitLab','Jenkins','Nessus','eMASS','Security+','CISSP','CySA+','FedRAMP','NIST','Docker','Kubernetes'];
    const nice=uniq(niceHints.filter(s=>text.toLowerCase().includes(s.toLowerCase()))).filter(x=>!skills.includes(x));
    return {roleTitle:inferTitle(text),mustHaves:skills.slice(0,14),niceHaves:nice.slice(0,8),clearance:inferClearance(text),location:inferLoc(text),targetCompanies:extract(text,companyBank),feedback:'Parsed from pasted JD. Review must-haves with HM. Treat clearance as requirement context only, not candidate verification.'};
  }
  function applyRole(role){
    const app=window.SourcingOS;
    if(!app||!app.state){toast('SourcingOS state not ready yet'); return false;}
    app.state.role=role;
    app.state.mode='search';
    try{localStorage.setItem('sourcingos_unified_v146',JSON.stringify(app.state));}catch(e){}
    if(typeof app.setMode==='function') app.setMode('search');
    toast('JD parsed');
    return true;
  }
  function analyzeFromCommand(){
    const text=clean($('commandInput')?.value||'');
    if(!text){toast('Paste a JD first'); return false;}
    if(/\b\d{3}-\d{2}-\d{4}\b/.test(text)){toast('Redact possible SSN first'); return false;}
    return applyRole(parseJD(text));
  }
  document.addEventListener('click',function(e){
    const btn=e.target && e.target.closest && e.target.closest('button');
    if(!btn) return;
    if(btn.id==='analyze'){
      e.preventDefault(); e.stopPropagation(); analyzeFromCommand();
    }
    if(btn.id==='buildSearches' || btn.id==='buildSearches2'){
      const hasRole=window.SourcingOS?.state?.role?.roleTitle;
      const hasText=clean($('commandInput')?.value||'').length>20;
      if(!hasRole && hasText){ e.preventDefault(); e.stopPropagation(); if(analyzeFromCommand() && window.SourcingOS?.buildSearches) setTimeout(()=>window.SourcingOS.buildSearches(),50); }
    }
  },true);
  window.SourcingOSParseJD=parseJD;
})();

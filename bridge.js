(function(){
  let pendingBridgeImport = null;

  function id(prefix='id'){
    return prefix + '_' + Math.random().toString(36).slice(2,9) + '_' + Date.now().toString(36);
  }

  function arr(x){ return Array.isArray(x) ? x : (x ? [x] : []); }
  function val(k){ return document.getElementById(k)?.value || ''; }
  function ensure(){
    try {
      state.projects ||= [];
      state.candidates ||= [];
      state.outputs ||= {};
      state.importedArtifacts ||= [];
      state.importHistory ||= [];
    } catch(e) {}
  }
  function html(s){ return String(s||'').replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }
  function fileDownload(name,type,content){
    if (typeof download === 'function') return download(name,type,content);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content],{type}));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function setIfEmpty(field, value){
    const el = document.getElementById(field);
    if (!el || el.value || value == null) return;
    el.value = Array.isArray(value) ? value.join(', ') : String(value);
  }

  function normalizePayload(o){
    if (o && o.schema === 'sourcingos_project_bridge' && (o.version === '1.1' || o.schemaVersion === '1.1.0')) return o;

    const sourcePack = o.sourcePack || o.source_pack || o.project_pack?.sourcePack || {};
    const clearanceStrategy = o.clearanceStrategy || o.clearance_strategy || {};
    const role = o.roleIntake || o.role_intake || o.role_context || {};
    const project = o.project || {};
    const isRegistry = o.schema === 'sourcingos_project_pack' || o.schema === 'sourcingos_master_project_pack' || o.schema === 'sourcingos_registry_module' || !!o.registry_count;
    const isCleared = o.schema === 'cleared_sourcing_strategy' || !!o.clearance_context || !!o.govcon_lanes;

    return {
      schema: 'sourcingos_project_bridge',
      version: '1.1',
      schemaVersion: '1.1.0',
      exportedAt: o.exportedAt || o.exported_at || new Date().toISOString(),
      generatedBy: isRegistry ? 'registry' : isCleared ? 'cleared_copilot' : 'import_hub',
      sourceSchema: o.schema || o.schemaVersion || 'unknown',
      project: {
        projectId: project.projectId || project.id || o.project_id || id('proj'),
        name: project.name || o.project_name || o.projectName || role.projectName || val('roleName') || 'Imported SourcingOS Project',
        roleTitle: project.roleTitle || o.role_title || o.roleTitle || role.title || val('roleName') || 'Imported Role',
        clientOrProgram: project.clientOrProgram || o.clientOrProgram || val('client') || '',
        status: project.status || val('status') || 'Active',
        createdAt: project.createdAt || o.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      roleIntake: {
        clearanceContext: role.clearanceContext || role.target_clearance_level || o.clearance_context || val('clearance') || '',
        location: role.location || role.location_requirement || o.location || val('location') || '',
        workModel: role.workModel || 'unspecified',
        requiredSkills: arr(role.requiredSkills || role.required_skills || o.required_skills || o.skills || sourcePack.requiredSkills),
        niceToHaveSkills: arr(role.niceToHaveSkills || role.nice_to_have_skills || o.nice_to_have_skills || o.nice),
        targetCompanies: arr(role.targetCompanies || role.target_companies || o.target_companies || o.companies),
        constraints: arr(role.constraints || o.constraints || o.risks),
        jdNotes: role.jdNotes || val('jdText') || '',
        candidateProfileNotes: role.candidateProfileNotes || val('candidateText') || '',
        riskNotes: role.riskNotes || val('notes') || ''
      },
      sourcePack: {
        sourceLanes: arr(sourcePack.sourceLanes || sourcePack.source_lanes || o.source_lanes || o.lanes),
        booleanStrings: arr(sourcePack.booleanStrings || sourcePack.boolean_strings || o.boolean_strings || o.search_strings || o.searchStrings),
        xrayStrings: arr(sourcePack.xrayStrings || sourcePack.xray_strings || o.xray_strings),
        clearanceJobsStrings: arr(sourcePack.clearanceJobsStrings || sourcePack.clearancejobs_strings || o.clearanceJobsStrings),
        targetCompanyLanes: arr(sourcePack.targetCompanyLanes || sourcePack.target_company_lanes || o.targetCompanyLanes),
        recommendedResources: arr(sourcePack.recommendedResources || sourcePack.recommended_resources || o.recommended_resources || o.resources || o.resource_vault),
        riskWarnings: arr(sourcePack.riskWarnings || sourcePack.risk_warnings || o.risk_warnings || o.compliance_checklist)
      },
      clearanceStrategy: {
        clearanceContext: clearanceStrategy.clearanceContext || o.clearance_context || role.clearanceContext || '',
        breadcrumbRules: arr(clearanceStrategy.breadcrumbRules || clearanceStrategy.breadcrumb_rules || o.breadcrumb_rules),
        verificationRules: arr(clearanceStrategy.verificationRules || clearanceStrategy.verification_rules || o.verification_rules),
        govconLanes: arr(clearanceStrategy.govconLanes || clearanceStrategy.govcon_lanes || o.govcon_lanes),
        screeningQuestions: arr(clearanceStrategy.screeningQuestions || o.screening_questions),
        hmNote: clearanceStrategy.hmNote || o.hiring_manager_notes || '',
        searchDifficultyEstimate: clearanceStrategy.searchDifficultyEstimate || ''
      },
      candidates: arr(o.candidates || o.candidateEvidence || o.candidate_pipeline),
      outreach: arr(o.outreach || o.outreachDrafts),
      memory: o.memory || o.projectMemory || { positivePatterns: [], negativePatterns: [], hmFeedback: [], searchAdjustments: [] },
      feedback: arr(o.feedback || o.feedbackEvents),
      guardrails: {
        noAutoSend: true,
        noAutoMerge: true,
        noVerifiedClearanceClaims: true,
        humanApprovalRequired: true,
        noPIIExport: true,
        noClassifiedData: true,
        noRestrictedSiteScraping: true,
        noProtectedClassInference: true,
        ...(o.guardrails || o.compliance || o.compliance_and_guardrails || {})
      }
    };
  }

  function applyBridgeToFields(b){
    const r = b.roleIntake || {}, p = b.project || {};
    setIfEmpty('roleName', p.roleTitle || p.name);
    setIfEmpty('client', p.clientOrProgram);
    setIfEmpty('location', r.location);
    setIfEmpty('must', r.requiredSkills);
    setIfEmpty('companies', r.targetCompanies);
    setIfEmpty('jdText', r.jdNotes);
    setIfEmpty('notes', r.riskNotes || r.constraints);
    if (r.clearanceContext && document.getElementById('clearance')) {
      const opts = [...document.getElementById('clearance').options].map(o => o.value);
      const match = opts.find(o => String(r.clearanceContext).toLowerCase().includes(o.toLowerCase()));
      if (match) document.getElementById('clearance').value = match;
    }
    if (typeof updateCounts === 'function') updateCounts();
  }

  window.importModule = function(mode){
    ensure();
    window.__sourcingosImportMode = mode || 'bridge';
    document.getElementById('bridgeFile')?.click();
  };

  window.handleImportFile = function(event){
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(){
      try {
        const raw = JSON.parse(reader.result);
        const normalized = normalizePayload(raw);
        pendingBridgeImport = { fileName: file.name, raw, normalized, mode: window.__sourcingosImportMode || 'bridge' };
        renderPreview();
        document.querySelector('.tab[onclick*="tab-assets"]')?.click();
        if (document.getElementById('importStatus')) document.getElementById('importStatus').textContent = 'Preview ready in Project Assets.';
      } catch(e) {
        if (document.getElementById('importStatus')) document.getElementById('importStatus').textContent = 'Import failed: invalid JSON. ' + e.message;
        if (typeof toast === 'function') toast('Invalid JSON');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  function renderPreview(){
    const el = document.getElementById('importPreview');
    if (!el || !pendingBridgeImport) return;
    const b = pendingBridgeImport.normalized;
    el.classList.remove('hide');
    el.innerHTML = '<h3>Import preview: '+html(pendingBridgeImport.fileName)+'</h3>'+
      '<p class="small">Detected '+html(b.generatedBy)+' · Schema '+html(b.version)+' · Project '+html(b.project?.name || 'Untitled')+'</p>'+
      '<pre>'+html(JSON.stringify(b,null,2).slice(0,2600))+'</pre>'+
      '<div class="btnrow"><button class="btn secondary" onclick="commitBridgeImport(\'merge\')">Merge into current project</button><button class="btn ghost" onclick="commitBridgeImport(\'artifact\')">Store as asset only</button><button class="btn red" onclick="cancelBridgeImport()">Cancel</button></div>';
  }

  window.cancelBridgeImport = function(){
    pendingBridgeImport = null;
    const el = document.getElementById('importPreview');
    if (el) { el.classList.add('hide'); el.innerHTML = ''; }
    if (typeof toast === 'function') toast('Import cancelled');
  };

  window.commitBridgeImport = function(commitMode){
    ensure();
    if (!pendingBridgeImport) return;
    const p = typeof currentProjectFields === 'function' ? currentProjectFields() : { id: id('proj') };
    if (!state.activeProjectId) {
      state.activeProjectId = p.id;
      if (!state.projects.some(x => x.id === p.id)) state.projects.unshift({...p, createdAt: new Date().toISOString()});
    }
    const asset = {
      id: id('asset'),
      projectId: state.activeProjectId,
      fileName: pendingBridgeImport.fileName,
      importedAt: new Date().toISOString(),
      mode: pendingBridgeImport.mode,
      sourceSchema: pendingBridgeImport.raw.schema || pendingBridgeImport.raw.schemaVersion || 'unknown',
      data: pendingBridgeImport.normalized
    };
    state.importedArtifacts.unshift(asset);
    state.importHistory.unshift({ assetId: asset.id, fileName: asset.fileName, sourceSchema: asset.sourceSchema, importedAt: asset.importedAt, commitMode: commitMode || 'artifact' });
    if (commitMode === 'merge') applyBridgeToFields(pendingBridgeImport.normalized);
    if (typeof saveLocal === 'function') saveLocal();
    if (typeof renderProjects === 'function') renderProjects();
    renderImportedArtifacts();
    cancelBridgeImport();
    if (typeof toast === 'function') toast('Import stored');
  };

  window.renderImportedArtifacts = function(){
    ensure();
    const el = document.getElementById('importedArtifacts');
    if (!el) return;
    const rows = state.importedArtifacts.filter(a => !state.activeProjectId || a.projectId === state.activeProjectId);
    if (!rows.length) { el.innerHTML = '<p class="small">No imported assets yet.</p>'; return; }
    el.innerHTML = rows.map(a => {
      const b = a.data || {}, sp = b.sourcePack || {}, cs = b.clearanceStrategy || {};
      return '<div class="box imported-asset"><h3>'+html(a.mode || 'Asset')+' · '+html(a.fileName)+'</h3>'+
        '<p class="small">Imported '+new Date(a.importedAt).toLocaleString()+' · Source schema: '+html(a.sourceSchema)+'</p>'+
        '<div class="asset-grid"><div><strong>Source pack</strong><p class="small">Lanes: '+arr(sp.sourceLanes).length+' · Boolean: '+arr(sp.booleanStrings).length+' · X-Ray: '+arr(sp.xrayStrings).length+' · Resources: '+arr(sp.recommendedResources).length+'</p></div>'+
        '<div><strong>Cleared strategy</strong><p class="small">Verification rules: '+arr(cs.verificationRules).length+' · GovCon lanes: '+arr(cs.govconLanes).length+'</p></div></div>'+
        '<div class="btnrow"><button class="btn small secondary" onclick="copyArtifact(\''+a.id+'\')">Copy Asset JSON</button><button class="btn small red" onclick="deleteArtifact(\''+a.id+'\')">Delete Asset</button></div></div>';
    }).join('');
  };

  window.copyArtifact = function(assetId){
    ensure();
    const a = state.importedArtifacts.find(x => x.id === assetId);
    if (!a) return;
    navigator.clipboard.writeText(JSON.stringify(a.data,null,2));
    if (typeof toast === 'function') toast('Asset copied');
  };

  window.deleteArtifact = function(assetId){
    ensure();
    state.importedArtifacts = state.importedArtifacts.filter(a => a.id !== assetId);
    if (typeof saveLocal === 'function') saveLocal();
    renderImportedArtifacts();
    if (typeof toast === 'function') toast('Asset deleted');
  };

  function detectWorkModel(s){
    const t = String(s||'').toLowerCase();
    if (t.includes('remote')) return 'remote';
    if (t.includes('hybrid')) return 'hybrid';
    if (t.includes('onsite') || t.includes('scif')) return 'onsite';
    return 'unspecified';
  }

  function buildBridgeExport(){
    ensure();
    const p = typeof currentProjectFields === 'function' ? currentProjectFields() : { id: id('proj') };
    const d = state.outputs?.d || (typeof buildData === 'function' ? buildData() : {});
    const lanes = state.outputs?.lanes || (typeof makeBooleanLanes === 'function' ? makeBooleanLanes(d) : {});
    const artifacts = state.importedArtifacts.filter(a => !state.activeProjectId || a.projectId === state.activeProjectId);
    return {
      schema: 'sourcingos_project_bridge',
      version: '1.1',
      schemaVersion: '1.1.0',
      exportedAt: new Date().toISOString(),
      generatedBy: 'sourcingos_workbench',
      project: {
        projectId: p.id,
        name: p.roleName || 'SourcingOS Project',
        roleTitle: p.roleName || d.title || 'SourcingOS Role',
        clientOrProgram: p.client || '',
        status: p.status || 'Active',
        createdAt: state.projects.find(x => x.id === p.id)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      roleIntake: {
        clearanceContext: p.clearance,
        location: p.location,
        workModel: detectWorkModel(p.location),
        requiredSkills: typeof words === 'function' ? words(p.must) : arr(p.must),
        niceToHaveSkills: [],
        targetCompanies: typeof words === 'function' ? words(p.companies) : arr(p.companies),
        constraints: typeof words === 'function' ? words(p.notes) : arr(p.notes),
        jdNotes: p.jdText,
        candidateProfileNotes: p.candidateText,
        riskNotes: p.notes
      },
      sourcePack: {
        sourceLanes: ['direct_fit','adjacent_title','clearance_breadcrumb','company_lane','location_lane'],
        booleanStrings: [lanes.direct,lanes.adjacent,lanes.clearance,lanes.company,lanes.location].filter(Boolean),
        xrayStrings: Object.entries(lanes).filter(([k]) => k !== 'clearanceJobs').map(([k,v]) => typeof xrayFrom === 'function' ? xrayFrom(v) : v),
        clearanceJobsStrings: [lanes.clearanceJobs].filter(Boolean),
        targetCompanyLanes: (document.getElementById('companyLanes')?.innerText || '').split('\n').filter(Boolean),
        recommendedResources: artifacts.flatMap(a => arr(a.data?.sourcePack?.recommendedResources)),
        riskWarnings: ['Public clearance terms are breadcrumbs only, not verification.','No restricted-site scraping or automated outreach.','Human review required before any candidate action.']
      },
      clearanceStrategy: {
        clearanceContext: p.clearance,
        breadcrumbRules: ['Never claim verified clearance from public text.','Treat clearance-related terms as search breadcrumbs only.'],
        verificationRules: ['Verify clearance only through approved employer or client process.','Confirm location, onsite expectations, compensation, and timeline directly.'],
        govconLanes: artifacts.flatMap(a => arr(a.data?.clearanceStrategy?.govconLanes)),
        screeningQuestions: (document.getElementById('screen')?.innerText || '').split('\n').filter(Boolean),
        hmNote: document.getElementById('hmNote')?.innerText || '',
        searchDifficultyEstimate: String(d.diff?.score || '')
      },
      candidates: (state.candidates || []).filter(c => !state.activeProjectId || !c.projectId || c.projectId === state.activeProjectId),
      outreach: [{ id: id('outreach'), candidateId: null, draftText: document.getElementById('outreach')?.innerText || '', approvalStatus: 'draft', humanApprovalRequired: true }],
      memory: { positivePatterns: [], negativePatterns: [], hmFeedback: [], searchAdjustments: [] },
      feedback: [],
      importedArtifacts: artifacts.map(a => ({ id: a.id, fileName: a.fileName, sourceSchema: a.sourceSchema, importedAt: a.importedAt })),
      guardrails: { noAutoSend:true, noAutoMerge:true, noVerifiedClearanceClaims:true, humanApprovalRequired:true, noPIIExport:true, noClassifiedData:true, noRestrictedSiteScraping:true, noProtectedClassInference:true }
    };
  }

  window.exportBridgeJSON = function(){
    if (typeof showRisk === 'function' && showRisk().length) { if (typeof toast === 'function') toast('Blocked sensitive pattern'); return; }
    fileDownload('sourcingos-project-bridge-v1-1.json','application/json',JSON.stringify(buildBridgeExport(),null,2));
  };

  const oldExportJSON = window.exportJSON;
  window.exportJSON = function(){
    fileDownload('sourcingos-workbench-backup.json','application/json',JSON.stringify({ state, project: typeof currentProjectFields === 'function' ? currentProjectFields() : {}, outputs: state.outputs, bridge: buildBridgeExport() },null,2));
  };

  window.purgeAll = function(){
    const phrase = prompt('This permanently deletes local Workbench projects, candidates, and imported assets in this browser. Type DELETE to confirm.');
    if (phrase !== 'DELETE') { if (typeof toast === 'function') toast('Purge cancelled'); return; }
    localStorage.removeItem('clearedSourcingOSV9');
    state = { projects: [], activeProjectId: null, candidates: [], outputs: {}, importedArtifacts: [], importHistory: [] };
    if (typeof clearFields === 'function') clearFields();
    if (typeof renderProjects === 'function') renderProjects();
    if (typeof renderCandidates === 'function') renderCandidates();
    renderImportedArtifacts();
    if (typeof toast === 'function') toast('Local data purged');
  };

  function injectStyles(){
    if (document.getElementById('bridgeStyles')) return;
    const style = document.createElement('style');
    style.id = 'bridgeStyles';
    style.textContent = '.asset-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.imported-asset{border-left:4px solid var(--blue)}.danger-zone{border-color:rgba(255,107,107,.35)}@media(max-width:760px){.asset-grid{grid-template-columns:1fr}}';
    document.head.appendChild(style);
  }

  window.addEventListener('load', function(){ ensure(); injectStyles(); renderImportedArtifacts(); });
})();
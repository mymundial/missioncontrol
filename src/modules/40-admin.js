  function renderAdmin(){
    const rows=CHECKPOINTS.map((cp,idx)=>adminCheckpoint(cp,idx)).join('');
    app.innerHTML=`<main class="admin-shell"><header class="admin-head"><div><div class="kicker">Silverstone Mission Control</div><h1>GPS Admin</h1><p>Coordinate changes are stored only on this browser/device. Master Silverstone values remain unchanged.</p></div><a class="btn secondary" href="/">Open Mission Control</a></header>
      <section class="admin-live panel"><div class="admin-live-head"><div><div class="kicker">Live GPS</div><h2 id="adminGpsStatus">${lastGps?'Signal Active':'Not Started'}</h2></div><button class="btn primary" id="adminStartGps">${lastGps?'Refresh GPS':'Start Live GPS'}</button></div><div class="admin-metrics"><div><span>Latitude</span><strong id="adminLat">${lastGps?lastGps.lat.toFixed(7):'—'}</strong></div><div><span>Longitude</span><strong id="adminLng">${lastGps?lastGps.lng.toFixed(7):'—'}</strong></div><div><span>Accuracy</span><strong id="adminAccuracy">${lastGps?`±${Math.round(lastGps.accuracy)} m`:'—'}</strong></div><div><span>Route Target</span><strong id="adminRouteTarget">${current()?.mc||'Complete'}</strong></div><div><span>Distance</span><strong id="adminRouteDistance">—</strong></div><div><span>Coordinate Source</span><strong id="adminCoordSource">${activeConfig(current())?.source||'—'}</strong></div></div></section>
      <section class="admin-tools panel"><div><div class="kicker">Device Tools</div><h2>Local Test Configuration</h2></div><div class="admin-tool-buttons"><button class="btn secondary" id="adminExport">Copy Overrides JSON</button><button class="btn secondary" id="adminTestMessage">Send Test Message</button><button class="btn secondary" id="adminClearMessages">Clear Comms Feed</button><button class="btn secondary" id="adminResetOverrides">Reset All Overrides</button><button class="btn danger" id="adminResetProgress">Reset Mission Progress</button></div><textarea id="adminImportText" class="admin-json" placeholder='Paste override JSON here to import'></textarea><button class="btn secondary" id="adminImport">Import JSON</button></section>
      <div class="admin-list">${rows}</div></main>`;
    bindAdmin();updateAdminGps();
  }
  function adminCheckpoint(cp,idx){
    const o=overrides[cp.id]; const cfg=activeConfig(cp); const isRoute=idx===state.routeIndex;
    return `<section class="admin-checkpoint panel ${o?'has-override':''}"><div class="admin-card-head"><div><div class="kicker">${cp.mc} · ${cp.location}</div><h2>${cp.name}</h2></div><span class="admin-source ${o?'local':''}">${o?'LOCAL':'MASTER'}</span></div>
      <div class="admin-master">Master: ${cp.lat.toFixed(14)}, ${cp.lng.toFixed(14)}${cp.id==='gantry'?' · QR only':''}</div>
      <div class="admin-fields"><label>Latitude<input data-field="lat" data-id="${cp.id}" type="number" step="0.0000001" value="${cfg.lat}"></label><label>Longitude<input data-field="lng" data-id="${cp.id}" type="number" step="0.0000001" value="${cfg.lng}"></label>${cp.geofence===false?'':`<label>Detection radius (m)<input data-field="detectionRadius" data-id="${cp.id}" type="number" min="10" max="500" step="1" value="${cfg.detectionRadius}"></label><label>Activation radius (m)<input data-field="activationRadius" data-id="${cp.id}" type="number" min="5" max="200" step="1" value="${cfg.activationRadius}"></label>`}</div>
      <div class="admin-actions"><button class="btn small secondary" data-admin-current="${cp.id}">Use My Current Location</button><button class="btn small primary" data-admin-save="${cp.id}">Save Override</button><button class="btn small secondary" data-admin-reset="${cp.id}" ${o?'':'disabled'}>Reset Override</button>${idx>=ROUTE_START_INDEX&&isRouteCheckpoint(cp)?`<button class="btn small ${isRoute?'success':'secondary'}" data-admin-route="${idx}">${isRoute?'Current Route Target':'Set as Next Checkpoint'}</button>`:''}</div></section>`;
  }
  function bindAdmin(){
    document.getElementById('adminStartGps')?.addEventListener('click',startAdminGps);
    document.querySelectorAll('[data-admin-current]').forEach(b=>b.addEventListener('click',()=>{if(!lastGps){toast('Start Live GPS first.');startAdminGps();return;}const id=b.dataset.adminCurrent;document.querySelector(`[data-field="lat"][data-id="${id}"]`).value=lastGps.lat;document.querySelector(`[data-field="lng"][data-id="${id}"]`).value=lastGps.lng;}));
    document.querySelectorAll('[data-admin-save]').forEach(b=>b.addEventListener('click',()=>saveAdminCheckpoint(b.dataset.adminSave)));
    document.querySelectorAll('[data-admin-reset]').forEach(b=>b.addEventListener('click',()=>{delete overrides[b.dataset.adminReset];saveOverrides();renderAdmin();toast('Local override reset.');}));
    document.querySelectorAll('[data-admin-route]').forEach(b=>b.addEventListener('click',()=>{const idx=Number(b.dataset.adminRoute);state={...state,onboarded:true,mode:'live',routeIndex:normaliseRouteIndex(idx),targetVisible:false,targetInRange:false,distance:null,missionOpen:null,nav:'radar'};resetGeofenceRuntime();save();renderAdmin();toast(`${CHECKPOINTS[idx].mc} set as next checkpoint.`);}));
    document.getElementById('adminExport')?.addEventListener('click',async()=>{const json=JSON.stringify(overrides,null,2);try{await navigator.clipboard.writeText(json);toast('Override JSON copied.');}catch{document.getElementById('adminImportText').value=json;toast('JSON placed in the text box.');}});
    document.getElementById('adminTestMessage')?.addEventListener('click',()=>{addMessage(`admin-test:${Date.now()}`,'MISSION CONTROL','TEST TRANSMISSION','This is a local Comms test message generated from the admin page.');toast('Test message added.');});
    document.getElementById('adminClearMessages')?.addEventListener('click',()=>{state.messages=[];state.messageSeq=0;state.messageAlert=false;save();toast('Comms feed cleared.');});
    document.getElementById('adminImport')?.addEventListener('click',()=>{try{const parsed=JSON.parse(document.getElementById('adminImportText').value||'{}');overrides=parsed&&typeof parsed==='object'?parsed:{};saveOverrides();renderAdmin();toast('Overrides imported.');}catch{toast('Invalid JSON.');}});
    document.getElementById('adminResetOverrides')?.addEventListener('click',()=>{if(confirm('Reset all local coordinate overrides on this device?')){overrides={};saveOverrides();renderAdmin();}});
    document.getElementById('adminResetProgress')?.addEventListener('click',()=>{if(confirm('Reset all Mission Control progress on this device?')){state={...defaults};save();resetGeofenceRuntime();renderAdmin();}});
  }
  function saveAdminCheckpoint(id){
    const cp=CHECKPOINTS.find(c=>c.id===id); if(!cp)return;
    const lat=Number(document.querySelector(`[data-field="lat"][data-id="${id}"]`).value),lng=Number(document.querySelector(`[data-field="lng"][data-id="${id}"]`).value);
    if(!Number.isFinite(lat)||!Number.isFinite(lng)){toast('Enter valid coordinates.');return;}
    const next={lat,lng};
    if(cp.geofence!==false){const detectionRadius=Number(document.querySelector(`[data-field="detectionRadius"][data-id="${id}"]`).value),activationRadius=Number(document.querySelector(`[data-field="activationRadius"][data-id="${id}"]`).value);if(!Number.isFinite(detectionRadius)||!Number.isFinite(activationRadius)||activationRadius>=detectionRadius){toast('Detection radius must be larger than activation radius.');return;}next.detectionRadius=detectionRadius;next.activationRadius=activationRadius;}
    overrides[id]=next;saveOverrides();renderAdmin();toast(`${cp.mc} local override saved.`);
  }
  function startAdminGps(){
    if(!navigator.geolocation){toast('Geolocation unavailable.');return;}
    if(adminWatchId!==null) navigator.geolocation.clearWatch(adminWatchId);
    adminWatchId=navigator.geolocation.watchPosition(pos=>{lastGps=normalisePosition(pos);updateAdminGps();},()=>toast('Unable to read GPS. Check browser permission.'),{enableHighAccuracy:true,maximumAge:500,timeout:15000});
  }
  function updateAdminGps(){
    if(!IS_ADMIN||!document.getElementById('adminLat'))return;
    document.getElementById('adminGpsStatus').textContent=lastGps?gpsCondition(lastGps.accuracy):'Not Started';
    document.getElementById('adminLat').textContent=lastGps?lastGps.lat.toFixed(7):'—';document.getElementById('adminLng').textContent=lastGps?lastGps.lng.toFixed(7):'—';document.getElementById('adminAccuracy').textContent=lastGps?`±${Math.round(lastGps.accuracy)} m`:'—';document.getElementById('adminRouteTarget').textContent=current()?.mc||'Complete';const cfg=activeConfig(current());document.getElementById('adminRouteDistance').textContent=lastGps&&cfg?`${Math.round(distanceMetres(lastGps.lat,lastGps.lng,cfg.lat,cfg.lng))} m`:'—';document.getElementById('adminCoordSource').textContent=cfg?.source||'—';
  }

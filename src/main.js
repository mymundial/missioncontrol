(() => {
  const app = document.getElementById('app');
  const toastEl = document.getElementById('toast');
  const STORAGE = 'silverstone-mc-pass2-v1';
  // Test stream for ELF FM. Replace with the production HTTPS stream when available.
  const ELF_STREAM_URL = 'https://streams.radiomast.io/ref-128k-mp3-stereo';
  const OVERRIDE_STORAGE = 'silverstone-mc-gps-overrides-v1';
  const IS_ADMIN = window.location.pathname.replace(/\/+$/, '') === '/admin';
  if(IS_ADMIN){
    document.documentElement.classList.add('admin-mode');
    document.body.classList.add('admin-mode');
  }

  const CHECKPOINTS = [
    {id:'gantry', mc:'MC-00', location:'Entrance Gantry', name:'Scan QR', type:'qr', playable:false, core:false, geofence:false, routeEnabled:false, lat:52.0735668895174, lng:-1.0234212294205571},
    {id:'entry', mc:'MC-01', location:'Village', name:'Circuit Entry', type:'activation', playable:true, core:false, mission:'Circuit Entry', geofence:true, lat:52.0742700024956, lng:-1.01353137321053, detectionRadius:80, activationRadius:30},
    {id:'velocity', mc:'MC-02', location:'Wellington Straight', name:'Velocity Vault', type:'diagnostics', playable:true, core:true, mission:'Performance Scan', lat:52.07672858114103, lng:-1.0179463765923242, detectionRadius:150, activationRadius:35},
    {id:'luffield', mc:'MC-03', location:'Luffield', name:'ELF FM', type:'commsrelay', playable:true, core:false, mission:'Signal Relay', routeEnabled:true, geofence:true, lat:52.07588935484336, lng:-1.0202073683140254, detectionRadius:120, activationRadius:30},
    {id:'power', mc:'MC-04', location:'National Pit Straight', name:'Power Pulse', type:'power', playable:true, core:true, mission:'Acceleration Run', lat:52.07867166248026, lng:-1.0177768332976036, detectionRadius:150, activationRadius:35},
    {id:'spirit', mc:'MC-05', location:'Copse', name:'Spirit Depot', type:'spirit', playable:true, core:true, mission:'Charge the Spirit Core', lat:52.07895798720806, lng:-1.0124059222979016, detectionRadius:120, activationRadius:30},
    {id:'escapade', mc:'MC-06', location:'Escapade', name:'Starstream Escapade', type:'artifacts', playable:true, core:true, mission:'Energy Interference', lat:52.07480005189975, lng:-1.0102119794664433, detectionRadius:120, activationRadius:30},
    {id:'comet', mc:'MC-07', location:'Becketts', name:'Comet Curve', type:'comet', playable:true, core:true, mission:'Guidance Calibration', lat:52.07247136741095, lng:-1.0099658493552224, detectionRadius:140, activationRadius:30},
    {id:'jingle', mc:'MC-08', location:'Hangar Straight', name:'Jingle Beams', type:'jingle', playable:true, core:true, mission:'Propulsion Sync', lat:52.067475902465475, lng:-1.0132842109045421, detectionRadius:150, activationRadius:35},
    {id:'lando', mc:'MC-09', location:'Stowe', name:'Lightspeed Lando', type:'lando', playable:true, core:true, mission:'High-Speed Control', lat:52.06363909240851, lng:-1.017077251994755, detectionRadius:120, activationRadius:30},
    {id:'aurora', mc:'MC-10', location:'Vale', name:'Aurora Apex', type:'aurora', playable:true, core:true, mission:'Aurora Lock', lat:52.065488708771205, lng:-1.0204674536551839, detectionRadius:120, activationRadius:30},
    {id:'lapland', mc:'MC-11', location:'Hamilton Straight', name:'Lapland Launch', type:'lapland', playable:true, core:true, mission:'Final Systems Test', lat:52.06828247188286, lng:-1.0234649670014986, detectionRadius:150, activationRadius:35},
    {id:'northern', mc:'MC-12', location:'Farm Curve', name:'Northern Flight', type:'northern', playable:true, core:true, mission:'Launch Sequence', lat:52.07236283289121, lng:-1.0138972673152702, detectionRadius:120, activationRadius:30}
  ];

  const ELF_RADIO_MISSION = {id:'elf-radio', mc:'COMMS', location:'Communications', name:'ELF FM', type:'radio', playable:true, core:false, mission:'Tune In'};

  const ROUTE_START_INDEX = 1;
  // GPS reliability thresholds. Activation is deliberately stricter than
  // detection so a weak fix can reveal a checkpoint without unlocking it.
  const ACTIVATION_ACCURACY_MAX = 25;
  const DETECTION_ACCURACY_MAX = 100;
  const PASS_ACCURACY_MAX = 40;
  const NEXT_PASS_ACCURACY_MAX = 35;
  const PASS_DWELL_MS = 8000;
  const ACTIVATION_HITS_REQUIRED = 2;
  const ACTIVATION_DWELL_MS = 1200;
  const NEXT_PASS_DWELL_MS = 1800;

  function isRouteCheckpoint(cp){ return !!cp && cp.routeEnabled!==false; }
  function normaliseRouteIndex(index){
    let i=Math.max(ROUTE_START_INDEX,Number.isFinite(Number(index))?Number(index):ROUTE_START_INDEX);
    while(i<CHECKPOINTS.length&&!isRouteCheckpoint(CHECKPOINTS[i])) i++;
    return i;
  }
  function nextRouteIndex(index){ return normaliseRouteIndex(Number(index)+1); }
  function nextRouteCheckpoint(index){ const i=nextRouteIndex(index); return CHECKPOINTS[i]||null; }
  function normaliseProgressRouteIndex(index,completed=[]){
    let i=normaliseRouteIndex(index);
    const done=new Set(Array.isArray(completed)?completed:[]);
    while(i<CHECKPOINTS.length&&done.has(CHECKPOINTS[i]?.id)) i=nextRouteIndex(i);
    return i;
  }

  const COMPLETION_MESSAGES = {
    entry:{sender:'MISSION CONTROL',title:'RECOVERY INITIATED',body:'Circuit energy has been routed into Santa-1. The recovery sequence is now underway.'},
    velocity:{sender:'ENGINEERING',title:'RACING-ENERGY PROFILE CONFIRMED',body:'Velocity Vault data shows the energy generated on track can be adapted for Santa-1.'},
    luffield:{sender:'COMMUNICATIONS',title:'COMMS LINK RESTORED',body:'Signal Relay has re-established the communications path to Santa-1. Santa is receiving Mission Control loud and clear.'},
    power:{sender:'ENGINEERING',title:'MAXIMUM POWER CAPTURED',body:'Power Pulse has captured a high-output racing energy profile for Santa-1.'},
    spirit:{sender:'MISSION CONTROL',title:'SPIRIT CORE CHARGED',body:'Stored racing energy is stable and Santa-1’s primary power system is back online.'},
    escapade:{sender:'STARSTREAM ESCAPADE',title:'STARSTREAM STABILISED',body:'Unstable energy artefacts have been cleared. The Starstream is stable and feeding Santa-1’s recovery systems.'},
    comet:{sender:'GUIDANCE SYSTEM',title:'GUIDANCE PATH RESTORED',body:'Santa-1 can now process the high-speed directional changes required for flight.'},
    jingle:{sender:'PROPULSION SYSTEM',title:'PROPULSION SYNCHRONISED',body:'Thrust output is stable and responding within the required flight parameters.'},
    lando:{sender:'FLIGHT CONTROL',title:'HIGH-SPEED CONTROL CALIBRATED',body:'Racing response data has been integrated into Santa-1’s flight-control system.'},
    aurora:{sender:'NAVIGATION',title:'NORTH POLE SIGNAL ACQUIRED',body:'Aurora Apex has restored Santa-1’s navigation link and confirmed the route home.'},
    lapland:{sender:'MISSION CONTROL',title:'ALL SYSTEMS GREEN',body:'Santa-1 has passed full-power verification and is cleared for launch.'},
    northern:{sender:'MISSION CONTROL',title:'RECOVERY MISSION COMPLETE',body:'Santa-1 is airborne and the Northern Flight is underway.'}
  };

  const SLEIGH_STAGES = [
    {stage:1,progress:0,name:'Grounded',asset:'./assets/sleigh-stage-1.webp',milestone:'Initial State',next:'Circuit Entry',copy:'Santa-1 remains grounded in stripped-back recovery condition. Mission Control is waiting for enough circuit energy to energise the chassis and begin the rebuild.'},
    {stage:2,progress:10,name:'Recovery Initiated',asset:'./assets/sleigh-stage-2.webp',milestone:'Circuit Entry',next:'Velocity Vault',copy:'Initial circuit energy has been routed into Santa-1. The chassis is energised and the recovery sequence is underway, while the individual sleigh systems remain offline until they are restored.'},
    {stage:3,progress:40,name:'Core Recovery',asset:'./assets/sleigh-stage-3.webp',milestone:'Power Pulse',next:'Comet Curve',copy:'Power Pulse has stabilised the main energy supply and the Spirit Core is holding charge. Structural systems are rebuilding around the central drive chamber and the sleigh frame is taking shape.'},
    {stage:4,progress:70,name:'Flight Systems Active',asset:'./assets/sleigh-stage-4.webp',milestone:'Comet Curve',next:'Aurora Apex',copy:'Comet Curve has restored Santa-1’s guidance architecture and flight systems are now being integrated. Steering vectors, control pathways and propulsion mounting are aligned for the final phase of recovery.'},
    {stage:5,progress:100,name:'Development Complete',asset:'./assets/sleigh-stage-5.webp',milestone:'Aurora Apex',next:'Lapland Launch',copy:'Aurora Apex has locked the navigation network and completed the rebuild. Santa-1 now has a fully restored frame, active flight systems and a confirmed route home, ready for final verification at Lapland Launch.'}
  ];

  const defaults = {
    onboarded:false,
    audio:true,
    mode:'live',
    nav:'radar',
    completed:[],
    available:[],
    routeIndex:ROUTE_START_INDEX,
    targetVisible:false,
    targetInRange:false,
    distance:null,
    bearing:0,
    gpsAccuracy:null,
    gpsCondition:'WAITING',
    missionOpen:null,
    missionReturnNav:'radar',
    elfUnlocked:false,
    elfAudioOn:false,
    lastMessage:'SEARCHING FOR ENERGY SIGNATURES',
    bootDone:false,
    messages:[],
    messageSeq:0,
    messageAlert:false,
    routeRevision:5
  };

  let state = load();
  let overrides = loadOverrides();
  let cleanupMission = null;
  let audioCtx = null;
  let noiseNode = null;
  let noiseGain = null;
  let elfAudioEl = null;
  let elfTunerPreviewActive = false;
  let santaCommsEl = null;
  let santaTransmissionCleanup = null;
  let gpsWatchId = null;
  let adminWatchId = null;
  let lastGps = null;
  let activationHits = 0;
  let activationSince = null;
  let outsideSince = null;
  let nextPassSince = null;
  let inRangeLatched = false;
  let demoTimer = null;
  let demoInterval = null;
  let demoHoldUntil = 0;

  function load(){
    try {
      const parsed=JSON.parse(localStorage.getItem(STORAGE)||'{}');
      const oldCompleted=Array.isArray(parsed.completed)?parsed.completed:[];
      const oldAvailable=Array.isArray(parsed.available)?parsed.available:[];
      const completed=[...new Set(oldCompleted.map(id=>id==='elf'?'luffield':id))];
      const available=[...new Set(oldAvailable.map(id=>id==='elf'?'luffield':id))];
      // Strip legacy MC-03 messages from the old ELF FM checkpoint implementation.
      const messages=(Array.isArray(parsed.messages)?parsed.messages:[]).filter(m=>m?.checkpointId!=='elf'&&!String(m?.key||'').includes(':elf'));
      let routeIndex=normaliseProgressRouteIndex(parsed.routeIndex??ROUTE_START_INDEX,completed);
      // Restore MC-03 for older sessions that skipped the temporarily removed route slot.
      if((Number(parsed.routeRevision)||1)<2 && routeIndex>3 && !completed.includes('luffield')) routeIndex=3;
      const liveMode=parsed.mode==='live';
      return {
        ...defaults,
        ...parsed,
        completed,
        available,
        messages,
        routeIndex,
        routeRevision:5,
        missionOpen:parsed.missionOpen==='entry'?null:(parsed.missionOpen||null),
        elfUnlocked:Boolean(parsed.elfUnlocked),
        elfAudioOn:false,
        // Never trust a persisted in-range lock after a refresh. Live GPS must
        // revalidate the checkpoint before a mission can be opened again.
        targetInRange:liveMode?false:Boolean(parsed.targetInRange),
        targetVisible:liveMode?false:Boolean(parsed.targetVisible),
        distance:liveMode?null:(Number.isFinite(parsed.distance)?parsed.distance:null),
        gpsAccuracy:liveMode?null:(Number.isFinite(parsed.gpsAccuracy)?parsed.gpsAccuracy:null),
        gpsCondition:liveMode?'WAITING':(parsed.gpsCondition||defaults.gpsCondition)
      };
    } catch { return {...defaults}; }
  }
  function save(){ localStorage.setItem(STORAGE, JSON.stringify(state)); }
  function unreadCount(){ return state.messages.filter(m=>!m.read).length; }
  function formatMessageTime(timestamp){
    try{return new Date(timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});}catch{return '';}
  }
  function addMessage(key,sender,title,body,checkpointId=null){
    if(!key||state.messages.some(m=>m.key===key)) return false;
    const seq=(Number(state.messageSeq)||0)+1;
    const message={id:`MSG-${String(seq).padStart(3,'0')}`,seq,key,sender,title,body,checkpointId,timestamp:Date.now(),read:false};
    state.messageSeq=seq;
    state.messages=[...state.messages,message];
    state.messageAlert=true;
    save();
    if(!IS_ADMIN&&state.nav==='radar'&&!state.missionOpen) updateRadarLive();
    return true;
  }
  function ensureOpeningMessage(){
    if(!state.onboarded) return;
    addMessage('opening','MISSION CONTROL','RECOVERY MISSION ACTIVE','Santa-1 has lost power and is grounded at Silverstone. Proceed to the circuit and complete each recovery mission to restore the sleigh and get Santa back in the air.','MC-00');
  }
  function markAllMessagesRead(){
    if(!state.messages.some(m=>!m.read)){state.messageAlert=false;save();return;}
    state.messages=state.messages.map(m=>({...m,read:true}));
    state.messageAlert=false;save();
  }
  function dismissMessageAlert(){ state.messageAlert=false;save();updateRadarLive(); }
  function updateCommsBadge(){
    const ico=document.querySelector('[data-nav="comms"] .ico'); if(!ico) return;
    ico.querySelector('.nav-badge')?.remove();
    const unread=unreadCount(); if(!unread) return;
    const badge=document.createElement('span');badge.className='nav-badge';badge.textContent=unread>9?'9+':String(unread);ico.appendChild(badge);
  }
  function checkpointCompletionMessage(id){
    const script=COMPLETION_MESSAGES[id]; if(!script) return;
    addMessage(`complete:${id}`,script.sender,script.title,script.body,id);
  }
  function getElfAudio(){
    if(!ELF_STREAM_URL) return null;
    if(!elfAudioEl){
      elfAudioEl=new Audio(ELF_STREAM_URL);
      elfAudioEl.preload='none';
      elfAudioEl.addEventListener('ended',()=>{state.elfAudioOn=false;save();updateElfRadioUI();});
      elfAudioEl.addEventListener('error',()=>{state.elfAudioOn=false;save();updateElfRadioUI();toast('ELF FM stream unavailable.');});
    }
    return elfAudioEl;
  }
  function updateElfRadioUI(){
    const btn=document.getElementById('elfAudioToggle'); if(!btn) return;
    btn.classList.toggle('on',state.elfAudioOn);btn.classList.toggle('off',!state.elfAudioOn);
    btn.setAttribute('aria-pressed',state.elfAudioOn?'true':'false');
    const strong=btn.querySelector('strong');if(strong)strong.textContent=state.elfAudioOn?'On':'Off';
    const status=document.getElementById('elfStreamState');if(status)status.textContent=ELF_STREAM_URL?(state.elfAudioOn?'Playing':'Ready'):'Pending';
    document.querySelector('.comms-radio .wave')?.classList.toggle('live',state.elfAudioOn);
  }
  async function toggleElfAudio(){
    if(!state.elfUnlocked) return;
    if(!ELF_STREAM_URL){toast('ELF FM live stream is not connected yet.');return;}
    const audio=getElfAudio();if(!audio)return;
    audio.volume=1;
    if(state.elfAudioOn){audio.pause();try{audio.load();}catch{}state.elfAudioOn=false;save();updateElfRadioUI();return;}
    try{await audio.play();state.elfAudioOn=true;save();updateElfRadioUI();}
    catch{state.elfAudioOn=false;save();updateElfRadioUI();toast('Tap again to enable ELF FM audio.');}
  }
  async function startElfTunerPreview(){
    const audio=getElfAudio(); if(!audio) return false;
    try{
      audio.volume=.02;
      if(audio.paused) await audio.play();
      elfTunerPreviewActive=true;
      return true;
    }catch{
      elfTunerPreviewActive=false;
      return false;
    }
  }
  function setElfTunerPreview(delta){
    if(!elfTunerPreviewActive||!elfAudioEl) return;
    const clarity=Math.max(0,Math.min(1,1-(delta/1.1)));
    elfAudioEl.volume=Math.min(.9,.02+Math.pow(clarity,1.7)*.86);
  }
  function stopElfTunerPreview(){
    if(!elfTunerPreviewActive) return;
    try{elfAudioEl?.pause();if(elfAudioEl){elfAudioEl.volume=1;elfAudioEl.load();}}catch{}
    elfTunerPreviewActive=false;
  }
  function getSantaCommsAudio(){
    if(!santaCommsEl){
      santaCommsEl=new Audio('./assets/santa-comms-radio.mp3');
      santaCommsEl.preload='auto';
    }
    return santaCommsEl;
  }
  function rampElementVolume(el,to,duration=350){
    if(!el) return ()=>{};
    const from=Number.isFinite(el.volume)?el.volume:1;
    const start=performance.now();let raf=0;
    const step=now=>{const p=Math.min(1,(now-start)/duration);el.volume=from+(to-from)*p;if(p<1)raf=requestAnimationFrame(step);};
    raf=requestAnimationFrame(step);
    return ()=>cancelAnimationFrame(raf);
  }
  function stopSantaTransmission(restoreRadio=true){
    try{santaTransmissionCleanup?.();}catch{}
    santaTransmissionCleanup=null;
    if(santaCommsEl){try{santaCommsEl.pause();santaCommsEl.currentTime=0;}catch{}}
    stopStatic();
    if(restoreRadio&&elfAudioEl&&state.elfAudioOn){rampElementVolume(elfAudioEl,1,320);}
  }
  function loadOverrides(){
    try { return JSON.parse(localStorage.getItem(OVERRIDE_STORAGE)||'{}') || {}; }
    catch { return {}; }
  }
  function saveOverrides(){ localStorage.setItem(OVERRIDE_STORAGE, JSON.stringify(overrides)); }
  function set(patch, rerender=true){ state={...state,...patch}; save(); if(rerender) render(); }
  function recovery(){
    if(state.completed.includes('aurora')) return 100;
    if(state.completed.includes('comet')) return 70;
    if(state.completed.includes('power')) return 40;
    if(state.completed.includes('entry')) return 10;
    return 0;
  }
  function sleighStage(){
    const progress=recovery();
    for(let i=SLEIGH_STAGES.length-1;i>=0;i--){ if(progress>=SLEIGH_STAGES[i].progress) return SLEIGH_STAGES[i]; }
    return SLEIGH_STAGES[0];
  }
  function current(){
    const i=normaliseProgressRouteIndex(state.routeIndex,state.completed);
    if(i!==state.routeIndex){state.routeIndex=i;save();}
    return CHECKPOINTS[i] || null;
  }
  function activeConfig(cp){
    if(!cp) return null;
    const o=overrides[cp.id]||{};
    return {...cp,...o,source:overrides[cp.id]?'LOCAL OVERRIDE':'MASTER'};
  }
  function checkpointIndex(id){ return CHECKPOINTS.findIndex(c=>c.id===id); }
  function toast(msg){ if(!toastEl) return; toastEl.textContent=msg; toastEl.classList.add('show'); setTimeout(()=>toastEl.classList.remove('show'),1800); }
  function haptic(pattern=30){ try{navigator.vibrate?.(pattern)}catch{} }
  function ensureAudio(){
    if(!state.audio) return null;
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended') audioCtx.resume();
    return audioCtx;
  }
  function ping(freq=660,dur=.08,vol=.035){
    const ctx=ensureAudio(); if(!ctx) return;
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type='sine';o.frequency.value=freq;g.gain.value=vol;o.connect(g).connect(ctx.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+dur);o.stop(ctx.currentTime+dur);
  }
  function startStatic(level=.08){
    stopStatic(); const ctx=ensureAudio(); if(!ctx) return;
    const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate); const data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=Math.random()*2-1;
    noiseNode=ctx.createBufferSource(); noiseGain=ctx.createGain(); noiseGain.gain.value=level;
    const filter=ctx.createBiquadFilter(); filter.type='bandpass';filter.frequency.value=1900;filter.Q.value=.65;
    noiseNode.buffer=buffer;noiseNode.loop=true;noiseNode.connect(filter).connect(noiseGain).connect(ctx.destination);noiseNode.start();
  }
  function setStatic(level){ if(noiseGain && audioCtx) noiseGain.gain.setTargetAtTime(level,audioCtx.currentTime,.05); }
  function stopStatic(){ try{noiseNode?.stop()}catch{} noiseNode=null;noiseGain=null; }

  function toRad(v){return v*Math.PI/180}
  function toDeg(v){return v*180/Math.PI}
  function distanceMetres(lat1,lng1,lat2,lng2){
    const R=6371000, dLat=toRad(lat2-lat1), dLng=toRad(lng2-lng1);
    const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  }
  function bearingDegrees(lat1,lng1,lat2,lng2){
    const p1=toRad(lat1), p2=toRad(lat2), dl=toRad(lng2-lng1);
    const y=Math.sin(dl)*Math.cos(p2), x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
    return (toDeg(Math.atan2(y,x))+360)%360;
  }
  function gpsCondition(accuracy){
    if(!Number.isFinite(accuracy)) return 'WAITING';
    if(accuracy<=20) return 'GOOD';
    if(accuracy<=40) return 'FAIR';
    return 'POOR';
  }
  function distanceToActivation(cp,distance){
    const cfg=activeConfig(cp); if(!cfg || !Number.isFinite(distance)) return null;
    return Math.max(0,distance-(cfg.activationRadius||0));
  }

  function shell(content, nav=true){ return `<main class="phone ${nav?'':'no-nav'}"><div class="screen">${content}</div>${nav?navBar():''}</main>`; }
  function navPageContent(){
    if(state.nav==='missions') return renderMissions();
    if(state.nav==='sleigh') return renderSleigh();
    if(state.nav==='comms') return renderComms();
    return renderRadar();
  }
  function navShell(){
    return `<main class="phone"><div class="screen">${topBar()}<div class="nav-view" data-view="${state.nav}">${navPageContent()}</div></div>${navBar()}</main>`;
  }
  function syncNavChrome(){
    document.querySelectorAll('[data-nav]').forEach(btn=>btn.classList.toggle('active',btn.dataset.nav===state.nav));
    updateCommsBadge();
  }
  function renderNavShell(){
    const view=document.querySelector('.phone:not(.no-nav) .nav-view');
    const masthead=document.querySelector('.phone:not(.no-nav) .screen>.topbar');
    if(view&&masthead){
      view.dataset.view=state.nav;
      view.innerHTML=navPageContent();
      syncNavChrome();
      return;
    }
    app.innerHTML=navShell();
  }
  function brand(){return `<div class="brand"><img src="./assets/silverstone-logo-landscape-cropped.webp" alt="Silverstone"></div>`}
  function navIcon(id){
    const icons={
      radar:`<svg viewBox="0 0 210 126" aria-hidden="true"><path fill="currentColor" d="M105 60.5c-11.8 0-23.1 4.9-31.2 13.6l4.4 4.1c13.7-14.8 36.8-15.7 51.6-1.9.6.6 1.2 1.2 1.8 1.8l4.4-4.1C128 65.3 116.7 60.5 105 60.5Zm0 30c-7 0-12.7 5.6-12.7 12.6S98 115.8 105 115.8s12.7-5.6 12.7-12.6c0-3.3-1.2-6.4-3.5-8.8-2.4-2.5-5.8-3.9-9.2-3.9Zm0 19.3c-3.7 0-6.6-3-6.6-6.6s3-6.6 6.6-6.6c3.6 0 6.6 3 6.6 6.6s-2.9 6.5-6.6 6.6ZM105 9.2C79 9.2 54.1 20 36.4 39l4.4 4.1c33.1-35.4 88.6-37.4 124.1-4.3 1.4 1.3 2.8 2.7 4.1 4.1l4.4-4.1C155.7 19.9 130.9 9.2 105 9.2Zm0 25.6c-18.9 0-37 7.8-49.9 21.7l4.4 4.1c23.4-25.1 62.7-26.5 87.9-3.1 1 .9 2 1.9 3 2.9l4.4-4.1c-13.1-13.7-31-21.5-49.8-21.5Z"/></svg>`,
      missions:`<svg viewBox="0 0 210 126" aria-hidden="true"><path fill="currentColor" d="M142 62.7H86.9v6H142v-6Zm0 15.4H86.9v6H142v-6Zm0-30.9H86.9v6H142v-6Zm-61.1-15.4H68.1v6h12.8v-6Zm61.1 0H86.9v6H142v-6Zm2.2-26.5H65.8l-12.3 6v102l12.3 6h78.5l12.3-6v-102l-12.4-6Zm6.3 108H59.5v-102h91.1v102ZM80.9 78.1H68.1v6h12.8v-6Zm0-30.9H68.1v6h12.8v-6Zm0 15.5H68.1v6h12.8v-6Z"/></svg>`,
      comms:`<svg viewBox="0 0 210 126" aria-hidden="true"><path fill="currentColor" d="M105 8.62a46.17 46.17 0 0 1 46.12 46.12h6a52.14 52.14 0 0 0-104.27 0h6A46.17 46.17 0 0 1 105 8.62Zm41.18 50.67c-7.73 0-13.12 5.49-13.12 13.36V86c0 7.89 4.87 13.18 12.11 13.18a12.52 12.52 0 0 0 4.41-.77c-2.54 7.83-8.27 11.22-18.1 11.22H119a9 9 0 0 0-8.45-6H99.32a8.95 8.95 0 1 0 0 17.89h11.25a9 9 0 0 0 8.39-5.86h12.51c17.54 0 25.7-9.42 25.7-29.64V59.29Zm-35.6 56.2H99.32a2.93 2.93 0 0 1 0-5.86h11.25a2.93 2.93 0 1 1 0 5.86ZM151.16 86c0 4.49-2.24 7.17-6 7.17s-6.1-2.61-6.1-7.17V72.65c0-3.55 1.87-7.34 7.11-7.34h5Zm-14-44.19A3 3 0 0 0 140 43.69a3.17 3.17 0 0 0 1.12-.21 3 3 0 0 0 1.67-3.92 40.73 40.73 0 0 0-75.58 0 3 3 0 1 0 5.58 2.25 34.71 34.71 0 0 1 64.42 0ZM63.85 59.29h-11V86c0 7.89 4.82 13.18 12 13.18S77 93.89 77 86V72.65C77 64.78 71.58 59.29 63.85 59.29ZM71 86c0 4.56-2.23 7.17-6.11 7.17s-6-2.68-6-7.17V65.31h5c5.24 0 7.11 3.79 7.11 7.34Z"/></svg>`,
      sleigh:`<span class="nav-sleigh-icon-wrap" aria-hidden="true"><img class="nav-sleigh-icon nav-sleigh-off" src="./assets/nav-sleigh-unselected.webp" alt=""><img class="nav-sleigh-icon nav-sleigh-on" src="./assets/nav-sleigh-selected.webp" alt=""></span>`
    };
    return icons[id]||'';
  }
  function navBar(){ return `<nav class="nav" aria-label="Mission Control">${navButton('radar','Radar')}${navButton('missions','Missions')}${navButton('sleigh','Sleigh')}${navButton('comms','Comms')}</nav>`; }
  function navButton(id,label){
    const unread=id==='comms'?unreadCount():0;
    return `<button data-nav="${id}" class="${state.nav===id?'active':''}"><span class="ico">${navIcon(id)}${unread?`<span class="nav-badge">${unread>9?'9+':unread}</span>`:''}</span><span>${label}</span></button>`;
  }
  function topBar(){ return `<header class="topbar">${brand()}<img class="mission-control-logo" src="./assets/mission-control-logo.webp" alt="Mission Control"></header>`; }
  function statusStrip(){
    const cp=current();
    const activationDistance=distanceToActivation(cp,state.distance);
    const distanceValue=!cp?'GROTTO':state.targetVisible&&Number.isFinite(activationDistance)?`${Math.round(activationDistance)} M`:'SEARCHING';
    const condition=state.mode==='demo'?'DEMO':state.gpsCondition;
    return `<section class="telemetry-block"><div class="telemetry-heading">TELEMETRY</div><div class="status-strip panel">
      <div class="status-cell"><div class="status-label">GPS Accuracy</div><div class="status-value gps-${condition.toLowerCase()}">${condition}</div></div>
      <div class="status-cell"><div class="status-label">Sleigh System</div><div class="status-value">${recovery()}%</div></div>
      <div class="status-cell"><div class="status-label">Next Checkpoint</div><div class="status-value">${distanceValue}</div></div>
    </div></section>`;
  }

  function radarMessage(cp){
    if(cp&&state.targetInRange&&cp.playable){
      return `<div class="mission-card message-card panel target-message compact-target" id="radarMessage"><div><div class="kicker">${cp.location}</div><h3>${cp.name}</h3></div><button class="btn small primary" data-start-mission="${cp.id}">${cp.type==='activation'?'Start Activation':cp.type==='radio'?'Tune Signal':cp.type==='diagnostics'?'Start Diagnostics':'Start Mission'}</button></div>`;
    }
    if(state.messageAlert&&unreadCount()>0){
      return `<div class="mission-card message-card panel comms-alert" id="radarMessage"><div class="comms-alert-copy"><div class="kicker">Mission Control</div><h3>New Message</h3></div><div class="comms-alert-actions"><button class="linkbtn comms-action" data-read-messages>Read</button><button class="linkbtn comms-action" data-dismiss-messages>Dismiss</button></div></div>`;
    }
    if(!cp) return `<div class="mission-card message-card panel complete-message compact-message" id="radarMessage"><div><div class="kicker">Mission Control</div><h3>Mission Complete</h3></div></div>`;
    if(cp.type==='activation'){
      if(state.targetVisible) return `<div class="mission-card message-card panel compact-message" id="radarMessage"><div><div class="kicker">Mission Control</div><h3>Circuit Entry Ahead</h3></div></div>`;
      return `<div class="mission-card message-card panel compact-message" id="radarMessage"><div><div class="kicker">Mission Control</div><h3>Locating Circuit Entry</h3></div></div>`;
    }
    if(state.targetVisible){
      const activationDistance=Math.round(distanceToActivation(cp,state.distance)||0);
      const title=activationDistance<40?'Closing On Target':'Signal Detected';
      return `<div class="mission-card message-card panel compact-message" id="radarMessage"><div><div class="kicker">Mission Control</div><h3>${title}</h3></div></div>`;
    }
    return `<div class="mission-card message-card panel compact-message" id="radarMessage"><div><div class="kicker">Mission Control</div><h3>Radar Searching</h3></div></div>`;
  }


  function render(){
    if(IS_ADMIN){ renderAdmin(); return; }
    if(cleanupMission){ cleanupMission(); cleanupMission=null; }
    stopStatic();
    stopMc00Scan();
    if(!state.onboarded){
      app.innerHTML=shell(renderLaunch(),false);
      bindGlobal();
      bindMc00Scan(state.bootDone);
      return;
    }
    if(state.missionOpen){ app.innerHTML=shell(renderMission(state.missionOpen),false); bindGlobal(); bindMission(state.missionOpen); return; }
    if(state.nav==='comms') markAllMessagesRead();
    renderNavShell();
    bindGlobal();
    if(state.nav==='radar'){
      updateRadarLive();
      // Demo progression is re-armed whenever Radar is rendered. This makes
      // returning from Comms / Missions / Sleigh resilient if a pending demo
      // timer was interrupted while another panel was open.
      if(state.mode==='demo'&&!state.missionOpen){
        maybeStartDemoTarget(400);
        rearmDemoRoute(900);
      }
    }
  }
  function renderLaunch(){
    if(state.bootDone===false) return `<section class="hero"><div class="hero-content"><img class="hero-logo hero-logo-stacked" src="./assets/silverstone-logo-landing.webp" alt="Silverstone"><img class="hero-mission-logo" src="./assets/mission-control-logo.webp" alt="Mission Control"><div class="hero-actions"><button class="btn primary" data-onboard="mc00-live">Start Mission</button><button class="btn secondary" data-onboard="demo">Quick Demo</button></div></div></section>`;
    return renderOnboardStep(state.bootDone);
  }
  function renderOnboardStep(step){
    const setupHeader=topBar();
    if(step==='mc00-live'||step==='mc00-demo'){
      const systems=[
        {key:'power',label:'Power',status:'Standby'},
        {key:'propulsion',label:'Propulsion',status:'Standby'},
        {key:'comms',label:'Comms',status:'Standby'},
        {key:'response',label:'Response',status:'Standby'},
        {key:'core',label:'Core',status:'Standby'},
        {key:'navigation',label:'Navigation',status:'Standby'},
        {key:'control',label:'Control',status:'Standby'},
        {key:'launch',label:'Launch',status:'Standby'}
      ];
      return `<section class="onboard with-masthead setup-page mc00-page">${setupHeader}<div class="onboard-card panel mc00-card" data-mc00-mode="${step}"><div class="mc00-copy"><h1>System Scan</h1><p class="support-copy">Santa-1 Sleigh Recovery</p></div><div class="mc00-visual-wrap"><div class="mc00-sleigh-frame"><div class="sleigh-visual sleigh-stage-1 mc00-sleigh-visual"><div class="sleigh-glow" aria-hidden="true"></div><img class="sleigh-art" src="./assets/sleigh-stage-1.webp" alt="Santa-1 sleigh system scan visual"><div class="mc00-scan-beam" aria-hidden="true"></div></div></div></div>${systemStatusBank(systems,'mc00-system-bank','mc00')}<div class="mc00-progress-row"><div class="mc00-progress" role="progressbar" aria-label="System scan progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="mc00ProgressFill"></span></div><strong id="mc00ProgressValue">0%</strong></div><div class="mc00-complete-popup panel" id="mc00CompleteBlock" hidden><div class="mc00-complete-icon" aria-hidden="true">✓</div><h2>Scan Complete</h2><button class="btn primary wide" id="mc00Continue" data-mc00-continue="${step}">Continue</button></div></div></section>`;
    }
    if(step==='brief') return `<section class="onboard with-masthead setup-page briefing-page">${setupHeader}<div class="onboard-card panel setup-card"><div class="onboard-icon setup-icon"><span class="setup-icon-glyph"><img src="./assets/mission-briefing-icon.svg" alt=""></span></div><h1>Mission Briefing</h1><p class="support-copy">Santa-1 has lost power. Energy signatures have been detected around the circuit. Locate each source, complete its mission and restore the sleigh.</p><div class="setup-actions"><button class="btn primary wide" data-onboard="audio">Continue</button></div></div></section>`;
    if(step==='audio') return `<section class="onboard with-masthead setup-page audio-page">${setupHeader}<div class="onboard-card panel setup-card"><div class="onboard-icon setup-icon"><span class="setup-icon-glyph"><img src="./assets/mission-audio-icon.webp" alt=""></span></div><h1>Mission Audio</h1><p class="support-copy">Mission Control uses proximity alerts, system sounds and live transmissions. Audio can be muted at any time.</p><div class="setup-actions stack"><button class="btn primary wide" data-audio="on">Enable Mission Audio</button><button class="btn secondary wide" data-audio="off">Continue Without Audio</button></div></div></section>`;
    if(step==='demo-scan') return `<section class="onboard with-masthead setup-page demo-scan-page">${setupHeader}<div class="onboard-card panel setup-card demo-scan-card"><div class="onboard-icon setup-icon demo-system-icon" aria-hidden="true"><span class="demo-scan-radar"><span></span></span></div><h1>DEMO MODE</h1><p class="support-copy">The demo will simulate checkpoint proximity in the same order as the live route. Your first target is <strong>Mission 01 · Circuit Entry</strong> at Village.</p><div class="setup-actions"><button class="btn primary wide" data-onboard="demo-continue">Continue to Radar</button></div></div></section>`;
    return `<section class="onboard with-masthead setup-page radar-setup-page">${setupHeader}<div class="onboard-card panel setup-card"><div class="onboard-icon setup-icon"><span class="setup-icon-glyph"><img src="./assets/radar-setup-icon.svg" alt=""></span></div><h1>Enable Live Radar</h1><p class="support-copy">Mission Control uses your location to detect each installation as you move around the circuit.</p><div class="setup-actions stack"><button class="btn primary wide" data-location="request">Enable Location</button><button class="btn secondary wide" data-location="demo">Use Demo Mode</button></div></div></section>`;
  }
  function renderRadar(){
    const cp=current();
    const modeClass=state.mode==='demo'?' demo-radar-page':'';
    return `<section class="radar-page${modeClass}">${statusStrip()}<section class="radar-zone" aria-label="Live checkpoint radar"><section class="radar-wrap"><div class="radar"><div class="sweep"></div><div class="user-dot"></div>${cp?'<div class="target-dot hidden"></div>':''}</div></section></section>${radarMessage(cp)}</section>`;
  }
  function missionStatus(cp){
    const idx=checkpointIndex(cp.id);
    if(state.completed.includes(cp.id)) return 'COMPLETE';
    if(state.available.includes(cp.id)) return 'AVAILABLE';
    if(idx===state.routeIndex) return state.targetInRange?'IN RANGE':'NEXT';
    if(idx<state.routeIndex) return 'AVAILABLE';
    return 'LOCKED';
  }
  function renderMissions(){
    const rows=CHECKPOINTS.filter(c=>c.playable&&isRouteCheckpoint(c)).map(cp=>{
      const status=missionStatus(cp);
      const playable=status==='AVAILABLE'||status==='IN RANGE';
      const interaction=playable?` data-open-mission="${cp.id}" role="button" tabindex="0" aria-label="Open ${cp.name}"`:'';
      return `<div class="mission-row panel ${status==='COMPLETE'?'done':''} ${status==='AVAILABLE'?'available':''} ${playable?'interactive':''}"${interaction}><div class="mission-index">${cp.mc.replace('MC-','')}</div><div class="mission-row-copy"><div class="kicker">${cp.location}</div><h3>${cp.name}</h3></div><div class="row-action"><div class="row-status">${status}</div></div></div>`;
    }).join('');
    return `<div class="list missions-list">${rows}</div>`;
  }
  function renderSleigh(){
    const r=recovery();
    const info=sleighStage();
    const stage=info.stage;
    const postStatus=state.completed.includes('northern')
      ? {name:'Airborne',copy:'Northern Flight is underway. Santa-1 has launched successfully and the rebuilt sleigh is operating as intended.'}
      : state.completed.includes('lapland')
        ? {name:'Flight Ready',copy:'Lapland Launch has completed the final systems verification. Every rebuilt system is stable and Santa-1 is fully cleared for launch.'}
        : {name:info.name,copy:info.copy};
    const systems=[
      {key:'power',label:'Power',status:state.completed.includes('power')?'Online':'Offline',state:state.completed.includes('power')?'online':'offline'},
      {key:'comms',label:'Comms',status:state.completed.includes('luffield')?'Online':'Offline',state:state.completed.includes('luffield')?'online':'offline'},
      {key:'core',label:'Core',status:state.completed.includes('spirit')?'Online':'Offline',state:state.completed.includes('spirit')?'online':'offline'},
      {key:'control',label:'Control',status:state.completed.includes('comet')?'Online':'Offline',state:state.completed.includes('comet')?'online':'offline'},
      {key:'propulsion',label:'Propulsion',status:state.completed.includes('jingle')?'Online':'Offline',state:state.completed.includes('jingle')?'online':'offline'},
      {key:'response',label:'Response',status:state.completed.includes('lando')?'Online':'Offline',state:state.completed.includes('lando')?'online':'offline'},
      {key:'navigation',label:'Navigation',status:state.completed.includes('aurora')?'Online':'Offline',state:state.completed.includes('aurora')?'online':'offline'},
      {key:'launch',label:'Launch',status:state.completed.includes('lapland')?'Clear':'Blocked',state:state.completed.includes('lapland')?'clear':'blocked'}
    ];
    return `<div class="sleigh-card panel"><div class="sleigh-title-row"><div><div class="kicker sleigh-pretitle">Sleigh Rebuild</div><h1>Santa-1</h1></div><strong class="sleigh-percent">${r}%</strong></div><div class="sleigh-development-bar" role="progressbar" aria-label="Santa-1 development progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${r}"><div class="sleigh-development-spectrum" aria-hidden="true"></div><div class="sleigh-development-mask" style="left:${r}%" aria-hidden="true"></div></div><div class="sleigh-visual sleigh-stage-${stage}"><div class="sleigh-glow" aria-hidden="true"></div><img class="sleigh-art" src="${info.asset}" alt="Santa-1 ${postStatus.name} development stage"></div><div class="sleigh-update-box panel soft"><div class="kicker sleigh-systems-title">Engineering Update</div><p class="sleigh-systems-copy">${postStatus.copy}</p></div><div class="sleigh-systems panel soft"><div class="kicker sleigh-systems-title">System Status</div>${systemStatusBank(systems,'sleigh-system-bank')}</div></div>`;
  }

  function systemStatusBank(systems,extraClass='',dataPrefix=''){
    return `<div class="system-status-bank ${extraClass}">${systems.map((system,i)=>{
      const stateClass=system.state?` is-${system.state}`:'';
      const dataAttr=dataPrefix?` data-${dataPrefix}-system="${system.key}"`:'';
      return `<div class="system-status-item${stateClass}"${dataAttr}><div class="system-status-name"><span class="system-node" aria-hidden="true"></span><span>${system.label}</span></div><div class="system-status-value"${dataPrefix?` data-${dataPrefix}-status="${system.key}"`:''}>${system.status}</div></div>`;
    }).join('')}</div>`;
  }
  function messageActivationLabel(message){
    if(message.key==='opening') return 'MISSION CONTROL';
    if(message.checkpointId){
      const cp=CHECKPOINTS.find(c=>c.id===message.checkpointId||c.mc===message.checkpointId);
      if(cp){
        return cp.name||cp.location||'MISSION CONTROL';
      }
    }
    return message.sender||'MISSION CONTROL';
  }
  function renderComms(){
    const feed=[...state.messages].sort((a,b)=>b.timestamp-a.timestamp).map(m=>`<article class="comms-message panel ${m.read?'':'unread'}"><div class="comms-message-head"><div class="kicker">${messageActivationLabel(m)}</div><time datetime="${new Date(m.timestamp).toISOString()}">${formatMessageTime(m.timestamp)}</time></div><h3>${m.title}</h3><p>${m.body}</p></article>`).join('');
    const streamReady=Boolean(ELF_STREAM_URL);
    const toggle=`<button class="sound-toggle ${state.elfAudioOn?'on':'off'}" id="elfAudioToggle" data-elf-audio aria-pressed="${state.elfAudioOn?'true':'false'}" ${streamReady?'':'aria-disabled="true"'}><span>Sound</span><strong>${state.elfAudioOn?'On':'Off'}</strong></button>`;
    const radio=state.elfUnlocked
      ? `<section class="comms-radio panel tuned compact"><div class="comms-radio-head"><div><div class="kicker">ELF FM</div><h2>87.7</h2></div>${toggle}</div><div class="wave locked ${state.elfAudioOn?'live':''}">${'<i></i>'.repeat(28)}</div><div class="radio-state-line">Signal Locked</div></section>`
      : `<section class="comms-radio panel locked compact"><div class="comms-radio-head"><div><div class="kicker">ELF FM</div><h2>87.7</h2></div><button class="btn small primary" data-tune-elf>Tune In</button></div><div class="wave">${'<i></i>'.repeat(28)}</div><div class="radio-state-line muted">Signal Available</div></section>`;
    return `${radio}<section class="comms-feed"><div class="comms-section-title"><span>Message Feed</span></div>${feed||'<div class="comms-empty panel">No transmissions received.</div>'}</section>`;
  }



  function missionHeader(cp){
    const label=`${cp.mc} / ${cp.name}`;
    if(cp.type==='diagnostics'){
      return `<div class="mission-head diagnostics-head"><div class="meta"><div class="kicker">${label}</div><button class="linkbtn" data-exit-mission>Exit Mission</button></div><div class="diagnostics-brand"><img src="./assets/audi-rings.webp" alt="Audi"></div><h1>Performance Scan</h1><p class="support-copy">${missionInstruction(cp.type)}</p></div>`;
    }
    if(cp.type==='activation'){
      return `<div class="mission-head mc01-head"><div class="meta"><div class="kicker">${label}</div><button class="linkbtn" data-exit-mission>Exit Mission</button></div><h1>Circuit Entry</h1><p class="support-copy">${missionInstruction(cp.type)}</p></div>`;
    }
    if(cp.type==='spirit'){
      return `<div class="mission-head spirit-head"><div class="meta"><div class="kicker">${label}</div><button class="linkbtn" data-exit-mission>Exit Mission</button></div><h1>Spirit Core</h1><p class="support-copy">${missionInstruction(cp.type)}</p></div>`;
    }
    return `<div class="mission-head"><div class="meta"><div class="kicker">${label}</div><button class="linkbtn" data-exit-mission>Exit Mission</button></div><h1>${cp.mission}</h1><p class="support-copy">${missionInstruction(cp.type)}</p></div>`;
  }
  function missionInstruction(type){
    return ({
      activation:'Kinetic energy generated on track has created enough power to initiate Santa-1’s recovery.',
      diagnostics:'Capture the engineering data needed for Santa-1.',
      radio:'Tune the receiver to 87.7 FM and establish a link with ELF FM.',
      commsrelay:'Relay the transmission and restore Santa-1 communications.',
      power:'Reach maximum velocity and capture racing power for Santa-1.',
      spirit:'Charge and stabilise the storage tanks.',
      placeholder:'This checkpoint is reserved while the final installation game is developed.',
      artifacts:'Clear the unstable signatures and stabilise the Starstream.',
      comet:'Lock 10 directional signals to restore Santa-1’s guidance path.',
      jingle:'Time three propulsion pulses so each lands inside the target flight zone.',
      lando:'React the moment the lights go out to calibrate Santa-1 flight control.',
      aurora:'Align the navigation rings and lock Santa-1 onto the North Pole.',
      lapland:'Initiate a full-system verification and watch every restored system report ready.',
      northern:'Authorise the restored sleigh for its final Northern Flight.'
    })[type]||'';
  }
  function renderMission(id){
    const cp=id==='elf-radio'?ELF_RADIO_MISSION:CHECKPOINTS.find(c=>c.id===id); if(!cp) return '';
    return `<div class="mission-shell mission-${cp.type}">${topBar()}${missionHeader(cp)}<div class="mission-content" id="missionContent">${missionBody(cp)}</div></div>`;
  }
  function missionBody(cp){
    switch(cp.type){
      case 'activation': return circuitEntryBody();
      case 'diagnostics': return diagnosticsBody();
      case 'radio': return radioBody();
      case 'commsrelay': return commsRelayBody();
      case 'power': return powerBody();
      case 'spirit': return spiritBody();
      case 'placeholder': return placeholderBody(cp);
      case 'artifacts': return artifactBody();
      case 'comet': return cometBody();
      case 'jingle': return jingleBody();
      case 'lando': return landoBody();
      case 'aurora': return auroraBody();
      case 'lapland': return laplandBody();
      case 'northern': return northernBody();
      default:return '';
    }
  }
  function circuitEntryBody(){
    return `<div class="mission-instrument panel mc01-panel" id="mc01Activation" data-stage="detected">
      <div class="mc01-track-stage" aria-hidden="true">
        <div class="mc01-track-shadow"></div>
        <div class="mc01-track-outline"></div>
        <div class="mc01-track-energy"></div>
        <span class="mc01-energy-node"></span>
        <span class="mc01-energy-ripple ripple-a"></span>
        <span class="mc01-energy-ripple ripple-b"></span>
      </div>
      <div class="mc01-readout">
        <span class="mc01-bolt" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13.7 1.8 5.3 13h5.5l-.5 9.2L18.7 11h-5.5l.5-9.2Z"/></svg></span>
        <div class="mc01-readout-copy"><span id="mc01StateLabel">Circuit Energy</span><strong id="mc01State">Detected</strong></div>
        <div class="mc01-signal-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      </div>
      <div class="mc01-transfer" aria-label="Circuit energy transfer progress">
        <div class="mc01-transfer-meta"><span>Energy Transfer</span><strong id="mc01TransferValue">0%</strong></div>
        <div class="mc01-transfer-track"><i id="mc01TransferFill"></i></div>
      </div>
    </div>`;
  }

  function diagnosticsBody(){
    const sensors=[
      {name:'Aero',key:'aero',viz:`<svg viewBox="0 0 120 70" role="presentation">
        <path class="aero-car" d="M48 20h24l10 9 3 18-9 7H44l-9-7 3-18 10-9Z"/>
        <path class="aero-flow aero-flow-1" d="M2 13 C22 9 31 10 44 16 C54 20 67 20 78 16 C91 11 102 11 118 15"/>
        <path class="aero-flow aero-flow-2" d="M1 31 C22 28 29 24 41 25 C52 26 68 26 81 24 C95 22 104 26 119 30"/>
        <path class="aero-flow aero-flow-3" d="M1 49 C23 53 31 52 44 47 C55 43 66 43 79 47 C92 52 103 53 119 49"/>
        <circle class="aero-particle aero-p1" cx="15" cy="13" r="2"/><circle class="aero-particle aero-p2" cx="14" cy="31" r="2"/><circle class="aero-particle aero-p3" cx="14" cy="49" r="2"/>
      </svg>`},
      {name:'Stability',key:'stability',viz:`<svg viewBox="0 0 120 70" role="presentation">
        <line class="stability-horizon" x1="8" y1="52" x2="112" y2="52"/>
        <g class="stability-chassis">
          <path class="stability-shell" d="M37 28h46l8 13-9 7H38l-9-7 8-13Z"/>
          <circle class="stability-wheel left" cx="42" cy="50" r="5"/><circle class="stability-wheel right" cx="78" cy="50" r="5"/>
          <line class="stability-spring left" x1="42" y1="36" x2="42" y2="46"/><line class="stability-spring right" x1="78" y1="36" x2="78" y2="46"/>
        </g>
        <line class="stability-centre" x1="60" y1="12" x2="60" y2="58"/>
        <circle class="stability-lock" cx="60" cy="36" r="25"/><circle class="stability-point" cx="60" cy="36" r="3"/>
      </svg>`},
      {name:'Power',key:'power',viz:`<svg viewBox="0 0 120 70" role="presentation">
        <path class="power-baseline" d="M5 53H115"/>
        <path class="power-trace-shadow" d="M6 50 L20 48 L30 43 L38 47 L47 30 L55 41 L65 18 L74 34 L83 12 L92 27 L102 9 L115 16"/>
        <path class="power-trace" d="M6 50 L20 48 L30 43 L38 47 L47 30 L55 41 L65 18 L74 34 L83 12 L92 27 L102 9 L115 16"/>
        <circle class="power-hotspot" cx="102" cy="9" r="4"/>
        <g class="power-output-bars"><rect x="8" y="57" width="12" height="5"/><rect x="24" y="54" width="12" height="8"/><rect x="40" y="51" width="12" height="11"/><rect x="56" y="47" width="12" height="15"/><rect x="72" y="43" width="12" height="19"/><rect x="88" y="38" width="12" height="24"/></g>
      </svg>`},
      {name:'Control',key:'control',viz:`<svg viewBox="0 0 120 70" role="presentation">
        <path class="control-path control-path-left" d="M7 35 C20 16 37 12 51 24"/>
        <path class="control-path control-path-right" d="M113 35 C100 54 83 58 69 46"/>
        <g class="control-wheel">
          <circle cx="60" cy="35" r="22"/><circle cx="60" cy="35" r="5"/>
          <line x1="60" y1="13" x2="60" y2="30"/><line x1="40" y1="43" x2="55" y2="37"/><line x1="80" y1="43" x2="65" y2="37"/>
        </g>
        <path class="control-angle" d="M38 18 A29 29 0 0 1 83 19"/><circle class="control-marker" cx="60" cy="7" r="2.5"/>
      </svg>`},
      {name:'Traction',key:'traction',viz:`<svg viewBox="0 0 120 70" role="presentation">
        <path class="traction-car" d="M50 13h20l9 11v22l-9 11H50l-9-11V24l9-11Z"/>
        <rect class="traction-wheel w1" x="31" y="18" width="12" height="14" rx="4"/><rect class="traction-wheel w2" x="77" y="18" width="12" height="14" rx="4"/><rect class="traction-wheel w3" x="31" y="39" width="12" height="14" rx="4"/><rect class="traction-wheel w4" x="77" y="39" width="12" height="14" rx="4"/>
        <ellipse class="traction-contact c1" cx="37" cy="25" rx="10" ry="5"/><ellipse class="traction-contact c2" cx="83" cy="25" rx="10" ry="5"/><ellipse class="traction-contact c3" cx="37" cy="46" rx="10" ry="5"/><ellipse class="traction-contact c4" cx="83" cy="46" rx="10" ry="5"/>
        <path class="traction-drive" d="M60 17v36"/>
      </svg>`},
      {name:'Response',key:'response',viz:`<svg viewBox="0 0 120 70" role="presentation">
        <circle class="response-ring response-ring-a" cx="60" cy="35" r="23"/><circle class="response-ring response-ring-b" cx="60" cy="35" r="15"/>
        <circle class="response-core" cx="60" cy="35" r="5"/>
        <path class="response-in" d="M6 35H48"/><path class="response-out" d="M72 35H114"/>
        <circle class="response-pulse response-pulse-in" cx="10" cy="35" r="3"/><circle class="response-pulse response-pulse-out" cx="110" cy="35" r="3"/>
      </svg>`}
    ];
    return `<div class="mission-instrument panel diagnostics-panel"><div class="sensor-grid diagnostics-grid">${sensors.map((x,i)=>`<button class="sensor sensor-${x.key}" data-sensor="${i}" data-diagnostic="${x.key}"><div class="sensor-head"><span class="num">0${i+1}</span><span class="name">${x.name}</span></div><div class="sensor-viz viz-${x.key}" aria-hidden="true">${x.viz}</div><div class="state">Ready to scan</div></button>`).join('')}</div></div><button class="btn primary wide" id="diagComplete" disabled>Confirm Performance Data</button>`;
  }

  function radioBody(){return `<div class="mission-instrument panel"><div class="wave" id="radioWave">${'<i></i>'.repeat(28)}</div><div class="frequency"><span id="freqVal">86.4</span> <small>FM</small></div><div class="range-wrap"><input id="freqRange" class="range" type="range" min="86" max="89" value="86.4" step="0.1"><div class="freq-marks"><span>86.0</span><span>87.0</span><span>87.7</span><span>89.0</span></div></div><div class="signal-state" id="signalState">Searching for signal</div><button class="btn primary wide" id="lockSignal" disabled>Lock Signal</button></div>`}
  function commsRelayBody(){
    return `<div class="mission-instrument panel comms-relay-panel">
      <div class="signal-state relay-instruction" id="relayState">Tap Relay 01 when the pulse meets the capture ring.</div>
      <div class="relay-network" id="relayNetwork" aria-label="Signal relay network">
        <svg class="relay-route" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">
          <line class="relay-hop-line" data-hop="0" x1="25" y1="25" x2="75" y2="25"></line>
          <line class="relay-hop-line" data-hop="1" x1="75" y1="25" x2="25" y2="75"></line>
          <line class="relay-hop-line" data-hop="2" x1="25" y1="75" x2="75" y2="75"></line>
          <line class="relay-hop-line" data-hop="3" x1="75" y1="75" x2="25" y2="125"></line>
          <line class="relay-hop-line" data-hop="4" x1="25" y1="125" x2="75" y2="125"></line>
        </svg>
        <div class="relay-cell relay-endpoint relay-origin"><span class="relay-radio-icon"><i></i><i></i><i></i></span><small>TRANSMITTER<br>MISSION CONTROL</small></div>
        ${[0,1,2,3].map(i=>`<div class="relay-cell relay-capture"><button class="relay-node ${i===0?'active':''}" data-relay="${i}" aria-label="Relay ${i+1}"><span class="relay-target"></span><span class="relay-pulse"></span><span class="relay-core">0${i+1}</span></button><small>RELAY 0${i+1}</small></div>`).join('')}
        <div class="relay-cell relay-endpoint relay-destination"><span class="relay-receiver-icon"></span><small>RECEIVER<br>SANTA-1</small></div>
      </div>
      <div class="relay-meter"><span>Signal Strength</span><div><i id="relayMeterFill"></i></div><strong id="relayMeterText">WEAK</strong></div>
    </div>`;
  }
  function powerBody(){
    const revSegments=Array.from({length:12},()=>'<i></i>').join('');
    return `<div class="mission-instrument panel power-run-panel">
      <div class="power-arcade" id="powerArcade">
        <div class="power-scanlines" aria-hidden="true"></div>
        <div class="power-hud">
          <div><span>Power Run</span><strong id="powerRunState">READY</strong></div>
          <div><span>Energy Output</span><strong id="powerOutput">0%</strong></div>
          <div class="power-speed-hud"><span>Speed</span><strong><b id="powerSpeed">000</b><small> MPH</small></strong></div>
        </div>
        <div class="power-rev-wrap"><span>POWER</span><div class="power-rev" id="powerRev">${revSegments}</div></div>
        <div class="power-road-scene" id="powerRoad">
          <div class="power-sky-sprite" aria-hidden="true"></div>
          <div class="power-ground" aria-hidden="true">
            <div class="power-grass-plane"></div>
            <div class="power-road-plane"></div>
          </div>
          <div class="power-horizon-seam" aria-hidden="true"></div>
          <div class="power-speed-lines" aria-hidden="true">${Array.from({length:12},()=>'<i></i>').join('')}</div>
          <div class="power-car" id="powerCar">
            <img class="power-car-sprite" src="./assets/power-car.webp" alt="Blue retro pixel racing car seen from behind">
            <span class="power-exhaust power-exhaust-left"></span><span class="power-exhaust power-exhaust-right"></span>
          </div>
          <div class="power-burst" id="powerBurst" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
        <div class="power-max-hold"><span>Sustain Max Power</span><div><i id="powerMaxFill"></i></div><strong id="powerMaxState">STANDBY</strong></div>
      </div>
      <div class="visually-hidden" id="powerState" aria-live="polite">Ready</div>
      <button class="btn primary wide power-accelerator" id="powerAccelerator">Press &amp; Hold to Accelerate</button>
    </div>`;
  }
  function spiritBody(){
    const tankCells=side=>Array.from({length:4},(_,i)=>`<div class="spirit-tank-cell" data-spirit-tank="${side}-${i}">
      <span class="spirit-tank-energy"></span><span class="spirit-tank-shimmer"></span>
      <span class="spirit-tank-vent" aria-hidden="true"><i></i><i></i><i></i></span>
    </div>`).join('');
    const stageDots=Array.from({length:5},(_,i)=>`<i data-spirit-stage-dot="${i}"></i>`).join('');
    return `<div class="mission-instrument panel spirit-panel" id="spiritRig" data-stage="0">
      <div class="spirit-apparatus" aria-label="Spirit energy storage tanks">
        <div class="spirit-meter spirit-meter-left" aria-hidden="true"><span class="spirit-meter-fill"></span><b class="spirit-meter-marker"></b></div>
        <div class="spirit-bank spirit-bank-left"><div class="spirit-tank-stack">${tankCells('left')}</div></div>
        <div class="spirit-bank spirit-bank-right"><div class="spirit-tank-stack">${tankCells('right')}</div></div>
        <div class="spirit-meter spirit-meter-right" aria-hidden="true"><span class="spirit-meter-fill"></span><b class="spirit-meter-marker"></b></div>
      </div>
      <div class="spirit-charge-controls" aria-label="Storage tank charging controls">
        <button class="spirit-charge-btn is-next" data-charge="A" aria-label="Charge left tank bank"><strong>A</strong></button>
        <button class="spirit-charge-btn" data-charge="B" aria-label="Charge right tank bank"><strong>B</strong></button>
      </div>
      <div class="spirit-stage-row"><div><span>Core Charge</span><strong><b id="spiritStageNumber">01</b> / 05</strong></div><em id="spiritStageName">Ignition</em></div>
      <div class="spirit-stage-progress" id="spiritStageProgress" aria-hidden="true">${stageDots}</div>
    </div>`;
  }
  function placeholderBody(cp){const location=cp?.location||'Checkpoint';return `<div class="mission-instrument panel" style="text-align:center;padding:30px 18px"><div class="onboard-icon">?</div><div class="kicker">${location} / Creative Hold</div><h2 style="font-family:var(--display);text-transform:uppercase;font-size:28px;margin:8px 0">Mission TBC</h2><p class="sub">This checkpoint is reserved while the final installation game is developed. GPS activation, route progression and completion behaviour remain active for testing.</p><button class="btn primary wide" style="margin-top:16px" id="completePlaceholder">Complete Demo Step</button></div>`}
  function artifactBody(){
    return `<div class="mission-instrument panel artifact-panel">
      <div class="artifact-score"><span>FIELD STABILITY</span><strong id="artifactProgress">0 / 12</strong></div>
      <div class="artifact-progress-track" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i data-artifact-step="${i}"></i>`).join('')}</div>
      <div class="artifact-instruction">Tap the unstable signatures before they distort the Starstream.</div>
      <div class="artifact-field" id="artifactField" data-intensity="1" aria-label="Fast-moving Starstream energy field">
        <canvas class="starstream-canvas" id="starstreamCanvas" aria-hidden="true"></canvas>
        <div class="starstream-nebula" aria-hidden="true"></div>
        <div class="starstream-vignette" aria-hidden="true"></div>
        <div class="starstream-beam" id="starstreamBeam" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="artifact-layer" id="artifactLayer"></div>
        <div class="artifact-burst-layer" id="artifactBurstLayer" aria-hidden="true"></div>
      </div>
      <div class="signal-state artifact-state" id="artifactState">Starstream interference detected</div>
    </div>`;
  }
  function cometBody(){
    const lanes=[['L','left'],['D','down'],['U','up'],['R','right']];
    const btnLabel={L:'Left',D:'Down',U:'Up',R:'Right'};
    return `<div class="mission-instrument panel comet-panel">
      <div class="comet-score"><span>GUIDANCE LOCK</span><strong id="cometProgress">0 / 10</strong></div>
      <div class="comet-progress-track" aria-hidden="true">${Array.from({length:10},(_,i)=>`<i data-comet-step="${i}"></i>`).join('')}</div>
      <div class="comet-instruction">Tap the matching direction as each signal reaches the capture line.</div>
      <div class="comet-game" id="cometGame" aria-label="Directional guidance game">
        <div class="comet-lanes">${lanes.map(([key,dir])=>`<div class="comet-lane" data-comet-lane="${key}"><span class="comet-lane-guide comet-guide-${dir}" aria-hidden="true"><i></i><i></i></span></div>`).join('')}</div>
        <div class="comet-capture-line"><span>CAPTURE</span></div>
        <div class="comet-notes" id="cometNotes" aria-hidden="true"></div>
        <div class="comet-hit-flash" id="cometHitFlash"></div>
      </div>
      <div class="comet-controls">${lanes.map(([key,dir])=>`<button class="comet-btn comet-btn-${dir}" data-arrow="${key}" aria-label="${btnLabel[key]}"><span class="comet-btn-icon" aria-hidden="true"><i></i><i></i></span></button>`).join('')}</div>
      <div class="signal-state comet-state" id="cometState">Guidance stream armed</div>
    </div>`;
  }
  function jingleBody(){
    const rows=[
      {level:1,label:'Calibration Speed',status:'Armed'},
      {level:2,label:'Sync Speed',status:'Standby'},
      {level:3,label:'Precision Speed',status:'Standby'}
    ];
    return `<div class="mission-instrument panel jingle-panel">
      <div class="jingle-stack">${rows.map(r=>`<div class="jingle-stage ${r.level===1?'active':'standby'}" data-jingle-stage="${r.level}">
        <div class="jingle-stage-head"><span><strong>${r.level}</strong> · ${r.label}</span><em data-jingle-status="${r.level}">${r.status}</em></div>
        <div class="sync-lane sync-lane-${r.level}"><div class="flight-zone"></div><div class="pulse-dot ${r.level===1?'active':''}" data-pulse-dot="${r.level}"></div></div>
      </div>`).join('')}</div>
      <div class="signal-state" id="jingleState">Pulse 1 · calibration speed</div>
      <button class="btn primary wide" id="syncPulse">Sync Pulse</button>
    </div>`;
  }
  function landoBody(){
    return `<div class="mission-instrument panel lando-panel">
      <div class="lando-round-head"><span>REACTION TEST</span><strong id="landoRound">ROUND 1 / 4</strong></div>
      <div class="lando-gantry-art" id="landoGantry" aria-label="Five column start light gantry with four stacked lamps">
        <img src="./assets/lando-gantry.webp" alt="" aria-hidden="true">
        <div class="lando-light-overlay" aria-hidden="true">
          ${[0,1,2,3,4].map(col=>[0,1,2,3].map(row=>`<span class="lando-lamp" data-col="${col}" data-row="${row}"></span>`).join('')).join('')}
        </div>
      </div>
      <div class="reaction-read"><span id="reactionRead">READY</span><small id="reactionUnit"></small></div>
      <div class="signal-state lando-state" id="landoState">Lights will go out at a random time. Be ready.</div>
      <button class="btn primary wide lando-react-btn" id="reactionBtn">Start Test</button>
      <div class="lando-results" aria-label="Reaction test results">
        ${[1,2,3,4].map(i=>`<div class="lando-result ${i===1?'active':''}" data-lando-result="${i}"><strong>0${i}</strong><span>${i===1?'READY':'STANDBY'}</span></div>`).join('')}
      </div>
    </div>`;
  }
  function auroraBody(){
    const rings=[['outer','Outer Ring'],['middle','Middle Ring'],['inner','Inner Ring']];
    return `<div class="mission-instrument panel aurora-panel">
      <div class="aurora-atmosphere" aria-hidden="true"></div>
      <div class="aurora-north" aria-hidden="true"><span class="aurora-north-star">✦</span><strong>North Pole</strong><i></i></div>
      <div class="aurora-dial" id="auroraDial" aria-label="Navigation ring alignment control">
        <div class="aurora-field"></div>
        <div class="aurora-target-line"></div>
        ${rings.map(([key])=>`<div class="aurora-ring aurora-ring-${key}" data-aurora-ring="${key}"><img src="./assets/aurora-ring-${key}.webp" alt="" aria-hidden="true"><span class="aurora-lock-notch"></span></div>`).join('')}
        <div class="aurora-compass"><span>✦</span></div>
      </div>
      <div class="aurora-ring-statuses">${rings.map(([key,label],i)=>`<button type="button" class="aurora-ring-status ${i===0?'selected':''}" data-aurora-status="${key}" data-aurora-select="${key}"><span class="aurora-mini-ring"></span><div><strong>${label}</strong><small>${i===0?'Selected · align':'Align to lock'}</small></div></button>`).join('')}</div>
      <div class="visually-hidden" id="auroraState" aria-live="polite">Outer ring awaiting alignment.</div>
    </div>`;
  }
  function laplandBody(){
    const systems=[
      {key:'power',label:'Power',status:'Standby'},
      {key:'comms',label:'Comms',status:'Standby'},
      {key:'core',label:'Core',status:'Standby'},
      {key:'control',label:'Control',status:'Standby'},
      {key:'propulsion',label:'Propulsion',status:'Standby'},
      {key:'response',label:'Response',status:'Standby'},
      {key:'navigation',label:'Navigation',status:'Standby'},
      {key:'launch',label:'Launch',status:'Blocked',state:'blocked'}
    ];
    return `<div class="mission-instrument panel lapland-panel">${systemStatusBank(systems,'lapland-system-bank','verify')}<button class="btn primary wide" id="initiateTest">Initiate Final Test</button></div>`;
  }
  function northernBody(){return `<div class="mission-instrument panel" style="text-align:center;padding:30px 18px"><div class="onboard-icon">✦</div><div class="kicker">Santa-1</div><h2 style="font-family:var(--display);text-transform:uppercase;font-size:34px;margin:8px 0">Northern Flight</h2><p class="sub">All restored systems are ready. Authorise the final flight sequence to complete the recovery mission.</p><button class="btn primary wide" style="margin-top:18px" id="authoriseFlight">Authorise Northern Flight</button></div>`}


  function bindGlobal(){
    document.querySelectorAll('[data-nav]').forEach(b=>{
      if(b.dataset.navBound==='1') return;
      b.dataset.navBound='1';
      b.addEventListener('click',()=>{
        if(b.dataset.nav==='comms') markAllMessagesRead();
        set({nav:b.dataset.nav});
      });
    });
    document.querySelectorAll('[data-read-messages]').forEach(b=>b.addEventListener('click',()=>{markAllMessagesRead();set({nav:'comms'});}));
    document.querySelectorAll('[data-dismiss-messages]').forEach(b=>b.addEventListener('click',dismissMessageAlert));
    document.querySelectorAll('[data-tune-elf]').forEach(b=>b.addEventListener('click',()=>openElfTuner()));
    document.querySelectorAll('[data-elf-audio]').forEach(b=>b.addEventListener('click',toggleElfAudio));
    document.querySelectorAll('[data-onboard]').forEach(b=>b.addEventListener('click',()=>{
      if(b.dataset.onboard==='demo'){ startDemoExperience(); return; }
      if(b.dataset.onboard==='demo-continue'){ continueDemoExperience(); return; }
      set({bootDone:b.dataset.onboard});
    }));
    document.querySelectorAll('[data-mc00-continue]').forEach(b=>b.addEventListener('click',()=>continueMc00Sequence(b.dataset.mc00Continue)));
    document.querySelectorAll('[data-audio]').forEach(b=>b.addEventListener('click',()=>{const on=b.dataset.audio==='on';set({audio:on,bootDone:'location'});if(on){ensureAudio();ping(660,.1,.03);}}));
    document.querySelectorAll('[data-location]').forEach(b=>b.addEventListener('click',()=>{
      if(b.dataset.location==='demo'){startDemoExperience();return;}
      startLiveExperience();
    }));
    document.querySelectorAll('[data-start-mission]').forEach(b=>b.addEventListener('click',()=>openMission(b.dataset.startMission)));
    document.querySelectorAll('[data-open-mission]').forEach(row=>{
      const open=()=>openMission(row.dataset.openMission);
      row.addEventListener('click',open);
      row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
    });
    document.querySelectorAll('[data-exit-mission]').forEach(b=>b.addEventListener('click',()=>{if(state.missionOpen==='entry') stopMc01Activation();const nav=state.missionReturnNav||'radar';set({missionOpen:null,nav});if(nav==='radar'&&lastGps)processGps(lastGps,true);}));
  }

  function openElfTuner(){
    ping(780,.06,.04);haptic(25);
    set({missionOpen:'elf-radio',missionReturnNav:'comms'});
  }
  function openMission(id){
    const cp=CHECKPOINTS.find(c=>c.id===id); if(!cp||!cp.playable) return;
    const idx=checkpointIndex(id);
    const allowed=state.completed.includes(id)||state.available.includes(id)||idx<state.routeIndex||(idx===state.routeIndex&&state.targetInRange);
    if(!allowed){toast('Mission is not available yet.');return;}
    // MC-01 is a cinematic activation. The Circuit Entry screen begins
    // immediately when opened; there is no second Start Activation control.
    if(id==='entry'&&!state.completed.includes('entry')){
      ping(780,.06,.04);haptic(25);
      triggerCircuitEntry();
      return;
    }
    ping(780,.06,.04);haptic(25);
    set({missionOpen:id,missionReturnNav:state.nav});
  }
  function showNorthernLaunchSurge(){
    const el=document.createElement('div');el.className='surge';el.innerHTML=`<div class="surge-copy"><div class="kicker">Northern Flight</div><h1>Launch Authorised</h1><p>Santa-1 is cleared for departure.</p></div>`;document.body.appendChild(el);ping(180,.25,.08);setTimeout(()=>{ping(520,.18,.05);haptic([50,40,90]);},600);setTimeout(()=>el.remove(),2200);
  }
  function showCompletion(title,copy){
    const mc=document.getElementById('missionContent'); if(!mc) return;
    mc.innerHTML=`<div class="completion panel"><div class="check">✓</div><div class="kicker">Mission Complete</div><h2>${title}</h2>${copy?`<p>${copy}</p>`:''}<button class="btn primary wide" id="returnRadar">${state.missionReturnNav==='comms'?'Return to Comms':state.missionReturnNav==='missions'?'Return to Missions':'Return to Radar'}</button></div>`;
    document.getElementById('returnRadar').onclick=()=>completeCurrent(); ping(880,.14,.05);haptic([30,35,70]);
  }
  function showRadioCompletion(){
    const mc=document.getElementById('missionContent'); if(!mc) return;
    mc.innerHTML=`<div class="completion panel"><div class="check">✓</div><div class="kicker">Signal Locked</div><h2>ELF FM Locked</h2><p>Signal acquired at 87.7. ELF FM is now playing and remains available from Communications.</p><button class="btn primary wide" id="returnComms">Return to Comms</button></div>`;
    document.getElementById('returnComms').onclick=()=>{
      state={...state,elfUnlocked:true,missionOpen:null,missionReturnNav:'radar',nav:'comms'};
      save();render();
    };
    ping(880,.14,.05);haptic([30,35,70]);
  }
  function completeCurrent(){
    const id=state.missionOpen; const idx=checkpointIndex(id); if(idx<0) return;
    const done=state.completed.includes(id)?state.completed:[...state.completed,id];
    const available=state.available.filter(x=>x!==id);
    let routeIndex=normaliseRouteIndex(state.routeIndex);
    if(idx===routeIndex) routeIndex=nextRouteIndex(routeIndex);
    const returnNav=state.missionReturnNav||'radar';
    resetGeofenceRuntime();
    state={...state,completed:done,available,missionOpen:null,routeIndex,targetVisible:false,targetInRange:false,distance:null,lastMessage:'SEARCHING FOR NEXT SIGNATURE',nav:returnNav};
    if(state.mode==='demo'){
      clearDemo();
      demoHoldUntil=Date.now()+1100;
    }
    save();checkpointCompletionMessage(id);render();
    if(state.mode==='demo'&&returnNav==='radar') rearmDemoRoute(650);
    if(state.mode==='live'&&lastGps) setTimeout(()=>processGps(lastGps,true),50);
  }
  function unlockMission(id){
    if(!id||state.completed.includes(id)||state.available.includes(id)) return;
    state.available=[...state.available,id];save();
  }
  function resetGeofenceRuntime(){activationHits=0;activationSince=null;outsideSince=null;nextPassSince=null;inRangeLatched=false;}
  function passCurrentCheckpoint(reason='passed'){
    const cp=current(); if(!cp) return;
    if(cp.playable&&!state.completed.includes(cp.id)) unlockMission(cp.id);
    state.routeIndex=nextRouteIndex(state.routeIndex);
    state.targetVisible=false;state.targetInRange=false;state.distance=null;state.lastMessage='SEARCHING FOR NEXT SIGNATURE';
    resetGeofenceRuntime();save();
    if(cp.playable&&!state.completed.includes(cp.id)){
      addMessage(`missed:${cp.id}`,'MISSION CONTROL','CHECKPOINT STORED',`${cp.name} has been stored for later. Continue your route or complete the mission at any time from Missions.`,cp.id);
    } else updateRadarLive();
  }
  function triggerCircuitEntry(){
    const cp=current(); if(!cp||cp.id!=='entry'||state.completed.includes('entry')) return;
    if(state.mode==='demo') clearDemo();
    if(state.missionOpen==='entry') return;
    resetGeofenceRuntime();
    state={...state,missionOpen:'entry',missionReturnNav:state.nav||'radar',targetVisible:true,targetInRange:true,lastMessage:'CIRCUIT ENERGY DETECTED'};
    save();render();
  }

  function startLiveExperience(){
    if(!navigator.geolocation){toast('Location services are unavailable on this device.');return;}
    navigator.geolocation.getCurrentPosition(pos=>{
      state={...state,onboarded:true,mode:'live',nav:'radar',routeIndex:normaliseRouteIndex(state.routeIndex||ROUTE_START_INDEX),gpsAccuracy:pos.coords.accuracy,gpsCondition:gpsCondition(pos.coords.accuracy)};save();ensureOpeningMessage();render();startGpsWatch();processGps(normalisePosition(pos),true);
    },()=>toast('Location permission is required for Live Radar.'),{enableHighAccuracy:true,timeout:10000,maximumAge:0});
  }
  let mc00ScanTimer = null;
  let mc00ScanRaf = null;

  function stopMc00Scan(){
    if(mc00ScanTimer){ clearInterval(mc00ScanTimer); mc00ScanTimer = null; }
    if(mc00ScanRaf){ cancelAnimationFrame(mc00ScanRaf); mc00ScanRaf = null; }
  }

  function continueMc00Sequence(mode){
    stopMc00Scan();
    const nextStep = mode==='mc00-demo' ? 'demo-scan' : 'brief';
    set({ bootDone: nextStep });
  }

  function bindMc00Scan(step){
    if(step!=='mc00-live' && step!=='mc00-demo') return;
    const card = document.querySelector('.mc00-card');
    const bar = document.getElementById('mc00ProgressFill');
    const value = document.getElementById('mc00ProgressValue');
    const progress = document.querySelector('.mc00-progress');
    const complete = document.getElementById('mc00CompleteBlock');
    const button = document.getElementById('mc00Continue');
    if(!card || !bar || !value || !progress || !complete || !button) return;

    stopMc00Scan();

    const scanSystems = [
      { key:'power', start:3, end:14 },
      { key:'comms', start:16, end:27 },
      { key:'core', start:29, end:40 },
      { key:'control', start:42, end:53 },
      { key:'propulsion', start:55, end:66 },
      { key:'response', start:68, end:79 },
      { key:'navigation', start:81, end:91 },
      { key:'launch', start:93, end:99, final:'blocked' }
    ];

    let progressValue = 0;
    const lastStates = new Map();

    const setSystemState = (key,nextState)=>{
      if(lastStates.get(key)===nextState) return;
      lastStates.set(key,nextState);
      const item=document.querySelector(`[data-mc00-system="${key}"]`);
      const status=document.querySelector(`[data-mc00-status="${key}"]`);
      if(!item||!status) return;
      item.classList.remove('is-standby','is-checking','is-offline','is-online','is-blocked','is-clear');
      item.classList.add(`is-${nextState}`);
      status.textContent=nextState==='checking'?'Checking':nextState==='offline'?'Offline':nextState==='blocked'?'Blocked':'Standby';
    };

    const paint = ()=>{
      bar.style.transform = `scaleX(${progressValue/100})`;
      value.textContent = `${progressValue}%`;
      progress.setAttribute('aria-valuenow', String(progressValue));

      scanSystems.forEach(system=>{
        const nextState = progressValue < system.start
          ? 'standby'
          : progressValue < system.end
            ? 'checking'
            : (system.final || 'offline');
        setSystemState(system.key,nextState);
      });

      if(progressValue >= 100){
        stopMc00Scan();
        card.classList.add('is-complete');
        complete.hidden = false;
      }
    };

    scanSystems.forEach(system=>setSystemState(system.key,'standby'));
    paint();
    card.classList.remove('is-complete');
    complete.hidden = true;

    mc00ScanTimer = setInterval(()=>{
      progressValue = Math.min(100, progressValue + 1);
      paint();
      if(progressValue === 100){
        ping(860,.12,.05);
        haptic([20,35,65]);
      } else if(progressValue % 13 === 0){
        ping(620 + (progressValue * 2), .05, .02);
      }
    }, 45);
  }
  let mc01Timers=[];

  function stopMc01Activation(){
    mc01Timers.forEach(clearTimeout);
    mc01Timers=[];
  }

  function mc01Later(fn,delay){
    const timer=setTimeout(()=>{
      mc01Timers=mc01Timers.filter(id=>id!==timer);
      fn();
    },delay);
    mc01Timers.push(timer);
  }

  function bindCircuitEntryActivation(){
    const panel=document.getElementById('mc01Activation');
    const stateLabel=document.getElementById('mc01StateLabel');
    const stateValue=document.getElementById('mc01State');
    const transferValue=document.getElementById('mc01TransferValue');
    const transferFill=document.getElementById('mc01TransferFill');
    if(!panel||!stateLabel||!stateValue||!transferValue||!transferFill) return;

    stopMc01Activation();

    const setProgress=value=>{
      const progress=Math.max(0,Math.min(100,Number(value)||0));
      transferValue.textContent=`${progress}%`;
      transferFill.style.transform=`scaleX(${progress/100})`;
    };
    const setStage=(stage,label,value,progress)=>{
      if(!document.getElementById('mc01Activation')) return;
      panel.dataset.stage=stage;
      stateLabel.textContent=label;
      stateValue.textContent=value;
      setProgress(progress);
    };

    setStage('detected','Circuit Energy','Detected',0);
    ping(560,.08,.025);

    mc01Later(()=>{
      setStage('routing','Track Energy','Routing',34);
      ping(640,.06,.025);
      haptic(18);
    },750);

    mc01Later(()=>{
      setStage('transfer','Power Transfer','Routing to Santa-1',72);
      ping(720,.08,.03);
      haptic([18,28,24]);
    },1850);

    mc01Later(()=>{
      setStage('recovery','Recovery Sequence','Initiated',100);
      ping(880,.14,.05);
      haptic([30,35,70]);
    },3150);

    mc01Later(()=>{
      stopMc01Activation();
      if(state.missionOpen!=='entry') return;
      showCompletion('Circuit Entry Complete',"Santa-1's recovery has begun.");
    },4350);
  }
  function startGpsWatch(){
    if(gpsWatchId!==null||!navigator.geolocation) return;
    gpsWatchId=navigator.geolocation.watchPosition(pos=>processGps(normalisePosition(pos)),err=>{
      state.gpsCondition=err.code===1?'DENIED':'WAITING';save();updateRadarLive();
    },{enableHighAccuracy:true,maximumAge:1000,timeout:15000});
  }
  function normalisePosition(pos){return {lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy,timestamp:pos.timestamp||Date.now()};}
  function processGps(fix,force=false){
    if(!fix||!Number.isFinite(fix.lat)||!Number.isFinite(fix.lng)) return;
    lastGps=fix;
    state.gpsAccuracy=fix.accuracy;state.gpsCondition=gpsCondition(fix.accuracy);
    if(IS_ADMIN){updateAdminGps();return;}
    if(!state.onboarded||state.mode!=='live'){save();return;}
    if(state.missionOpen){save();return;}
    const cp=current();
    if(!cp){state.targetVisible=false;state.targetInRange=false;state.distance=null;save();updateRadarLive();return;}
    const cfg=activeConfig(cp);
    const d=distanceMetres(fix.lat,fix.lng,cfg.lat,cfg.lng);
    const bearing=bearingDegrees(fix.lat,fix.lng,cfg.lat,cfg.lng);
    state.distance=d;state.bearing=bearing;
    const now=Date.now();
    const accuracy=Number(fix.accuracy);
    const reliable=Number.isFinite(accuracy)&&accuracy<=ACTIVATION_ACCURACY_MAX;
    const passReliable=Number.isFinite(accuracy)&&accuracy<=PASS_ACCURACY_MAX;
    const detectable=Number.isFinite(accuracy)&&accuracy<=DETECTION_ACCURACY_MAX&&d<=cfg.detectionRadius;
    const exitRadius=(cfg.activationRadius||30)+35;
    const nextCp=nextRouteCheckpoint(state.routeIndex);
    const nextCfg=activeConfig(nextCp);
    const nextDistance=nextCfg&&nextCfg.geofence!==false?distanceMetres(fix.lat,fix.lng,nextCfg.lat,nextCfg.lng):Infinity;

    // Passing because the following checkpoint is nearby is intentionally much
    // stricter than ordinary detection. This avoids overlapping detection zones
    // skipping a mission: the next checkpoint must be close to its activation
    // zone, the current checkpoint must clearly be behind us, and the evidence
    // must persist across multiple good fixes.
    const nextPassRadius=nextCfg?(nextCfg.activationRadius||30)+20:0;
    const strongNextEvidence=Boolean(
      nextCfg&&
      Number.isFinite(accuracy)&&accuracy<=NEXT_PASS_ACCURACY_MAX&&
      nextDistance<=nextPassRadius&&
      d>exitRadius+15
    );
    if(strongNextEvidence){
      if(!nextPassSince) nextPassSince=now;
    } else nextPassSince=null;
    const nextPassConfirmed=Boolean(nextPassSince&&now-nextPassSince>=NEXT_PASS_DWELL_MS);

    const registerActivationFix=()=>{
      if(reliable&&d<=cfg.activationRadius){
        if(!activationSince) activationSince=now;
        activationHits++;
        return activationHits>=ACTIVATION_HITS_REQUIRED&&now-activationSince>=ACTIVATION_DWELL_MS;
      }
      activationHits=0;activationSince=null;
      return false;
    };

    if(cp.type==='activation'){
      state.targetVisible=detectable;state.targetInRange=false;
      const activationConfirmed=registerActivationFix();
      save();updateRadarLive();
      if(activationConfirmed||nextPassConfirmed) triggerCircuitEntry();
      return;
    }

    if(!inRangeLatched){
      state.targetVisible=detectable;
      if(registerActivationFix()){
        inRangeLatched=true;state.targetVisible=true;state.targetInRange=true;unlockMission(cp.id);ping(700,.08,.04);haptic(30);
      }
    } else {
      state.targetVisible=true;state.targetInRange=true;
      // Do not advance a checkpoint on a weak GPS fix. The guest must remain
      // outside the exit radius with a reasonably accurate fix for the full
      // dwell period before the route moves on.
      if(passReliable&&d>exitRadius){
        if(!outsideSince) outsideSince=now;
        if(now-outsideSince>=PASS_DWELL_MS){passCurrentCheckpoint('exit radius');if(lastGps)setTimeout(()=>processGps(lastGps,true),25);return;}
      } else outsideSince=null;
    }

    if(nextPassConfirmed&&!state.targetInRange){
      passCurrentCheckpoint('next checkpoint confirmed');
      if(lastGps)setTimeout(()=>processGps(lastGps,true),25);
      return;
    }
    save();updateRadarLive();
  }

  function updateRadarLive(){
    if(IS_ADMIN||state.nav!=='radar'||state.missionOpen) return;
    updateCommsBadge();
    const cp=current(); const cfg=activeConfig(cp);
    const gpsValue=document.querySelector('.status-cell:first-child .status-value');
    if(gpsValue){const condition=state.mode==='demo'?'DEMO':state.gpsCondition;gpsValue.textContent=condition;gpsValue.className=`status-value gps-${condition.toLowerCase()}`;}
    const sleighValue=document.querySelector('.status-cell:nth-child(2) .status-value'); if(sleighValue)sleighValue.textContent=`${recovery()}%`;
    const checkpointValue=document.querySelector('.status-cell:last-child .status-value');
    if(checkpointValue){const d=distanceToActivation(cp,state.distance);checkpointValue.textContent=!cp?'COMPLETE':state.targetVisible&&Number.isFinite(d)?`${Math.round(d)} M`:'SEARCHING';}
    const target=document.querySelector('.target-dot');
    if(target&&cp&&cfg){
      const radial=state.targetInRange?5:Math.max(8,Math.min(39,(Number.isFinite(state.distance)?state.distance/cfg.detectionRadius:1)*39));
      const ang=(Number.isFinite(state.bearing)?state.bearing:0)-90;
      const x=50+Math.cos(toRad(ang))*radial, y=50+Math.sin(toRad(ang))*radial;
      target.style.left=`${x}%`;target.style.top=`${y}%`;target.classList.toggle('hidden',!state.targetVisible);
    }
    const msg=document.getElementById('radarMessage'); if(!msg)return;
    const holder=document.createElement('div');holder.innerHTML=radarMessage(cp).trim();const fresh=holder.firstElementChild;
    if(!fresh)return;
    if(msg.innerHTML!==fresh.innerHTML||msg.className!==fresh.className){
      msg.className=fresh.className;msg.innerHTML=fresh.innerHTML;
      const b=msg.querySelector('[data-start-mission]');if(b)b.addEventListener('click',()=>openMission(b.dataset.startMission));
      const read=msg.querySelector('[data-read-messages]');if(read)read.addEventListener('click',()=>{markAllMessagesRead();set({nav:'comms'});});
      const dismiss=msg.querySelector('[data-dismiss-messages]');if(dismiss)dismiss.addEventListener('click',dismissMessageAlert);
    }
  }

  function startDemoExperience(){
    clearDemo();
    state={...defaults,onboarded:false,audio:state.audio,bootDone:'mc00-demo',mode:'demo',nav:'radar',completed:[],available:[],routeIndex:1,gpsCondition:'DEMO'};
    save();
    render();
    ping(480,.07,.025);
  }
  function continueDemoExperience(){
    clearDemo();
    demoHoldUntil=Date.now()+900;
    state={...state,onboarded:true,bootDone:true,mode:'demo',nav:'radar',completed:[],available:[],routeIndex:1,targetVisible:false,targetInRange:false,distance:null,gpsCondition:'DEMO'};
    save();
    ensureOpeningMessage();
    render();
    maybeStartDemoTarget(650);
  }
  function clearDemo(){clearTimeout(demoTimer);clearInterval(demoInterval);demoTimer=null;demoInterval=null;}
  function rearmDemoRoute(delay=350){
    if(state.mode!=='demo') return;
    const expectedIndex=normaliseProgressRouteIndex(state.routeIndex,state.completed);
    if(expectedIndex!==state.routeIndex){state.routeIndex=expectedIndex;save();}
    const arm=()=>{
      if(state.mode!=='demo'||state.nav!=='radar'||state.missionOpen||state.routeIndex!==expectedIndex||state.targetInRange) return;
      if(!state.targetVisible) forceDemoTarget(0);
    };
    setTimeout(arm,Math.max(0,Number(delay)||0));
    // Fallback in case a navigation/render transition interrupted the first timer.
    setTimeout(arm,2600);
  }
  function beginDemoApproach(){
    if(!canRunDemoTarget()) return;
    const cp=current();
    const cfg=activeConfig(cp);
    if(!cp||!cfg) return;
    const activationRadius=Number(cfg.activationRadius)||30;
    let d=state.targetVisible&&Number.isFinite(state.distance)
      ? Math.max(activationRadius,state.distance)
      : 180;
    state.targetVisible=true;
    state.targetInRange=false;
    state.distance=d;
    state.bearing=Number.isFinite(state.bearing)?state.bearing:35;
    save();updateRadarLive();
    if(d<=activationRadius){
      state.targetInRange=true;state.distance=activationRadius;unlockMission(cp.id);save();updateRadarLive();ping(700,.08,.04);haptic(30);return;
    }
    demoInterval=setInterval(()=>{
      if(!canRunDemoTarget()){clearInterval(demoInterval);demoInterval=null;return;}
      const activeCp=current();
      const activeCfg=activeConfig(activeCp);
      if(!activeCp||!activeCfg){clearInterval(demoInterval);demoInterval=null;return;}
      const activeRadius=Number(activeCfg.activationRadius)||30;
      d-=16;
      state.distance=Math.max(activeRadius,d);
      state.bearing=(state.bearing+2)%360;
      if(d<=activeRadius){
        clearInterval(demoInterval);demoInterval=null;
        state.targetInRange=true;state.distance=activeRadius;unlockMission(activeCp.id);save();updateRadarLive();ping(700,.08,.04);haptic(30);
      }else{save();updateRadarLive();}
    },650);
  }
  function forceDemoTarget(delay=250){
    if(state.mode!=='demo'||state.nav!=='radar'||state.missionOpen||!current()) return;
    clearDemo();
    demoTimer=setTimeout(()=>{demoTimer=null;beginDemoApproach();},Math.max(0,Number(delay)||0));
  }
  function canRunDemoTarget(){
    return state.mode==='demo'&&state.nav==='radar'&&!state.missionOpen&&!!current()&&!state.targetInRange;
  }
  function maybeStartDemoTarget(delay=500){
    if(!canRunDemoTarget()||demoTimer!==null||demoInterval!==null) return;
    const wait=Math.max(0,Number(delay)||0,demoHoldUntil-Date.now());
    demoTimer=setTimeout(()=>{
      demoTimer=null;
      // If the guest opened another panel during the wait, stop here. The
      // next Radar render will call maybeStartDemoTarget() again.
      if(!canRunDemoTarget()) return;
      beginDemoApproach();
    },wait);
  }

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
  function bindMission(id){
    const cp=id==='elf-radio'?ELF_RADIO_MISSION:CHECKPOINTS.find(c=>c.id===id); if(!cp) return;
    if(cp.type==='activation') bindCircuitEntryActivation();
    if(cp.type==='diagnostics') bindDiagnostics();
    if(cp.type==='radio') bindRadio();
    if(cp.type==='commsrelay') bindCommsRelay();
    if(cp.type==='power') bindPower();
    if(cp.type==='spirit') bindSpirit();
    if(cp.type==='placeholder') document.getElementById('completePlaceholder').onclick=()=>showCompletion('Checkpoint Reserved',`${cp.location} is reserved while the final activation game is developed.`);
    if(cp.type==='artifacts') bindArtifacts();
    if(cp.type==='comet') bindComet();
    if(cp.type==='jingle') bindJingle();
    if(cp.type==='lando') bindLando();
    if(cp.type==='aurora') bindAurora();
    if(cp.type==='lapland') bindLapland();
    if(cp.type==='northern') document.getElementById('authoriseFlight').onclick=()=>{showNorthernLaunchSurge();setTimeout(()=>showCompletion('Santa-1 Airborne','Northern Flight completes the recovery mission. Santa-1 is airborne.'),1500);};
  }
  function bindDiagnostics(){
    const done=new Set();
    const durations=[1600,1900,1700,2000,1800,2200];
    let busy=false;
    document.querySelectorAll('[data-sensor]').forEach(btn=>btn.onclick=()=>{
      const i=Number(btn.dataset.sensor);
      if(done.has(i)||busy)return;
      busy=true;
      document.querySelectorAll('[data-sensor]').forEach(other=>{ if(other!==btn&&!other.classList.contains('done')) other.classList.add('scan-locked'); });
      btn.classList.add('active');
      btn.querySelector('.state').textContent='Scanning…';
      ping(420+i*85,.07,.02);
      haptic(12);
      setTimeout(()=>{
        done.add(i);
        btn.classList.remove('active');
        btn.classList.add('done');
        btn.querySelector('.state').textContent='Captured ✓';
        document.querySelectorAll('[data-sensor]').forEach(other=>other.classList.remove('scan-locked'));
        ping(720+i*40,.06,.025);
        haptic(24);
        busy=false;
        if(done.size===6)document.getElementById('diagComplete').disabled=false;
      },durations[i]||1800);
    });
    document.getElementById('diagComplete').onclick=()=>showCompletion('Data Captured','');
  }

  async function completeElfTuning(){
    stopStatic();
    state.elfUnlocked=true;
    const audio=getElfAudio();
    let playing=false;
    if(audio){
      try{
        audio.volume=1;
        await audio.play();
        playing=true;
      }catch{
        playing=false;
      }
    }
    elfTunerPreviewActive=false;
    state.elfAudioOn=playing;
    save();
    showRadioCompletion();
    if(!playing) toast('ELF FM is tuned. Use Sound On in Comms to start the stream.');
  }
  function bindRadio(){
    const range=document.getElementById('freqRange'), val=document.getElementById('freqVal'), st=document.getElementById('signalState'), btn=document.getElementById('lockSignal'), wave=document.getElementById('radioWave');
    startStatic(.095);
    startElfTunerPreview().then(started=>{if(!started) st.textContent='Move the tuner to locate ELF FM';});
    let wasLocked=false;
    const update=()=>{
      const f=Number(range.value);
      val.textContent=f.toFixed(1);
      const delta=Math.abs(f-87.7);
      const distanceMix=Math.max(0,Math.min(1,delta/1.1));
      setStatic(.006+distanceMix*.089);
      setElfTunerPreview(delta);
      if(delta<.051){
        st.textContent='ELF FM SIGNAL ACQUIRED';st.classList.add('lock');btn.disabled=false;wave.classList.add('locked');
        if(!wasLocked){ping(920,.06,.02);haptic(20);wasLocked=true;}
      } else {
        wasLocked=false;
        st.textContent=delta<.15?'Signal almost clear…':delta<.4?'Signal resolving…':delta<.8?'Weak ELF FM signal…':'Searching for signal';
        st.classList.remove('lock');btn.disabled=true;wave.classList.remove('locked');
      }
    };
    range.oninput=update;update();
    btn.onclick=()=>{completeElfTuning();};
    cleanupMission=()=>{stopStatic();stopElfTunerPreview();};
  }
  function bindCommsRelay(){
    const nodes=[...document.querySelectorAll('[data-relay]')];
    const hops=[...document.querySelectorAll('[data-hop]')];
    const stateEl=document.getElementById('relayState');
    const meterFill=document.getElementById('relayMeterFill');
    const meterText=document.getElementById('relayMeterText');
    const help=['Acquire the incoming signal.','Route the recovered transmission.','Boost the communications carrier.','Transmit the restored link to Santa-1.'];
    const cycles=[1900,1650,1450,1300];
    let stage=0,phase=0,start=performance.now(),raf=0,locked=false,finishing=false;
    const santa=getSantaCommsAudio();
    try{santa.load();}catch{}
    function draw(now){
      if(finishing)return;
      const cycle=cycles[stage]||1300;
      phase=((now-start)%cycle)/cycle;
      const pulse=nodes[stage]?.querySelector('.relay-pulse');
      if(pulse){
        const scale=.42+phase*1.28;
        pulse.style.transform=`translate(-50%,-50%) scale(${scale})`;
        pulse.style.opacity=String(Math.max(.08,1-phase*.72));
      }
      raf=requestAnimationFrame(draw);
    }
    function arm(nextStage){
      stage=nextStage;phase=0;start=performance.now();locked=false;
      nodes.forEach((n,i)=>n.classList.toggle('active',i===stage));
      stateEl.textContent=`Tap Relay 0${stage+1} when the pulse meets the capture ring.`;
    }
    function showIncomingTransmission(){
      finishing=true;cancelAnimationFrame(raf);
      const mc=document.getElementById('missionContent');if(!mc)return;
      mc.innerHTML=`<div class="mission-instrument panel incoming-transmission"><div class="transmission-icon"><span></span><i></i><i></i><i></i></div><div class="kicker">Incoming Transmission</div><h2>SANTA-1</h2><div class="transmission-wave">${'<b></b>'.repeat(24)}</div><div class="signal-state lock" id="incomingState">Opening channel…</div></div>`;
      const incomingState=document.getElementById('incomingState');
      const radioWasOn=Boolean(state.elfAudioOn&&elfAudioEl&&!elfAudioEl.paused);
      const previousRadioVolume=radioWasOn?elfAudioEl.volume:1;
      let stopDuck=()=>{};
      // Narrative transmissions take priority over ELF FM. Keep a trace of the
      // station underneath rather than stopping/restarting the live stream.
      if(radioWasOn) stopDuck=rampElementVolume(elfAudioEl,.025,420);
      if(state.audio) startStatic(.05);
      let introStatic=null,santaDelay=null,fallback=null,tailTimer=null,finished=false;
      const finish=()=>{
        if(finished)return;finished=true;
        clearTimeout(introStatic);clearTimeout(santaDelay);clearTimeout(fallback);clearTimeout(tailTimer);stopStatic();
        if(radioWasOn&&elfAudioEl){elfAudioEl.volume=Math.min(elfAudioEl.volume,.025);rampElementVolume(elfAudioEl,previousRadioVolume,520);}
        setTimeout(()=>showCompletion('Comms Link Restored',''),260);
      };
      const playSanta=()=>{
        stopStatic();
        if(incomingState) incomingState.textContent='Signal locked · receiving';
        if(!state.audio){setTimeout(finish,1050);return;}
        try{
          santa.currentTime=0;santa.volume=1;
          const play=santa.play();
          if(play&&typeof play.catch==='function') play.catch(()=>finish());
          santa.onended=()=>{
            if(incomingState) incomingState.textContent='Transmission received';
            startStatic(.028);
            tailTimer=setTimeout(()=>{stopStatic();finish();},220);
          };
          santa.onerror=()=>finish();
          fallback=setTimeout(finish,14000);
        }catch{finish();}
      };
      // Give the carrier/static its own beat, then leave a clean gap before
      // Santa begins so the opening Ho Ho Ho is never masked by the noise.
      introStatic=setTimeout(()=>{stopStatic();if(incomingState)incomingState.textContent='Channel open';},430);
      santaDelay=setTimeout(playSanta,900);
      santaTransmissionCleanup=()=>{
        clearTimeout(introStatic);clearTimeout(santaDelay);clearTimeout(fallback);clearTimeout(tailTimer);stopDuck();
        if(santaCommsEl){santaCommsEl.onended=null;santaCommsEl.onerror=null;try{santaCommsEl.pause();santaCommsEl.currentTime=0;}catch{}}
        if(radioWasOn&&elfAudioEl)elfAudioEl.volume=previousRadioVolume;
        stopStatic();
      };
      cleanupMission=()=>stopSantaTransmission(true);
    }
    nodes.forEach((node,i)=>node.onclick=()=>{
      if(i!==stage||locked||finishing)return;
      // The moving pulse intersects the fixed capture ring around 67% of the cycle.
      const hit=phase>=.53&&phase<=.80;
      if(!hit){
        node.classList.add('miss');stateEl.textContent='Signal missed · retry current relay.';haptic([16,28,16]);ping(230,.07,.025);
        setTimeout(()=>node.classList.remove('miss'),280);start=performance.now();return;
      }
      locked=true;node.classList.remove('active');node.classList.add('locked');
      hops[stage]?.classList.add('locked');
      meterFill.style.width=`${25+(stage*25)}%`;
      meterText.textContent=['ACQUIRED','ROUTED','STRONG','LOCKED'][stage];
      stateEl.textContent=stage===3?'Transmission path locked.':'Relay locked · signal strengthened.';
      ping(620+stage*105,.09,.035);haptic([20,25,38]);
      if(stage===3){
        hops.forEach(h=>h.classList.add('locked'));
        const dest=document.querySelector('.relay-destination');dest?.classList.add('locked');
        // Prime the Santa media element inside the final user gesture, but at
        // zero volume. This preserves reliable mobile playback while the
        // visible carrier/static intro and clean pause happen afterwards.
        if(state.audio){
          try{
            santa.currentTime=0;santa.volume=0;
            const prime=santa.play();
            if(prime&&typeof prime.then==='function') prime.then(()=>{try{santa.pause();santa.currentTime=0;santa.volume=1;}catch{}}).catch(()=>{});
          }catch{}
        }
        setTimeout(()=>showIncomingTransmission(),560);
      }else setTimeout(()=>arm(stage+1),460);
    });
    cleanupMission=()=>{cancelAnimationFrame(raf);stopSantaTransmission(true);};
    raf=requestAnimationFrame(draw);
  }

  function bindPower(){
    const arcade=document.getElementById('powerArcade');
    const road=document.getElementById('powerRoad');
    const car=document.getElementById('powerCar');
    const button=document.getElementById('powerAccelerator');
    const speedEl=document.getElementById('powerSpeed');
    const outputEl=document.getElementById('powerOutput');
    const runState=document.getElementById('powerRunState');
    const stateEl=document.getElementById('powerState');
    const maxFill=document.getElementById('powerMaxFill');
    const maxState=document.getElementById('powerMaxState');
    const burst=document.getElementById('powerBurst');
    const rev=[...document.querySelectorAll('#powerRev i')];
    const speedLines=[...document.querySelectorAll('.power-speed-lines i')];
    const topSpeed=214;
    const sustainRequired=1150;
    const powerAudio=new Audio('./assets/power-acceleration.mp3');
    powerAudio.preload='auto';
    powerAudio.volume=0;
    const powerWinAudio=new Audio('./assets/power-win.mp3');
    powerWinAudio.preload='auto';
    powerWinAudio.volume=.92;
    let audioFadeRaf=0;
    let speed=0,holding=false,sustain=0,last=performance.now(),roadPhase=0,grassPhase=0,raf=0,finished=false;
    let thresholdStep=0;

    function cancelPowerAudioFade(){
      if(audioFadeRaf)cancelAnimationFrame(audioFadeRaf);
      audioFadeRaf=0;
    }
    function fadePowerAudio(target,duration=220,onDone){
      cancelPowerAudioFade();
      const from=Number.isFinite(powerAudio.volume)?powerAudio.volume:0;
      const start=performance.now();
      const step=now=>{
        const p=Math.min(1,(now-start)/duration);
        powerAudio.volume=Math.max(0,Math.min(1,from+(target-from)*p));
        if(p<1)audioFadeRaf=requestAnimationFrame(step);
        else{audioFadeRaf=0;onDone?.();}
      };
      audioFadeRaf=requestAnimationFrame(step);
    }
    function startPowerAudio(){
      if(!state.audio)return;
      cancelPowerAudioFade();
      // Resume from the exact point reached on the previous acceleration hold.
      // Do not rewind when the player lifts and presses again.
      if(powerAudio.paused){
        powerAudio.volume=0;
        try{
          const play=powerAudio.play();
          if(play&&typeof play.then==='function') play.then(()=>fadePowerAudio(.82,180)).catch(()=>{});
          else fadePowerAudio(.82,180);
        }catch{}
      }else fadePowerAudio(.82,180);
    }
    function pausePowerAudio(){
      if(!state.audio||powerAudio.paused)return;
      // Fade the engine away, then pause without changing currentTime so the
      // next acceleration continues naturally from where the sound left off.
      fadePowerAudio(0,240,()=>{try{powerAudio.pause();}catch{}});
    }
    function stopPowerAudio(reset=false){
      cancelPowerAudioFade();
      try{powerAudio.pause();powerAudio.volume=0;if(reset)powerAudio.currentTime=0;}catch{}
    }

    function setHolding(next){
      if(finished)return;
      holding=next;
      button.classList.toggle('pressed',holding);
      if(holding){
        startPowerAudio();
        runState.textContent=speed>190?'MAX ATTACK':'ACCELERATING';
        stateEl.textContent=speed>190?'Hold maximum velocity':'Building racing power…';
      }else{
        pausePowerAudio();
        runState.textContent=speed>1?'COASTING':'READY';
        stateEl.textContent=speed>1?'Hold again to keep accelerating':'Press and hold to accelerate';
      }
    }

    function accelerationRate(v){
      if(v<72)return 62;
      if(v<155)return 47;
      return 32;
    }

    function updateRoad(dt,norm,now){
      // Scroll the road and grass textures together so they share one ground plane
      // and meet the sky on exactly the same horizon line.
      const travel=(dt*.00205)*speed;
      // Keep the perspective planes geometrically fixed. Speed is communicated by
      // texture travel, speed lines and car motion instead of scaling the 3D planes,
      // which prevents iOS Safari from clipping/flickering them at high velocity.
      roadPhase=(roadPhase+travel)%470;
      grassPhase=(grassPhase+travel*.72)%270;
      road.style.setProperty('--road-scroll',`${roadPhase.toFixed(2)}px`);
      road.style.setProperty('--grass-scroll',`${grassPhase.toFixed(2)}px`);
      const jitter=Math.sin(now*.026)*(norm*1.35)+Math.sin(now*.051)*(norm*.45);
      car.style.transform=`translateX(-50%) translateX(${jitter.toFixed(2)}px) translateY(${(norm*-1.8).toFixed(2)}px) scale(${(1+norm*.025).toFixed(3)})`;
      speedLines.forEach((line,i)=>{
        const alpha=Math.max(0,(norm-.55)*1.8)*(.25+((i%4)/5));
        line.style.opacity=String(Math.min(.72,alpha));
        line.style.transform=`translateY(${(((now*.085*Math.max(.2,norm))+i*19)%150).toFixed(1)}px) scaleY(${(1+norm*.9).toFixed(2)})`;
      });
    }

    function renderPower(norm){
      speedEl.textContent=String(Math.round(speed)).padStart(3,'0');
      const output=Math.min(100,Math.round(Math.pow(norm,.82)*100));
      outputEl.textContent=output+'%';
      arcade.style.setProperty('--power-level',norm.toFixed(3));
      road.style.setProperty('--power-level',norm.toFixed(3));
      const active=Math.round(norm*rev.length);
      rev.forEach((seg,i)=>{
        seg.classList.toggle('active',i<active);
        seg.classList.toggle('hot',i<active&&i>=8);
      });
      const nextThreshold=Math.min(4,Math.floor(norm*4));
      if(nextThreshold>thresholdStep){
        thresholdStep=nextThreshold;
        haptic(thresholdStep===4?[22,18,35]:14);
        ping(280+thresholdStep*105,.045,.018);
      }else if(nextThreshold<thresholdStep){thresholdStep=nextThreshold;}
    }

    function finishRun(){
      if(finished)return;
      finished=true;holding=false;speed=topSpeed;sustain=sustainRequired;
      renderPower(1);
      runState.textContent='MAX VELOCITY';
      outputEl.textContent='100%';
      maxFill.style.width='100%';
      maxState.textContent='LOCKED';
      stateEl.textContent='Maximum racing power captured';
      button.textContent='MAX POWER CAPTURED';
      button.disabled=true;
      arcade.classList.add('captured');
      car.classList.add('captured');
      burst.classList.add('active');
      rev.forEach(seg=>seg.classList.add('locked'));
      ping(980,.16,.055);haptic([34,24,65]);
      if(state.audio){
        // Start the 8-bit win sting on the same frame the engine begins fading,
        // giving the two sounds a short intentional overlap at max power.
        try{
          powerWinAudio.currentTime=0;
          const win=powerWinAudio.play();
          if(win&&typeof win.catch==='function')win.catch(()=>{});
        }catch{}
        if(!powerAudio.paused)fadePowerAudio(0,520,()=>{try{powerAudio.pause();}catch{}});
      }
      cancelAnimationFrame(raf);
      setTimeout(()=>showCompletion('Power Captured',''),1100);
    }

    function frame(now){
      const dt=Math.min(40,now-last);last=now;
      if(holding){speed=Math.min(topSpeed,speed+accelerationRate(speed)*(dt/1000));}
      else{speed=Math.max(0,speed-38*(dt/1000));}
      const norm=Math.max(0,Math.min(1,speed/topSpeed));
      if(speed>=topSpeed-.75&&holding){
        sustain=Math.min(sustainRequired,sustain+dt);
        runState.textContent='MAX VELOCITY';
        maxState.textContent='CAPTURING';
        stateEl.textContent='Hold maximum velocity to capture power';
      }else{
        sustain=Math.max(0,sustain-dt*1.7);
        maxState.textContent=sustain>0?'HOLD POWER':'STANDBY';
        if(!holding&&speed<1){runState.textContent='READY';}
      }
      maxFill.style.width=(sustain/sustainRequired*100).toFixed(1)+'%';
      renderPower(norm);updateRoad(dt,norm,now);
      if(sustain>=sustainRequired){finishRun();return;}
      raf=requestAnimationFrame(frame);
    }

    const press=e=>{if(e){e.preventDefault();try{button.setPointerCapture?.(e.pointerId);}catch{}}setHolding(true);};
    const release=e=>{if(e)e.preventDefault();setHolding(false);};
    button.addEventListener('pointerdown',press);
    button.addEventListener('pointerup',release);
    button.addEventListener('pointercancel',release);
    // iOS Safari can treat a sustained press as text selection / callout even on
    // controls. Suppress those browser gestures without changing the game input.
    button.addEventListener('contextmenu',e=>e.preventDefault());
    button.addEventListener('selectstart',e=>e.preventDefault());
    button.addEventListener('dragstart',e=>e.preventDefault());
    button.addEventListener('lostpointercapture',()=>setHolding(false));
    button.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();setHolding(true);}});
    button.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();setHolding(false);}});
    cleanupMission=()=>{
      cancelAnimationFrame(raf);
      stopPowerAudio(false);
      try{powerWinAudio.pause();powerWinAudio.currentTime=0;}catch{}
    };
    raf=requestAnimationFrame(frame);
  }
  function bindSpirit(){
    const rig=document.getElementById('spiritRig');
    const stageNumber=document.getElementById('spiritStageNumber');
    const stageName=document.getElementById('spiritStageName');
    const stageDots=[...document.querySelectorAll('[data-spirit-stage-dot]')];
    const buttons=[...document.querySelectorAll('[data-charge]')];
    const tankMap={
      A:[...document.querySelectorAll('[data-spirit-tank^="left-"]')],
      B:[...document.querySelectorAll('[data-spirit-tank^="right-"]')]
    };
    const meterMap={
      A:document.querySelector('.spirit-meter-left'),
      B:document.querySelector('.spirit-meter-right')
    };
    const bankMap={
      A:document.querySelector('.spirit-bank-left'),
      B:document.querySelector('.spirit-bank-right')
    };
    if(!rig||!stageNumber||!stageName||stageDots.length!==5||buttons.length!==2||tankMap.A.length!==4||tankMap.B.length!==4) return;

    const stages=['IGNITION','CHARGE','PRESSURE','SURGE','STABLE'];
    const tapsPerTank=4;
    const tanksPerBank=4;
    const tapsPerBank=tapsPerTank*tanksPerBank;
    const totalTaps=tapsPerBank*2;
    const sideHits={A:0,B:0};
    let expected='A';
    let hits=0;
    let completed=false;
    let finishTimer=0;
    const reactionTimers=[];
    const payoffAudio=new Audio('./assets/spirit-tank-vent.mp3');
    payoffAudio.preload='auto';
    payoffAudio.volume=.72;

    function playTankPayoff(){
      if(!state.audio) return;
      try{
        payoffAudio.currentTime=0;
        const play=payoffAudio.play();
        if(play&&typeof play.catch==='function') play.catch(()=>{});
      }catch{}
    }

    function stageFromHits(){
      if(hits>=totalTaps) return 4;
      return Math.min(4,Math.floor((hits/totalTaps)*5));
    }

    function updateStage(){
      const stage=stageFromHits();
      const stageStart=(stage/5)*totalTaps;
      const stageEnd=((stage+1)/5)*totalTaps;
      const local=Math.max(0,Math.min(1,(hits-stageStart)/(stageEnd-stageStart)));
      rig.dataset.stage=String(stage);
      stageNumber.textContent=String(stage+1).padStart(2,'0');
      stageName.textContent=stages[stage];
      stageDots.forEach((dot,i)=>{
        const progress=i<stage?1:i===stage?local:0;
        dot.classList.toggle('complete',i<stage||(completed&&i===4));
        dot.classList.toggle('active',!completed&&i===stage);
        dot.style.setProperty('--stage-progress',String(progress));
      });
    }

    function updateBank(side){
      const sideTotal=sideHits[side];
      const bankProgress=Math.max(0,Math.min(1,sideTotal/tapsPerBank));
      const meter=meterMap[side];
      if(meter) meter.style.setProperty('--meter-level',String(bankProgress));
      const tanks=tankMap[side];
      tanks.forEach((tank,displayIndex)=>{
        const fillOrder=(tanks.length-1)-displayIndex;
        const local=Math.max(0,Math.min(1,(sideTotal-(fillOrder*tapsPerTank))/tapsPerTank));
        tank.style.setProperty('--tank-fill',String(local));
        tank.classList.toggle('is-active',local>0&&local<1);
        tank.classList.toggle('is-full',local>=1);
      });
    }

    function pulseCharge(side,button){
      const bank=bankMap[side];
      const meter=meterMap[side];
      const tanks=tankMap[side];
      const active=tanks.find(tank=>tank.classList.contains('is-active')) || [...tanks].reverse().find(tank=>tank.classList.contains('is-full'));
      [bank,meter,button,active].forEach(el=>{
        if(!el) return;
        el.classList.remove('is-pumping');
        void el.offsetWidth;
        el.classList.add('is-pumping');
        const timer=setTimeout(()=>el.classList.remove('is-pumping'),220);
        reactionTimers.push(timer);
      });
    }

    function tankJustFilled(side){
      if(sideHits[side]===0||sideHits[side]%tapsPerTank!==0) return;
      const completedFromBottom=(sideHits[side]/tapsPerTank)-1;
      const displayIndex=(tanksPerBank-1)-completedFromBottom;
      const tank=tankMap[side][displayIndex];
      if(!tank) return;
      tank.classList.remove('is-locking');
      void tank.offsetWidth;
      tank.classList.add('is-locking');
      setTimeout(()=>tank.classList.remove('is-locking'),900);
      playTankPayoff();
      haptic([24,18,42]);
    }

    function updateExpected(){
      buttons.forEach(button=>button.classList.toggle('is-next',!completed&&button.dataset.charge===expected));
    }

    function completeSpirit(){
      completed=true;
      rig.classList.add('is-complete');
      stageNumber.textContent='05';
      stageName.textContent='STABLE';
      stageDots.forEach(dot=>{
        dot.classList.add('complete');dot.classList.remove('active');dot.style.setProperty('--stage-progress','1');
      });
      updateExpected();
      buttons.forEach(button=>{button.disabled=true;button.classList.remove('is-next');});
      haptic([30,28,64]);
      finishTimer=setTimeout(()=>{
        if(state.missionOpen==='spirit') showCompletion('Spirit Core Charged','');
      },950);
    }

    function flashWrong(button){
      button.classList.remove('is-wrong');void button.offsetWidth;button.classList.add('is-wrong');
      setTimeout(()=>button.classList.remove('is-wrong'),280);
      haptic([12,22,12]);
    }

    function onCharge(event){
      if(completed) return;
      const button=event.currentTarget;
      const side=button.dataset.charge;
      if(side!==expected){flashWrong(button);return;}
      hits++;
      sideHits[side]++;
      updateBank(side);
      pulseCharge(side,button);
      tankJustFilled(side);
      expected=expected==='A'?'B':'A';
      updateStage();
      updateExpected();
      haptic(10);
      if(hits>=totalTaps) completeSpirit();
    }

    buttons.forEach(button=>button.addEventListener('click',onCharge));
    updateBank('A');updateBank('B');updateStage();updateExpected();

    cleanupMission=()=>{
      clearTimeout(finishTimer);
      reactionTimers.forEach(clearTimeout);
      buttons.forEach(button=>button.removeEventListener('click',onCharge));
      try{payoffAudio.pause();payoffAudio.currentTime=0;}catch{}
    };
  }
  function bindArtifacts(){
    const field=document.getElementById('artifactField');
    const layer=document.getElementById('artifactLayer');
    const burstLayer=document.getElementById('artifactBurstLayer');
    const beam=document.getElementById('starstreamBeam');
    const progress=document.getElementById('artifactProgress');
    const stateEl=document.getElementById('artifactState');
    const canvas=document.getElementById('starstreamCanvas');
    const panel=field?.closest('.artifact-panel');
    const steps=[...document.querySelectorAll('[data-artifact-step]')];
    if(!field||!layer||!burstLayer||!beam||!progress||!stateEl||!canvas) return;

    let cleared=0;
    let active=null;
    let timers=[];
    let finished=false;
    let raf=0;
    let resizeObserver=null;

    function clearTimers(){timers.forEach(clearTimeout);timers=[];}
    function later(fn,delay){const t=setTimeout(()=>{timers=timers.filter(id=>id!==t);fn();},delay);timers.push(t);return t;}
    function randomPos(){return {x:14+Math.random()*72,y:14+Math.random()*70};}
    function intensity(){return cleared<4?1:cleared<8?2:3;}

    function setIntensity(){
      const level=intensity();
      field.dataset.intensity=String(level);
      panel?.classList.toggle('is-live',cleared>0);
      panel?.classList.toggle('is-intense',cleared>=8);
    }

    function startStarstream(){
      const ctx=canvas.getContext('2d',{alpha:true});
      if(!ctx) return;
      const stars=[];
      const STAR_COUNT=150;
      let width=0,height=0,dpr=1,last=performance.now();

      function seed(star,far=false){
        let x=0,y=0;
        do{x=(Math.random()*2-1)*1.22;y=(Math.random()*2-1)*.92;}while(Math.abs(x)<.035&&Math.abs(y)<.035);
        star.x=x;
        star.y=y;
        star.z=far?.96+Math.random()*.24:.08+Math.random()*1.08;
        star.blue=Math.random();
        star.weight=.55+Math.random()*1.35;
      }
      for(let i=0;i<STAR_COUNT;i++){const s={};seed(s,false);stars.push(s);}

      function resize(){
        const rect=field.getBoundingClientRect();
        dpr=Math.min(2,window.devicePixelRatio||1);
        width=Math.max(1,Math.round(rect.width));
        height=Math.max(1,Math.round(rect.height));
        canvas.width=Math.round(width*dpr);
        canvas.height=Math.round(height*dpr);
        canvas.style.width=width+'px';
        canvas.style.height=height+'px';
        ctx.setTransform(dpr,0,0,dpr,0,0);
      }
      resize();
      if(window.ResizeObserver){resizeObserver=new ResizeObserver(resize);resizeObserver.observe(field);}else window.addEventListener('resize',resize);

      function frame(now){
        if(finished&&field.classList.contains('stabilised')===false) return;
        const dt=Math.min(.038,Math.max(.001,(now-last)/1000));
        last=now;
        ctx.clearRect(0,0,width,height);

        const level=Number(field.dataset.intensity)||1;
        const stable=field.classList.contains('stabilised');
        const speed=stable?.10:(level===1?.30:level===2?.43:.58);
        const focal=Math.min(width,height)*.58;
        const cx=width*.49,cy=height*.50;

        for(const s of stars){
          const previousZ=s.z;
          s.z-=speed*dt;
          if(s.z<.055){seed(s,true);continue;}

          const sx=cx+(s.x/s.z)*focal;
          const sy=cy+(s.y/s.z)*focal;
          const prevZ=previousZ+speed*dt*(level===3?3.1:2.45);
          const px=cx+(s.x/prevZ)*focal;
          const py=cy+(s.y/prevZ)*focal;
          if(sx<-80||sx>width+80||sy<-80||sy>height+80){seed(s,true);continue;}

          const proximity=Math.max(0,Math.min(1,1-s.z));
          const alpha=Math.min(.95,.16+proximity*.92);
          const blue=190+Math.round(s.blue*55);
          ctx.beginPath();
          ctx.moveTo(px,py);
          ctx.lineTo(sx,sy);
          ctx.lineWidth=Math.max(.55,s.weight*(.55+proximity*1.25));
          ctx.lineCap='round';
          ctx.strokeStyle=`rgba(${s.blue>.76?190:105},${blue},255,${alpha})`;
          ctx.stroke();

          if(proximity>.66){
            ctx.beginPath();
            ctx.arc(sx,sy,Math.max(.45,s.weight*.62),0,Math.PI*2);
            ctx.fillStyle=`rgba(224,249,255,${Math.min(.9,alpha)})`;
            ctx.fill();
          }
        }
        raf=requestAnimationFrame(frame);
      }
      raf=requestAnimationFrame(frame);
    }

    function distortField(){
      field.classList.remove('is-distorted');
      void field.offsetWidth;
      field.classList.add('is-distorted');
      later(()=>field.classList.remove('is-distorted'),220);
    }

    function createSignature(){
      if(finished||active) return;
      const pos=randomPos();
      const el=document.createElement('button');
      el.type='button';
      el.className='starstream-signature is-entering';
      el.style.left=pos.x+'%';
      el.style.top=pos.y+'%';
      el.setAttribute('aria-label','Clear unstable energy signature');
      el.innerHTML=`<span class="signature-orbit orbit-a" aria-hidden="true"></span><span class="signature-orbit orbit-b" aria-hidden="true"></span><span class="signature-core" aria-hidden="true"><img src="./assets/mission-briefing-icon.svg" alt=""></span><i class="signature-scan" aria-hidden="true"></i>`;
      layer.appendChild(el);
      active={el};
      later(()=>el.classList.remove('is-entering'),240);

      const pop=ev=>{
        ev.preventDefault();
        ev.stopPropagation();
        if(finished||!active||active.el!==el) return;
        popSignature();
      };
      if(window.PointerEvent) el.addEventListener('pointerdown',pop,{passive:false});
      el.addEventListener('click',pop,{passive:false});

      const shiftDelay=cleared<4?2250+Math.random()*650:cleared<8?1750+Math.random()*500:1250+Math.random()*380;
      later(()=>{
        if(finished||!active||active.el!==el) return;
        const p=randomPos();
        el.classList.add('phase');
        distortField();
        stateEl.textContent='Signature shifted · reacquire';
        later(()=>{
          if(!active||active.el!==el) return;
          el.style.left=p.x+'%';el.style.top=p.y+'%';
          el.classList.remove('phase');
        },120);
      },shiftDelay);
    }

    function spawnBurst(x,y){
      const ripple=document.createElement('span');
      ripple.className='artifact-ripple';
      ripple.style.left=x+'px';ripple.style.top=y+'px';
      burstLayer.appendChild(ripple);
      later(()=>ripple.remove(),600);

      const count=cleared>=8?14:10;
      for(let i=0;i<count;i++){
        const p=document.createElement('i');
        p.className='artifact-particle';
        p.style.left=x+'px';p.style.top=y+'px';
        p.style.setProperty('--dx',`${(Math.random()-.5)*150}px`);
        p.style.setProperty('--dy',`${(Math.random()-.5)*150}px`);
        p.style.setProperty('--rot',`${Math.round((Math.random()-.5)*260)}deg`);
        burstLayer.appendChild(p);
        later(()=>p.remove(),600);
      }

      field.classList.remove('is-hit');
      void field.offsetWidth;
      field.classList.add('is-hit');
      later(()=>field.classList.remove('is-hit'),220);
    }

    function popSignature(){
      if(finished||!active) return;
      const item=active;
      const fr=field.getBoundingClientRect(),r=item.el.getBoundingClientRect();
      spawnBurst(r.left-fr.left+r.width/2,r.top-fr.top+r.height/2);
      item.el.classList.add('popped');
      active=null;
      later(()=>item.el.remove(),230);

      cleared++;
      setIntensity();
      progress.textContent=`${cleared} / 12`;
      steps[cleared-1]?.classList.add('on');
      ping(630+cleared*20,.045,.018);haptic(18);
      stateEl.textContent=cleared===12?'Starstream stabilised':cleared>=8?'Interference critical · keep clearing':`Signature cleared · ${12-cleared} remaining`;
      if(cleared>=12){finish();return;}
      later(createSignature,cleared>=8?90:cleared>=4?125:170);
    }

    function finish(){
      finished=true;
      clearTimers();
      if(active){active.el.classList.add('absorbed');setTimeout(()=>active?.el?.remove(),220);active=null;}
      panel?.classList.add('is-complete');
      field.classList.remove('is-distorted','is-hit');
      field.classList.add('stabilised');
      beam.classList.add('active');
      progress.textContent='12 / 12';
      ping(920,.12,.045);haptic([28,24,58]);
      setTimeout(()=>showCompletion('Starstream Stabilised',''),900);
    }

    setIntensity();
    startStarstream();
    createSignature();

    cleanupMission=()=>{
      finished=true;
      clearTimers();
      if(raf)cancelAnimationFrame(raf);
      resizeObserver?.disconnect?.();
      active?.el?.remove();
      active=null;
    };
  }
  function bindComet(){
    const dirClass={L:'left',D:'down',U:'up',R:'right'};
    const keys=['L','D','U','R'];
    const game=document.getElementById('cometGame');
    const notesLayer=document.getElementById('cometNotes');
    const progress=document.getElementById('cometProgress');
    const stateEl=document.getElementById('cometState');
    const flash=document.getElementById('cometHitFlash');
    const steps=[...document.querySelectorAll('[data-comet-step]')];
    let correct=0;
    let finished=false;
    let raf=0;
    let spawnTimer=0;
    let burstTimer=0;
    let burstPending=0;
    let last=performance.now();
    let notes=[];

    function pace(){
      if(correct<3) return {speed:.00043,delay:430,count:1,stagger:0};
      if(correct<7) return {speed:.00053,delay:340,count:Math.random()<0.42?2:1,stagger:285};
      return {speed:.00064,delay:265,count:Math.random()<0.78?2:1,stagger:245};
    }
    function laneCenter(key){
      const lane=document.querySelector(`[data-comet-lane="${key}"]`);
      if(!lane) return 0;
      const wrap=game.getBoundingClientRect();
      const r=lane.getBoundingClientRect();
      return (r.left-wrap.left)+(r.width/2);
    }
    function createNote(key){
      const el=document.createElement('div');
      el.className=`comet-note active ${dirClass[key]}`;
      el.style.left=laneCenter(key)+'px';
      el.innerHTML='<span class="comet-chevron"><i></i><i></i></span><span class="comet-tail"></span>';
      notesLayer.appendChild(el);
      notes.push({key,y:.02,el,hit:false});
      burstPending=Math.max(0,burstPending-1);
    }
    function uniqueKeys(count){
      const pool=[...keys];
      const out=[];
      while(out.length<count&&pool.length){
        out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
      }
      return out;
    }
    function spawn(){
      if(finished) return;
      const cfg=pace();
      const chosen=uniqueKeys(cfg.count);
      burstPending=chosen.length;
      createNote(chosen[0]);
      if(chosen.length>1){
        clearTimeout(burstTimer);
        burstTimer=setTimeout(()=>{
          if(!finished) createNote(chosen[1]);
        },cfg.stagger);
      }
      stateEl.textContent=correct<3?'Acquire the guidance signal':correct<7?'Chevron pattern accelerating':'Final guidance lock';
      last=performance.now();
      if(!raf) raf=requestAnimationFrame(frame);
    }
    function scheduleNext(delay=pace().delay){
      clearTimeout(spawnTimer);
      if(finished||notes.length||burstPending) return;
      spawnTimer=setTimeout(spawn,delay);
    }
    function removeNote(note,status='miss'){
      note.hit=status==='hit';
      note.el.classList.remove('active');
      note.el.classList.add(status);
      setTimeout(()=>note.el.remove(),180);
      notes=notes.filter(n=>n!==note);
    }
    function missNote(note,message='Signal missed · keep going'){
      if(finished) return;
      const lane=document.querySelector(`[data-comet-lane="${note.key}"]`);
      lane?.classList.add('miss');
      setTimeout(()=>lane?.classList.remove('miss'),240);
      removeNote(note,'miss');
      stateEl.textContent=message;
      haptic([12,18,12]);
      if(notes.length===0&&burstPending===0) scheduleNext(320);
    }
    function hitNote(note){
      if(finished) return;
      const lane=document.querySelector(`[data-comet-lane="${note.key}"]`);
      lane?.classList.add('hit');
      setTimeout(()=>lane?.classList.remove('hit'),240);
      removeNote(note,'hit');
      flash.classList.remove('active'); void flash.offsetWidth; flash.classList.add('active');
      setTimeout(()=>flash.classList.remove('active'),280);
      correct++;
      progress.textContent=`${correct} / 10`;
      steps[correct-1]?.classList.add('on');
      ping(650+correct*32,.055,.018); haptic(22);
      stateEl.textContent=correct===10?'Guidance path locked':`Signal captured · ${10-correct} remaining`;
      if(correct>=10){
        finished=true;
        cancelAnimationFrame(raf); raf=0; clearTimeout(spawnTimer); clearTimeout(burstTimer);
        notes.forEach(n=>n.el.remove()); notes=[]; burstPending=0;
        game.classList.add('complete');
        document.querySelectorAll('.comet-btn').forEach(b=>b.disabled=true);
        ping(980,.14,.05); haptic([30,22,60]);
        setTimeout(()=>showCompletion('Guidance Path Restored',''),650);
        return;
      }
      if(notes.length===0&&burstPending===0) scheduleNext();
    }
    function frame(now){
      if(finished){ raf=0; return; }
      const dt=Math.min(40,now-last); last=now;
      const speed=pace().speed;
      notes.slice().forEach(note=>{
        note.y+=speed*dt;
        note.el.style.top=(note.y*100)+'%';
        if(note.y>.94) missNote(note);
      });
      raf=requestAnimationFrame(frame);
    }
    document.querySelectorAll('.comet-btn[data-arrow]').forEach(btn=>btn.onclick=()=>{
      if(finished||!notes.length) return;
      const key=btn.dataset.arrow;
      const laneNotes=notes.filter(n=>n.key===key);
      const candidate=laneNotes.sort((a,b)=>Math.abs(a.y-.80)-Math.abs(b.y-.80))[0];
      const inWindow=candidate&&candidate.y>=.70&&candidate.y<=.90;
      if(!inWindow){
        stateEl.textContent='Wait for the signal to reach the capture line';
        haptic(8);
        return;
      }
      hitNote(candidate);
    });
    cleanupMission=()=>{
      cancelAnimationFrame(raf);
      clearTimeout(spawnTimer);
      clearTimeout(burstTimer);
      notes.forEach(n=>n.el.remove());
      notes=[];
      burstPending=0;
    };
    scheduleNext(500);
  }

  function bindJingle(){
    let level=1;
    let x=0;
    let dir=1;
    let last=performance.now();
    let raf=0;
    const st=document.getElementById('jingleState');
    const btn=document.getElementById('syncPulse');
    const speeds=[0,0.035,0.08,0.11];
    const labels=['','calibration speed','sync speed','precision speed'];

    function dotFor(n){return document.querySelector(`[data-pulse-dot="${n}"]`);}
    function stageFor(n){return document.querySelector(`[data-jingle-stage="${n}"]`);}
    function statusFor(n){return document.querySelector(`[data-jingle-status="${n}"]`);}

    function tick(now){
      const dt=Math.min(32,now-last); last=now;
      x+=dir*speeds[level]*dt;
      if(x>100){x=100;dir=-1}else if(x<0){x=0;dir=1}
      const dot=dotFor(level);
      if(dot) dot.style.left=x+'%';
      raf=requestAnimationFrame(tick);
    }
    raf=requestAnimationFrame(tick);
    cleanupMission=()=>cancelAnimationFrame(raf);

    btn.onclick=()=>{
      if(x>=42&&x<=58){
        ping(820+level*100,.09,.04); haptic(25);
        const stage=stageFor(level);
        const dot=dotFor(level);
        const status=statusFor(level);
        stage?.classList.remove('active','standby');
        stage?.classList.add('locked');
        if(dot){ dot.classList.remove('active'); dot.classList.add('locked'); dot.style.left=x+'%'; }
        if(status) status.textContent='Locked';

        if(level===3){
          cancelAnimationFrame(raf);
          btn.disabled=true;
          st.textContent='All propulsion pulses locked';
          setTimeout(()=>showCompletion('Propulsion Synchronised','All three moving propulsion pulses have been locked into the target flight zone.'),420);
          return;
        }

        level++;
        x=0;
        dir=1;
        const nextStage=stageFor(level);
        const nextDot=dotFor(level);
        const nextStatus=statusFor(level);
        nextStage?.classList.remove('standby');
        nextStage?.classList.add('active');
        nextDot?.classList.add('active');
        if(nextDot) nextDot.style.left='0%';
        if(nextStatus) nextStatus.textContent='Armed';
        st.textContent=`Pulse ${level} · ${labels[level]}`;
      }else{
        st.textContent='Sync missed · retry';
        haptic([15,25,15]);
      }
    };
  }

  function bindLando(){
    let round=1,armed=false,goTime=0,timers=[],running=false;
    const btn=document.getElementById('reactionBtn');
    const read=document.getElementById('reactionRead');
    const unit=document.getElementById('reactionUnit');
    const st=document.getElementById('landoState');
    const roundEl=document.getElementById('landoRound');
    const lamps=[...document.querySelectorAll('.lando-lamp')];
    const results=[...document.querySelectorAll('[data-lando-result]')];
    const clear=()=>{timers.forEach(clearTimeout);timers=[]};
    cleanupMission=clear;

    function activeRows(){return Math.min(round,4);}
    function setResultState(n,status,text){
      const el=results[n-1]; if(!el)return;
      el.className=`lando-result ${status}`;
      el.querySelector('span').textContent=text;
    }
    function resetLights(){lamps.forEach(l=>l.className='lando-lamp');}
    function lampsForColumn(col){
      const rows=activeRows();
      return lamps.filter(l=>Number(l.dataset.col)===col && Number(l.dataset.row)>=4-rows);
    }
    function start(){
      clear(); resetLights(); armed=false; running=true; goTime=0;
      read.textContent='READY'; unit.textContent='';
      roundEl.textContent=`ROUND ${round} / 4`;
      st.textContent='Lights building…';
      btn.textContent='WAIT FOR LIGHTS'; btn.disabled=false;
      setResultState(round,'active','ACTIVE');
      for(let col=0;col<5;col++){
        timers.push(setTimeout(()=>{
          lampsForColumn(col).forEach(l=>l.classList.add('red'));
          ping(250+col*28,.035,.01); haptic(8);
        },380+col*250));
      }
      const builtAt=380+4*250;
      const wait=builtAt+650+Math.random()*1050;
      timers.push(setTimeout(()=>{
        lamps.forEach(l=>l.classList.remove('red'));
        armed=true; running=true; goTime=performance.now();
        btn.textContent='REACT'; st.textContent='LIGHTS OUT';
        ping(920,.045,.028); haptic(18);
      },wait));
    }
    function capture(){
      const ms=Math.round(performance.now()-goTime);
      armed=false; running=false;
      lampsForColumn(0); // ensure round state is resolved before success flash
      for(let col=0;col<5;col++) lampsForColumn(col).forEach(l=>l.classList.add('green'));
      read.textContent=ms; unit.textContent='ms';
      st.textContent=ms<300?'Elite response captured':ms<500?'Strong response captured':'Response captured';
      setResultState(round,'complete',`${ms} ms`);
      haptic([20,20,45]); ping(760,.075,.03);
      if(round===4){
        btn.textContent='COMPLETE'; btn.disabled=true;
        timers.push(setTimeout(()=>showCompletion('Flight Control Calibrated',''),850));
      }else{
        const completedRound=round;
        round++;
        setResultState(round,'active','READY');
        btn.textContent='NEXT TEST';
        timers.push(setTimeout(()=>{
          lampsForColumn(0); // no-op for stable timing
        },200));
      }
    }
    btn.onclick=()=>{
      if(btn.textContent==='Start Test'||btn.textContent==='NEXT TEST'){start();return;}
      if(armed){capture();return;}
      if(running){
        clear(); running=false; armed=false; resetLights();
        read.textContent='JUMP START'; unit.textContent='';
        st.textContent='Too early · retry this round';
        btn.textContent='Start Test';
        setResultState(round,'active','RETRY');
        haptic([20,30,20]);
      }
    };
  }

  function bindAurora(){
    const dial=document.getElementById('auroraDial');
    const stateEl=document.getElementById('auroraState');
    const ringEls={
      outer:document.querySelector('[data-aurora-ring="outer"]'),
      middle:document.querySelector('[data-aurora-ring="middle"]'),
      inner:document.querySelector('[data-aurora-ring="inner"]')
    };
    const statusEls={
      outer:document.querySelector('[data-aurora-status="outer"]'),
      middle:document.querySelector('[data-aurora-status="middle"]'),
      inner:document.querySelector('[data-aurora-status="inner"]')
    };
    const order=['outer','middle','inner'];
    const labels={outer:'Outer',middle:'Middle',inner:'Inner'};
    const rotations={outer:112,middle:-96,inner:148};
    const locked={outer:false,middle:false,inner:false};
    const ringCenters={outer:.785,middle:.485,inner:.275};
    let selected='outer';
    let active=null;
    let pointerId=null;
    let lastPointerAngle=0;
    let finished=false;

    const normalise=a=>((a%360)+360)%360;
    const signed=a=>{const n=normalise(a);return n>180?n-360:n;};
    const angleForEvent=e=>{
      const r=dial.getBoundingClientRect();
      const cx=r.left+r.width/2,cy=r.top+r.height/2;
      return Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI;
    };
    function renderRing(key){
      ringEls[key].style.setProperty('--aurora-rotation',`${rotations[key]}deg`);
    }
    function radiusForEvent(e){
      const r=dial.getBoundingClientRect();
      const cx=r.left+r.width/2,cy=r.top+r.height/2;
      return Math.hypot(e.clientX-cx,e.clientY-cy)/(Math.min(r.width,r.height)/2);
    }
    function ringFromPoint(e){
      const radius=radiusForEvent(e);
      if(radius<.29||radius>1.02)return null;
      const candidates=order.filter(k=>!locked[k]);
      if(!candidates.length)return null;
      return candidates.reduce((best,key)=>Math.abs(radius-ringCenters[key])<Math.abs(radius-ringCenters[best])?key:best,candidates[0]);
    }
    function nextUnlocked(){return order.find(k=>!locked[k]);}
    function setSelected(key){
      if(!key||locked[key])return;
      selected=key;
      order.forEach(k=>{
        ringEls[k].classList.toggle('selected',k===key&&!locked[k]);
        statusEls[k].classList.toggle('selected',k===key&&!locked[k]);
        const small=statusEls[k].querySelector('small');
        if(!locked[k]) small.textContent=k===key?'Selected · align':'Align to lock';
      });
      stateEl.textContent=`${labels[key]} ring awaiting alignment.`;
    }
    function lockRing(key){
      if(locked[key])return;
      rotations[key]=0;renderRing(key);locked[key]=true;
      ringEls[key].classList.remove('selected','dragging','near-lock');
      ringEls[key].classList.add('locked');
      statusEls[key].classList.remove('selected');
      statusEls[key].classList.add('locked');
      statusEls[key].querySelector('small').textContent='Locked ✓';
      ping(720+order.indexOf(key)*95,.08,.025);haptic([18,18,42]);
      const next=nextUnlocked();
      if(next)setSelected(next);
      if(order.every(k=>locked[k])){
        finished=true;dial.classList.add('complete');
        stateEl.textContent='North Pole navigation locked.';
        ping(1040,.14,.045);haptic([30,22,70]);
        setTimeout(()=>showCompletion('North Pole Signal Locked',''),850);
      }
    }
    function endDrag(e){
      if(pointerId===null)return;
      try{dial.releasePointerCapture(pointerId);}catch{}
      if(active){
        ringEls[active].classList.remove('dragging');
        if(Math.abs(signed(rotations[active]))<=14)lockRing(active);
        else setSelected(active);
      }
      active=null;pointerId=null;
    }
    dial.addEventListener('pointerdown',e=>{
      if(finished)return;
      const direct=ringFromPoint(e);
      const key=direct||selected||nextUnlocked();
      if(!key||locked[key])return;
      e.preventDefault();
      setSelected(key);
      active=key;pointerId=e.pointerId;lastPointerAngle=angleForEvent(e);
      dial.setPointerCapture(e.pointerId);
      ringEls[key].classList.add('dragging');
      stateEl.textContent=`${labels[key]} ring aligning.`;
    });
    dial.addEventListener('pointermove',e=>{
      if(!active||e.pointerId!==pointerId)return;
      e.preventDefault();
      const nextAngle=angleForEvent(e);
      const delta=signed(nextAngle-lastPointerAngle);
      lastPointerAngle=nextAngle;
      rotations[active]+=delta;
      renderRing(active);
      const offset=Math.abs(signed(rotations[active]));
      ringEls[active].classList.toggle('near-lock',offset<=18);
      if(offset<=4){
        lockRing(active);
        try{dial.releasePointerCapture(pointerId);}catch{}
        active=null;pointerId=null;
      }
    });
    dial.addEventListener('pointerup',endDrag);
    dial.addEventListener('pointercancel',endDrag);
    document.querySelectorAll('[data-aurora-select]').forEach(btn=>{
      btn.addEventListener('click',()=>setSelected(btn.dataset.auroraSelect));
      btn.addEventListener('keydown',e=>{
        const key=btn.dataset.auroraSelect;
        if(locked[key])return;
        if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
          e.preventDefault();setSelected(key);
          rotations[key]+=e.key==='ArrowLeft'?-8:8;renderRing(key);
          if(Math.abs(signed(rotations[key]))<=14)lockRing(key);
        }
      });
    });
    Object.keys(ringEls).forEach(renderRing);
    setSelected('outer');
    cleanupMission=()=>{};
  }

  function bindLapland(){
    const btn=document.getElementById('initiateTest');
    // Final verification mirrors the MC-00 system bank. The first seven rows
    // validate restored route systems; LAUNCH remains BLOCKED until those
    // checks have all passed, then changes directly to CLEAR.
    const checks=['power','luffield','spirit','comet','jingle','lando','aurora'];
    const systemKeys=['power','comms','core','control','propulsion','response','navigation'];
    btn.onclick=()=>{
      if(btn.dataset.review==='true'){ set({missionOpen:null,nav:'missions'}); return; }
      btn.disabled=true;
      const missing=[];

      checks.forEach((checkpointId,i)=>setTimeout(()=>{
        const key=systemKeys[i];
        const row=document.querySelector(`[data-verify-system="${key}"]`);
        const status=document.querySelector(`[data-verify-status="${key}"]`);
        if(!row||!status) return;
        row.classList.remove('is-standby','is-online','is-offline','is-checking');
        row.classList.add('is-checking');
        status.textContent='Checking';
        ping(430+i*45,.04,.014);

        setTimeout(()=>{
          const ready=state.completed.includes(checkpointId);
          row.classList.remove('is-checking');
          row.classList.add(ready?'is-online':'is-offline');
          status.textContent=ready?'Online':'Offline';
          if(!ready) missing.push(checkpointId);
          ping(ready?540+i*50:220,.055,.018);

          if(i===checks.length-1){
            setTimeout(()=>{
              const launchRow=document.querySelector('[data-verify-system="launch"]');
              const launchStatus=document.querySelector('[data-verify-status="launch"]');
              const clear=!missing.length;
              if(launchRow&&launchStatus){
                launchRow.classList.remove('is-blocked','is-clear');
                launchRow.classList.add(clear?'is-clear':'is-blocked');
                launchStatus.textContent=clear?'Clear':'Blocked';
              }
              if(clear){
                showCompletion('All Systems Green','Every restored system has passed verification. Santa-1 is ready for the final flight authorisation.');
              } else {
                btn.disabled=false; btn.dataset.review='true'; btn.textContent='View Missions';
                const note=document.createElement('div'); note.className='final-check-note';
                note.innerHTML=`<div class="kicker">Systems Require Attention</div><p>${missing.length} ${missing.length===1?'system':'systems'} must be restored before Santa-1 can be cleared for launch.</p>`;
                btn.closest('.mission-instrument').appendChild(note); haptic([20,35,20]);
              }
            },650);
          }
        },260);
      },350+i*520));
    };
  }

  if(IS_ADMIN){renderAdmin();}
  else {
    if(state.onboarded) ensureOpeningMessage();
    render();
    if(state.onboarded&&state.mode==='live') startGpsWatch();
    if(state.onboarded&&state.mode==='demo'&&state.nav==='radar'&&!state.missionOpen){setTimeout(maybeStartDemoTarget,350);rearmDemoRoute(850);}
  }
})();

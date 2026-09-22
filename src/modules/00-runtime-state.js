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
    {id:'jingle', mc:'MC-08', location:'Hangar Straight', name:'Jingle Beams', type:'jingle', playable:true, core:true, mission:'Jingle Beams', lat:52.067475902465475, lng:-1.0132842109045421, detectionRadius:150, activationRadius:35},
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
    lapland:{sender:'MISSION CONTROL',title:'ALL SYSTEMS GO',body:'Santa-1 has passed full-power verification and is cleared for launch.'},
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
    gpsEnabled:true,
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
        gpsCondition:liveMode?(parsed.gpsEnabled===false?'OFF':'WAITING'):(parsed.gpsCondition||defaults.gpsCondition),
        gpsEnabled:parsed.gpsEnabled!==undefined?Boolean(parsed.gpsEnabled):liveMode
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

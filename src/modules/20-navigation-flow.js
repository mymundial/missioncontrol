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
    document.querySelectorAll('[data-exit-mission]').forEach(b=>b.addEventListener('click',()=>{if(state.missionOpen==='entry') stopMc01Activation();if(state.missionOpen==='lapland') stopLaplandAudio();const nav=state.missionReturnNav||'radar';set({missionOpen:null,nav});if(nav==='radar'&&lastGps)processGps(lastGps,true);}));
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
    if(id==='lapland') stopLaplandAudio();
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

  let northernTimers=[];
  let northernHoldRaf=0;
  let northernFlybyAudio=null;
  let northernTakeoverEl=null;

  function northernLater(fn,delay){
    const timer=setTimeout(()=>{
      northernTimers=northernTimers.filter(id=>id!==timer);
      fn();
    },delay);
    northernTimers.push(timer);
    return timer;
  }

  function getNorthernFlybyAudio(){
    if(!northernFlybyAudio){
      northernFlybyAudio=new Audio('./assets/santa-sleigh-flyby.mp3');
      northernFlybyAudio.preload='auto';
      northernFlybyAudio.volume=.95;
    }
    return northernFlybyAudio;
  }

  // Final Santa transmission audio and the isolated second Christmas Magic hit
  // are intentionally left unwired until their approved production files arrive.

  function stopNorthernSequence(){
    northernTimers.forEach(clearTimeout); northernTimers=[];
    if(northernHoldRaf){cancelAnimationFrame(northernHoldRaf);northernHoldRaf=0;}
    [northernFlybyAudio].forEach(audio=>{
      if(!audio)return;
      audio.onended=null;audio.onerror=null;
      try{audio.pause();audio.currentTime=0;}catch{}
    });
    if(northernTakeoverEl){northernTakeoverEl.remove();northernTakeoverEl=null;}
    stopStatic();
  }

  function primeNorthernFinalAudio(){ /* Awaiting approved Santa-1 final transmission asset. */ }

  function showNorthernTransmission(){
    const mc=document.getElementById('missionContent'); if(!mc)return;
    mc.innerHTML=`<div class="mission-instrument panel incoming-transmission northern-incoming">
      <div class="transmission-icon"><span></span><i></i><i></i><i></i></div>
      <div class="kicker">Final Transmission</div>
      <h2>SANTA-1</h2>
      <div class="transmission-wave">${'<b></b>'.repeat(24)}</div>
      <div class="signal-state lock">Signal locked</div>
    </div>`;

    let finished=false;
    let minDwellTimer=null;
    let fallbackTimer=null;
    const opened=performance.now();
    if(state.audio)startStatic(.04);
    northernLater(()=>stopStatic(),420);

    const finish=()=>{
      if(finished)return;finished=true;
      clearTimeout(minDwellTimer);clearTimeout(fallbackTimer);stopStatic();
      const elapsed=performance.now()-opened;
      const wait=Math.max(0,6200-elapsed);
      northernLater(showNorthernDeparture,wait+180);
    };

    // Audio intentionally pending: preserve the final-transmission beat visually
    // without substituting the older Santa recording. The approved file will be
    // bound here in the dedicated audio pass.
    minDwellTimer=setTimeout(finish,6200);
    northernTimers.push(minDwellTimer);
  }

  function showNorthernDeparture(){
    const mc=document.getElementById('missionContent'); if(!mc)return;
    mc.innerHTML=`<div class="mission-instrument panel northern-departure-panel" id="northernDeparturePanel">
      <div class="northern-departure-sky" aria-hidden="true">
        <i class="northern-departure-axis"></i>
        <i class="northern-departure-trail trail-a"></i><i class="northern-departure-trail trail-b"></i><i class="northern-departure-trail trail-c"></i>
        <span class="northern-departure-sleigh"><b></b></span>
      </div>
      <div class="kicker">Northern Flight</div>
      <h2>Departure Confirmed</h2>
      <p>Santa-1 is leaving Silverstone.</p>
    </div>`;

    const panel=document.getElementById('northernDeparturePanel');
    const flyby=getNorthernFlybyAudio();
    let finished=false;
    const finish=()=>{if(finished)return;finished=true;northernLater(showNorthernAirborneTakeover,520);};
    northernLater(()=>{panel?.classList.add('flyby');haptic([22,30,70]);ping(720,.12,.035);},3150);

    if(!state.audio){northernLater(finish,9700);return;}
    try{
      flyby.currentTime=0;flyby.volume=.95;
      flyby.onended=finish;
      flyby.onerror=()=>northernLater(finish,9700);
      const play=flyby.play();
      if(play&&typeof play.catch==='function')play.catch(()=>northernLater(finish,9700));
      northernLater(finish,11200);
    }catch{northernLater(finish,9700);}
  }

  function playNorthernAirborneMagic(){ /* Awaiting isolated Christmas Magic second-hit asset. */ }

  function showNorthernAirborneTakeover(){
    if(northernTakeoverEl)return;
    playNorthernAirborneMagic();
    ping(980,.18,.05);haptic([35,30,85,35,110]);
    const el=document.createElement('div');
    el.className='northern-airborne-takeover';
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    el.innerHTML=`<div class="northern-airborne-field" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div class="northern-airborne-copy">
        <div class="kicker">Mission Complete</div>
        <span>SANTA-1</span>
        <h1>AIRBORNE</h1>
        <div class="northern-airborne-status">
          <div><small>Systems</small><strong>100%</strong></div>
          <div><small>Northern Flight</small><strong>Active</strong></div>
        </div>
      </div>`;
    document.body.appendChild(el);northernTakeoverEl=el;
    northernLater(()=>el.classList.add('is-settled'),250);
    northernLater(()=>{
      el.classList.add('is-exiting');
      showCompletion('Santa-1 Airborne','Northern Flight is underway. The recovery mission is complete.');
    },3900);
    northernLater(()=>{
      if(el.isConnected)el.remove();
      if(northernTakeoverEl===el)northernTakeoverEl=null;
    },4380);
  }

  function bindNorthern(){
    const panel=document.getElementById('northernPanel');
    const button=document.getElementById('authoriseFlight');
    const label=button?.querySelector('.northern-authorise-label');
    const hint=document.getElementById('northernHint');
    const stateEl=document.getElementById('northernState');
    const checks=[...document.querySelectorAll('[data-flight-check]')];
    if(!panel||!button||!label||!hint||!stateEl||checks.length!==3)return;

    stopNorthernSequence();
    cleanupMission=stopNorthernSequence;
    const flyby=getNorthernFlybyAudio();
    try{flyby.load();}catch{}

    const checkValues=['Locked','Clear','Open'];
    checks.forEach((check,i)=>{
      check.classList.remove('ready');
      const value=check.querySelector('strong'); if(value)value.textContent='Checking';
      northernLater(()=>{
        check.classList.add('ready');
        if(value)value.textContent=checkValues[i];
        ping(560+(i*70),.045,.018);haptic(12);
      },420+(i*580));
    });
    northernLater(()=>{
      button.disabled=false;
      panel.classList.add('is-ready');
      stateEl.textContent='Ready';
      hint.textContent='Hold the control to give final flight authorisation.';
    },1850);

    let holding=false;
    let authorised=false;
    let started=0;
    const HOLD_MS=2800;

    const setProgress=value=>{
      const p=Math.max(0,Math.min(1,value));
      panel.style.setProperty('--northern-hold',String(p));
      panel.style.setProperty('--northern-hold-angle',`${Math.round(p*360)}deg`);
      button.setAttribute('aria-valuenow',String(Math.round(p*100)));
      if(holding&&!authorised){
        stateEl.textContent=p<.34?'Standby':p<.72?'Clearance':'Authorising';
        hint.textContent=`Flight authorisation ${Math.round(p*100)}%`;
      }
    };

    const resetHold=()=>{
      if(!holding||authorised)return;
      holding=false;
      if(northernHoldRaf){cancelAnimationFrame(northernHoldRaf);northernHoldRaf=0;}
      button.classList.remove('is-holding');
      setProgress(0);
      stateEl.textContent='Ready';
      hint.textContent='Hold the control to give final flight authorisation.';
    };

    const authorise=()=>{
      if(authorised)return;
      authorised=true;holding=false;
      if(northernHoldRaf){cancelAnimationFrame(northernHoldRaf);northernHoldRaf=0;}
      setProgress(1);
      button.classList.remove('is-holding');button.classList.add('success','is-authorised');button.disabled=true;
      label.textContent='Flight Authorised';
      panel.classList.add('is-authorised');
      stateEl.textContent='Authorised';
      hint.textContent='Santa-1 cleared for departure.';
      ping(920,.16,.05);haptic([30,30,85]);
      northernLater(showNorthernTransmission,1450);
    };

    const tick=now=>{
      if(!holding||authorised)return;
      const progress=(now-started)/HOLD_MS;
      setProgress(progress);
      if(progress>=1){authorise();return;}
      northernHoldRaf=requestAnimationFrame(tick);
    };

    const startHold=event=>{
      if(button.disabled||holding||authorised)return;
      if(event?.type==='pointerdown'&&typeof button.setPointerCapture==='function'){
        try{button.setPointerCapture(event.pointerId);}catch{}
      }
      holding=true;started=performance.now();button.classList.add('is-holding');haptic(16);
      primeNorthernFinalAudio();
      northernHoldRaf=requestAnimationFrame(tick);
    };

    button.addEventListener('pointerdown',startHold);
    button.addEventListener('pointerup',resetHold);
    button.addEventListener('pointercancel',resetHold);
    button.addEventListener('lostpointercapture',resetHold);
    button.addEventListener('keydown',event=>{
      if((event.key===' '||event.key==='Enter')&&!holding){event.preventDefault();startHold(event);}
    });
    button.addEventListener('keyup',event=>{
      if(event.key===' '||event.key==='Enter'){event.preventDefault();resetHold();}
    });
  }

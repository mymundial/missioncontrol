  let northernTimers=[];
  let northernFlybyAudio=null;
  let northernSantaAudio=null;
  let northernMagicAudio=null;
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

  function getNorthernSantaAudio(){
    if(!northernSantaAudio){
      northernSantaAudio=new Audio('./assets/northern-santa-final.mp3');
      northernSantaAudio.preload='auto';
      northernSantaAudio.volume=.92;
    }
    return northernSantaAudio;
  }

  function getNorthernMagicAudio(){
    if(!northernMagicAudio){
      northernMagicAudio=new Audio('./assets/christmas-magic-02.mp3');
      northernMagicAudio.preload='auto';
      northernMagicAudio.volume=.88;
    }
    return northernMagicAudio;
  }

  function stopNorthernSequence(){
    northernTimers.forEach(clearTimeout); northernTimers=[];
    if(northernTakeoverEl){northernTakeoverEl.remove();northernTakeoverEl=null;}
    [northernSantaAudio,northernMagicAudio].forEach(audio=>{
      if(!audio)return;
      try{audio.pause();audio.currentTime=0;audio.onended=null;audio.onerror=null;}catch{}
    });
    stopStatic();
  }

  function primeNorthernFinalAudio(){
    if(!state.audio)return;
    [getNorthernMagicAudio(),getNorthernSantaAudio()].forEach(audio=>{
      try{
        audio.load();
        audio.muted=true;
        const play=audio.play();
        if(play&&typeof play.then==='function'){
          play.then(()=>{try{audio.pause();audio.currentTime=0;audio.muted=false;}catch{}}).catch(()=>{audio.muted=false;});
        }else{audio.pause();audio.currentTime=0;audio.muted=false;}
      }catch{audio.muted=false;}
    });
  }

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
    let fallbackTimer=null;
    const opened=performance.now();
    const santa=getNorthernSantaAudio();
    if(state.audio)startStatic(.04);
    northernLater(()=>stopStatic(),420);

    const finish=()=>{
      if(finished)return;finished=true;
      clearTimeout(fallbackTimer);stopStatic();
      try{santa.onended=null;santa.onerror=null;}catch{}
      const elapsed=performance.now()-opened;
      const wait=Math.max(0,900-elapsed);
      northernLater(showNorthernMissionComplete,wait+220);
    };

    if(state.audio){
      try{
        santa.currentTime=0;santa.volume=.92;santa.muted=false;
        santa.onended=finish;
        santa.onerror=()=>{fallbackTimer=setTimeout(finish,6200);northernTimers.push(fallbackTimer);};
        northernLater(()=>{
          try{
            const play=santa.play();
            if(play&&typeof play.catch==='function')play.catch(()=>{fallbackTimer=setTimeout(finish,6200);northernTimers.push(fallbackTimer);});
          }catch{fallbackTimer=setTimeout(finish,6200);northernTimers.push(fallbackTimer);}
        },260);
        fallbackTimer=setTimeout(finish,17000);northernTimers.push(fallbackTimer);
      }catch{fallbackTimer=setTimeout(finish,6200);northernTimers.push(fallbackTimer);}
    }else{
      fallbackTimer=setTimeout(finish,6200);northernTimers.push(fallbackTimer);
    }
  }

  function showNorthernMissionComplete(){
    const flyby=getNorthernFlybyAudio();
    if(state.audio){
      try{
        flyby.onended=null;flyby.onerror=null;flyby.currentTime=0;flyby.volume=.95;
        const play=flyby.play();
        if(play&&typeof play.catch==='function')play.catch(()=>{});
      }catch{}
    }
    showCompletion('Santa-1 Airborne','Santa-1 is airborne. Recovery complete. The Northern Flight is underway.');
  }

  function playNorthernAirborneMagic(){
    if(!state.audio)return;
    const magic=getNorthernMagicAudio();
    try{
      magic.onended=null;magic.onerror=null;magic.currentTime=0;magic.volume=.88;magic.muted=false;
      const play=magic.play();
      if(play&&typeof play.catch==='function')play.catch(()=>{});
    }catch{}
  }

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
        <img class="northern-airborne-mark" src="./assets/silverstone-s-mark.webp" alt="">
        <div class="kicker">Northern Flight</div>
        <h1>AIRBORNE</h1>
        <div class="northern-airborne-status">
          <div><small>Systems</small><strong>100%</strong></div>
          <div><small>Northern Flight</small><strong>Active</strong></div>
        </div>
      </div>`;
    document.body.appendChild(el);northernTakeoverEl=el;
    northernLater(()=>el.classList.add('is-settled'),180);
    northernLater(()=>el.classList.add('is-exiting'),3820);
    northernLater(()=>{
      showNorthernTransmission();
      if(el.isConnected)el.remove();
      if(northernTakeoverEl===el)northernTakeoverEl=null;
    },4260);
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
    [getNorthernFlybyAudio(),getNorthernSantaAudio(),getNorthernMagicAudio()].forEach(audio=>{try{audio.load();}catch{}});

    label.textContent='Authorise Flight';
    button.disabled=true;
    button.classList.remove('success','is-authorising','is-authorised');
    panel.classList.remove('is-ready','is-authorising','is-authorised');
    stateEl.textContent='Standby';

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
      hint.textContent='Santa-1 ready for final authorisation.';
      haptic(18);
    },1850);

    let authorised=false;
    button.addEventListener('click',()=>{
      if(button.disabled||authorised)return;
      authorised=true;
      primeNorthernFinalAudio();
      button.disabled=true;
      button.classList.add('is-authorising');
      panel.classList.add('is-authorising');
      label.textContent='Authorising';
      stateEl.textContent='Authorising';
      hint.textContent='Final flight authorisation in progress.';
      ping(690,.08,.025);haptic(22);

      northernLater(()=>{
        button.classList.remove('is-authorising');
        panel.classList.remove('is-authorising');
        button.classList.add('success','is-authorised');
        panel.classList.add('is-authorised');
        label.textContent='Authorised';
        stateEl.textContent='Authorised';
        hint.textContent='Santa-1 cleared for departure.';
        ping(920,.16,.05);haptic([30,30,85]);
        northernLater(showNorthernAirborneTakeover,620);
      },720);
    });
  }


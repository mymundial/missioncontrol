  let laplandMusic=null;
  let laplandVoice=null;
  let laplandExitSfx=null;
  let laplandVolumeRaf=0;
  let laplandTimers=[];

  function clearLaplandTimers(){
    laplandTimers.forEach(id=>clearTimeout(id));
    laplandTimers=[];
  }
  function laplandLater(fn,delay){
    const id=setTimeout(()=>{laplandTimers=laplandTimers.filter(x=>x!==id);fn();},delay);
    laplandTimers.push(id);
    return id;
  }
  function getLaplandMusic(){
    if(!laplandMusic){
      laplandMusic=new Audio('./assets/lapland-vegas.mp3');
      laplandMusic.preload='auto';
      laplandMusic.loop=true;
      laplandMusic.volume=.34;
    }
    return laplandMusic;
  }
  function getLaplandVoice(){
    if(!laplandVoice){
      laplandVoice=new Audio('./assets/lapland-chief-engineer.mp3');
      laplandVoice.preload='auto';
      laplandVoice.volume=1;
    }
    return laplandVoice;
  }
  function getLaplandExitSfx(){
    if(!laplandExitSfx){
      laplandExitSfx=new Audio('./assets/lapland-exit-celebration.mp3');
      laplandExitSfx.preload='auto';
      laplandExitSfx.volume=.9;
    }
    return laplandExitSfx;
  }
  function playLaplandExitCelebration(onComplete){
    if(!state.audio){onComplete?.();return;}
    const sfx=getLaplandExitSfx();
    let finished=false;
    const finish=()=>{if(finished)return;finished=true;sfx.onended=null;sfx.onerror=null;onComplete?.();};
    try{sfx.currentTime=0;}catch{}
    sfx.onended=finish;
    sfx.onerror=finish;
    try{
      const p=sfx.play();
      if(p&&typeof p.catch==='function') p.catch(finish);
    }catch{finish();}
  }
  function fadeLaplandMusic(target,duration=350,onDone){
    if(!laplandMusic){onDone?.();return;}
    cancelAnimationFrame(laplandVolumeRaf);
    const from=laplandMusic.volume;
    const started=performance.now();
    const step=now=>{
      const p=Math.min(1,(now-started)/duration);
      laplandMusic.volume=from+(target-from)*p;
      if(p<1) laplandVolumeRaf=requestAnimationFrame(step);
      else {laplandVolumeRaf=0;onDone?.();}
    };
    laplandVolumeRaf=requestAnimationFrame(step);
  }
  function startLaplandMusic(){
    if(!state.audio) return;
    beginMissionAudioRadioOverride('lapland');
    const music=getLaplandMusic();
    music.loop=true;
    if(music.ended) music.currentTime=0;
    music.volume=Math.min(music.volume||.34,.34);
    try{
      const p=music.play();
      if(p&&typeof p.catch==='function') p.catch(()=>endMissionAudioRadioOverride('lapland'));
    }catch{endMissionAudioRadioOverride('lapland');}
  }
  function stopLaplandAudio(reset=true,restoreRadio=true){
    clearLaplandTimers();
    cancelAnimationFrame(laplandVolumeRaf);laplandVolumeRaf=0;
    stopStatic();
    if(laplandVoice){try{laplandVoice.pause();if(reset)laplandVoice.currentTime=0;}catch{}}
    if(laplandMusic){try{laplandMusic.pause();if(reset)laplandMusic.currentTime=0;laplandMusic.volume=.34;}catch{}}
    if(restoreRadio) endMissionAudioRadioOverride('lapland');
  }
  function playLaplandClearance(onComplete){
    const finish=()=>{
      startStatic(.07);
      laplandLater(()=>{stopStatic();onComplete?.();},280);
    };
    if(!state.audio){finish();return;}
    const voice=getLaplandVoice();
    startStatic(.085);
    laplandLater(()=>{
      stopStatic();
      try{voice.currentTime=0;}catch{}
      voice.onended=finish;
      voice.onerror=finish;
      try{
        const p=voice.play();
        if(p&&typeof p.catch==='function') p.catch(finish);
      }catch{finish();}
    },260);
  }

  function bindLapland(){
    const btn=document.getElementById('initiateTest');
    const panel=document.getElementById('laplandPanel');
    const verificationStage=document.getElementById('laplandVerificationStage');
    const transmissionStage=document.getElementById('laplandTransmissionStage');
    const partyStage=document.getElementById('laplandPartyStage');
    const masterStatus=document.getElementById('laplandMasterStatus');
    const masterValue=document.getElementById('laplandMasterValue');
    const head=document.querySelector('.lapland-head');
    if(!btn||!panel||!verificationStage||!transmissionStage||!partyStage||!masterStatus||!masterValue) return;

    startLaplandMusic();

    // MC01–MC10 each restore one named system. Lapland Launch checks those ten
    // systems in mission order before the derived LAUNCH SYSTEMS state can go ONLINE.
    const checks=['entry','diagnostics','luffield','power','spirit','escapade','comet','jingle','lando','aurora'];
    const systemKeys=['circuitry','diagnostic','comms','power','core','propulsion','guidance','control','response','navigation'];
    const setCharge=value=>panel.style.setProperty('--lapland-charge',String(Math.max(0,Math.min(1,value))));
    const setRowState=(key,nextState,label)=>{
      const row=document.querySelector(`[data-verify-system="${key}"]`);
      const status=document.querySelector(`[data-verify-status="${key}"]`);
      if(!row||!status) return;
      row.classList.remove('is-standby','is-online','is-offline','is-checking');
      row.classList.add(`is-${nextState}`);
      status.textContent=label;
    };
    const setMasterOnline=()=>{
      masterValue.textContent='Online';
      masterStatus.classList.remove('is-offline');
      masterStatus.classList.add('is-online');
      panel.classList.add('is-complete');
      head?.classList.add('is-launch-clear');
      ping(820,.08,.026);
      laplandLater(()=>ping(1080,.12,.038),150);
      haptic([20,24,62]);
    };
    const showTransmission=()=>{
      if(state.missionOpen!=='lapland') return;
      verificationStage.hidden=true;
      partyStage.hidden=true;
      transmissionStage.hidden=false;
      panel.classList.remove('is-verifying','is-celebrating','is-party');
      panel.classList.add('is-transmission');
      head?.classList.remove('is-celebrating');
      if(laplandMusic&&!laplandMusic.paused) fadeLaplandMusic(.07,420);
      playLaplandClearance(showParty);
    };
    const showParty=()=>{
      if(state.missionOpen!=='lapland') return;
      transmissionStage.hidden=true;
      verificationStage.hidden=true;
      partyStage.hidden=false;
      panel.classList.remove('is-transmission');
      panel.classList.add('is-party','is-celebrating');
      head?.classList.add('is-celebrating');
      fadeLaplandMusic(.9,620);
      ping(1040,.14,.045);
      laplandLater(()=>ping(1320,.18,.045),210);
      haptic([25,28,75]);
      laplandLater(()=>{
        if(state.missionOpen==='lapland'){
          showCompletion('Launch Systems Online','Santa-1 is fully online and ready for the final flight sequence.');
        }
      },8200);
    };

    masterStatus.classList.add('is-offline');
    masterValue.textContent='Offline';

    btn.onclick=()=>{
      if(btn.dataset.review==='true'){ stopLaplandAudio();set({missionOpen:null,nav:'missions'});return; }
      btn.disabled=true;
      clearLaplandTimers();
      panel.querySelector('.final-check-note')?.remove();
      panel.classList.remove('is-complete','is-celebrating','is-party','is-transmission','has-attention');
      head?.classList.remove('is-launch-clear','is-celebrating');
      panel.classList.add('is-verifying');
      transmissionStage.hidden=true;
      partyStage.hidden=true;
      verificationStage.hidden=false;
      masterStatus.classList.remove('is-online');
      masterStatus.classList.add('is-offline');
      masterValue.textContent='Offline';
      setCharge(0);
      const missing=[];

      startLaplandMusic();
      if(laplandMusic&&!laplandMusic.paused) fadeLaplandMusic(.34,220);
      systemKeys.forEach(key=>setRowState(key,'standby','Standby'));

      checks.forEach((checkpointId,i)=>laplandLater(()=>{
        const key=systemKeys[i];
        setRowState(key,'checking','Checking');
        ping(430+i*34,.04,.012);

        laplandLater(()=>{
          const ready=state.completed.includes(checkpointId);
          setRowState(key,ready?'online':'offline',ready?'Online':'Offline');
          if(!ready) missing.push(checkpointId);
          setCharge((i+1)/checks.length);
          ping(ready?540+i*38:220,.05,.016);

          if(i===checks.length-1){
            laplandLater(()=>{
              const clear=!missing.length;
              setCharge(1);
              panel.classList.remove('is-verifying');

              if(clear){
                btn.hidden=true;
                setMasterOnline();
                // Let the launch-status reward land before the narrative hand-off.
                laplandLater(showTransmission,1550);
              } else {
                if(laplandMusic&&!laplandMusic.paused) fadeLaplandMusic(.34,350);
                panel.classList.add('has-attention');
                btn.disabled=false; btn.dataset.review='true'; btn.textContent='View Missions';
                const note=document.createElement('div'); note.className='final-check-note';
                note.innerHTML=`<div class="kicker">Systems Require Attention</div><p>${missing.length} ${missing.length===1?'system':'systems'} must be restored before launch systems can come online.</p>`;
                verificationStage.appendChild(note); haptic([20,35,20]);
              }
            },620);
          }
        },220);
      },220+i*360));
    };
  }

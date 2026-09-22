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
    const payoff=document.getElementById('laplandPayoff');
    const head=document.querySelector('.lapland-head');
    if(!btn||!panel) return;

    startLaplandMusic();

    // Final verification deliberately mirrors MC-00: the same seven restored
    // systems resolve from STANDBY -> CHECKING -> ONLINE, then LAUNCH resolves
    // STANDBY -> CHECKING -> CLEAR only after the route systems pass.
    const checks=['power','luffield','spirit','comet','jingle','lando','aurora'];
    const systemKeys=['power','comms','core','control','propulsion','response','navigation'];
    const setCharge=value=>panel.style.setProperty('--lapland-charge',String(Math.max(0,Math.min(1,value))));
    const setRowState=(key,nextState,label)=>{
      const row=document.querySelector(`[data-verify-system="${key}"]`);
      const status=document.querySelector(`[data-verify-status="${key}"]`);
      if(!row||!status) return;
      row.classList.remove('is-standby','is-online','is-offline','is-checking','is-blocked','is-clear');
      row.classList.add(`is-${nextState}`);
      status.textContent=label;
    };
    const celebrate=()=>{
      if(state.missionOpen!=='lapland') return;
      panel.classList.add('is-complete','is-celebrating');
      head?.classList.add('is-launch-clear','is-celebrating');
      if(payoff) payoff.hidden=false;
      fadeLaplandMusic(.9,260);
      ping(940,.16,.055);haptic([25,35,85]);
      laplandLater(()=>panel.classList.remove('is-celebrating'),7600);
      laplandLater(()=>head?.classList.remove('is-celebrating'),7600);
      laplandLater(()=>{
        if(state.missionOpen==='lapland'){
          showCompletion('Launch Clear','Every restored system has passed final verification. Santa-1 is cleared for launch.');
        }
      },8200);
    };

    btn.onclick=()=>{
      if(btn.dataset.review==='true'){ stopLaplandAudio();set({missionOpen:null,nav:'missions'});return; }
      btn.disabled=true;
      clearLaplandTimers();
      panel.classList.remove('is-complete','is-celebrating','has-attention');
      head?.classList.remove('is-launch-clear','is-celebrating');
      panel.classList.add('is-verifying');
      if(payoff) payoff.hidden=true;
      setCharge(0);
      const missing=[];

      startLaplandMusic();
      if(laplandMusic&&!laplandMusic.paused) fadeLaplandMusic(.34,220);
      systemKeys.forEach(key=>setRowState(key,'standby','Standby'));
      setRowState('launch','standby','Standby');

      checks.forEach((checkpointId,i)=>laplandLater(()=>{
        const key=systemKeys[i];
        setRowState(key,'checking','Checking');
        ping(430+i*45,.04,.014);

        laplandLater(()=>{
          const ready=state.completed.includes(checkpointId);
          setRowState(key,ready?'online':'offline',ready?'Online':'Offline');
          if(!ready) missing.push(checkpointId);
          setCharge((i+1)/8);
          ping(ready?540+i*50:220,.055,.018);

          if(i===checks.length-1){
            laplandLater(()=>{
              setRowState('launch','checking','Checking');
              if(laplandMusic&&!laplandMusic.paused) fadeLaplandMusic(.08,520);
              ping(770,.055,.018);
              laplandLater(()=>{
                const clear=!missing.length;
                setRowState('launch',clear?'clear':'blocked',clear?'Clear':'Blocked');
                setCharge(1);
                panel.classList.remove('is-verifying');

                if(clear){
                  head?.classList.add('is-launch-clear');
                  btn.hidden=true;
                  haptic([18,25,35]);
                  playLaplandClearance(celebrate);
                } else {
                  if(laplandMusic&&!laplandMusic.paused) fadeLaplandMusic(.34,350);
                  panel.classList.add('has-attention');
                  btn.disabled=false; btn.dataset.review='true'; btn.textContent='View Missions';
                  const note=document.createElement('div'); note.className='final-check-note';
                  note.innerHTML=`<div class="kicker">Systems Require Attention</div><p>${missing.length} ${missing.length===1?'system':'systems'} must be restored before Santa-1 can be cleared for launch.</p>`;
                  panel.appendChild(note); haptic([20,35,20]);
                }
              },520);
            },680);
          }
        },240);
      },260+i*430));
    };
  }

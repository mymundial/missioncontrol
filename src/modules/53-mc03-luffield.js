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


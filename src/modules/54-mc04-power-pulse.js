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
    const idleAudio=new Audio('./assets/reindeer-engine-idle-loop.wav');
    idleAudio.preload='auto';
    idleAudio.loop=true;
    idleAudio.volume=0;
    const powerWinAudio=new Audio('./assets/power-win.mp3');
    powerWinAudio.preload='auto';
    powerWinAudio.volume=.92;
    let audioFadeRaf=0;
    let idleFadeRaf=0;
    let idleStarted=false;
    let speed=0,holding=false,sustain=0,last=performance.now(),roadPhase=0,grassPhase=0,raf=0,finished=false;
    let thresholdStep=0;

    function cancelPowerAudioFade(){
      if(audioFadeRaf)cancelAnimationFrame(audioFadeRaf);
      audioFadeRaf=0;
    }
    function cancelIdleAudioFade(){
      if(idleFadeRaf)cancelAnimationFrame(idleFadeRaf);
      idleFadeRaf=0;
    }
    function fadeIdleAudio(target,duration=240,onDone){
      cancelIdleAudioFade();
      const from=Number.isFinite(idleAudio.volume)?idleAudio.volume:0;
      const start=performance.now();
      const step=now=>{
        const p=Math.min(1,(now-start)/duration);
        idleAudio.volume=Math.max(0,Math.min(1,from+(target-from)*p));
        if(p<1)idleFadeRaf=requestAnimationFrame(step);
        else{idleFadeRaf=0;onDone?.();}
      };
      idleFadeRaf=requestAnimationFrame(step);
    }
    function ensureIdleAudio(target=.28){
      if(!state.audio)return;
      cancelIdleAudioFade();
      if(idleAudio.paused){
        idleAudio.volume=0;
        try{
          const play=idleAudio.play();
          if(play&&typeof play.then==='function') play.then(()=>{idleStarted=true;fadeIdleAudio(target,220);}).catch(()=>{});
          else{idleStarted=true;fadeIdleAudio(target,220);}
        }catch{}
      }else{
        idleStarted=true;
        fadeIdleAudio(target,220);
      }
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
      ensureIdleAudio(.09);
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
      if(!state.audio)return;
      ensureIdleAudio(.28);
      if(powerAudio.paused)return;
      // Fade the acceleration layer away, then pause without changing currentTime.
      // The low idle bed remains underneath so coasting never falls silent.
      fadePowerAudio(0,240,()=>{try{powerAudio.pause();}catch{}});
    }
    function stopPowerAudio(reset=false){
      cancelPowerAudioFade();
      try{powerAudio.pause();powerAudio.volume=0;if(reset)powerAudio.currentTime=0;}catch{}
    }
    function stopIdleAudio(reset=false){
      cancelIdleAudioFade();
      idleStarted=false;
      try{idleAudio.pause();idleAudio.volume=0;if(reset)idleAudio.currentTime=0;}catch{}
    }

    function setHolding(next){
      if(finished)return;
      holding=next;
      button.classList.toggle('pressed',holding);
      if(holding){
        startPowerAudio();
        runState.textContent=speed>190?'FULL GALLOP':'ACCELERATING';
        stateEl.textContent=speed>190?'Hold maximum velocity':'Building raceway speed…';
      }else{
        pausePowerAudio();
        runState.textContent=speed>1?'COASTING':'READY';
        stateEl.textContent=speed>1?'Hold again to keep accelerating':'Hold to accelerate';
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
      stateEl.textContent='Maximum raceway speed confirmed';
      button.textContent='MAX SPEED CONFIRMED';
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
        if(idleStarted&&!idleAudio.paused)fadeIdleAudio(0,420,()=>{try{idleAudio.pause();}catch{}});
      }
      cancelAnimationFrame(raf);
      setTimeout(()=>showCompletion('Raceway Run Complete','Santa-1’s propulsion system has been tested and is ready for flight.'),1100);
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
        stateEl.textContent='Hold maximum velocity to confirm the run';
      }else{
        sustain=Math.max(0,sustain-dt*1.7);
        maxState.textContent=sustain>0?'HOLD SPEED':'STANDBY';
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
      stopIdleAudio(false);
      try{powerWinAudio.pause();powerWinAudio.currentTime=0;}catch{}
    };
    raf=requestAnimationFrame(frame);
  }

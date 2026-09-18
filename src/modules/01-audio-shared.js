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

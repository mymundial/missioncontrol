  let mc01Timers=[];
  let mc01BloomEl=null;
  let mc01BloomAudio=null;

  function getMc01BloomAudio(){
    if(!mc01BloomAudio){
      mc01BloomAudio=new Audio('./assets/christmas-magic-01.mp3');
      mc01BloomAudio.preload='auto';
      mc01BloomAudio.volume=.92;
    }
    return mc01BloomAudio;
  }

  function stopMc01Bloom(){
    if(mc01BloomEl){mc01BloomEl.remove();mc01BloomEl=null;}
    if(mc01BloomAudio){
      try{mc01BloomAudio.pause();mc01BloomAudio.currentTime=0;}catch{}
    }
  }

  function stopMc01Activation(){
    mc01Timers.forEach(clearTimeout);
    mc01Timers=[];
    stopMc01Bloom();
  }

  function mc01Later(fn,delay){
    const timer=setTimeout(()=>{
      mc01Timers=mc01Timers.filter(id=>id!==timer);
      fn();
    },delay);
    mc01Timers.push(timer);
  }

  function showMc01EnergyBloom(){
    if(state.missionOpen!=='entry'||mc01BloomEl) return;
    const el=document.createElement('div');
    el.className='mc01-energy-bloom';
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    el.innerHTML=`<div class="mc01-bloom-field" aria-hidden="true"><i></i><i></i><i></i></div><div class="mc01-bloom-copy"><img class="mc01-bloom-mark" src="./assets/silverstone-s-mark.webp" alt=""><div class="kicker">Circuit Link</div><h1>Energy Transfer Complete</h1><p>Circuit energy has been routed to Santa-1. Recovery sequence initiated.</p></div>`;
    document.body.appendChild(el);
    mc01BloomEl=el;
    if(state.audio){
      const audio=getMc01BloomAudio();
      try{audio.currentTime=0;audio.play().catch(()=>{});}catch{}
    }
    haptic([45,35,90]);
  }

  function bindCircuitEntryActivation(){
    const panel=document.getElementById('mc01Activation');
    const stateLabel=document.getElementById('mc01StateLabel');
    const stateValue=document.getElementById('mc01State');
    const transferValue=document.getElementById('mc01TransferValue');
    const transferFill=document.getElementById('mc01TransferFill');
    if(!panel||!stateLabel||!stateValue||!transferValue||!transferFill) return;

    stopMc01Activation();
    if(state.audio) getMc01BloomAudio();

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

    // Leave the completed 100% scan on screen long enough to register before
    // the full-screen energy reaction begins.
    mc01Later(()=>{
      showMc01EnergyBloom();
    },4650);

    // The bloom is a readable payoff state, not a single-frame transition.
    // Its duration is aligned to the 4.57 s production sting before returning
    // to the stable mission-complete card.
    mc01Later(()=>{
      stopMc01Activation();
      if(state.missionOpen!=='entry') return;
      document.querySelector('.mc01-brand')?.remove();
      showCompletion('Circuit Link Complete',"Santa-1's recovery has begun.");
    },9350);
  }

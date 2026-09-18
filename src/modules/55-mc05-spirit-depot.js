  function bindSpirit(){
    const rig=document.getElementById('spiritRig');
    const control=document.getElementById('spiritBalanceControl');
    const knob=document.getElementById('spiritKnob');
    const target=document.getElementById('spiritTarget');
    const stateEl=document.getElementById('spiritState');
    const stageNumber=document.getElementById('spiritStageNumber');
    const stageName=document.getElementById('spiritStageName');
    const stageDots=[...document.querySelectorAll('[data-spirit-stage-dot]')];
    const tanks=[...document.querySelectorAll('[data-spirit-tank]')];
    if(!rig||!control||!knob||!target||!stateEl||!stageNumber||!stageName||!stageDots.length||!tanks.length) return;

    const stages=[
      {name:'IGNITION',threshold:18,amplitude:14,speed:.00070,rate:.00050},
      {name:'CHARGE',threshold:16,amplitude:20,speed:.00082,rate:.00047},
      {name:'PRESSURE',threshold:14,amplitude:26,speed:.00096,rate:.00044},
      {name:'SURGE',threshold:12,amplitude:31,speed:.00110,rate:.00041},
      {name:'CORE STABLE',threshold:11,amplitude:35,speed:.00124,rate:.00038}
    ];

    const energyAudio=new Audio('./assets/spirit-energy-vortex.mp3');
    energyAudio.preload='auto';energyAudio.loop=true;energyAudio.volume=.12;
    const ventAudio=new Audio('./assets/spirit-tank-vent.mp3');
    ventAudio.preload='auto';ventAudio.volume=.68;

    let stage=0;
    let stageProgress=0;
    let userPos=50;
    let targetPos=50;
    let dragging=false;
    let completed=false;
    let audioStarted=false;
    let raf=0;
    let last=performance.now();
    let ventTimer=0;

    function startEnergyAudio(){
      if(!state.audio||audioStarted) return;
      audioStarted=true;
      try{const p=energyAudio.play();if(p&&typeof p.catch==='function')p.catch(()=>{});}catch{}
    }
    function stopAudio(){
      try{energyAudio.pause();ventAudio.pause();energyAudio.currentTime=0;ventAudio.currentTime=0;}catch{}
    }
    function vent(){
      rig.classList.remove('is-venting');void rig.offsetWidth;rig.classList.add('is-venting');
      clearTimeout(ventTimer);ventTimer=setTimeout(()=>rig.classList.remove('is-venting'),850);
      if(state.audio){try{ventAudio.currentTime=0;const p=ventAudio.play();if(p&&typeof p.catch==='function')p.catch(()=>{});}catch{}}
      haptic([22,18,34]);
    }
    function setUserFromClientX(clientX){
      const rect=control.getBoundingClientRect();
      if(!rect.width) return;
      userPos=Math.max(4,Math.min(96,((clientX-rect.left)/rect.width)*100));
      control.setAttribute('aria-valuenow',String(Math.round(userPos)));
      startEnergyAudio();
    }
    function onPointerDown(e){
      dragging=true;
      control.classList.add('is-active');
      try{control.setPointerCapture(e.pointerId);}catch{}
      setUserFromClientX(e.clientX);
      e.preventDefault();
    }
    function onPointerMove(e){
      if(!dragging) return;
      setUserFromClientX(e.clientX);
      e.preventDefault();
    }
    function endPointer(e){
      dragging=false;
      control.classList.remove('is-active');
      try{control.releasePointerCapture(e.pointerId);}catch{}
    }
    function onKey(e){
      if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight') return;
      e.preventDefault();
      userPos=Math.max(4,Math.min(96,userPos+(e.key==='ArrowLeft'?-4:4)));
      control.setAttribute('aria-valuenow',String(Math.round(userPos)));
      startEnergyAudio();
    }

    control.addEventListener('pointerdown',onPointerDown);
    control.addEventListener('pointermove',onPointerMove);
    control.addEventListener('pointerup',endPointer);
    control.addEventListener('pointercancel',endPointer);
    control.addEventListener('keydown',onKey);

    function updateTanks(overall){
      const perSide=3;
      tanks.forEach((cell,index)=>{
        const slot=index%perSide;
        const local=Math.max(0,Math.min(1,overall*perSide-slot));
        cell.style.setProperty('--cell-fill',String(local));
        cell.classList.toggle('is-full',local>.98);
      });
    }

    function updateVisuals(now){
      const cfg=stages[stage]||stages[stages.length-1];
      targetPos=50+
        Math.sin(now*cfg.speed+(stage*.78))*cfg.amplitude+
        Math.sin(now*cfg.speed*.43+1.9)*(cfg.amplitude*.18);
      targetPos=Math.max(8,Math.min(92,targetPos));

      const error=Math.abs(userPos-targetPos);
      const quality=Math.max(0,Math.min(1,1-(error/cfg.threshold)));
      const balanced=error<=cfg.threshold;
      const meterLevel=Math.max(.06,quality);
      const overall=(stage+stageProgress)/stages.length;

      knob.style.left=`${userPos}%`;
      target.style.left=`${targetPos}%`;
      target.style.width=`${Math.max(12,cfg.threshold*1.45)}%`;
      rig.style.setProperty('--balance-quality',String(meterLevel));
      rig.style.setProperty('--core-power',String(Math.max(.08,overall)));
      rig.style.setProperty('--spirit-charge',String(overall));
      updateTanks(overall);

      if(!audioStarted){
        stateEl.textContent='HOLD CONTROL';
      }else if(balanced){
        stateEl.textContent=quality>.72?'BALANCED':'STABILISING';
      }else{
        stateEl.textContent=userPos<targetPos?'SHIFT RIGHT':'SHIFT LEFT';
      }
      rig.classList.toggle('is-balanced',balanced&&audioStarted);
      rig.classList.toggle('is-unstable',!balanced&&audioStarted);
      stageNumber.textContent=String(stage+1).padStart(2,'0');
      stageName.textContent=cfg.name;
      stageDots.forEach((dot,i)=>{
        dot.classList.toggle('complete',i<stage);
        dot.classList.toggle('active',i===stage);
        dot.style.setProperty('--stage-progress',i===stage?String(stageProgress):(i<stage?'1':'0'));
      });

      return {balanced,quality};
    }

    function completeStage(){
      vent();
      ping(520+(stage*72),.09,.035);
      if(stage>=stages.length-1){
        completed=true;
        stageProgress=1;
        rig.dataset.stage='complete';
        rig.classList.add('is-complete');
        rig.style.setProperty('--balance-quality','1');
        rig.style.setProperty('--core-power','1');
        rig.style.setProperty('--spirit-charge','1');
        updateTanks(1);
        stageDots.forEach(dot=>{dot.classList.add('complete');dot.classList.remove('active');dot.style.setProperty('--stage-progress','1');});
        stageNumber.textContent='05';
        stageName.textContent='CORE STABLE';
        stateEl.textContent='STABLE';
        ping(840,.15,.055);haptic([30,28,64]);
        setTimeout(()=>{
          stopAudio();
          if(state.missionOpen==='spirit') showCompletion('Spirit Core Charged','');
        },900);
        return;
      }
      stage++;
      stageProgress=0;
      rig.dataset.stage=String(stage);
      haptic([18,22,32]);
    }

    function tick(now){
      if(completed) return;
      const dt=Math.min(50,Math.max(0,now-last));last=now;
      const {balanced,quality}=updateVisuals(now);
      if(audioStarted&&balanced){
        stageProgress=Math.min(1,stageProgress+(dt*stages[stage].rate*(.48+quality*.72)));
      }else if(audioStarted){
        stageProgress=Math.max(0,stageProgress-(dt*.00010));
      }
      if(stageProgress>=1){completeStage();if(completed)return;}
      raf=requestAnimationFrame(tick);
    }

    rig.dataset.stage='0';
    updateTanks(0);
    updateVisuals(last);
    raf=requestAnimationFrame(tick);

    cleanupMission=()=>{
      cancelAnimationFrame(raf);clearTimeout(ventTimer);stopAudio();
      control.removeEventListener('pointerdown',onPointerDown);
      control.removeEventListener('pointermove',onPointerMove);
      control.removeEventListener('pointerup',endPointer);
      control.removeEventListener('pointercancel',endPointer);
      control.removeEventListener('keydown',onKey);
    };
  }

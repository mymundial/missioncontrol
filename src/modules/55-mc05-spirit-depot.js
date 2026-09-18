  function bindSpirit(){
    let expected='A',hits=0;
    const tapsPerTank=6,total=tapsPerTank*5;
    const stateEl=document.getElementById('spiritState');
    const tanks=[...document.querySelectorAll('[data-tank]')];
    const energyAudio=new Audio('./assets/spirit-energy-vortex.mp3');
    energyAudio.preload='auto';energyAudio.loop=true;energyAudio.volume=.16;
    const ventAudio=new Audio('./assets/spirit-tank-vent.mp3');
    ventAudio.preload='auto';ventAudio.volume=.76;
    let audioStarted=false,audioFade=0;

    function startEnergyAudio(){
      if(!state.audio||audioStarted)return;
      audioStarted=true;
      try{const p=energyAudio.play();if(p&&typeof p.catch==='function')p.catch(()=>{});}catch{}
    }
    function stopEnergyAudio(fade=true){
      if(audioFade)cancelAnimationFrame(audioFade);
      if(!fade){try{energyAudio.pause();energyAudio.currentTime=0;}catch{};return;}
      const from=energyAudio.volume,start=performance.now();
      const step=now=>{const p=Math.min(1,(now-start)/420);energyAudio.volume=Math.max(0,from*(1-p));if(p<1)audioFade=requestAnimationFrame(step);else{audioFade=0;try{energyAudio.pause();}catch{}}};
      audioFade=requestAnimationFrame(step);
    }
    function ventTank(index){
      const tank=tanks[index];if(!tank)return;
      tank.classList.remove('venting');void tank.offsetWidth;tank.classList.add('venting');
      setTimeout(()=>tank.classList.remove('venting'),1250);
      if(state.audio){
        try{ventAudio.currentTime=0;const p=ventAudio.play();if(p&&typeof p.catch==='function')p.catch(()=>{});}catch{}
      }
      haptic([24,14,34]);
    }

    document.querySelectorAll('[data-charge]').forEach(b=>b.onclick=()=>{
      const v=b.dataset.charge;
      if(v!==expected){stateEl.textContent=`Rhythm broken · alternate ${expected}`;haptic([15,20,15]);return;}
      startEnergyAudio();
      hits++; expected=expected==='A'?'B':'A'; ping(330+hits*8,.045,.018); haptic(12);
      const fullCount=Math.floor(hits/tapsPerTank);
      const activeIndex=Math.min(4,fullCount);
      const within=hits%tapsPerTank;
      tanks.forEach((t,i)=>{
        const isFull=i<fullCount || hits>=total;
        t.classList.toggle('active',i===activeIndex&&hits<total);
        t.classList.toggle('full',isFull);
        const fill=t.querySelector('.tank-fill');
        const pct=isFull?100:(i===fullCount?Math.round(within/tapsPerTank*100):0);
        fill.style.height=pct+'%';
      });
      if(hits%tapsPerTank===0)ventTank(Math.min(4,fullCount-1));
      stateEl.textContent=hits<10?'Charge stability · balancing':hits<22?'Charge stability · stable':'Charge stability · optimal';
      if(hits>=total){
        stopEnergyAudio(true);
        ping(760,.14,.05);haptic([28,18,46]);
        setTimeout(()=>showCompletion('Spirit Core Charged',''),1250);
      }
    });
    cleanupMission=()=>{if(audioFade)cancelAnimationFrame(audioFade);try{energyAudio.pause();ventAudio.pause();energyAudio.currentTime=0;ventAudio.currentTime=0;}catch{}};
  }

  function bindSpirit(){
    const rig=document.getElementById('spiritRig');
    const stageNumber=document.getElementById('spiritStageNumber');
    const stageName=document.getElementById('spiritStageName');
    const stageDots=[...document.querySelectorAll('[data-spirit-stage-dot]')];
    const buttons=[...document.querySelectorAll('[data-charge]')];
    const tankMap={
      A:[...document.querySelectorAll('[data-spirit-tank^="left-"]')],
      B:[...document.querySelectorAll('[data-spirit-tank^="right-"]')]
    };
    const meterMap={
      A:document.querySelector('.spirit-meter-left'),
      B:document.querySelector('.spirit-meter-right')
    };
    const bankMap={
      A:document.querySelector('.spirit-bank-left'),
      B:document.querySelector('.spirit-bank-right')
    };
    if(!rig||!stageNumber||!stageName||stageDots.length!==5||buttons.length!==2||tankMap.A.length!==4||tankMap.B.length!==4) return;

    const stages=['IGNITION','CHARGE','PRESSURE','SURGE','STABLE'];
    const tapsPerTank=4;
    const tanksPerBank=4;
    const tapsPerBank=tapsPerTank*tanksPerBank;
    const totalTaps=tapsPerBank*2;
    const sideHits={A:0,B:0};
    let expected='A';
    let hits=0;
    let completed=false;
    let finishTimer=0;
    const reactionTimers=[];
    const payoffAudio=new Audio('./assets/spirit-tank-vent.mp3');
    payoffAudio.preload='auto';
    payoffAudio.volume=.72;

    function playTankPayoff(){
      if(!state.audio) return;
      try{
        payoffAudio.currentTime=0;
        const play=payoffAudio.play();
        if(play&&typeof play.catch==='function') play.catch(()=>{});
      }catch{}
    }

    function stageFromHits(){
      if(hits>=totalTaps) return 4;
      return Math.min(4,Math.floor((hits/totalTaps)*5));
    }

    function updateStage(){
      const stage=stageFromHits();
      const stageStart=(stage/5)*totalTaps;
      const stageEnd=((stage+1)/5)*totalTaps;
      const local=Math.max(0,Math.min(1,(hits-stageStart)/(stageEnd-stageStart)));
      rig.dataset.stage=String(stage);
      stageNumber.textContent=String(stage+1).padStart(2,'0');
      stageName.textContent=stages[stage];
      stageDots.forEach((dot,i)=>{
        const progress=i<stage?1:i===stage?local:0;
        dot.classList.toggle('complete',i<stage||(completed&&i===4));
        dot.classList.toggle('active',!completed&&i===stage);
        dot.style.setProperty('--stage-progress',String(progress));
      });
    }

    function updateBank(side){
      const sideTotal=sideHits[side];
      const bankProgress=Math.max(0,Math.min(1,sideTotal/tapsPerBank));
      const meter=meterMap[side];
      if(meter) meter.style.setProperty('--meter-level',String(bankProgress));
      const tanks=tankMap[side];
      tanks.forEach((tank,displayIndex)=>{
        const fillOrder=(tanks.length-1)-displayIndex;
        const local=Math.max(0,Math.min(1,(sideTotal-(fillOrder*tapsPerTank))/tapsPerTank));
        tank.style.setProperty('--tank-fill',String(local));
        tank.classList.toggle('is-active',local>0&&local<1);
        tank.classList.toggle('is-full',local>=1);
      });
    }

    function pulseCharge(side,button){
      const bank=bankMap[side];
      const meter=meterMap[side];
      const tanks=tankMap[side];
      const active=tanks.find(tank=>tank.classList.contains('is-active')) || [...tanks].reverse().find(tank=>tank.classList.contains('is-full'));
      [bank,meter,button,active].forEach(el=>{
        if(!el) return;
        el.classList.remove('is-pumping');
        void el.offsetWidth;
        el.classList.add('is-pumping');
        const timer=setTimeout(()=>el.classList.remove('is-pumping'),220);
        reactionTimers.push(timer);
      });
    }

    function tankJustFilled(side){
      if(sideHits[side]===0||sideHits[side]%tapsPerTank!==0) return;
      const completedFromBottom=(sideHits[side]/tapsPerTank)-1;
      const displayIndex=(tanksPerBank-1)-completedFromBottom;
      const tank=tankMap[side][displayIndex];
      if(!tank) return;
      tank.classList.remove('is-locking');
      void tank.offsetWidth;
      tank.classList.add('is-locking');
      setTimeout(()=>tank.classList.remove('is-locking'),900);
      playTankPayoff();
      haptic([24,18,42]);
    }

    function updateExpected(){
      buttons.forEach(button=>button.classList.toggle('is-next',!completed&&button.dataset.charge===expected));
    }

    function completeSpirit(){
      completed=true;
      rig.classList.add('is-complete');
      stageNumber.textContent='05';
      stageName.textContent='STABLE';
      stageDots.forEach(dot=>{
        dot.classList.add('complete');dot.classList.remove('active');dot.style.setProperty('--stage-progress','1');
      });
      updateExpected();
      buttons.forEach(button=>{button.disabled=true;button.classList.remove('is-next');});
      haptic([30,28,64]);
      finishTimer=setTimeout(()=>{
        if(state.missionOpen==='spirit') showCompletion('Spirit Core Charged','The recovered energy has been stored and the Spirit Core is fully charged.');
      },950);
    }

    function flashWrong(button){
      button.classList.remove('is-wrong');void button.offsetWidth;button.classList.add('is-wrong');
      setTimeout(()=>button.classList.remove('is-wrong'),280);
      haptic([12,22,12]);
    }

    function onCharge(event){
      if(completed) return;
      const button=event.currentTarget;
      const side=button.dataset.charge;
      if(side!==expected){flashWrong(button);return;}
      hits++;
      sideHits[side]++;
      updateBank(side);
      pulseCharge(side,button);
      tankJustFilled(side);
      expected=expected==='A'?'B':'A';
      updateStage();
      updateExpected();
      haptic(10);
      if(hits>=totalTaps) completeSpirit();
    }

    buttons.forEach(button=>button.addEventListener('click',onCharge));
    updateBank('A');updateBank('B');updateStage();updateExpected();

    cleanupMission=()=>{
      clearTimeout(finishTimer);
      reactionTimers.forEach(clearTimeout);
      buttons.forEach(button=>button.removeEventListener('click',onCharge));
      try{payoffAudio.pause();payoffAudio.currentTime=0;}catch{}
    };
  }

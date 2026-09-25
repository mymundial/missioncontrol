  function bindAurora(){
    const dial=document.getElementById('auroraDial');
    const stateEl=document.getElementById('auroraState');
    const north=document.querySelector('.aurora-north');
    const pulseEl=document.querySelector('.aurora-charge-pulse');
    const finalWave=document.querySelector('.aurora-final-wave');
    if(!dial||!stateEl)return;

    const ringEls={
      outer:document.querySelector('[data-aurora-ring="outer"]'),
      middle:document.querySelector('[data-aurora-ring="middle"]'),
      inner:document.querySelector('[data-aurora-ring="inner"]')
    };
    const statusEls={
      outer:document.querySelector('[data-aurora-status="outer"]'),
      middle:document.querySelector('[data-aurora-status="middle"]'),
      inner:document.querySelector('[data-aurora-status="inner"]')
    };
    const order=['outer','middle','inner'];
    const labels={outer:'Outer',middle:'Middle',inner:'Inner'};
    const angles={outer:132,middle:-84,inner:164};
    const baseSpeeds={outer:62,middle:-84,inner:126};
    const captureWindows={outer:24,middle:18,inner:11};
    const readyWindows={outer:38,middle:30,inner:24};
    const pulseSizes={outer:'91%',middle:'60%',inner:'34%'};
    const locked={outer:false,middle:false,inner:false};
    const desyncVelocity={outer:0,middle:0,inner:0};
    const reduced=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const speedScale=reduced ? .72 : 1;

    let activeIndex=0;
    let pointerId=null;
    let braking=false;
    let brakeFactor=1;
    let finished=false;
    let raf=0;
    let lastTs=0;
    let completionTimer=0;
    const feedbackTimers=[];

    const normalise=a=>((a%360)+360)%360;
    const signed=a=>{const n=normalise(a);return n>180?n-360:n;};
    const activeKey=()=>order[activeIndex]||null;

    function renderRing(key){
      ringEls[key].style.setProperty('--aurora-rotation',`${angles[key]}deg`);
    }

    function setStatus(key,mode){
      const el=statusEls[key];
      if(!el)return;
      el.classList.toggle('active',mode==='active');
      el.classList.toggle('locked',mode==='locked');
      el.classList.toggle('tracking',mode==='tracking');
      const small=el.querySelector('small');
      if(!small)return;
      if(mode==='locked') small.textContent='Locked ✓';
      else if(mode==='active') small.textContent=key==='inner'?'Hold to brake':'Tap to capture';
      else small.textContent='Tracking';
    }

    function updateStage(){
      const active=activeKey();
      order.forEach((key,i)=>{
        const mode=locked[key]?'locked':i===activeIndex?'active':'tracking';
        setStatus(key,mode);
        ringEls[key].classList.toggle('active',mode==='active');
        ringEls[key].classList.toggle('tracking',mode==='tracking');
      });
      if(active){
        stateEl.textContent=active==='inner'?'Inner ring active. Press and hold to brake it into the North Pole axis.':`${labels[active]} ring active. Tap when its marker reaches the North Pole axis.`;
      }
    }

    function fireInwardPulse(key){
      if(!pulseEl)return;
      pulseEl.style.setProperty('--pulse-size',pulseSizes[key]);
      pulseEl.classList.remove('fire');
      void pulseEl.offsetWidth;
      pulseEl.classList.add('fire');
    }

    function clearMomentClass(el,className,delay){
      if(!el)return;
      el.classList.remove(className);
      void el.offsetWidth;
      el.classList.add(className);
      feedbackTimers.push(setTimeout(()=>el.classList.remove(className),delay));
    }

    function finishSequence(){
      finished=true;
      braking=false;
      brakeFactor=1;
      dial.classList.remove('capture-ready','braking','miss');
      releasePointer();
      dial.classList.add('complete');
      if(north) north.classList.add('complete');
      order.forEach(key=>ringEls[key].classList.add('final-surge'));
      if(finalWave){
        finalWave.classList.remove('fire');
        void finalWave.offsetWidth;
        finalWave.classList.add('fire');
      }
      stateEl.textContent='Navigation route locked to the North Pole.';
      ping(1090,.13,.04);
      feedbackTimers.push(setTimeout(()=>ping(1370,.18,.05),260));
      haptic([32,20,68]);
      completionTimer=setTimeout(()=>showCompletion('North Pole Signal Locked','The North Pole navigation signal has been locked and Santa-1 has a route home.'),2800);
    }

    function lockRing(key){
      if(finished||locked[key]||key!==activeKey())return;
      angles[key]=0;
      renderRing(key);
      locked[key]=true;
      ringEls[key].classList.remove('near-lock','braking','active','miss');
      ringEls[key].classList.add('locked');
      clearMomentClass(ringEls[key],'lock-burst',620);
      dial.classList.remove('capture-ready','braking','miss');
      fireInwardPulse(key);

      const charge=order.filter(k=>locked[k]).length;
      dial.dataset.charge=String(charge);
      setStatus(key,'locked');
      ping(700+(charge-1)*145,.09,.03+charge*.004);
      haptic(charge===3?[24,18,50]:[18,15,34]);

      activeIndex++;
      if(activeIndex>=order.length){
        feedbackTimers.push(setTimeout(finishSequence,360));
      }else{
        updateStage();
        const next=activeKey();
        clearMomentClass(ringEls[next],'wake',520);
      }
    }

    function missCapture(key){
      const kick={outer:210,middle:290,inner:380}[key]||240;
      const direction=Math.sign(baseSpeeds[key]||1);
      desyncVelocity[key]+=direction*kick;
      ringEls[key].classList.remove('desync');
      dial.classList.remove('desync');
      void ringEls[key].offsetWidth;
      ringEls[key].classList.add('desync');
      dial.classList.add('desync');
      clearMomentClass(ringEls[key],'miss',260);
      clearMomentClass(dial,'miss',260);
      feedbackTimers.push(setTimeout(()=>ringEls[key].classList.remove('desync'),key==='inner'?300:240));
      feedbackTimers.push(setTimeout(()=>dial.classList.remove('desync'),220));
      stateEl.textContent=`${labels[key]} ring passed the capture window. Keep watching the North Pole axis.`;
      ping(key==='inner'?245:285,.045,.014);
      haptic(key==='inner'?[10,18,8]:8);
    }

    function tryCapture(){
      const key=activeKey();
      if(!key||finished)return false;
      const offset=Math.abs(signed(angles[key]));
      if(offset<=captureWindows[key]){
        lockRing(key);
        return true;
      }
      missCapture(key);
      return false;
    }

    function updateReadiness(){
      const key=activeKey();
      let ready=false;
      order.forEach(k=>ringEls[k].classList.remove('near-lock'));
      if(key&&!finished){
        const offset=Math.abs(signed(angles[key]));
        ready=offset<=readyWindows[key];
        ringEls[key].classList.toggle('near-lock',ready);
      }
      dial.classList.toggle('capture-ready',ready);
      if(north) north.classList.toggle('capture-ready',ready);
    }

    function frame(ts){
      if(!lastTs)lastTs=ts;
      const dt=Math.min(.05,(ts-lastTs)/1000||0);
      lastTs=ts;

      if(!finished){
        const active=activeKey();
        const targetBrake=active==='inner'&&braking ? .17 : 1;
        brakeFactor+=(targetBrake-brakeFactor)*Math.min(1,dt*7.5);

        order.forEach(key=>{
          if(locked[key])return;
          let speed=baseSpeeds[key]*speedScale;
          if(key==='inner') speed*=1+.12*Math.sin(ts/620);
          if(key==='inner'&&active==='inner') speed*=brakeFactor;
          speed+=desyncVelocity[key];
          angles[key]+=speed*dt;
          desyncVelocity[key]*=Math.exp(-dt*11.5);
          if(Math.abs(desyncVelocity[key])<.5)desyncVelocity[key]=0;
          renderRing(key);
        });
        updateReadiness();

        if(active==='inner'&&braking&&Math.abs(signed(angles.inner))<=captureWindows.inner){
          lockRing('inner');
        }
      }
      if(!finished)raf=requestAnimationFrame(frame);
    }

    function releasePointer(){
      if(pointerId===null)return;
      try{dial.releasePointerCapture(pointerId);}catch{}
      pointerId=null;
    }

    dial.addEventListener('pointerdown',e=>{
      if(finished||pointerId!==null)return;
      const key=activeKey();
      if(!key)return;
      e.preventDefault();
      pointerId=e.pointerId;
      try{dial.setPointerCapture(pointerId);}catch{}
      if(key==='inner'){
        braking=true;
        dial.classList.add('braking');
        ringEls.inner.classList.add('braking');
        statusEls.inner.querySelector('small').textContent='Braking · hold';
        stateEl.textContent='Inner ring braking. Hold until the marker reaches the North Pole axis.';
      }else{
        dial.classList.add('pressed');
      }
    });

    dial.addEventListener('pointerup',e=>{
      if(e.pointerId!==pointerId)return;
      const key=activeKey();
      if(key==='inner'){
        braking=false;
        dial.classList.remove('braking');
        ringEls.inner.classList.remove('braking');
        if(!finished&&!tryCapture())setStatus('inner','active');
      }else if(key){
        tryCapture();
      }
      dial.classList.remove('pressed');
      releasePointer();
    });

    dial.addEventListener('pointercancel',e=>{
      if(e.pointerId!==pointerId)return;
      braking=false;
      dial.classList.remove('braking','pressed');
      if(ringEls.inner)ringEls.inner.classList.remove('braking');
      if(activeKey())setStatus(activeKey(),'active');
      releasePointer();
    });

    dial.addEventListener('keydown',e=>{
      if(finished||e.repeat||!['Enter',' '].includes(e.key))return;
      e.preventDefault();
      const key=activeKey();
      if(key==='inner'){
        braking=true;
        dial.classList.add('braking');
        ringEls.inner.classList.add('braking');
        setStatus('inner','active');
      }else tryCapture();
    });

    dial.addEventListener('keyup',e=>{
      if(finished||!['Enter',' '].includes(e.key)||activeKey()!=='inner')return;
      e.preventDefault();
      braking=false;
      dial.classList.remove('braking');
      ringEls.inner.classList.remove('braking');
      if(!tryCapture())setStatus('inner','active');
    });

    order.forEach(renderRing);
    updateStage();
    updateReadiness();
    raf=requestAnimationFrame(frame);

    cleanupMission=()=>{
      cancelAnimationFrame(raf);
      clearTimeout(completionTimer);
      feedbackTimers.forEach(clearTimeout);
      braking=false;
      releasePointer();
    };
  }

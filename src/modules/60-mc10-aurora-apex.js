  function bindAurora(){
    const dial=document.getElementById('auroraDial');
    const panel=dial?.closest('.aurora-panel');
    const stateEl=document.getElementById('auroraState');
    const lockWave=document.getElementById('auroraLockWave');
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
    if(!dial||!panel||!stateEl)return;

    const order=['outer','middle','inner'];
    const labels={outer:'Outer',middle:'Middle',inner:'Inner'};
    const rotations={outer:112,middle:-96,inner:148};
    const locked={outer:false,middle:false,inner:false};
    const ringCenters={outer:.785,middle:.485,inner:.275};
    const config={
      outer:{dragScale:1,snap:14,magnet:4,coast:0,wave:'91%'},
      middle:{dragScale:-.88,snap:12,magnet:4,coast:.92,wave:'60%'},
      inner:{dragScale:1.28,snap:9,magnet:3,coast:.78,wave:'34%'}
    };
    const idleCopy={outer:'Align to lock',middle:'Counter-rotate · align',inner:'Precision align'};
    let selected='outer';
    let active=null;
    let pointerId=null;
    let lastPointerAngle=0;
    let lastMoveAt=0;
    let angularVelocity=0;
    let coastRaf=0;
    let completionTimer=0;
    let finished=false;
    const nearPinged={outer:false,middle:false,inner:false};

    const normalise=a=>((a%360)+360)%360;
    const signed=a=>{const n=normalise(a);return n>180?n-360:n;};
    const angleForEvent=e=>{
      const r=dial.getBoundingClientRect();
      const cx=r.left+r.width/2,cy=r.top+r.height/2;
      return Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI;
    };
    function renderRing(key){
      ringEls[key].style.setProperty('--aurora-rotation',`${rotations[key]}deg`);
    }
    function radiusForEvent(e){
      const r=dial.getBoundingClientRect();
      const cx=r.left+r.width/2,cy=r.top+r.height/2;
      return Math.hypot(e.clientX-cx,e.clientY-cy)/(Math.min(r.width,r.height)/2);
    }
    function ringFromPoint(e){
      const radius=radiusForEvent(e);
      if(radius<.29||radius>1.02)return null;
      const candidates=order.filter(k=>!locked[k]);
      if(!candidates.length)return null;
      return candidates.reduce((best,key)=>Math.abs(radius-ringCenters[key])<Math.abs(radius-ringCenters[best])?key:best,candidates[0]);
    }
    function nextUnlocked(){return order.find(k=>!locked[k]);}
    function smallCopy(key){
      if(locked[key])return 'Locked ✓';
      if(key!==selected)return idleCopy[key];
      if(key==='middle')return 'Selected · counter-rotate';
      if(key==='inner')return 'Selected · precision';
      return 'Selected · align';
    }
    function refreshStatuses(){
      order.forEach(key=>{
        ringEls[key].classList.toggle('selected',key===selected&&!locked[key]);
        statusEls[key].classList.toggle('selected',key===selected&&!locked[key]);
        statusEls[key].querySelector('small').textContent=smallCopy(key);
      });
    }
    function setSelected(key){
      if(!key||locked[key]||finished)return;
      selected=key;
      refreshStatuses();
      const instruction=key==='middle'?'Counter-rotate the middle ring into alignment.':key==='inner'?'Fine-align the inner ring to complete the vector.':`${labels[key]} ring awaiting alignment.`;
      stateEl.textContent=instruction;
    }
    function pulseLock(key){
      if(!lockWave)return;
      lockWave.style.setProperty('--aurora-wave-size',config[key].wave);
      lockWave.classList.remove('active');
      void lockWave.offsetWidth;
      lockWave.classList.add('active');
    }
    function updateLockStage(){
      const count=order.filter(k=>locked[k]).length;
      panel.classList.remove('aurora-stage-1','aurora-stage-2','aurora-stage-3');
      if(count)panel.classList.add(`aurora-stage-${count}`);
      panel.style.setProperty('--aurora-lock-progress',String(count));
    }
    function finalPayoff(){
      finished=true;
      dial.classList.add('complete');
      panel.classList.add('aurora-route-locked');
      stateEl.textContent='North Pole vector locked. Aurora route established.';
      ping(1040,.14,.04);
      setTimeout(()=>ping(1320,.12,.036),150);
      setTimeout(()=>ping(1620,.18,.04),330);
      haptic([30,18,45,18,85]);
      completionTimer=setTimeout(()=>showCompletion('North Pole Vector Locked','Aurora route established.'),2300);
    }
    function lockRing(key){
      if(locked[key]||finished)return;
      rotations[key]=0;
      renderRing(key);
      locked[key]=true;
      nearPinged[key]=false;
      ringEls[key].classList.remove('selected','dragging','near-lock');
      ringEls[key].classList.add('locked','lock-flash');
      setTimeout(()=>ringEls[key]?.classList.remove('lock-flash'),560);
      statusEls[key].classList.remove('selected');
      statusEls[key].classList.add('locked');
      statusEls[key].querySelector('small').textContent='Locked ✓';
      pulseLock(key);
      updateLockStage();
      const index=order.indexOf(key);
      ping(690+index*120,.09,.026+index*.004);
      haptic(index===2?[22,18,52]:[16,14,34]);
      const next=nextUnlocked();
      if(next)setSelected(next);
      if(order.every(k=>locked[k]))finalPayoff();
    }
    function updateNearLock(key){
      const offset=Math.abs(signed(rotations[key]));
      const near=offset<=18;
      ringEls[key].classList.toggle('near-lock',near);
      if(near&&!nearPinged[key]){
        nearPinged[key]=true;
        ping(430+order.indexOf(key)*38,.035,.01);
      }else if(offset>24){
        nearPinged[key]=false;
      }
      return offset;
    }
    function stopCoast(){
      if(coastRaf){cancelAnimationFrame(coastRaf);coastRaf=0;}
    }
    function coastRing(key,startVelocity){
      stopCoast();
      const coast=config[key].coast;
      if(!coast||Math.abs(startVelocity)<.035){setSelected(key);return;}
      let velocity=Math.max(-.18,Math.min(.18,startVelocity))*coast;
      let last=performance.now();
      const started=last;
      ringEls[key].classList.add('coasting');
      const step=now=>{
        if(finished||locked[key]){ringEls[key].classList.remove('coasting');coastRaf=0;return;}
        const dt=Math.min(34,Math.max(8,now-last));
        last=now;
        rotations[key]+=velocity*dt;
        renderRing(key);
        const offset=updateNearLock(key);
        if(offset<=config[key].magnet){
          ringEls[key].classList.remove('coasting');
          coastRaf=0;
          lockRing(key);
          return;
        }
        velocity*=Math.pow(.84,dt/16.67);
        if(Math.abs(velocity)<.018||now-started>360){
          ringEls[key].classList.remove('coasting');
          coastRaf=0;
          setSelected(key);
          return;
        }
        coastRaf=requestAnimationFrame(step);
      };
      coastRaf=requestAnimationFrame(step);
    }
    function endDrag(){
      if(pointerId===null)return;
      try{dial.releasePointerCapture(pointerId);}catch{}
      if(active){
        const key=active;
        ringEls[key].classList.remove('dragging');
        const offset=Math.abs(signed(rotations[key]));
        if(offset<=config[key].snap)lockRing(key);
        else coastRing(key,angularVelocity);
      }
      active=null;
      pointerId=null;
      angularVelocity=0;
    }

    dial.addEventListener('pointerdown',e=>{
      if(finished)return;
      stopCoast();
      const direct=ringFromPoint(e);
      const key=direct||selected||nextUnlocked();
      if(!key||locked[key])return;
      e.preventDefault();
      setSelected(key);
      active=key;
      pointerId=e.pointerId;
      lastPointerAngle=angleForEvent(e);
      lastMoveAt=performance.now();
      angularVelocity=0;
      dial.setPointerCapture(e.pointerId);
      ringEls[key].classList.add('dragging');
      stateEl.textContent=`${labels[key]} ring aligning.`;
    });
    dial.addEventListener('pointermove',e=>{
      if(!active||e.pointerId!==pointerId)return;
      e.preventDefault();
      const now=performance.now();
      const nextAngle=angleForEvent(e);
      const rawDelta=signed(nextAngle-lastPointerAngle);
      const delta=rawDelta*config[active].dragScale;
      const dt=Math.max(8,now-lastMoveAt);
      lastPointerAngle=nextAngle;
      lastMoveAt=now;
      angularVelocity=delta/dt;
      rotations[active]+=delta;
      renderRing(active);
      const offset=updateNearLock(active);
      if(offset<=config[active].magnet){
        const key=active;
        try{dial.releasePointerCapture(pointerId);}catch{}
        active=null;
        pointerId=null;
        angularVelocity=0;
        lockRing(key);
      }
    });
    dial.addEventListener('pointerup',endDrag);
    dial.addEventListener('pointercancel',endDrag);

    document.querySelectorAll('[data-aurora-select]').forEach(btn=>{
      btn.addEventListener('click',()=>setSelected(btn.dataset.auroraSelect));
      btn.addEventListener('keydown',e=>{
        const key=btn.dataset.auroraSelect;
        if(locked[key]||finished)return;
        if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
          e.preventDefault();
          stopCoast();
          setSelected(key);
          rotations[key]+=e.key==='ArrowLeft'?-8:8;
          renderRing(key);
          const offset=updateNearLock(key);
          if(offset<=config[key].snap)lockRing(key);
        }
      });
    });

    Object.keys(ringEls).forEach(renderRing);
    updateLockStage();
    setSelected('outer');
    cleanupMission=()=>{
      stopCoast();
      if(completionTimer)clearTimeout(completionTimer);
    };
  }

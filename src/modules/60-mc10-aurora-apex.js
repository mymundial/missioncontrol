  function bindAurora(){
    const dial=document.getElementById('auroraDial');
    const orb=document.getElementById('auroraOrb');
    const panel=dial?.closest('.aurora-panel');
    const prompt=document.getElementById('auroraGuidePrompt');
    const stateEl=document.getElementById('auroraState');
    const lockCopy=document.getElementById('auroraLockCopy');
    if(!dial||!orb||!stateEl) return;

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
    const thresholds=[315,625,900];
    const radii=[.405,.275,.155,.018];
    const trailEls=Array.from(dial.querySelectorAll('.aurora-trail-dot'));
    const trailHistory=[];
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timers=[];

    let raf=0;
    let pointerId=null;
    let dragging=false;
    let started=false;
    let finished=false;
    let stage=0;
    let angle=-62;
    let angularVelocity=18;
    let travel=0;
    let lastPointerAngle=0;
    let last=performance.now();
    let trailTick=0;

    const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
    const normalise=a=>((a%360)+360)%360;
    const signed=a=>{const n=normalise(a);return n>180?n-360:n;};
    const ease=p=>.5-Math.cos(Math.PI*clamp(p,0,1))*.5;
    const delay=(fn,ms)=>{const id=setTimeout(fn,ms);timers.push(id);return id;};

    function angleForEvent(e){
      const r=dial.getBoundingClientRect();
      const cx=r.left+r.width/2;
      const cy=r.top+r.height/2;
      return Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI;
    }
    function radiusForTravel(value){
      if(value<=thresholds[0]){
        const p=ease(value/thresholds[0]);
        return radii[0]+(radii[1]-radii[0])*p;
      }
      if(value<=thresholds[1]){
        const p=ease((value-thresholds[0])/(thresholds[1]-thresholds[0]));
        return radii[1]+(radii[2]-radii[1])*p;
      }
      const p=ease((value-thresholds[1])/(thresholds[2]-thresholds[1]));
      return radii[2]+(radii[3]-radii[2])*p;
    }
    function pointFor(angleDeg,radius){
      const radians=angleDeg*Math.PI/180;
      return {
        x:50+Math.cos(radians)*radius*100,
        y:50+Math.sin(radians)*radius*100
      };
    }
    function renderTrail(point){
      if(reduced){
        trailEls.forEach(el=>el.style.opacity='0');
        return;
      }
      trailTick++;
      if(trailTick%2===0){
        trailHistory.unshift(point);
        if(trailHistory.length>trailEls.length*2) trailHistory.length=trailEls.length*2;
      }
      trailEls.forEach((el,i)=>{
        const p=trailHistory[Math.min(trailHistory.length-1,i*2)];
        if(!p){el.style.opacity='0';return;}
        el.style.left=`${p.x}%`;
        el.style.top=`${p.y}%`;
        el.style.opacity=`${Math.max(.04,.5-i*.055)}`;
        el.style.transform=`translate(-50%,-50%) scale(${Math.max(.24,1-i*.085)})`;
      });
    }
    function renderOrb(){
      const radius=finished?0:radiusForTravel(travel);
      const point=finished?{x:50,y:50}:pointFor(angle,radius);
      orb.style.left=`${point.x}%`;
      orb.style.top=`${point.y}%`;
      const speedGlow=clamp(Math.abs(angularVelocity)/330,.2,1);
      orb.style.setProperty('--aurora-orb-glow',`${12+speedGlow*10}px`);
      orb.style.setProperty('--aurora-orb-glow-wide',`${24+speedGlow*16}px`);
      renderTrail(point);
    }
    function setStatus(index,state){
      const key=order[index];
      const el=statusEls[key];
      if(!el) return;
      el.classList.toggle('active',state==='active');
      el.classList.toggle('locked',state==='locked');
      const small=el.querySelector('small');
      if(small) small.textContent=state==='locked'?'ROUTED':state==='active'?'GUIDING':'STANDBY';
    }
    function activateStage(index){
      order.forEach((_,i)=>setStatus(i,i<index?'locked':i===index?'active':'standby'));
      dial.dataset.stage=String(index+1);
      stateEl.textContent=`${order[index][0].toUpperCase()+order[index].slice(1)} aurora route active.`;
    }
    function crossStage(index){
      const key=order[index];
      ringEls[key]?.classList.add('energised');
      setStatus(index,'locked');
      dial.classList.remove('route-pulse');
      void dial.offsetWidth;
      dial.classList.add('route-pulse');
      delay(()=>dial.classList.remove('route-pulse'),480);
      ping(690+index*120,.095,.035+index*.006);
      haptic(index===2?[24,18,48]:[14,12,24]);
      stage=index+1;
      if(stage<order.length) activateStage(stage);
    }
    function finishRoute(){
      if(finished) return;
      finished=true;
      dragging=false;
      angularVelocity=0;
      travel=thresholds[2];
      order.forEach((_,i)=>setStatus(i,'locked'));
      dial.dataset.stage='4';
      dial.classList.add('route-locked');
      panel?.classList.add('route-locked');
      stateEl.textContent='Aurora route locked. North Pole vector established.';
      renderOrb();
      ping(930,.11,.045);
      delay(()=>ping(1160,.15,.05),180);
      delay(()=>ping(1390,.22,.055),420);
      haptic([28,22,70]);
      const hold=reduced?1900:3200;
      delay(()=>showCompletion('Aurora Route Locked','North Pole navigation vector established. Santa-1 now has a confirmed route home.'),hold);
    }
    function advanceStages(){
      while(stage<order.length&&travel>=thresholds[stage]){
        crossStage(stage);
        if(stage===order.length){finishRoute();break;}
      }
    }
    function startGuidance(){
      if(started) return;
      started=true;
      dial.classList.add('is-live');
      prompt?.classList.add('is-hidden');
      activateStage(0);
      stateEl.textContent='Outer aurora route active. Swipe around the vortex to guide the charge inward.';
      ping(540,.07,.024);
    }
    function applyImpulse(delta){
      if(!delta||finished) return;
      startGuidance();
      const capped=clamp(delta,-24,24);
      angularVelocity=clamp(angularVelocity+capped*7.8,-390,390);
      if(Math.abs(angularVelocity)<72) angularVelocity=(angularVelocity<0?-1:1)*72;
      dial.classList.toggle('is-counter',angularVelocity<0);
    }
    function tick(now){
      const dt=Math.min(34,Math.max(0,now-last));
      last=now;
      if(!finished){
        if(started){
          const decay=dragging?.997:.986;
          angularVelocity*=Math.pow(decay,dt/16.67);
          if(Math.abs(angularVelocity)<7) angularVelocity=0;
          angle+=angularVelocity*dt/1000;
          if(Math.abs(angularVelocity)>6){
            travel=Math.min(thresholds[2],travel+Math.abs(angularVelocity)*dt/1000);
            advanceStages();
          }
        }else{
          angle+=18*dt/1000;
        }
        renderOrb();
      }
      raf=requestAnimationFrame(tick);
    }
    function onPointerDown(e){
      if(finished) return;
      e.preventDefault();
      pointerId=e.pointerId;
      dragging=true;
      lastPointerAngle=angleForEvent(e);
      try{dial.setPointerCapture(pointerId);}catch{}
      try{dial.focus({preventScroll:true});}catch{dial.focus();}
      startGuidance();
      dial.classList.add('is-guiding');
    }
    function onPointerMove(e){
      if(!dragging||e.pointerId!==pointerId||finished) return;
      e.preventDefault();
      const next=angleForEvent(e);
      const delta=signed(next-lastPointerAngle);
      lastPointerAngle=next;
      if(Math.abs(delta)>.45) applyImpulse(delta);
    }
    function endPointer(e){
      if(e&&pointerId!==null&&e.pointerId!==pointerId) return;
      dragging=false;
      dial.classList.remove('is-guiding');
      if(pointerId!==null){try{dial.releasePointerCapture(pointerId);}catch{}}
      pointerId=null;
    }
    function onKeyDown(e){
      if(finished) return;
      if(!['ArrowLeft','ArrowRight','a','A','d','D',' '].includes(e.key)) return;
      e.preventDefault();
      const direction=['ArrowLeft','a','A'].includes(e.key)?-1:1;
      applyImpulse(direction*14);
    }

    activateStage(0);
    renderOrb();
    dial.addEventListener('pointerdown',onPointerDown,{passive:false});
    dial.addEventListener('pointermove',onPointerMove,{passive:false});
    dial.addEventListener('pointerup',endPointer);
    dial.addEventListener('pointercancel',endPointer);
    dial.addEventListener('keydown',onKeyDown);
    raf=requestAnimationFrame(tick);

    cleanupMission=()=>{
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      dial.removeEventListener('pointerdown',onPointerDown);
      dial.removeEventListener('pointermove',onPointerMove);
      dial.removeEventListener('pointerup',endPointer);
      dial.removeEventListener('pointercancel',endPointer);
      dial.removeEventListener('keydown',onKeyDown);
    };
  }

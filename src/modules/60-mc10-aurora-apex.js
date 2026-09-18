  function bindAurora(){
    const dial=document.getElementById('auroraDial');
    const stateEl=document.getElementById('auroraState');
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
    const rotations={outer:112,middle:-96,inner:148};
    const locked={outer:false,middle:false,inner:false};
    const ringCenters={outer:.785,middle:.485,inner:.275};
    let selected='outer';
    let active=null;
    let pointerId=null;
    let lastPointerAngle=0;
    let finished=false;

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
    function setSelected(key){
      if(!key||locked[key])return;
      selected=key;
      order.forEach(k=>{
        ringEls[k].classList.toggle('selected',k===key&&!locked[k]);
        statusEls[k].classList.toggle('selected',k===key&&!locked[k]);
        const small=statusEls[k].querySelector('small');
        if(!locked[k]) small.textContent=k===key?'Selected · align':'Align to lock';
      });
      stateEl.textContent=`${labels[key]} ring awaiting alignment.`;
    }
    function lockRing(key){
      if(locked[key])return;
      rotations[key]=0;renderRing(key);locked[key]=true;
      ringEls[key].classList.remove('selected','dragging','near-lock');
      ringEls[key].classList.add('locked');
      statusEls[key].classList.remove('selected');
      statusEls[key].classList.add('locked');
      statusEls[key].querySelector('small').textContent='Locked ✓';
      ping(720+order.indexOf(key)*95,.08,.025);haptic([18,18,42]);
      const next=nextUnlocked();
      if(next)setSelected(next);
      if(order.every(k=>locked[k])){
        finished=true;dial.classList.add('complete');
        stateEl.textContent='North Pole navigation locked.';
        ping(1040,.14,.045);haptic([30,22,70]);
        setTimeout(()=>showCompletion('North Pole Signal Locked',''),850);
      }
    }
    function endDrag(e){
      if(pointerId===null)return;
      try{dial.releasePointerCapture(pointerId);}catch{}
      if(active){
        ringEls[active].classList.remove('dragging');
        if(Math.abs(signed(rotations[active]))<=14)lockRing(active);
        else setSelected(active);
      }
      active=null;pointerId=null;
    }
    dial.addEventListener('pointerdown',e=>{
      if(finished)return;
      const direct=ringFromPoint(e);
      const key=direct||selected||nextUnlocked();
      if(!key||locked[key])return;
      e.preventDefault();
      setSelected(key);
      active=key;pointerId=e.pointerId;lastPointerAngle=angleForEvent(e);
      dial.setPointerCapture(e.pointerId);
      ringEls[key].classList.add('dragging');
      stateEl.textContent=`${labels[key]} ring aligning.`;
    });
    dial.addEventListener('pointermove',e=>{
      if(!active||e.pointerId!==pointerId)return;
      e.preventDefault();
      const nextAngle=angleForEvent(e);
      const delta=signed(nextAngle-lastPointerAngle);
      lastPointerAngle=nextAngle;
      rotations[active]+=delta;
      renderRing(active);
      const offset=Math.abs(signed(rotations[active]));
      ringEls[active].classList.toggle('near-lock',offset<=18);
      if(offset<=4){
        lockRing(active);
        try{dial.releasePointerCapture(pointerId);}catch{}
        active=null;pointerId=null;
      }
    });
    dial.addEventListener('pointerup',endDrag);
    dial.addEventListener('pointercancel',endDrag);
    document.querySelectorAll('[data-aurora-select]').forEach(btn=>{
      btn.addEventListener('click',()=>setSelected(btn.dataset.auroraSelect));
      btn.addEventListener('keydown',e=>{
        const key=btn.dataset.auroraSelect;
        if(locked[key])return;
        if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
          e.preventDefault();setSelected(key);
          rotations[key]+=e.key==='ArrowLeft'?-8:8;renderRing(key);
          if(Math.abs(signed(rotations[key]))<=14)lockRing(key);
        }
      });
    });
    Object.keys(ringEls).forEach(renderRing);
    setSelected('outer');
    cleanupMission=()=>{};
  }


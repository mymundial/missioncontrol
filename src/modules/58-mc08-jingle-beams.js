  function bindJingle(){
    let level=1;
    let x=0;
    let dir=1;
    let last=performance.now();
    let raf=0;
    let feedbackTimer=0;
    const st=document.getElementById('jingleState');
    const btn=document.getElementById('syncPulse');
    // End-to-end chamber crossing times: ~1.6s, 1.25s and 0.95s.
    const speeds=[0,0.0625,0.08,0.105];
    const labels=['','calibration speed','sync speed','precision speed'];
    const targetMin=42;
    const targetMax=58;

    function dotFor(n){return document.querySelector(`[data-pulse-dot="${n}"]`);}
    function trailFor(n){return document.querySelector(`[data-pulse-trail="${n}"]`);}
    function stageFor(n){return document.querySelector(`[data-jingle-stage="${n}"]`);}
    function statusFor(n){return document.querySelector(`[data-jingle-status="${n}"]`);}
    function progressFor(n){return document.querySelector(`[data-jingle-progress="${n}"]`);}

    function setPulsePosition(n,value){
      const dot=dotFor(n);
      const trail=trailFor(n);
      if(dot) dot.style.left=value+'%';
      if(trail) trail.style.setProperty('--pulse-x',value+'%');
    }

    function tick(now){
      const dt=Math.min(32,now-last); last=now;
      x+=dir*speeds[level]*dt;
      if(x>100){x=100;dir=-1}else if(x<0){x=0;dir=1}
      setPulsePosition(level,x);
      raf=requestAnimationFrame(tick);
    }
    raf=requestAnimationFrame(tick);
    cleanupMission=()=>{cancelAnimationFrame(raf);clearTimeout(feedbackTimer);};

    function flashMiss(stage,status,kind){
      clearTimeout(feedbackTimer);
      stage?.classList.remove('early','late');
      void stage?.offsetWidth;
      stage?.classList.add(kind);
      if(status) status.textContent=kind==='early'?'Early':'Late';
      st.textContent=kind==='early'?'Early · hold for the sync gate':'Late · catch the next pass';
      haptic([18,22,18]);
      ping(220,.055,.02);
      feedbackTimer=setTimeout(()=>{
        stage?.classList.remove('early','late');
        if(status) status.textContent='Armed';
        if(level<=3) st.textContent=`Pulse ${level} · ${labels[level]}`;
      },520);
    }

    btn.onclick=()=>{
      const stage=stageFor(level);
      const status=statusFor(level);
      if(x>=targetMin&&x<=targetMax){
        ping(820+level*100,.09,.04); haptic([22,25,45]);
        const dot=dotFor(level);
        const trail=trailFor(level);
        const progress=progressFor(level);
        stage?.classList.remove('active','standby','early','late');
        stage?.classList.add('locked','bursting');
        if(dot){ dot.classList.remove('active'); dot.classList.add('locked'); }
        if(trail){ trail.classList.remove('active'); trail.classList.add('locked'); }
        if(status) status.textContent='Locked';
        progress?.classList.remove('active','pending');
        progress?.classList.add('locked');
        setTimeout(()=>stage?.classList.remove('bursting'),460);

        if(level===3){
          cancelAnimationFrame(raf);
          btn.disabled=true;
          st.textContent='Propulsion sequence complete';
          btn.classList.add('complete');
          btn.querySelector('span').textContent='Propulsion Locked';
          setTimeout(()=>showCompletion('Propulsion Synchronised','All three moving propulsion pulses have been locked into the target flight zone.'),620);
          return;
        }

        level++;
        x=0;
        dir=1;
        const nextStage=stageFor(level);
        const nextDot=dotFor(level);
        const nextTrail=trailFor(level);
        const nextStatus=statusFor(level);
        const nextProgress=progressFor(level);
        nextStage?.classList.remove('standby');
        nextStage?.classList.add('active');
        nextDot?.classList.add('active');
        nextTrail?.classList.add('active');
        setPulsePosition(level,0);
        if(nextStatus) nextStatus.textContent='Armed';
        nextProgress?.classList.remove('pending');
        nextProgress?.classList.add('active');
        st.textContent=`Pulse ${level} · ${labels[level]}`;
      }else{
        flashMiss(stage,status,x<targetMin?'early':'late');
      }
    };
  }

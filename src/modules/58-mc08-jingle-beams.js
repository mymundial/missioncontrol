  function bindJingle(){
    let level=1;
    let x=0;
    let dir=1;
    let last=performance.now();
    let raf=0;
    let feedbackTimer=0;
    let advanceTimer=0;
    const panel=document.getElementById('jinglePanel');
    const st=document.getElementById('jingleState');
    const btn=document.getElementById('syncPulse');

    // Each channel is quicker and less forgiving than the last.
    const speeds=[0,0.058,0.076,0.10];
    const windows=[null,[40,60],[43,57],[46,54]];

    function dotFor(n){return document.querySelector(`[data-pulse-dot="${n}"]`);}
    function trailFor(n){return document.querySelector(`[data-pulse-trail="${n}"]`);}
    function stageFor(n){return document.querySelector(`[data-jingle-stage="${n}"]`);}
    function statusFor(n){return document.querySelector(`[data-jingle-status="${n}"]`);}

    function setPulsePosition(n,value){
      const dot=dotFor(n);
      const trail=trailFor(n);
      if(dot) dot.style.left=value+'%';
      if(trail) trail.style.setProperty('--pulse-x',value+'%');
    }

    function updateApproachCue(){
      const [min,max]=windows[level];
      const distance=x<min?min-x:(x>max?x-max:0);
      btn?.classList.toggle('approaching',distance<=11);
    }

    function tick(now){
      const dt=Math.min(32,now-last); last=now;
      x+=dir*speeds[level]*dt;
      if(x>100){x=100;dir=-1;}else if(x<0){x=0;dir=1;}
      setPulsePosition(level,x);
      updateApproachCue();
      raf=requestAnimationFrame(tick);
    }
    raf=requestAnimationFrame(tick);
    cleanupMission=()=>{
      cancelAnimationFrame(raf);
      clearTimeout(feedbackTimer);
      clearTimeout(advanceTimer);
    };

    function flashMiss(stage,status,kind){
      clearTimeout(feedbackTimer);
      stage?.classList.remove('early','late');
      void stage?.offsetWidth;
      stage?.classList.add(kind);
      if(status) status.textContent=kind==='early'?'EARLY':'LATE';
      st.textContent=kind==='early'?'EARLY · wait for the sync window':'LATE · catch the next pass';
      haptic([18,22,18]);
      ping(220,.05,.018);
      feedbackTimer=setTimeout(()=>{
        stage?.classList.remove('early','late');
        if(status) status.textContent='ARMED';
        if(level<=3) st.textContent=`Channel 0${level} · armed`;
      },430);
    }

    function armNext(){
      level++;
      x=0;
      dir=1;
      last=performance.now();
      const nextStage=stageFor(level);
      const nextDot=dotFor(level);
      const nextTrail=trailFor(level);
      const nextStatus=statusFor(level);
      nextStage?.classList.remove('standby');
      nextStage?.classList.add('active');
      nextDot?.classList.add('active');
      nextTrail?.classList.add('active');
      setPulsePosition(level,0);
      if(nextStatus) nextStatus.textContent='ARMED';
      st.textContent=`Channel 0${level} · armed`;
    }

    btn.onclick=()=>{
      const stage=stageFor(level);
      const status=statusFor(level);
      const [targetMin,targetMax]=windows[level];
      if(x>=targetMin&&x<=targetMax){
        const perfect=Math.abs(x-50)<=2.5;
        ping(perfect?1040:880+level*90,.085,.035);
        haptic(perfect?[18,18,48]:[22,25,42]);
        const dot=dotFor(level);
        const trail=trailFor(level);
        stage?.classList.remove('active','standby','early','late');
        stage?.classList.add('locked','bursting');
        if(dot){dot.classList.remove('active');dot.classList.add('locked');dot.style.left='50%';}
        if(trail){trail.classList.remove('active');trail.classList.add('locked');trail.style.setProperty('--pulse-x','50%');}
        if(status) status.textContent='LOCKED';
        btn.classList.remove('approaching');
        st.textContent=perfect?`PERFECT · Channel 0${level} locked`:`Channel 0${level} · locked`;
        setTimeout(()=>stage?.classList.remove('bursting'),380);

        if(level===3){
          cancelAnimationFrame(raf);
          btn.disabled=true;
          panel?.classList.add('all-locked');
          st.textContent='PROPULSION ONLINE';
          btn.querySelector('span').textContent='Propulsion Online';
          setTimeout(()=>ping(1120,.11,.035),180);
          setTimeout(()=>ping(1380,.14,.03),360);
          advanceTimer=setTimeout(()=>showCompletion('Propulsion Online','All three propulsion channels are synchronised and responding within flight parameters.'),1700);
          return;
        }

        advanceTimer=setTimeout(armNext,360);
      }else{
        flashMiss(stage,status,x<targetMin?'early':'late');
      }
    };
  }

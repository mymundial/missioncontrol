  function bindJingle(){
    let level=1;
    let x=0;
    let dir=1;
    let last=performance.now();
    let raf=0;
    const st=document.getElementById('jingleState');
    const btn=document.getElementById('syncPulse');
    const speeds=[0,0.035,0.08,0.11];
    const labels=['','calibration speed','sync speed','precision speed'];

    function dotFor(n){return document.querySelector(`[data-pulse-dot="${n}"]`);}
    function stageFor(n){return document.querySelector(`[data-jingle-stage="${n}"]`);}
    function statusFor(n){return document.querySelector(`[data-jingle-status="${n}"]`);}

    function tick(now){
      const dt=Math.min(32,now-last); last=now;
      x+=dir*speeds[level]*dt;
      if(x>100){x=100;dir=-1}else if(x<0){x=0;dir=1}
      const dot=dotFor(level);
      if(dot) dot.style.left=x+'%';
      raf=requestAnimationFrame(tick);
    }
    raf=requestAnimationFrame(tick);
    cleanupMission=()=>cancelAnimationFrame(raf);

    btn.onclick=()=>{
      if(x>=42&&x<=58){
        ping(820+level*100,.09,.04); haptic(25);
        const stage=stageFor(level);
        const dot=dotFor(level);
        const status=statusFor(level);
        stage?.classList.remove('active','standby');
        stage?.classList.add('locked');
        if(dot){ dot.classList.remove('active'); dot.classList.add('locked'); dot.style.left=x+'%'; }
        if(status) status.textContent='Locked';

        if(level===3){
          cancelAnimationFrame(raf);
          btn.disabled=true;
          st.textContent='All propulsion pulses locked';
          setTimeout(()=>showCompletion('Propulsion Synchronised','All three moving propulsion pulses have been locked into the target flight zone.'),420);
          return;
        }

        level++;
        x=0;
        dir=1;
        const nextStage=stageFor(level);
        const nextDot=dotFor(level);
        const nextStatus=statusFor(level);
        nextStage?.classList.remove('standby');
        nextStage?.classList.add('active');
        nextDot?.classList.add('active');
        if(nextDot) nextDot.style.left='0%';
        if(nextStatus) nextStatus.textContent='Armed';
        st.textContent=`Pulse ${level} · ${labels[level]}`;
      }else{
        st.textContent='Sync missed · retry';
        haptic([15,25,15]);
      }
    };
  }


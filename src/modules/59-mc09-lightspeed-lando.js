  function bindLando(){
    let round=1,armed=false,goTime=0,timers=[],running=false;
    const btn=document.getElementById('reactionBtn');
    const read=document.getElementById('reactionRead');
    const unit=document.getElementById('reactionUnit');
    const st=document.getElementById('landoState');
    const roundEl=document.getElementById('landoRound');
    const lamps=[...document.querySelectorAll('.lando-lamp')];
    const results=[...document.querySelectorAll('[data-lando-result]')];
    const clear=()=>{timers.forEach(clearTimeout);timers=[]};
    cleanupMission=clear;

    function activeRows(){return Math.min(round,4);}
    function setResultState(n,status,text){
      const el=results[n-1]; if(!el)return;
      el.className=`lando-result ${status}`;
      el.querySelector('span').textContent=text;
    }
    function resetLights(){lamps.forEach(l=>l.className='lando-lamp');}
    function lampsForColumn(col){
      const rows=activeRows();
      return lamps.filter(l=>Number(l.dataset.col)===col && Number(l.dataset.row)>=4-rows);
    }
    function start(){
      clear(); resetLights(); armed=false; running=true; goTime=0;
      read.textContent='READY'; unit.textContent='';
      roundEl.textContent=`ROUND ${round} / 4`;
      st.textContent='Lights building…';
      btn.textContent='WAIT FOR LIGHTS'; btn.disabled=false;
      setResultState(round,'active','ACTIVE');
      for(let col=0;col<5;col++){
        timers.push(setTimeout(()=>{
          lampsForColumn(col).forEach(l=>l.classList.add('red'));
          ping(250+col*28,.035,.01); haptic(8);
        },380+col*250));
      }
      const builtAt=380+4*250;
      const wait=builtAt+650+Math.random()*1050;
      timers.push(setTimeout(()=>{
        lamps.forEach(l=>l.classList.remove('red'));
        armed=true; running=true; goTime=performance.now();
        btn.textContent='REACT'; st.textContent='LIGHTS OUT';
        ping(920,.045,.028); haptic(18);
      },wait));
    }
    function capture(){
      const ms=Math.round(performance.now()-goTime);
      armed=false; running=false;
      lampsForColumn(0); // ensure round state is resolved before success flash
      for(let col=0;col<5;col++) lampsForColumn(col).forEach(l=>l.classList.add('green'));
      read.textContent=ms; unit.textContent='ms';
      st.textContent=ms<300?'Elite response captured':ms<500?'Strong response captured':'Response captured';
      setResultState(round,'complete',`${ms} ms`);
      haptic([20,20,45]); ping(760,.075,.03);
      if(round===4){
        btn.textContent='COMPLETE'; btn.disabled=true;
        timers.push(setTimeout(()=>showCompletion('Flight Control Calibrated',''),850));
      }else{
        const completedRound=round;
        round++;
        setResultState(round,'active','READY');
        btn.textContent='NEXT TEST';
        timers.push(setTimeout(()=>{
          lampsForColumn(0); // no-op for stable timing
        },200));
      }
    }
    btn.onclick=()=>{
      if(btn.textContent==='Start Test'||btn.textContent==='NEXT TEST'){start();return;}
      if(armed){capture();return;}
      if(running){
        clear(); running=false; armed=false; resetLights();
        read.textContent='JUMP START'; unit.textContent='';
        st.textContent='Too early · retry this round';
        btn.textContent='Start Test';
        setResultState(round,'active','RETRY');
        haptic([20,30,20]);
      }
    };
  }


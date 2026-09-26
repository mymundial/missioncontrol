  function bindLando(){
    let round=1,armed=false,goTime=0,timers=[],running=false;
    const btn=document.getElementById('reactionBtn');
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
      roundEl.textContent=`${round} / 4`;
      btn.textContent='WAIT…'; btn.disabled=false;
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
        btn.textContent='GO!';
        ping(920,.045,.028); haptic(18);
      },wait));
    }
    function capture(){
      const ms=Math.round(performance.now()-goTime);
      armed=false; running=false;
      for(let col=0;col<5;col++) lampsForColumn(col).forEach(l=>l.classList.add('green'));
      setResultState(round,'complete',`${ms} ms`);
      haptic([20,20,45]); ping(760,.075,.03);
      if(round===4){
        btn.textContent='COMPLETE'; btn.disabled=true;
        timers.push(setTimeout(()=>showCompletion('Flight Control Calibrated','Santa-1’s flight response has been calibrated for high-speed operation.'),850));
      }else{
        round++;
        roundEl.textContent=`${round} / 4`;
        setResultState(round,'active','READY');
        btn.textContent='NEXT TEST';
      }
    }
    btn.onclick=()=>{
      if(btn.textContent==='Start Test'||btn.textContent==='NEXT TEST'){start();return;}
      if(armed){capture();return;}
      if(running){
        clear(); running=false; armed=false; resetLights();
        btn.textContent='FALSE START';
        setResultState(round,'active','RETRY');
        haptic([20,30,20]);
        timers.push(setTimeout(()=>{btn.textContent='Start Test';},700));
      }
    };
  }

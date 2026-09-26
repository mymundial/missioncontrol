  function bindLando(){
    let round=1,armed=false,goTime=0,timers=[],running=false;
    const btn=document.getElementById('reactionBtn');
    const roundEl=document.getElementById('landoRound');
    const lamps=[...document.querySelectorAll('.lando-lamp')];
    const results=[...document.querySelectorAll('[data-lando-result]')];
    const redLightAudio=Array.from({length:5},()=>new Audio('./assets/lando-red-light-beep.mp3'));
    const goAudio=new Audio('./assets/lando-go-beep.mp3');
    redLightAudio.forEach(audio=>{audio.preload='auto';audio.volume=.72;});
    goAudio.preload='auto';goAudio.volume=.82;
    let countdownAudioPrimed=false;
    const clear=()=>{timers.forEach(clearTimeout);timers=[]};
    function stopCountdownAudio(reset=true){
      [...redLightAudio,goAudio].forEach(audio=>{try{audio.pause();if(reset)audio.currentTime=0;}catch{}});
    }
    function cleanupLando(){clear();stopCountdownAudio(true);}
    cleanupMission=cleanupLando;

    function primeCountdownAudio(){
      if(countdownAudioPrimed||!state.audio)return;
      countdownAudioPrimed=true;
      [...redLightAudio,goAudio].forEach(audio=>{
        const target=audio===goAudio?.82:.72;
        try{
          audio.volume=0;audio.currentTime=0;
          const play=audio.play();
          if(play&&typeof play.then==='function'){
            play.then(()=>{try{audio.pause();audio.currentTime=0;audio.volume=target;}catch{}}).catch(()=>{audio.volume=target;});
          }else{audio.pause();audio.currentTime=0;audio.volume=target;}
        }catch{audio.volume=target;}
      });
    }
    function playCountdownFx(audio,volume){
      if(!state.audio)return;
      try{
        audio.pause();audio.currentTime=0;audio.volume=volume;
        const play=audio.play();
        if(play&&typeof play.catch==='function')play.catch(()=>{});
      }catch{}
    }

    function activeRows(){return Math.min(round,4);}
    function setResultState(n,status,value=null){
      const el=results[n-1]; if(!el)return;
      el.className=`lando-result ${status}`;
      if(value!==null){
        const ms=Math.max(0,Math.round(Number(value)||0));
        el.innerHTML=`<span class="lando-result-value"><b>${ms}</b><small>MS</small></span>`;
      }
    }
    function resetLights(){lamps.forEach(l=>l.className='lando-lamp');}
    function lampsForColumn(col){
      const rows=activeRows();
      return lamps.filter(l=>Number(l.dataset.col)===col && Number(l.dataset.row)>=4-rows);
    }
    function start(){
      clear(); resetLights(); armed=false; running=true; goTime=0;
      primeCountdownAudio();
      roundEl.textContent=`${round} / 4`;
      btn.textContent='WAIT…'; btn.disabled=false;
      setResultState(round,'active');
      for(let col=0;col<5;col++){
        timers.push(setTimeout(()=>{
          lampsForColumn(col).forEach(l=>l.classList.add('red'));
          playCountdownFx(redLightAudio[col],.72); haptic(8);
        },380+col*250));
      }
      const builtAt=380+4*250;
      const wait=builtAt+650+Math.random()*1050;
      timers.push(setTimeout(()=>{
        lamps.forEach(l=>l.classList.remove('red'));
        armed=true; running=true; goTime=performance.now();
        btn.textContent='GO!';
        playCountdownFx(goAudio,.82); haptic(18);
      },wait));
    }
    function capture(){
      const ms=Math.round(performance.now()-goTime);
      armed=false; running=false;
      for(let col=0;col<5;col++) lampsForColumn(col).forEach(l=>l.classList.add('green'));
      setResultState(round,'complete',ms);
      haptic([20,20,45]); ping(760,.075,.03);
      if(round===4){
        btn.textContent='COMPLETE'; btn.disabled=true;
        timers.push(setTimeout(()=>showCompletion('Flight Control Calibrated','Santa-1’s flight response has been calibrated for high-speed operation.'),850));
      }else{
        round++;
        roundEl.textContent=`${round} / 4`;
        setResultState(round,'active');
        btn.textContent='NEXT TEST';
      }
    }
    btn.onclick=()=>{
      if(btn.textContent==='Start Test'||btn.textContent==='NEXT TEST'){start();return;}
      if(armed){capture();return;}
      if(running){
        clear(); running=false; armed=false; resetLights();
        btn.textContent='FALSE START';
        setResultState(round,'active');
        haptic([20,30,20]);
        timers.push(setTimeout(()=>{btn.textContent='Start Test';},700));
      }
    };
  }

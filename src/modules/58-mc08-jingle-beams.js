  function bindJingle(){
    const panel=document.getElementById('jinglePanel');
    const arena=document.getElementById('jingleArena');
    const puck=document.getElementById('jinglePuck');
    const trail=document.getElementById('jinglePuckTrail');
    const paddle=document.getElementById('jinglePaddle');
    const receiver=document.getElementById('jingleReceiver');
    const goalFlare=document.getElementById('jingleGoalFlare');
    const prompt=document.getElementById('jinglePrompt');
    const stateEl=document.getElementById('jingleState');
    if(!panel||!arena||!puck||!trail||!paddle||!receiver||!stateEl) return;

    const TOTAL_BEAMS=5;
    let beam=1;
    let running=false;
    let started=false;
    let dragging=false;
    let raf=0;
    let launchTimer=0;
    let finishTimer=0;
    let buzzerTimer=0;
    let last=performance.now();
    let lastStrikeAt=0;
    let lastPostAt=0;
    let motionStart=performance.now();
    let receiverCenter=0;
    let bounds={w:0,h:0,paddleW:0,paddleH:0,paddleY:0,puckR:9,goalW:0,goalLeft:0,goalRight:0,apertureLeft:0,apertureRight:0,goalBottom:0};
    let paddleX=0;
    let puckX=0;
    let puckY=0;
    let vx=0;
    let vy=0;
    let previousPuck={x:0,y:0};
    const speeds=[0,.245,.275,.305,.318,.332];
    const goalPositions=[0,.50,.31,.69,.50,.50];
    const motionPeriods={4:5200,5:3200};

    const strikePool=Array.from({length:3},()=>{const a=new Audio('./assets/jingle-puck-strike.mp3');a.preload='auto';return a;});
    const postPool=Array.from({length:2},()=>{const a=new Audio('./assets/jingle-post-hit.mp3');a.preload='auto';return a;});
    const goalAudio=new Audio('./assets/jingle-goal.mp3');goalAudio.preload='auto';
    const buzzerAudio=new Audio('./assets/jingle-buzzer.mp3');buzzerAudio.preload='auto';
    const music=new Audio('./assets/jingle-arena-loop.mp3');music.preload='auto';music.loop=true;music.volume=.30;
    let strikeIndex=0;
    let postIndex=0;
    const radioWasPlaying=beginMissionAudioRadioOverride('jingle');

    function beamEl(n){return document.querySelector(`[data-jingle-beam="${n}"]`);}
    function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
    function playAudio(el,volume=1,rate=1){
      if(!state.audio||!el) return;
      try{el.pause();el.currentTime=0;el.volume=clamp(volume,0,1);el.playbackRate=rate;const play=el.play();if(play&&typeof play.catch==='function') play.catch(()=>{});}catch{}
    }
    function startMusic(){
      if(!state.audio) return;
      beginMissionAudioRadioOverride('jingle');
      try{music.currentTime=music.currentTime||0;const play=music.play();if(play&&typeof play.catch==='function') play.catch(()=>{});}catch{}
    }
    function ensureMusic(){if(state.audio&&music.paused) startMusic();}
    function stopMusic(){try{music.pause();music.currentTime=0;}catch{}}
    function playStrike(volume=.62,rate=1){
      if(!state.audio) return;
      const now=performance.now();if(now-lastStrikeAt<65) return;lastStrikeAt=now;
      playAudio(strikePool[strikeIndex++%strikePool.length],volume,rate);
    }
    function playPost(side){
      if(!state.audio) return;
      const now=performance.now();if(now-lastPostAt<90) return;lastPostAt=now;
      playAudio(postPool[postIndex++%postPool.length],.62,side==='left'?.96:1.04);
    }
    function setPaddleX(x){
      const half=bounds.paddleW/2;
      paddleX=clamp(x,half+10,bounds.w-half-10);
      paddle.style.transform=`translate3d(${paddleX-half}px,0,0)`;
    }
    function setReceiverCenter(x){
      receiverCenter=clamp(x,bounds.goalW/2+20,bounds.w-bounds.goalW/2-20);
      receiver.style.left=`${receiverCenter}px`;
      goalFlare.style.left=`${receiverCenter}px`;
      bounds.goalLeft=receiverCenter-bounds.goalW/2;
      bounds.goalRight=receiverCenter+bounds.goalW/2;
      const apertureW=bounds.goalW*.44;
      bounds.apertureLeft=receiverCenter-apertureW/2;
      bounds.apertureRight=receiverCenter+apertureW/2;
    }
    function updateReceiverMotion(now=performance.now()){
      if(beam<4||beam>TOTAL_BEAMS) return;
      const half=bounds.goalW/2;
      const min=half+22;
      const max=bounds.w-half-22;
      const period=motionPeriods[beam];
      const phase=((now-motionStart)%period)/period;
      const eased=.5-.5*Math.cos(phase*Math.PI*2);
      setReceiverCenter(min+(max-min)*eased);
    }
    function setPuckPosition(){
      const r=bounds.puckR;
      puck.style.transform=`translate3d(${puckX-r}px,${puckY-r}px,0)`;
      const dx=puckX-previousPuck.x,dy=puckY-previousPuck.y;
      const speed=Math.hypot(vx,vy);
      const speedMix=clamp((speed-.23)/.11,0,1);
      const length=clamp(38+speedMix*48+Math.hypot(dx,dy)*2.6,38,108);
      const angle=Math.atan2(dy,dx)*180/Math.PI;
      trail.style.width=`${length}px`;
      trail.style.opacity=String(.72+speedMix*.22);
      trail.style.transform=`translate3d(${puckX}px,${puckY}px,0) rotate(${angle+180}deg)`;
    }
    function updateBounds(preservePaddle=true){
      const rect=arena.getBoundingClientRect();
      bounds.w=rect.width;bounds.h=rect.height;bounds.paddleW=paddle.offsetWidth;bounds.paddleH=paddle.offsetHeight;bounds.paddleY=paddle.offsetTop;bounds.puckR=puck.offsetWidth/2;bounds.goalW=receiver.offsetWidth;bounds.goalBottom=receiver.offsetTop+receiver.offsetHeight;
      if(!preservePaddle||!paddleX) setPaddleX(bounds.w/2); else setPaddleX(paddleX);
      if(beam>=4) updateReceiverMotion(); else setReceiverCenter((goalPositions[beam]||.5)*bounds.w);
    }
    function setReceiverForBeam(n){
      receiver.classList.toggle('is-moving',n>=4);
      receiver.dataset.speed=n===5?'fast':n===4?'moving':'static';
      motionStart=performance.now();
      requestAnimationFrame(()=>{updateBounds();if(n>=4) updateReceiverMotion();else setReceiverCenter((goalPositions[n]||.5)*bounds.w);});
    }
    function spawnImpact(x,y,type='rail'){
      const burst=document.createElement('div');
      burst.className=`jingle-impact-burst ${type}`;
      burst.style.left=`${x}px`;burst.style.top=`${y}px`;
      burst.innerHTML=Array.from({length:6},(_,i)=>`<i style="--spark-angle:${i*60}deg"></i>`).join('');
      arena.appendChild(burst);setTimeout(()=>burst.remove(),300);
    }
    function pulseRail(side){
      const rail=arena.querySelector(`.rail-${side}`);if(!rail)return;
      rail.classList.remove('is-hit');void rail.offsetWidth;rail.classList.add('is-hit');
      spawnImpact(side==='left'?10:bounds.w-10,puckY,'rail');
      setTimeout(()=>rail.classList.remove('is-hit'),180);
    }
    function pulsePost(side){
      receiver.classList.remove('is-post-left','is-post-right');void receiver.offsetWidth;receiver.classList.add(`is-post-${side}`);
      spawnImpact(side==='left'?bounds.goalLeft+bounds.goalW*.18:bounds.goalRight-bounds.goalW*.18,bounds.goalBottom,'post');
      setTimeout(()=>receiver.classList.remove('is-post-left','is-post-right'),180);
    }
    function resetPuckAtReceiver(){
      updateBounds();
      puckX=receiverCenter||bounds.w/2;puckY=Math.max(bounds.goalBottom+30,64);previousPuck={x:puckX,y:puckY};setPuckPosition();
    }
    function launchPuck(fromReceiver=false){
      clearTimeout(launchTimer);updateBounds();
      if(fromReceiver) resetPuckAtReceiver();
      else{puckX=bounds.w/2;puckY=Math.min(bounds.h*.35,bounds.paddleY-90);previousPuck={x:puckX,y:puckY};setPuckPosition();}
      const speed=speeds[beam];
      const lateral=(beam===1?.28:beam===2?.34:beam===3?.39:.42)*(Math.random()<.5?-1:1);
      vx=speed*lateral;vy=Math.sqrt(Math.max(.001,speed*speed-vx*vx));running=true;last=performance.now();stateEl.textContent=`Beam 0${beam} live`;
    }
    function scheduleLaunch(fromReceiver=false,delay=420){running=false;clearTimeout(launchTimer);launchTimer=setTimeout(()=>launchPuck(fromReceiver),delay);}
    function normaliseVelocity(speed){const mag=Math.hypot(vx,vy)||1;vx=vx/mag*speed;vy=vy/mag*speed;}
    function paddleHit(){
      const half=bounds.paddleW/2,offset=clamp((puckX-paddleX)/half,-1,1),speed=speeds[beam];
      vx=vx*.28+offset*speed*.84;vy=-Math.abs(vy||speed);normaliseVelocity(speed);puckY=bounds.paddleY-bounds.puckR-1;
      paddle.classList.remove('is-hit');void paddle.offsetWidth;paddle.classList.add('is-hit');setTimeout(()=>paddle.classList.remove('is-hit'),170);
      spawnImpact(puckX,bounds.paddleY,'paddle');playStrike(.68,1+(Math.random()-.5)*.07);haptic(14);
    }
    function postHit(side){
      const speed=speeds[beam];puckY=bounds.goalBottom+bounds.puckR+1;vy=Math.abs(vy||speed);
      const lateral=Math.max(Math.abs(vx),speed*.26);vx=side==='left'?lateral:-lateral;normaliseVelocity(speed);
      pulsePost(side);playPost(side);haptic(11);
    }
    function missedPaddle(){
      running=false;stateEl.textContent=`Beam 0${beam} relaunching`;arena.classList.add('is-missed');haptic([14,24,14]);setTimeout(()=>arena.classList.remove('is-missed'),260);scheduleLaunch(true,520);
    }
    function markBeamCharged(n){
      const current=beamEl(n);current?.classList.remove('is-next');current?.classList.add('is-charged');current?.setAttribute('aria-label',`Beam 0${n} charged`);
      beamEl(n+1)?.classList.add('is-next');
      panel.dataset.charge=String(n);
    }
    function finishGame(){
      running=false;panel.classList.add('is-complete');arena.classList.add('is-complete');stateEl.textContent='PROPULSION ONLINE';
      clearTimeout(buzzerTimer);buzzerTimer=setTimeout(()=>{playAudio(buzzerAudio,.78,1);haptic([30,28,70]);},780);
      finishTimer=setTimeout(()=>showCompletion('Propulsion Online','All five Jingle Beams are charged and Santa-1 propulsion is responding within flight parameters.'),2450);
    }
    function scoreGoal(){
      if(!running)return;
      running=false;const scoredBeam=beam;
      if(scoredBeam===TOTAL_BEAMS) stopMusic();
      markBeamCharged(scoredBeam);stateEl.textContent=`BEAM 0${scoredBeam} CHARGED`;
      goalFlare.classList.remove('is-active');void goalFlare.offsetWidth;goalFlare.classList.add('is-active');
      receiver.classList.add('is-charged');puck.classList.add('is-absorbed');arena.classList.remove('is-goal-hit');void arena.offsetWidth;arena.classList.add('is-goal-hit');
      spawnImpact(receiverCenter,bounds.goalBottom,'goal');playAudio(goalAudio,.86,1);haptic([22,18,42]);
      setTimeout(()=>{goalFlare.classList.remove('is-active');arena.classList.remove('is-goal-hit');if(scoredBeam<TOTAL_BEAMS){puck.classList.remove('is-absorbed');receiver.classList.remove('is-charged');}},520);
      if(scoredBeam===TOTAL_BEAMS){finishGame();return;}
      beam++;
      setTimeout(()=>{setReceiverForBeam(beam);stateEl.textContent=`Beam 0${beam} ready`;scheduleLaunch(true,380);},620);
    }
    function tick(now){
      const dt=Math.min(26,now-last);last=now;
      if(beam>=4&&!panel.classList.contains('is-complete')) updateReceiverMotion(now);
      if(running){
        previousPuck={x:puckX,y:puckY};puckX+=vx*dt;puckY+=vy*dt;const r=bounds.puckR;
        if(puckX-r<=4&&vx<0){puckX=r+4;vx=Math.abs(vx);pulseRail('left');playStrike(.2,.93);}
        if(puckX+r>=bounds.w-4&&vx>0){puckX=bounds.w-r-4;vx=-Math.abs(vx);pulseRail('right');playStrike(.2,1.05);}

        const crossedReceiver=vy<0&&puckY-r<=bounds.goalBottom&&previousPuck.y-r>bounds.goalBottom;
        if(crossedReceiver&&puckX>=bounds.goalLeft-r*.08&&puckX<=bounds.goalRight+r*.08){
          if(puckX>=bounds.apertureLeft+r*.10&&puckX<=bounds.apertureRight-r*.10) scoreGoal();
          else postHit(puckX<receiverCenter?'left':'right');
        }else if(running&&vy<0&&puckY-r<=6){puckY=r+6;vy=Math.abs(vy);spawnImpact(puckX,7,'rail');playStrike(.18,.97);}

        if(running&&vy>0&&puckY+r>=bounds.paddleY&&previousPuck.y+r<bounds.paddleY+bounds.paddleH){
          const half=bounds.paddleW/2;if(puckX>=paddleX-half-r*.35&&puckX<=paddleX+half+r*.35)paddleHit();
        }
        if(running&&puckY-r>bounds.h) missedPaddle();
        setPuckPosition();
      }
      raf=requestAnimationFrame(tick);
    }
    function pointerToPaddle(e){const rect=arena.getBoundingClientRect();setPaddleX(e.clientX-rect.left);}
    function startFromInteraction(){if(started){ensureMusic();return;}started=true;prompt?.classList.add('is-hidden');arena.classList.add('is-live');ensureMusic();scheduleLaunch(false,220);}
    function onPointerDown(e){dragging=true;try{arena.setPointerCapture?.(e.pointerId);}catch{}e.preventDefault();try{arena.focus({preventScroll:true});}catch{arena.focus();}pointerToPaddle(e);startFromInteraction();}
    function onPointerMove(e){if(!dragging)return;e.preventDefault();pointerToPaddle(e);}
    function onPointerUp(e){dragging=false;try{arena.releasePointerCapture?.(e.pointerId);}catch{}}
    function onKeyDown(e){if(!['ArrowLeft','ArrowRight','a','A','d','D'].includes(e.key))return;e.preventDefault();updateBounds();setPaddleX(paddleX+(['ArrowLeft','a','A'].includes(e.key)?-28:28));startFromInteraction();}
    function onResize(){updateBounds();if(!running&&!panel.classList.contains('is-complete'))resetPuckAtReceiver();}

    panel.dataset.charge='0';setReceiverForBeam(1);
    requestAnimationFrame(()=>{updateBounds(false);puckX=bounds.w/2;puckY=Math.min(bounds.h*.33,bounds.paddleY-84);previousPuck={x:puckX,y:puckY};setPuckPosition();});
    arena.addEventListener('pointerdown',onPointerDown,{passive:false});arena.addEventListener('pointermove',onPointerMove,{passive:false});arena.addEventListener('pointerup',onPointerUp);arena.addEventListener('pointercancel',onPointerUp);arena.addEventListener('keydown',onKeyDown);window.addEventListener('resize',onResize);
    startMusic();raf=requestAnimationFrame(tick);

    cleanupMission=()=>{
      cancelAnimationFrame(raf);clearTimeout(launchTimer);clearTimeout(finishTimer);clearTimeout(buzzerTimer);
      arena.removeEventListener('pointerdown',onPointerDown);arena.removeEventListener('pointermove',onPointerMove);arena.removeEventListener('pointerup',onPointerUp);arena.removeEventListener('pointercancel',onPointerUp);arena.removeEventListener('keydown',onKeyDown);window.removeEventListener('resize',onResize);
      stopMusic();[...strikePool,...postPool,goalAudio,buzzerAudio].forEach(a=>{try{a.pause();a.currentTime=0;}catch{}});
      endMissionAudioRadioOverride('jingle');if(radioWasPlaying) ensureElfRadioPlayback(1,520);
    };
  }

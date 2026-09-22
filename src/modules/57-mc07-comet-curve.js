  function bindComet(){
    const dirClass={L:'left',D:'down',U:'up',R:'right'};
    const keys=['L','D','U','R'];
    const game=document.getElementById('cometGame');
    const notesLayer=document.getElementById('cometNotes');
    const progress=document.getElementById('cometProgress');
    const stateEl=document.getElementById('cometState');
    const flash=document.getElementById('cometHitFlash');
    const judgement=document.getElementById('cometJudgement');
    const comboEl=document.getElementById('cometCombo');
    const instruction=document.getElementById('cometInstruction');
    const steps=[...document.querySelectorAll('[data-comet-step]')];
    const receptors=[...document.querySelectorAll('.comet-receptor')];
    if(!game||!notesLayer||!progress||!stateEl||!flash||!judgement||!comboEl) return;

    const BPM=129.2;
    const BEAT=60/BPM;
    const BEAT_OFFSET=1.405;
    const TARGET_Y=.80;
    const PERFECT_WINDOW=.085;
    const GOOD_WINDOW=.22;
    const MISS_WINDOW=.31;

    let correct=0;
    let combo=0;
    let finished=false;
    let raf=0;
    let spawnTimer=0;
    let judgementTimer=0;
    let beatPulseTimer=0;
    let clockStart=performance.now();
    let lastBeat=-1;
    let lastKey='';
    let notes=[];
    let music=null;

    function clock(){ return Math.max(0,(performance.now()-clockStart)/1000); }
    function leadBeats(){ return correct<3?4:correct<7?3:3; }
    function gapBeats(){ return correct<3?1:correct<7?1:0; }
    function nextBeatTime(t,extraBeats=0){
      const base=Math.max(BEAT_OFFSET,t);
      const index=Math.ceil((base-BEAT_OFFSET)/BEAT);
      return BEAT_OFFSET+(index+extraBeats)*BEAT;
    }
    function laneCenter(key){
      const lane=document.querySelector(`[data-comet-lane="${key}"]`);
      if(!lane) return 0;
      const wrap=game.getBoundingClientRect();
      const r=lane.getBoundingClientRect();
      return (r.left-wrap.left)+(r.width/2);
    }
    function arrowMarkup(key){
      const dir=dirClass[key];
      return `<span class="comet-arrow-icon comet-arrow-${dir}" aria-hidden="true"><i></i><i></i></span><span class="comet-tail"></span>`;
    }
    function chooseKey(){
      const pool=keys.filter(k=>k!==lastKey);
      const key=pool[Math.floor(Math.random()*pool.length)]||keys[Math.floor(Math.random()*keys.length)];
      lastKey=key;
      return key;
    }
    function startMusic(){
      if(!state.audio) return;
      try{
        music=new Audio('./assets/comet-curve-rhythm.mp3');
        music.preload='auto';
        music.volume=.58;
        music.currentTime=0;
        music.play().catch(()=>{});
      }catch{music=null;}
    }
    function stopMusic(){
      if(!music) return;
      try{music.pause();music.currentTime=0;}catch{}
      music=null;
    }
    function pulseBeat(){
      game.classList.remove('beat-pulse');
      void game.offsetWidth;
      game.classList.add('beat-pulse');
      clearTimeout(beatPulseTimer);
      beatPulseTimer=setTimeout(()=>game.classList.remove('beat-pulse'),105);
    }
    function showJudgement(text,type){
      clearTimeout(judgementTimer);
      judgement.textContent=text;
      judgement.className=`comet-judgement show ${type}`;
      judgementTimer=setTimeout(()=>{judgement.className='comet-judgement';},430);
    }
    function updateCombo(){
      comboEl.textContent=combo>=2?`COMBO ${String(combo).padStart(2,'0')}`:'';
      comboEl.classList.toggle('show',combo>=2);
    }
    function receptorFor(key){ return receptors[keys.indexOf(key)]||null; }
    function pulseReceptor(key,type){
      const receptor=receptorFor(key); if(!receptor) return;
      receptor.classList.remove('hit','miss'); void receptor.offsetWidth; receptor.classList.add(type);
      setTimeout(()=>receptor.classList.remove(type),220);
    }
    function scheduleNext(){
      clearTimeout(spawnTimer);
      if(finished||notes.length) return;
      const t=clock();
      const spawnAt=nextBeatTime(t+.04,gapBeats());
      spawnTimer=setTimeout(()=>spawn(spawnAt),Math.max(0,(spawnAt-t)*1000));
    }
    function spawn(spawnAt=clock()){
      if(finished||notes.length) return;
      const key=chooseKey();
      const targetTime=spawnAt+(leadBeats()*BEAT);
      const el=document.createElement('div');
      el.className=`comet-note active ${dirClass[key]}`;
      el.style.left=laneCenter(key)+'px';
      el.style.top='8%';
      el.innerHTML=arrowMarkup(key);
      notesLayer.appendChild(el);
      notes.push({key,el,spawnTime:spawnAt,targetTime,hit:false});
      if(correct===1&&instruction) instruction.classList.add('recede');
      if(!raf) raf=requestAnimationFrame(frame);
    }
    function removeNote(note,status='miss'){
      note.hit=status==='hit';
      note.el.classList.remove('active');
      note.el.classList.add(status);
      setTimeout(()=>note.el.remove(),190);
      notes=notes.filter(n=>n!==note);
    }
    function triggerMissVisual(key){
      const lane=document.querySelector(`[data-comet-lane="${key}"]`);
      lane?.classList.add('miss');
      pulseReceptor(key,'miss');
      game.classList.remove('miss-shock'); void game.offsetWidth; game.classList.add('miss-shock');
      setTimeout(()=>{lane?.classList.remove('miss');game.classList.remove('miss-shock');},260);
    }
    function missNote(note,message='SIGNAL MISSED'){
      if(finished||!note) return;
      triggerMissVisual(note.key);
      removeNote(note,'miss');
      combo=0; updateCombo();
      showJudgement('MISS','miss');
      stateEl.textContent=message;
      ping(180,.09,.025); haptic([18,20,28]);
      if(notes.length===0) scheduleNext();
    }
    function hitNote(note,error){
      if(finished||!note) return;
      const perfect=error<=PERFECT_WINDOW;
      const lane=document.querySelector(`[data-comet-lane="${note.key}"]`);
      lane?.classList.add('hit');
      pulseReceptor(note.key,'hit');
      setTimeout(()=>lane?.classList.remove('hit'),220);
      removeNote(note,'hit');
      flash.classList.remove('active'); void flash.offsetWidth; flash.classList.add('active');
      setTimeout(()=>flash.classList.remove('active'),280);

      correct++;
      combo++;
      updateCombo();
      progress.textContent=`${correct} / 10`;
      steps[correct-1]?.classList.add('on');
      showJudgement(perfect?'PERFECT':'GOOD',perfect?'perfect':'good');
      ping(perfect?880:720,.055,perfect?.022:.016); haptic(perfect?[24,18,28]:20);
      stateEl.textContent=combo>=3?`SYNCED · COMBO ${combo}`:'SIGNAL LOCK';

      if(correct>=10){
        finished=true;
        cancelAnimationFrame(raf);raf=0;clearTimeout(spawnTimer);
        notes.forEach(n=>n.el.remove());notes=[];
        game.classList.add('complete');
        receptors.forEach(r=>r.classList.add('locked'));
        document.querySelectorAll('.comet-btn').forEach(b=>b.disabled=true);
        comboEl.classList.remove('show');
        judgement.textContent='GUIDANCE SIGNAL LOCKED';
        judgement.className='comet-judgement show complete';
        stateEl.textContent='GUIDANCE SIGNAL LOCKED';
        ping(980,.15,.05);haptic([30,22,60]);
        stopMusic();
        setTimeout(()=>showCompletion('Guidance Signal Locked',''),900);
        return;
      }
      scheduleNext();
    }
    function frame(){
      if(finished){raf=0;return;}
      const t=clock();
      const beatIndex=Math.floor((t-BEAT_OFFSET)/BEAT);
      if(beatIndex>=0&&beatIndex!==lastBeat){lastBeat=beatIndex;pulseBeat();}

      notes.slice().forEach(note=>{
        let y=.08;
        if(t<=note.targetTime){
          const p=Math.max(0,Math.min(1,(t-note.spawnTime)/(note.targetTime-note.spawnTime)));
          y=.08+((TARGET_Y-.08)*p);
        }else{
          const p=Math.max(0,Math.min(1,(t-note.targetTime)/MISS_WINDOW));
          y=TARGET_Y+((.97-TARGET_Y)*p);
        }
        note.el.style.top=(y*100)+'%';
        if(t-note.targetTime>MISS_WINDOW) missNote(note);
      });
      raf=requestAnimationFrame(frame);
    }

    document.querySelectorAll('.comet-btn[data-arrow]').forEach(btn=>btn.onclick=()=>{
      if(finished||!notes.length) return;
      const key=btn.dataset.arrow;
      const note=notes[0];
      const delta=clock()-note.targetTime;
      const error=Math.abs(delta);
      if(error>GOOD_WINDOW){
        if(delta>-.48){
          if(key===note.key) missNote(note,'TIMING LOST · REACQUIRE');
          else missNote(note,'DIRECTION MISSED');
        }else{
          stateEl.textContent='WAIT FOR THE BEAT';
          haptic(7);
        }
        return;
      }
      if(key!==note.key){missNote(note,'DIRECTION MISSED');return;}
      hitNote(note,error);
    });

    cleanupMission=()=>{
      cancelAnimationFrame(raf);
      clearTimeout(spawnTimer);
      clearTimeout(judgementTimer);
      clearTimeout(beatPulseTimer);
      notes.forEach(n=>n.el.remove());
      notes=[];
      stopMusic();
    };

    clockStart=performance.now();
    startMusic();
    spawnTimer=setTimeout(()=>spawn(BEAT_OFFSET+BEAT),Math.max(0,(BEAT_OFFSET+BEAT)*1000));
    raf=requestAnimationFrame(frame);
  }

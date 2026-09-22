  function bindComet(){
    const dirClass={L:'left',D:'down',U:'up',R:'right'};
    const keys=['L','D','U','R'];
    const game=document.getElementById('cometGame');
    const notesLayer=document.getElementById('cometNotes');
    const progress=document.getElementById('cometProgress');
    const stateEl=document.getElementById('cometState');
    const flash=document.getElementById('cometHitFlash');
    const steps=[...document.querySelectorAll('[data-comet-step]')];
    let correct=0;
    let finished=false;
    let raf=0;
    let spawnTimer=0;
    let burstTimer=0;
    let burstPending=0;
    let last=performance.now();
    let notes=[];

    function pace(){
      if(correct<3) return {speed:.00043,delay:430,count:1,stagger:0};
      if(correct<7) return {speed:.00053,delay:340,count:Math.random()<0.42?2:1,stagger:285};
      return {speed:.00064,delay:265,count:Math.random()<0.78?2:1,stagger:245};
    }
    function laneCenter(key){
      const lane=document.querySelector(`[data-comet-lane="${key}"]`);
      if(!lane) return 0;
      const wrap=game.getBoundingClientRect();
      const r=lane.getBoundingClientRect();
      return (r.left-wrap.left)+(r.width/2);
    }
    function createNote(key){
      const el=document.createElement('div');
      el.className=`comet-note active ${dirClass[key]}`;
      el.style.left=laneCenter(key)+'px';
      el.innerHTML='<span class="comet-chevron"><i></i><i></i></span><span class="comet-tail"></span>';
      notesLayer.appendChild(el);
      notes.push({key,y:.02,el,hit:false});
      burstPending=Math.max(0,burstPending-1);
    }
    function uniqueKeys(count){
      const pool=[...keys];
      const out=[];
      while(out.length<count&&pool.length){
        out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
      }
      return out;
    }
    function spawn(){
      if(finished) return;
      const cfg=pace();
      const chosen=uniqueKeys(cfg.count);
      burstPending=chosen.length;
      createNote(chosen[0]);
      if(chosen.length>1){
        clearTimeout(burstTimer);
        burstTimer=setTimeout(()=>{
          if(!finished) createNote(chosen[1]);
        },cfg.stagger);
      }
      stateEl.textContent=correct<3?'Acquire the guidance signal':correct<7?'Chevron pattern accelerating':'Final guidance lock';
      last=performance.now();
      if(!raf) raf=requestAnimationFrame(frame);
    }
    function scheduleNext(delay=pace().delay){
      clearTimeout(spawnTimer);
      if(finished||notes.length||burstPending) return;
      spawnTimer=setTimeout(spawn,delay);
    }
    function removeNote(note,status='miss'){
      note.hit=status==='hit';
      note.el.classList.remove('active');
      note.el.classList.add(status);
      setTimeout(()=>note.el.remove(),180);
      notes=notes.filter(n=>n!==note);
    }
    function missNote(note,message='Signal missed · keep going'){
      if(finished) return;
      const lane=document.querySelector(`[data-comet-lane="${note.key}"]`);
      lane?.classList.add('miss');
      setTimeout(()=>lane?.classList.remove('miss'),240);
      removeNote(note,'miss');
      stateEl.textContent=message;
      haptic([12,18,12]);
      if(notes.length===0&&burstPending===0) scheduleNext(320);
    }
    function hitNote(note){
      if(finished) return;
      const lane=document.querySelector(`[data-comet-lane="${note.key}"]`);
      lane?.classList.add('hit');
      setTimeout(()=>lane?.classList.remove('hit'),240);
      removeNote(note,'hit');
      flash.classList.remove('active'); void flash.offsetWidth; flash.classList.add('active');
      setTimeout(()=>flash.classList.remove('active'),280);
      correct++;
      progress.textContent=`${correct} / 10`;
      steps[correct-1]?.classList.add('on');
      ping(650+correct*32,.055,.018); haptic(22);
      stateEl.textContent=correct===10?'Guidance path locked':`Signal captured · ${10-correct} remaining`;
      if(correct>=10){
        finished=true;
        cancelAnimationFrame(raf); raf=0; clearTimeout(spawnTimer); clearTimeout(burstTimer);
        notes.forEach(n=>n.el.remove()); notes=[]; burstPending=0;
        game.classList.add('complete');
        document.querySelectorAll('.comet-btn').forEach(b=>b.disabled=true);
        ping(980,.14,.05); haptic([30,22,60]);
        setTimeout(()=>showCompletion('Guidance Path Restored',''),650);
        return;
      }
      if(notes.length===0&&burstPending===0) scheduleNext();
    }
    function frame(now){
      if(finished){ raf=0; return; }
      const dt=Math.min(40,now-last); last=now;
      const speed=pace().speed;
      notes.slice().forEach(note=>{
        note.y+=speed*dt;
        note.el.style.top=(note.y*100)+'%';
        if(note.y>.92) missNote(note);
      });
      raf=requestAnimationFrame(frame);
    }
    document.querySelectorAll('.comet-btn[data-arrow]').forEach(btn=>btn.onclick=()=>{
      if(finished||!notes.length) return;
      const key=btn.dataset.arrow;
      const laneNotes=notes.filter(n=>n.key===key);
      const candidate=laneNotes.sort((a,b)=>Math.abs(a.y-.80)-Math.abs(b.y-.80))[0];
      const inWindow=candidate&&candidate.y>=.73&&candidate.y<=.87;
      if(!inWindow){
        stateEl.textContent='Wait for the signal to enter the target zone';
        haptic(8);
        return;
      }
      hitNote(candidate);
    });
    cleanupMission=()=>{
      cancelAnimationFrame(raf);
      clearTimeout(spawnTimer);
      clearTimeout(burstTimer);
      notes.forEach(n=>n.el.remove());
      notes=[];
      burstPending=0;
    };
    scheduleNext(500);
  }


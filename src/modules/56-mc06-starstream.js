  function bindArtifacts(){
    const field=document.getElementById('artifactField');
    const layer=document.getElementById('artifactLayer');
    const burstLayer=document.getElementById('artifactBurstLayer');
    const beam=document.getElementById('starstreamBeam');
    const progress=document.getElementById('artifactProgress');
    const stateEl=document.getElementById('artifactState');
    const steps=[...document.querySelectorAll('[data-artifact-step]')];
    const shapes=['spark','shard','star','glitch'];
    let cleared=0;
    let active=[];
    let timers=[];
    let finished=false;
    let spawnSeq=0;

    function clearTimers(){timers.forEach(clearTimeout);timers=[];}
    function maxVisible(){return cleared<4?1:cleared<8?2:3;}
    function randomPos(){
      return {x:10+Math.random()*80,y:10+Math.random()*74};
    }
    function createArtifact(){
      if(finished||active.length>=maxVisible()) return;
      const pos=randomPos();
      const el=document.createElement('button');
      el.type='button';
      el.className=`energy-artifact ${shapes[(spawnSeq++)%shapes.length]}`;
      el.style.left=pos.x+'%'; el.style.top=pos.y+'%';
      el.setAttribute('aria-label','Clear unstable energy artefact');
      el.innerHTML='<span></span><i></i><b></b>';
      layer.appendChild(el);
      const item={el}; active.push(item);
      const pop=ev=>{ev.preventDefault();popArtifact(item);};
      if(window.PointerEvent) el.addEventListener('pointerdown',pop,{passive:false});
      else el.addEventListener('click',pop);
      const reposition=setTimeout(()=>{
        if(finished||!active.includes(item)) return;
        const p=randomPos(); el.classList.add('phase');
        el.style.left=p.x+'%'; el.style.top=p.y+'%';
        setTimeout(()=>el.classList.remove('phase'),180);
      },1800+Math.random()*900);
      timers.push(reposition);
    }
    function spawnBurst(x,y){
      for(let i=0;i<7;i++){
        const p=document.createElement('i');
        p.className='artifact-particle'; p.style.left=x+'px'; p.style.top=y+'px';
        p.style.setProperty('--dx',`${(Math.random()-.5)*90}px`);
        p.style.setProperty('--dy',`${(Math.random()-.5)*90}px`);
        burstLayer.appendChild(p); setTimeout(()=>p.remove(),480);
      }
    }
    function popArtifact(item){
      if(finished||!active.includes(item)) return;
      const fr=field.getBoundingClientRect(),r=item.el.getBoundingClientRect();
      spawnBurst(r.left-fr.left+r.width/2,r.top-fr.top+r.height/2);
      item.el.classList.add('popped');
      active=active.filter(a=>a!==item);
      setTimeout(()=>item.el.remove(),220);
      cleared++;
      progress.textContent=`${cleared} / 12`;
      steps[cleared-1]?.classList.add('on');
      ping(620+cleared*22,.045,.018); haptic(18);
      stateEl.textContent=cleared===12?'Starstream stabilised':`Artefact cleared · ${12-cleared} remaining`;
      if(cleared>=12){finish();return;}
      const desired=maxVisible();
      const t=setTimeout(()=>{while(active.length<desired)createArtifact();},160);
      timers.push(t);
    }
    function finish(){
      finished=true; clearTimers();
      active.forEach(a=>{a.el.classList.add('absorbed');setTimeout(()=>a.el.remove(),240)}); active=[];
      field.classList.add('stabilised'); beam.classList.add('active');
      ping(920,.12,.045); haptic([28,24,58]);
      setTimeout(()=>showCompletion('Starstream Stabilised',''),850);
    }
    function start(){
      createArtifact();
      const t=setTimeout(()=>{if(!finished&&active.length<maxVisible())createArtifact();},900);timers.push(t);
    }
    cleanupMission=()=>{finished=true;clearTimers();active.forEach(a=>a.el.remove());active=[];};
    start();
  }

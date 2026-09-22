  function bindArtifacts(){
    const field=document.getElementById('artifactField');
    const layer=document.getElementById('artifactLayer');
    const burstLayer=document.getElementById('artifactBurstLayer');
    const beam=document.getElementById('starstreamBeam');
    const progress=document.getElementById('artifactProgress');
    const stateEl=document.getElementById('artifactState');
    const panel=field?.closest('.artifact-panel');
    const steps=[...document.querySelectorAll('[data-artifact-step]')];
    const shapes=['spark','shard','star','glitch'];
    let cleared=0;
    let active=[];
    let timers=[];
    let finished=false;
    let spawnSeq=0;

    function clearTimers(){timers.forEach(clearTimeout);timers=[];}
    function maxVisible(){return cleared<4?1:cleared<8?2:3;}
    function randomPos(){return {x:11+Math.random()*78,y:12+Math.random()*72};}
    function setIntensity(){
      const level=cleared<4?1:cleared<8?2:3;
      field.dataset.intensity=String(level);
      panel?.classList.toggle('is-live',cleared>0);
      panel?.classList.toggle('is-intense',cleared>=8);
    }
    function distortField(){
      field.classList.remove('is-distorted');
      void field.offsetWidth;
      field.classList.add('is-distorted');
      const t=setTimeout(()=>field.classList.remove('is-distorted'),260);
      timers.push(t);
    }
    function createArtifact(){
      if(finished||active.length>=maxVisible()) return;
      const pos=randomPos();
      const el=document.createElement('button');
      el.type='button';
      el.className=`energy-artifact ${shapes[(spawnSeq++)%shapes.length]}`;
      el.style.left=pos.x+'%'; el.style.top=pos.y+'%';
      el.style.setProperty('--artifact-delay',`${(Math.random()*-.8).toFixed(2)}s`);
      el.setAttribute('aria-label','Clear unstable energy artefact');
      el.innerHTML='<span></span><i></i><b></b>';
      layer.appendChild(el);
      const item={el}; active.push(item);
      const pop=ev=>{ev.preventDefault();popArtifact(item);};
      if(window.PointerEvent) el.addEventListener('pointerdown',pop,{passive:false});
      else el.addEventListener('click',pop);
      const reposition=setTimeout(()=>{
        if(finished||!active.includes(item)) return;
        const p=randomPos();
        el.classList.add('phase');
        distortField();
        el.style.left=p.x+'%'; el.style.top=p.y+'%';
        setTimeout(()=>el.classList.remove('phase'),180);
      },cleared<4?2100+Math.random()*850:cleared<8?1650+Math.random()*700:1300+Math.random()*600);
      timers.push(reposition);
    }
    function spawnBurst(x,y){
      const ripple=document.createElement('span');
      ripple.className='artifact-ripple';
      ripple.style.left=x+'px'; ripple.style.top=y+'px';
      burstLayer.appendChild(ripple);
      setTimeout(()=>ripple.remove(),520);
      const count=cleared>=8?11:8;
      for(let i=0;i<count;i++){
        const p=document.createElement('i');
        p.className='artifact-particle'; p.style.left=x+'px'; p.style.top=y+'px';
        p.style.setProperty('--dx',`${(Math.random()-.5)*110}px`);
        p.style.setProperty('--dy',`${(Math.random()-.5)*110}px`);
        p.style.setProperty('--rot',`${Math.round((Math.random()-.5)*220)}deg`);
        burstLayer.appendChild(p); setTimeout(()=>p.remove(),520);
      }
      field.classList.remove('is-hit');
      void field.offsetWidth;
      field.classList.add('is-hit');
      setTimeout(()=>field.classList.remove('is-hit'),180);
    }
    function popArtifact(item){
      if(finished||!active.includes(item)) return;
      const fr=field.getBoundingClientRect(),r=item.el.getBoundingClientRect();
      spawnBurst(r.left-fr.left+r.width/2,r.top-fr.top+r.height/2);
      item.el.classList.add('popped');
      active=active.filter(a=>a!==item);
      setTimeout(()=>item.el.remove(),220);
      cleared++;
      setIntensity();
      progress.textContent=`${cleared} / 12`;
      steps[cleared-1]?.classList.add('on');
      ping(620+cleared*22,.045,.018); haptic(18);
      stateEl.textContent=cleared===12?'Starstream stabilised':cleared>=8?'Interference critical · keep clearing':`Artefact cleared · ${12-cleared} remaining`;
      if(cleared>=12){finish();return;}
      const desired=maxVisible();
      const t=setTimeout(()=>{while(active.length<desired)createArtifact();},cleared>=8?95:150);
      timers.push(t);
    }
    function finish(){
      finished=true; clearTimers();
      active.forEach(a=>{a.el.classList.add('absorbed');setTimeout(()=>a.el.remove(),240)}); active=[];
      panel?.classList.add('is-complete');
      field.classList.remove('is-distorted','is-hit');
      field.classList.add('stabilised'); beam.classList.add('active');
      progress.textContent='12 / 12';
      ping(920,.12,.045); haptic([28,24,58]);
      setTimeout(()=>showCompletion('Starstream Stabilised',''),900);
    }
    function start(){
      setIntensity();
      createArtifact();
      const t=setTimeout(()=>{if(!finished&&active.length<maxVisible())createArtifact();},900);timers.push(t);
    }
    cleanupMission=()=>{finished=true;clearTimers();active.forEach(a=>a.el.remove());active=[];};
    start();
  }

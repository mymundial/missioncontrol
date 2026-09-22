  function bindArtifacts(){
    const field=document.getElementById('artifactField');
    const layer=document.getElementById('artifactLayer');
    const burstLayer=document.getElementById('artifactBurstLayer');
    const beam=document.getElementById('starstreamBeam');
    const progress=document.getElementById('artifactProgress');
    const stateEl=document.getElementById('artifactState');
    const canvas=document.getElementById('starstreamCanvas');
    const panel=field?.closest('.artifact-panel');
    const steps=[...document.querySelectorAll('[data-artifact-step]')];
    if(!field||!layer||!burstLayer||!beam||!progress||!stateEl||!canvas) return;

    let cleared=0;
    let active=null;
    let timers=[];
    let finished=false;
    let raf=0;
    let resizeObserver=null;
    let lastType='blue';

    function clearTimers(){timers.forEach(clearTimeout);timers=[];}
    function later(fn,delay){const t=setTimeout(()=>{timers=timers.filter(id=>id!==t);fn();},delay);timers.push(t);return t;}
    function randomPos(){return {x:14+Math.random()*72,y:14+Math.random()*70};}
    function intensity(){return cleared<3?1:cleared<7?2:3;}

    function setIntensity(){
      const level=intensity();
      field.dataset.intensity=String(level);
      panel?.classList.toggle('is-live',cleared>0);
      panel?.classList.toggle('is-intense',cleared>=7);
    }

    function renderStability(){
      progress.textContent=`${cleared} / 10`;
      steps.forEach((step,i)=>step.classList.toggle('on',i<cleared));
      setIntensity();
    }

    function startStarstream(){
      const ctx=canvas.getContext('2d',{alpha:true});
      if(!ctx) return;
      const stars=[];
      const STAR_COUNT=150;
      let width=0,height=0,dpr=1,last=performance.now();

      function seed(star,far=false){
        let x=0,y=0;
        do{x=(Math.random()*2-1)*1.22;y=(Math.random()*2-1)*.92;}while(Math.abs(x)<.035&&Math.abs(y)<.035);
        star.x=x;
        star.y=y;
        star.z=far?.96+Math.random()*.24:.08+Math.random()*1.08;
        star.blue=Math.random();
        star.weight=.55+Math.random()*1.35;
      }
      for(let i=0;i<STAR_COUNT;i++){const s={};seed(s,false);stars.push(s);}

      function resize(){
        const rect=field.getBoundingClientRect();
        dpr=Math.min(2,window.devicePixelRatio||1);
        width=Math.max(1,Math.round(rect.width));
        height=Math.max(1,Math.round(rect.height));
        canvas.width=Math.round(width*dpr);
        canvas.height=Math.round(height*dpr);
        canvas.style.width=width+'px';
        canvas.style.height=height+'px';
        ctx.setTransform(dpr,0,0,dpr,0,0);
      }
      resize();
      if(window.ResizeObserver){resizeObserver=new ResizeObserver(resize);resizeObserver.observe(field);}else window.addEventListener('resize',resize);

      function frame(now){
        if(finished&&field.classList.contains('stabilised')===false) return;
        const dt=Math.min(.038,Math.max(.001,(now-last)/1000));
        last=now;
        ctx.clearRect(0,0,width,height);

        const level=Number(field.dataset.intensity)||1;
        const stable=field.classList.contains('stabilised');
        const speed=stable?.10:(level===1?.30:level===2?.43:.58);
        const focal=Math.min(width,height)*.58;
        const cx=width*.49,cy=height*.50;

        for(const s of stars){
          const previousZ=s.z;
          s.z-=speed*dt;
          if(s.z<.055){seed(s,true);continue;}

          const sx=cx+(s.x/s.z)*focal;
          const sy=cy+(s.y/s.z)*focal;
          const prevZ=previousZ+speed*dt*(level===3?3.1:2.45);
          const px=cx+(s.x/prevZ)*focal;
          const py=cy+(s.y/prevZ)*focal;
          if(sx<-80||sx>width+80||sy<-80||sy>height+80){seed(s,true);continue;}

          const proximity=Math.max(0,Math.min(1,1-s.z));
          const alpha=Math.min(.95,.16+proximity*.92);
          const blue=190+Math.round(s.blue*55);
          ctx.beginPath();
          ctx.moveTo(px,py);
          ctx.lineTo(sx,sy);
          ctx.lineWidth=Math.max(.55,s.weight*(.55+proximity*1.25));
          ctx.lineCap='round';
          ctx.strokeStyle=`rgba(${s.blue>.76?190:105},${blue},255,${alpha})`;
          ctx.stroke();

          if(proximity>.66){
            ctx.beginPath();
            ctx.arc(sx,sy,Math.max(.45,s.weight*.62),0,Math.PI*2);
            ctx.fillStyle=`rgba(224,249,255,${Math.min(.9,alpha)})`;
            ctx.fill();
          }
        }
        raf=requestAnimationFrame(frame);
      }
      raf=requestAnimationFrame(frame);
    }

    function distortField(){
      field.classList.remove('is-distorted');
      void field.offsetWidth;
      field.classList.add('is-distorted');
      later(()=>field.classList.remove('is-distorted'),220);
    }

    function chooseType(){
      if(cleared===0) return 'blue';
      if(lastType==='red') return 'blue';
      const chance=cleared<3?.16:cleared<7?.26:.36;
      return Math.random()<chance?'red':'blue';
    }

    function createSignature(){
      if(finished||active) return;
      const type=chooseType();
      lastType=type;
      const pos=randomPos();
      const el=document.createElement('button');
      el.type='button';
      el.className=`starstream-signature is-${type} is-entering`;
      el.style.left=pos.x+'%';
      el.style.top=pos.y+'%';
      el.setAttribute('aria-label',type==='blue'?'Capture blue energy signature':'Avoid red interference signature');
      el.innerHTML=`<span class="signature-orbit orbit-a" aria-hidden="true"></span><span class="signature-orbit orbit-b" aria-hidden="true"></span><span class="signature-core" aria-hidden="true"><img src="./assets/mission-briefing-icon.svg" alt=""></span><i class="signature-scan" aria-hidden="true"></i>`;
      layer.appendChild(el);
      const item={el,type,locked:false};
      active=item;
      later(()=>{if(active===item)el.classList.remove('is-entering');},220);

      const tap=ev=>{
        ev.preventDefault();
        ev.stopPropagation();
        if(finished||!active||active!==item||item.locked) return;
        if(item.type==='red') hitRed(item); else hitBlue(item);
      };
      if(window.PointerEvent) el.addEventListener('pointerdown',tap,{passive:false});
      el.addEventListener('click',tap,{passive:false});

      if(type==='red'){
        const dwell=intensity()===1?1050+Math.random()*380:intensity()===2?850+Math.random()*330:680+Math.random()*290;
        later(()=>passRed(item),dwell);
        return;
      }

      const phaseSignature=()=>{
        if(finished||!active||active!==item||item.locked) return;
        const p=randomPos();
        const level=intensity();
        el.classList.add('phase');
        stateEl.textContent='Blue signature shifted · reacquire';
        later(()=>{
          if(finished||!active||active!==item||item.locked) return;
          el.style.left=p.x+'%';
          el.style.top=p.y+'%';
          el.classList.remove('phase');
          const dwell=level===1?1450+Math.random()*750:level===2?880+Math.random()*650:500+Math.random()*540;
          later(phaseSignature,dwell);
        },level===3?140+Math.random()*110:180+Math.random()*140);
      };
      const firstShift=cleared<3?1450+Math.random()*700:cleared<7?980+Math.random()*600:590+Math.random()*500;
      later(phaseSignature,firstShift);
    }

    function spawnBurst(x,y,tone='blue'){
      const ripple=document.createElement('span');
      ripple.className=`artifact-ripple ${tone==='red'?'is-red':''}`;
      ripple.style.left=x+'px';ripple.style.top=y+'px';
      burstLayer.appendChild(ripple);
      later(()=>ripple.remove(),600);

      const count=cleared>=7?14:10;
      for(let i=0;i<count;i++){
        const p=document.createElement('i');
        p.className=`artifact-particle ${tone==='red'?'is-red':''}`;
        p.style.left=x+'px';p.style.top=y+'px';
        p.style.setProperty('--dx',`${(Math.random()-.5)*150}px`);
        p.style.setProperty('--dy',`${(Math.random()-.5)*150}px`);
        p.style.setProperty('--rot',`${Math.round((Math.random()-.5)*260)}deg`);
        burstLayer.appendChild(p);
        later(()=>p.remove(),600);
      }

      field.classList.remove('is-hit','is-negative');
      void field.offsetWidth;
      field.classList.add(tone==='red'?'is-negative':'is-hit');
      later(()=>field.classList.remove(tone==='red'?'is-negative':'is-hit'),260);
    }

    function signatureCentre(item){
      const fr=field.getBoundingClientRect(),r=item.el.getBoundingClientRect();
      return {x:r.left-fr.left+r.width/2,y:r.top-fr.top+r.height/2};
    }

    function removeSignature(item,className='popped',delay=220){
      if(active===item) active=null;
      item.locked=true;
      item.el.classList.add(className);
      later(()=>item.el.remove(),delay);
    }

    function hitBlue(item){
      if(finished||active!==item||item.locked) return;
      const c=signatureCentre(item);
      spawnBurst(c.x,c.y,'blue');
      removeSignature(item,'popped',230);
      cleared=Math.min(10,cleared+1);
      renderStability();
      ping(630+cleared*20,.045,.018);haptic(18);
      stateEl.textContent=cleared===10?'Starstream stabilised':cleared>=7?'Interference critical · capture blue':`Blue captured · ${10-cleared} remaining`;
      if(cleared>=10){finish();return;}
      later(createSignature,cleared>=7?90:cleared>=3?125:170);
    }

    function hitRed(item){
      if(finished||active!==item||item.locked) return;
      const c=signatureCentre(item);
      spawnBurst(c.x,c.y,'red');
      removeSignature(item,'negative',250);
      const lost=cleared>0;
      cleared=Math.max(0,cleared-1);
      renderStability();
      distortField();
      stateEl.textContent=lost?'Interference spike · stability -1':'Interference spike · avoid red';
      ping(235,.075,.028);haptic([22,26,18]);
      later(createSignature,270);
    }

    function passRed(item){
      if(finished||!active||active!==item||item.locked) return;
      removeSignature(item,'passed',190);
      stateEl.textContent='Red interference passed';
      later(createSignature,150);
    }

    function finish(){
      finished=true;
      clearTimers();
      if(active){active.el.classList.add('absorbed');setTimeout(()=>active?.el?.remove(),220);active=null;}
      panel?.classList.add('is-complete');
      field.classList.remove('is-distorted','is-hit','is-negative');
      field.classList.add('stabilised');
      beam.classList.add('active');
      progress.textContent='10 / 10';
      ping(920,.12,.045);haptic([28,24,58]);
      setTimeout(()=>showCompletion('Starstream Stabilised',''),900);
    }

    renderStability();
    startStarstream();
    createSignature();

    cleanupMission=()=>{
      finished=true;
      clearTimers();
      if(raf)cancelAnimationFrame(raf);
      resizeObserver?.disconnect?.();
      active?.el?.remove();
      active=null;
    };
  }

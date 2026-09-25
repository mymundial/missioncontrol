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

    const EMOTIONS=[
      {id:'love',name:'Love',rgb:'240,82,97',icon:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 40 8.7 25.3C2.8 19.6 6.4 9 15 9c4.1 0 7.2 2.2 9 5.2C25.8 11.2 28.9 9 33 9c8.6 0 12.2 10.6 6.3 16.3L24 40Z" fill="currentColor"/></svg>`},
      {id:'joy',name:'Joy',rgb:'255,212,71',icon:`<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="8" fill="currentColor"/><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11.3 11.3l4.2 4.2M32.5 32.5l4.2 4.2M36.7 11.3l-4.2 4.2M15.5 32.5l-4.2 4.2"/></g></svg>`},
      {id:'cheer',name:'Cheer',rgb:'244,111,168',icon:`<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M10 34c0-8.3 6.3-15 14-15s14 6.7 14 15"/><path d="M15 34c0-5.3 4-9.5 9-9.5s9 4.2 9 9.5"/><path d="M20 34c0-2.4 1.8-4.5 4-4.5s4 2.1 4 4.5"/></svg>`},
      {id:'kindness',name:'Kindness',rgb:'168,121,216',icon:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M20.5 37 9.8 26.7C5.6 22.6 8.1 15 14.2 15c2.8 0 5.1 1.5 6.3 3.7 1.3-2.2 3.5-3.7 6.4-3.7 6 0 8.6 7.6 4.3 11.7L20.5 37Z" fill="currentColor"/><path d="m35.5 7 1.4 4.1L41 12.5l-4.1 1.4-1.4 4.1-1.4-4.1-4.1-1.4 4.1-1.4L35.5 7Z" fill="currentColor"/></svg>`},
      {id:'friendship',name:'Friendship',rgb:'143,103,197',icon:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M18.5 35 9.6 26.4C6 22.9 8.2 16.5 13.3 16.5c2.4 0 4.2 1.2 5.2 3 1.1-1.8 2.9-3 5.3-3 1.3 0 2.4.4 3.4 1" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M29.5 35 20.6 26.4c-3.6-3.5-1.4-9.9 3.7-9.9 2.4 0 4.2 1.2 5.2 3 1.1-1.8 2.9-3 5.3-3 5.1 0 7.3 6.4 3.7 9.9L29.5 35Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>`},
      {id:'hope',name:'Hope',rgb:'85,201,207',icon:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m31 10 2.5 6 6.5.5-5 4.3 1.5 6.2-5.5-3.4-5.5 3.4 1.5-6.2-5-4.3 6.5-.5L31 10Z" fill="currentColor"/><path d="M8 34c6-1 10.5-3.1 14-6.5M11 39c6-1.8 10.5-4.6 14-8.3" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`},
      {id:'generosity',name:'Generosity',rgb:'117,201,107',icon:`<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><rect x="9" y="19" width="30" height="21" rx="2"/><path d="M24 19v21M7 19h34v-6H7v6Z"/><path d="M24 13c-5.5 0-9-1.7-9-4.5C15 6.6 16.6 5 18.6 5 22.2 5 24 10.2 24 13Zm0 0c5.5 0 9-1.7 9-4.5C33 6.6 31.4 5 29.4 5 25.8 5 24 10.2 24 13Z"/></svg>`},
      {id:'wonder',name:'Wonder',rgb:'90,173,225',icon:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m24 5 4.3 12.7L41 22l-12.7 4.3L24 39l-4.3-12.7L7 22l12.7-4.3L24 5Z" fill="currentColor"/><path d="m38 8 1.3 3.7L43 13l-3.7 1.3L38 18l-1.3-3.7L33 13l3.7-1.3L38 8Z" fill="currentColor" opacity=".78"/></svg>`}
    ];

    let cleared=0;
    let active=null;
    let timers=[];
    let finished=false;
    let raf=0;
    let resizeObserver=null;
    let emotionBag=[];

    function clearTimers(){timers.forEach(clearTimeout);timers=[];}
    function later(fn,delay){const t=setTimeout(()=>{timers=timers.filter(id=>id!==t);fn();},delay);timers.push(t);return t;}
    function randomPos(){return {x:14+Math.random()*72,y:14+Math.random()*70};}
    function intensity(){return cleared<3?1:cleared<7?2:3;}
    function refillEmotionBag(){
      emotionBag=[...EMOTIONS];
      for(let i=emotionBag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[emotionBag[i],emotionBag[j]]=[emotionBag[j],emotionBag[i]];}
    }
    function nextEmotion(){if(!emotionBag.length)refillEmotionBag();return emotionBag.pop();}

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

    function createSignature(){
      if(finished||active) return;
      const emotion=nextEmotion();
      const pos=randomPos();
      const el=document.createElement('button');
      el.type='button';
      el.className=`starstream-signature emotion-signature emotion-${emotion.id} is-entering`;
      el.style.left=pos.x+'%';
      el.style.top=pos.y+'%';
      el.style.setProperty('--emotion-rgb',emotion.rgb);
      el.setAttribute('aria-label',`Capture ${emotion.name} energy signature`);
      el.innerHTML=`<span class="signature-orbit orbit-a" aria-hidden="true"></span><span class="signature-orbit orbit-b" aria-hidden="true"></span><span class="signature-core signature-emotion-icon" aria-hidden="true">${emotion.icon}</span><i class="signature-scan" aria-hidden="true"></i>`;
      layer.appendChild(el);
      const item={el,emotion,locked:false};
      active=item;
      later(()=>{if(active===item)el.classList.remove('is-entering');},220);

      const tap=ev=>{
        ev.preventDefault();
        ev.stopPropagation();
        if(finished||!active||active!==item||item.locked) return;
        captureEmotion(item);
      };
      if(window.PointerEvent) el.addEventListener('pointerdown',tap,{passive:false});
      el.addEventListener('click',tap,{passive:false});
    }

    function spawnBurst(x,y,rgb){
      const ripple=document.createElement('span');
      ripple.className='artifact-ripple is-emotion';
      ripple.style.left=x+'px';ripple.style.top=y+'px';
      ripple.style.setProperty('--emotion-rgb',rgb);
      burstLayer.appendChild(ripple);
      later(()=>ripple.remove(),600);

      const count=cleared>=7?14:10;
      for(let i=0;i<count;i++){
        const p=document.createElement('i');
        p.className='artifact-particle is-emotion';
        p.style.left=x+'px';p.style.top=y+'px';
        p.style.setProperty('--emotion-rgb',rgb);
        p.style.setProperty('--dx',`${(Math.random()-.5)*150}px`);
        p.style.setProperty('--dy',`${(Math.random()-.5)*150}px`);
        p.style.setProperty('--rot',`${Math.round((Math.random()-.5)*260)}deg`);
        burstLayer.appendChild(p);
        later(()=>p.remove(),600);
      }

      field.classList.remove('is-hit');
      void field.offsetWidth;
      field.classList.add('is-hit');
      later(()=>field.classList.remove('is-hit'),260);
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

    function captureEmotion(item){
      if(finished||active!==item||item.locked) return;
      const c=signatureCentre(item);
      spawnBurst(c.x,c.y,item.emotion.rgb);
      removeSignature(item,'popped',230);
      cleared=Math.min(10,cleared+1);
      renderStability();
      ping(630+cleared*20,.045,.018);haptic(18);
      stateEl.textContent=cleared===10?'Power stabilised':`${item.emotion.name} energy captured · ${10-cleared} remaining`;
      if(cleared>=10){finish();return;}
      later(createSignature,cleared>=7?90:cleared>=3?125:170);
    }

    function finish(){
      finished=true;
      clearTimers();
      if(active){active.el.classList.add('absorbed');setTimeout(()=>active?.el?.remove(),220);active=null;}
      panel?.classList.add('is-complete');
      field.classList.remove('is-hit');
      field.classList.add('stabilised');
      beam.classList.add('active');
      progress.textContent='10 / 10';
      ping(920,.12,.045);haptic([28,24,58]);
      setTimeout(()=>showCompletion('Power Stabilised','Santa-1’s propulsion system has been tested and is ready for flight.'),900);
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

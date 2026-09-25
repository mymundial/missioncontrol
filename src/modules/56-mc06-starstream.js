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

    const ENERGY_SIGNATURES=[
      {id:'clover',name:'Clover',rgb:'117,201,107',icon:'./assets/power-pulse-icons/clover-green.png?v=7.38.43'},
      {id:'rainbow',name:'Rainbow',rgb:'244,111,168',icon:'./assets/power-pulse-icons/rainbow-pink.png?v=7.38.43'},
      {id:'flower',name:'Flower',rgb:'168,121,216',icon:'./assets/power-pulse-icons/flower-purple.png?v=7.38.43'},
      {id:'star',name:'Star',rgb:'255,212,71',icon:'./assets/power-pulse-icons/star-yellow.png?v=7.38.43'},
      {id:'moon',name:'Moon',rgb:'90,173,225',icon:'./assets/power-pulse-icons/moon-blue.png?v=7.38.43'},
      {id:'heart',name:'Heart',rgb:'240,82,97',icon:'./assets/power-pulse-icons/heart-red.png?v=7.38.43'},
      {id:'sun',name:'Sun',rgb:'255,165,55',icon:'./assets/power-pulse-icons/sun-orange.png?v=7.38.43'},
      {id:'snowflake',name:'Snowflake',rgb:'238,243,250',icon:'./assets/power-pulse-icons/snowflake-white.png?v=7.38.43'}
    ];

    let cleared=0;
    let active=null;
    let timers=[];
    let finished=false;
    let raf=0;
    let resizeObserver=null;
    let signatureBag=[];

    function clearTimers(){timers.forEach(clearTimeout);timers=[];}
    function later(fn,delay){const t=setTimeout(()=>{timers=timers.filter(id=>id!==t);fn();},delay);timers.push(t);return t;}
    function randomPos(){return {x:14+Math.random()*72,y:14+Math.random()*70};}
    function intensity(){return cleared<3?1:cleared<7?2:3;}
    function refillSignatureBag(){
      signatureBag=[...ENERGY_SIGNATURES];
      for(let i=signatureBag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[signatureBag[i],signatureBag[j]]=[signatureBag[j],signatureBag[i]];}
    }
    function nextSignature(){if(!signatureBag.length)refillSignatureBag();return signatureBag.pop();}

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
      for(let i=0;i<STAR_COUNT;i++){const star={};seed(star,false);stars.push(star);}

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

        for(const star of stars){
          const previousZ=star.z;
          star.z-=speed*dt;
          if(star.z<.055){seed(star,true);continue;}

          const sx=cx+(star.x/star.z)*focal;
          const sy=cy+(star.y/star.z)*focal;
          const prevZ=previousZ+speed*dt*(level===3?3.1:2.45);
          const px=cx+(star.x/prevZ)*focal;
          const py=cy+(star.y/prevZ)*focal;
          if(sx<-80||sx>width+80||sy<-80||sy>height+80){seed(star,true);continue;}

          const proximity=Math.max(0,Math.min(1,1-star.z));
          const alpha=Math.min(.95,.16+proximity*.92);
          const blue=190+Math.round(star.blue*55);
          ctx.beginPath();
          ctx.moveTo(px,py);
          ctx.lineTo(sx,sy);
          ctx.lineWidth=Math.max(.55,star.weight*(.55+proximity*1.25));
          ctx.lineCap='round';
          ctx.strokeStyle=`rgba(${star.blue>.76?190:105},${blue},255,${alpha})`;
          ctx.stroke();

          if(proximity>.66){
            ctx.beginPath();
            ctx.arc(sx,sy,Math.max(.45,star.weight*.62),0,Math.PI*2);
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
      const signature=nextSignature();
      const pos=randomPos();
      const el=document.createElement('button');
      el.type='button';
      el.className=`starstream-signature emotion-signature energy-${signature.id} is-entering`;
      el.style.left=pos.x+'%';
      el.style.top=pos.y+'%';
      el.style.setProperty('--emotion-rgb',signature.rgb);
      el.setAttribute('aria-label',`Capture ${signature.name} positive energy signature`);
      el.innerHTML=`<img class="power-pulse-energy-icon" src="${signature.icon}" alt="" draggable="false">`;
      layer.appendChild(el);
      const item={el,signature,locked:false};
      active=item;
      later(()=>{if(active===item)el.classList.remove('is-entering');},220);

      const tap=ev=>{
        ev.preventDefault();
        ev.stopPropagation();
        if(finished||!active||active!==item||item.locked) return;
        captureSignature(item);
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

    function captureSignature(item){
      if(finished||active!==item||item.locked) return;
      const c=signatureCentre(item);
      spawnBurst(c.x,c.y,item.signature.rgb);
      removeSignature(item,'popped',230);
      cleared=Math.min(10,cleared+1);
      renderStability();
      ping(630+cleared*20,.045,.018);haptic(18);
      stateEl.textContent=cleared===10?'Power stabilised':`${item.signature.name} energy captured · ${10-cleared} remaining`;
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
      setTimeout(()=>showCompletion('Power Stabilised','The racing energy has been stabilised and is ready to power Santa-1.'),900);
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

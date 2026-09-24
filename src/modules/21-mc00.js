  let mc00ScanTimer = null;
  let mc00ScanRaf = null;

  function stopMc00Scan(){
    if(mc00ScanTimer){ clearInterval(mc00ScanTimer); mc00ScanTimer = null; }
    if(mc00ScanRaf){ cancelAnimationFrame(mc00ScanRaf); mc00ScanRaf = null; }
  }

  function continueMc00Sequence(mode){
    stopMc00Scan();
    set({ bootDone: 'brief' });
  }

  function bindMc00Scan(step){
    if(step!=='mc00-live') return;
    const card = document.querySelector('.mc00-card');
    const bar = document.getElementById('mc00ProgressFill');
    const value = document.getElementById('mc00ProgressValue');
    const progress = document.querySelector('.mc00-progress');
    const complete = document.getElementById('mc00CompleteBlock');
    const button = document.getElementById('mc00Continue');
    if(!card || !bar || !value || !progress || !complete || !button) return;

    stopMc00Scan();

    const scanSystems = [
      { key:'comms', start:3, end:14 },
      { key:'power', start:16, end:27 },
      { key:'core', start:29, end:40 },
      { key:'propulsion', start:42, end:53 },
      { key:'guidance', start:55, end:66 },
      { key:'control', start:68, end:79 },
      { key:'response', start:81, end:91 },
      { key:'navigation', start:93, end:99 }
    ];

    let progressValue = 0;
    const lastStates = new Map();

    const setSystemState = (key,nextState)=>{
      if(lastStates.get(key)===nextState) return;
      lastStates.set(key,nextState);
      const item=document.querySelector(`[data-mc00-system="${key}"]`);
      const status=document.querySelector(`[data-mc00-status="${key}"]`);
      if(!item||!status) return;
      item.classList.remove('is-standby','is-checking','is-offline','is-online');
      item.classList.add(`is-${nextState}`);
      status.textContent=nextState==='checking'?'Checking':nextState==='offline'?'Offline':nextState==='online'?'Online':'Standby';
    };

    const paint = ()=>{
      bar.style.transform = `scaleX(${progressValue/100})`;
      value.textContent = `${progressValue}%`;
      progress.setAttribute('aria-valuenow', String(progressValue));

      scanSystems.forEach(system=>{
        const nextState = progressValue < system.start
          ? 'standby'
          : progressValue < system.end
            ? 'checking'
            : 'offline';
        setSystemState(system.key,nextState);
      });

      if(progressValue >= 100){
        stopMc00Scan();
        card.classList.add('is-complete');
        complete.hidden = false;
      }
    };

    scanSystems.forEach(system=>setSystemState(system.key,'standby'));
    paint();
    card.classList.remove('is-complete');
    complete.hidden = true;

    mc00ScanTimer = setInterval(()=>{
      progressValue = Math.min(100, progressValue + 1);
      paint();
      if(progressValue === 100){
        ping(860,.12,.05);
        haptic([20,35,65]);
      } else if(progressValue % 13 === 0){
        ping(620 + (progressValue * 2), .05, .02);
      }
    }, 45);
  }

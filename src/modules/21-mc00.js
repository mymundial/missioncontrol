  let mc00ScanTimer = null;
  let mc00ScanRaf = null;

  function stopMc00Scan(){
    if(mc00ScanTimer){ clearInterval(mc00ScanTimer); mc00ScanTimer = null; }
    if(mc00ScanRaf){ cancelAnimationFrame(mc00ScanRaf); mc00ScanRaf = null; }
  }

  function continueMc00Sequence(mode){
    stopMc00Scan();
    const nextStep = mode==='mc00-demo' ? 'demo-scan' : 'brief';
    set({ bootDone: nextStep });
  }

  function bindMc00Scan(step){
    if(step!=='mc00-live' && step!=='mc00-demo') return;
    const card = document.querySelector('.mc00-card');
    const bar = document.getElementById('mc00ProgressFill');
    const value = document.getElementById('mc00ProgressValue');
    const status = document.getElementById('mc00StatusLine');
    const progress = document.querySelector('.mc00-progress');
    const complete = document.getElementById('mc00CompleteBlock');
    const button = document.getElementById('mc00Continue');
    if(!card || !bar || !value || !status || !progress || !complete || !button) return;

    stopMc00Scan();

    const script = [
      { at: 0, text: 'Initialising scan' },
      { at: 12, text: 'Power: scanning' },
      { at: 24, text: 'Power: offline' },
      { at: 40, text: 'Comms: scanning' },
      { at: 54, text: 'Comms: offline' },
      { at: 70, text: 'Navigation: scanning' },
      { at: 84, text: 'Navigation: offline' }
    ];

    let progressValue = 0;
    let lastText = '';

    const paint = ()=>{
      bar.style.width = `${progressValue}%`;
      value.textContent = `${progressValue}%`;
      progress.setAttribute('aria-valuenow', String(progressValue));
      const line = script.reduce((active, item)=>progressValue >= item.at ? item : active, script[0]);
      if(line.text !== lastText){
        lastText = line.text;
        status.textContent = line.text;
      }
      if(progressValue >= 100){
        stopMc00Scan();
        card.classList.add('is-complete');
        complete.hidden = false;
      }
    };

    paint();
    card.classList.remove('is-complete');
    complete.hidden = true;

    mc00ScanTimer = setInterval(()=>{
      progressValue = Math.min(100, progressValue + 1);
      paint();
      if(progressValue === 100){
        ping(860,.12,.05);
        haptic([20,35,65]);
      } else if(progressValue % 18 === 0){
        ping(620 + (progressValue * 2), .05, .02);
      }
    }, 45);
  }

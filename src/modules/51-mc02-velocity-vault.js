  function bindDiagnostics(){
    const done=new Set();
    const durations=[4300,4250,4230,1200,2500,3360];
    const scanAudioPaths=[
      './assets/mc02-scan-aero.mp3',
      './assets/mc02-scan-stability.mp3',
      './assets/mc02-scan-power.mp3',
      './assets/mc02-scan-control.mp3',
      './assets/mc02-scan-traction.mp3',
      './assets/mc02-scan-response.mp3'
    ];
    const scanAudio=scanAudioPaths.map(src=>{
      const audio=new Audio(src);
      audio.preload='auto';
      audio.volume=.72;
      return audio;
    });
    let busy=false;

    function playDiagnosticScanFx(index){
      if(!state.audio)return;
      const audio=scanAudio[index];
      if(!audio)return;
      try{
        audio.currentTime=0;
        audio.volume=.72;
        const play=audio.play();
        if(play&&typeof play.catch==='function')play.catch(()=>{});
      }catch{}
    }

    document.querySelectorAll('[data-sensor]').forEach(btn=>btn.onclick=()=>{
      const i=Number(btn.dataset.sensor);
      if(done.has(i)||busy)return;
      busy=true;
      document.querySelectorAll('[data-sensor]').forEach(other=>{ if(other!==btn&&!other.classList.contains('done')) other.classList.add('scan-locked'); });
      btn.classList.add('active');
      btn.querySelector('.state').textContent='Scanning…';
      playDiagnosticScanFx(i);
      haptic(12);
      setTimeout(()=>{
        done.add(i);
        btn.classList.remove('active');
        btn.classList.add('done');
        btn.querySelector('.state').innerHTML='Captured <span class="checkmark-icon checkmark-icon--inline" aria-hidden="true"></span>';
        document.querySelectorAll('[data-sensor]').forEach(other=>other.classList.remove('scan-locked'));
        haptic(24);
        busy=false;
        if(done.size===6)document.getElementById('diagComplete').disabled=false;
      },durations[i]||1800);
    });
    document.getElementById('diagComplete').onclick=()=>{
      showCompletion('Performance Scan Complete','The racing performance data has been captured and is ready to support Santa-1’s recovery systems.');
    };
  }

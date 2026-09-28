  function bindDiagnostics(){
    const done=new Set();
    const durations=[1600,1900,1700,2000,1800,2200];
    let busy=false;
    function playDiagnosticScanFx(index,complete=false){
      if(!state.audio)return;
      const ctx=ensureAudio();if(!ctx)return;
      const now=ctx.currentTime;
      const osc=ctx.createOscillator();const gain=ctx.createGain();const filter=ctx.createBiquadFilter();
      osc.type=index%2?'triangle':'sine';
      osc.frequency.setValueAtTime(complete?620+index*38:300+index*34,now);
      osc.frequency.exponentialRampToValueAtTime(complete?980+index*42:680+index*44,now+(complete?.13:.24));
      filter.type='bandpass';filter.frequency.value=1100;filter.Q.value=.8;
      gain.gain.setValueAtTime(complete?.035:.022,now);gain.gain.exponentialRampToValueAtTime(.0001,now+(complete?.15:.27));
      osc.connect(filter).connect(gain).connect(ctx.destination);osc.start(now);osc.stop(now+(complete?.16:.28));
    }
    document.querySelectorAll('[data-sensor]').forEach(btn=>btn.onclick=()=>{
      const i=Number(btn.dataset.sensor);
      if(done.has(i)||busy)return;
      busy=true;
      document.querySelectorAll('[data-sensor]').forEach(other=>{ if(other!==btn&&!other.classList.contains('done')) other.classList.add('scan-locked'); });
      btn.classList.add('active');
      btn.querySelector('.state').textContent='Scanning…';
      playDiagnosticScanFx(i,false);
      ping(420+i*85,.07,.012);
      haptic(12);
      setTimeout(()=>{
        done.add(i);
        btn.classList.remove('active');
        btn.classList.add('done');
        btn.querySelector('.state').innerHTML='Captured <span class="checkmark-icon checkmark-icon--inline" aria-hidden="true"></span>';
        document.querySelectorAll('[data-sensor]').forEach(other=>other.classList.remove('scan-locked'));
        playDiagnosticScanFx(i,true);
        ping(720+i*40,.05,.016);
        haptic(24);
        busy=false;
        if(done.size===6)document.getElementById('diagComplete').disabled=false;
      },durations[i]||1800);
    });
    document.getElementById('diagComplete').onclick=()=>showCompletion('Performance Scan Complete','The racing performance data has been captured and is ready to support Santa-1’s recovery systems.');
  }


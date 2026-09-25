  function bindDiagnostics(){
    const done=new Set();
    const durations=[1600,1900,1700,2000,1800,2200];
    let busy=false;
    document.querySelectorAll('[data-sensor]').forEach(btn=>btn.onclick=()=>{
      const i=Number(btn.dataset.sensor);
      if(done.has(i)||busy)return;
      busy=true;
      document.querySelectorAll('[data-sensor]').forEach(other=>{ if(other!==btn&&!other.classList.contains('done')) other.classList.add('scan-locked'); });
      btn.classList.add('active');
      btn.querySelector('.state').textContent='Scanning…';
      ping(420+i*85,.07,.02);
      haptic(12);
      setTimeout(()=>{
        done.add(i);
        btn.classList.remove('active');
        btn.classList.add('done');
        btn.querySelector('.state').innerHTML='Captured <span class="checkmark-icon checkmark-icon--inline" aria-hidden="true"></span>';
        document.querySelectorAll('[data-sensor]').forEach(other=>other.classList.remove('scan-locked'));
        ping(720+i*40,.06,.025);
        haptic(24);
        busy=false;
        if(done.size===6)document.getElementById('diagComplete').disabled=false;
      },durations[i]||1800);
    });
    document.getElementById('diagComplete').onclick=()=>showCompletion('Performance Scan Complete','The racing performance data has been captured and is ready to support Santa-1’s recovery systems.');
  }


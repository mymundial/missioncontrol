  function bindLapland(){
    const btn=document.getElementById('initiateTest');
    // Final verification mirrors the MC-00 system bank. The first seven rows
    // validate restored route systems; LAUNCH remains BLOCKED until those
    // checks have all passed, then changes directly to CLEAR.
    const checks=['power','luffield','spirit','comet','jingle','lando','aurora'];
    const systemKeys=['power','comms','core','control','propulsion','response','navigation'];
    btn.onclick=()=>{
      if(btn.dataset.review==='true'){ set({missionOpen:null,nav:'missions'}); return; }
      btn.disabled=true;
      const missing=[];

      checks.forEach((checkpointId,i)=>setTimeout(()=>{
        const key=systemKeys[i];
        const row=document.querySelector(`[data-verify-system="${key}"]`);
        const status=document.querySelector(`[data-verify-status="${key}"]`);
        if(!row||!status) return;
        row.classList.remove('is-standby','is-online','is-offline','is-checking');
        row.classList.add('is-checking');
        status.textContent='Checking';
        ping(430+i*45,.04,.014);

        setTimeout(()=>{
          const ready=state.completed.includes(checkpointId);
          row.classList.remove('is-checking');
          row.classList.add(ready?'is-online':'is-offline');
          status.textContent=ready?'Online':'Offline';
          if(!ready) missing.push(checkpointId);
          ping(ready?540+i*50:220,.055,.018);

          if(i===checks.length-1){
            setTimeout(()=>{
              const launchRow=document.querySelector('[data-verify-system="launch"]');
              const launchStatus=document.querySelector('[data-verify-status="launch"]');
              const clear=!missing.length;
              if(launchRow&&launchStatus){
                launchRow.classList.remove('is-blocked','is-clear');
                launchRow.classList.add(clear?'is-clear':'is-blocked');
                launchStatus.textContent=clear?'Clear':'Blocked';
              }
              if(clear){
                showCompletion('All Systems Green','Every restored system has passed verification. Santa-1 is ready for the final flight authorisation.');
              } else {
                btn.disabled=false; btn.dataset.review='true'; btn.textContent='View Missions';
                const note=document.createElement('div'); note.className='final-check-note';
                note.innerHTML=`<div class="kicker">Systems Require Attention</div><p>${missing.length} ${missing.length===1?'system':'systems'} must be restored before Santa-1 can be cleared for launch.</p>`;
                btn.closest('.mission-instrument').appendChild(note); haptic([20,35,20]);
              }
            },650);
          }
        },260);
      },350+i*520));
    };
  }

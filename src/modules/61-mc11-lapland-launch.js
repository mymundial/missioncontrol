  function bindLapland(){
    const btn=document.getElementById('initiateTest');
    // Final verification reflects route activations only. The Comms line is
    // satisfied by completing MC-03 / Luffield (ELF FM activation); tuning the
    // separate ELF FM radio in Comms is optional and must not affect launch.
    const checks=['power','luffield','spirit','comet','jingle','lando','aurora'];
    btn.onclick=()=>{
      if(btn.dataset.review==='true'){ set({missionOpen:null,nav:'missions'}); return; }
      btn.disabled=true;
      const rows=[...document.querySelectorAll('[data-verify]')];
      const missing=[];
      rows.forEach((r,i)=>setTimeout(()=>{
        const checkpointId=checks[i];
        const ready=state.completed.includes(checkpointId);
        r.classList.toggle('ok',ready); r.classList.toggle('attention',!ready);
        r.children[1].textContent=ready?'Verified':'Required';
        if(!ready) missing.push(checkpointId);
        ping(ready?500+i*55:220,.055,.018);
        if(i===rows.length-1)setTimeout(()=>{
          if(!missing.length){
            showCompletion('All Systems Green','Every restored system has passed verification. Santa-1 is ready for the final flight authorisation.');
          } else {
            btn.disabled=false; btn.dataset.review='true'; btn.textContent='View Missions';
            const note=document.createElement('div'); note.className='final-check-note';
            note.innerHTML=`<div class="kicker">Systems Require Attention</div><p>${missing.length} ${missing.length===1?'system':'systems'} must be restored before Santa-1 can be cleared for launch.</p>`;
            btn.closest('.mission-instrument').appendChild(note); haptic([20,35,20]);
          }
        },650);
      },450+i*430));
    };
  }


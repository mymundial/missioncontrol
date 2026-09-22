  function bindLapland(){
    const btn=document.getElementById('initiateTest');
    const panel=document.getElementById('laplandPanel');
    const payoff=document.getElementById('laplandPayoff');
    if(!btn||!panel) return;

    // Final verification deliberately mirrors MC-00: the same seven restored
    // systems resolve from STANDBY -> CHECKING -> ONLINE, then LAUNCH resolves
    // STANDBY -> CHECKING -> CLEAR only after the route systems pass.
    const checks=['power','luffield','spirit','comet','jingle','lando','aurora'];
    const systemKeys=['power','comms','core','control','propulsion','response','navigation'];
    const setCharge=value=>panel.style.setProperty('--lapland-charge',String(Math.max(0,Math.min(1,value))));
    const setRowState=(key,nextState,label)=>{
      const row=document.querySelector(`[data-verify-system="${key}"]`);
      const status=document.querySelector(`[data-verify-status="${key}"]`);
      if(!row||!status) return;
      row.classList.remove('is-standby','is-online','is-offline','is-checking','is-blocked','is-clear');
      row.classList.add(`is-${nextState}`);
      status.textContent=label;
    };

    btn.onclick=()=>{
      if(btn.dataset.review==='true'){ set({missionOpen:null,nav:'missions'}); return; }
      btn.disabled=true;
      panel.classList.remove('is-complete','has-attention');
      panel.classList.add('is-verifying');
      if(payoff) payoff.hidden=true;
      setCharge(0);
      const missing=[];

      systemKeys.forEach(key=>setRowState(key,'standby','Standby'));
      setRowState('launch','standby','Standby');

      checks.forEach((checkpointId,i)=>setTimeout(()=>{
        const key=systemKeys[i];
        setRowState(key,'checking','Checking');
        ping(430+i*45,.04,.014);

        setTimeout(()=>{
          const ready=state.completed.includes(checkpointId);
          setRowState(key,ready?'online':'offline',ready?'Online':'Offline');
          if(!ready) missing.push(checkpointId);
          setCharge((i+1)/8);
          ping(ready?540+i*50:220,.055,.018);

          if(i===checks.length-1){
            setTimeout(()=>{
              setRowState('launch','checking','Checking');
              ping(770,.055,.018);
              setTimeout(()=>{
                const clear=!missing.length;
                setRowState('launch',clear?'clear':'blocked',clear?'Clear':'Blocked');
                setCharge(1);
                panel.classList.remove('is-verifying');

                if(clear){
                  panel.classList.add('is-complete');
                  document.querySelector('.lapland-head')?.classList.add('is-launch-clear');
                  btn.hidden=true;
                  if(payoff) payoff.hidden=false;
                  ping(940,.16,.055); haptic([25,35,85]);
                  setTimeout(()=>{
                    if(state.missionOpen==='lapland'){
                      showCompletion('Launch Clear','Every restored system has passed final verification. Santa-1 is ready for final flight authorisation.');
                    }
                  },1250);
                } else {
                  panel.classList.add('has-attention');
                  btn.disabled=false; btn.dataset.review='true'; btn.textContent='View Missions';
                  const note=document.createElement('div'); note.className='final-check-note';
                  note.innerHTML=`<div class="kicker">Systems Require Attention</div><p>${missing.length} ${missing.length===1?'system':'systems'} must be restored before Santa-1 can be cleared for launch.</p>`;
                  panel.appendChild(note); haptic([20,35,20]);
                }
              },380);
            },420);
          }
        },240);
      },260+i*430));
    };
  }

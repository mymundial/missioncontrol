  function shell(content, nav=true){ return `<main class="phone ${nav?'':'no-nav'}"><div class="screen">${content}</div>${nav?navBar():''}</main>`; }
  function navPageContent(){
    if(state.nav==='missions') return renderMissions();
    if(state.nav==='sleigh') return renderSleigh();
    if(state.nav==='comms') return renderComms();
    return renderRadar();
  }
  function navShell(){
    return `<main class="phone"><div class="screen">${topBar()}<div class="nav-view" data-view="${state.nav}">${navPageContent()}</div></div>${navBar()}</main>`;
  }
  function syncNavChrome(){
    document.querySelectorAll('[data-nav]').forEach(btn=>btn.classList.toggle('active',btn.dataset.nav===state.nav));
    updateCommsBadge();
  }
  function renderNavShell(){
    const view=document.querySelector('.phone:not(.no-nav) .nav-view');
    const masthead=document.querySelector('.phone:not(.no-nav) .screen>.topbar');
    if(view&&masthead){
      view.dataset.view=state.nav;
      view.innerHTML=navPageContent();
      syncNavChrome();
      return;
    }
    app.innerHTML=navShell();
  }
  function brand(){return `<div class="brand"><img src="./assets/silverstone-logo-landscape-cropped.webp" alt="Silverstone"></div>`}
  function navIcon(id){
    const icons={
      radar:`<svg viewBox="0 0 210 126" aria-hidden="true"><path fill="currentColor" d="M105 60.5c-11.8 0-23.1 4.9-31.2 13.6l4.4 4.1c13.7-14.8 36.8-15.7 51.6-1.9.6.6 1.2 1.2 1.8 1.8l4.4-4.1C128 65.3 116.7 60.5 105 60.5Zm0 30c-7 0-12.7 5.6-12.7 12.6S98 115.8 105 115.8s12.7-5.6 12.7-12.6c0-3.3-1.2-6.4-3.5-8.8-2.4-2.5-5.8-3.9-9.2-3.9Zm0 19.3c-3.7 0-6.6-3-6.6-6.6s3-6.6 6.6-6.6c3.6 0 6.6 3 6.6 6.6s-2.9 6.5-6.6 6.6ZM105 9.2C79 9.2 54.1 20 36.4 39l4.4 4.1c33.1-35.4 88.6-37.4 124.1-4.3 1.4 1.3 2.8 2.7 4.1 4.1l4.4-4.1C155.7 19.9 130.9 9.2 105 9.2Zm0 25.6c-18.9 0-37 7.8-49.9 21.7l4.4 4.1c23.4-25.1 62.7-26.5 87.9-3.1 1 .9 2 1.9 3 2.9l4.4-4.1c-13.1-13.7-31-21.5-49.8-21.5Z"/></svg>`,
      missions:`<svg viewBox="0 0 210 126" aria-hidden="true"><path fill="currentColor" d="M142 62.7H86.9v6H142v-6Zm0 15.4H86.9v6H142v-6Zm0-30.9H86.9v6H142v-6Zm-61.1-15.4H68.1v6h12.8v-6Zm61.1 0H86.9v6H142v-6Zm2.2-26.5H65.8l-12.3 6v102l12.3 6h78.5l12.3-6v-102l-12.4-6Zm6.3 108H59.5v-102h91.1v102ZM80.9 78.1H68.1v6h12.8v-6Zm0-30.9H68.1v6h12.8v-6Zm0 15.5H68.1v6h12.8v-6Z"/></svg>`,
      comms:`<svg viewBox="0 0 210 126" aria-hidden="true"><path fill="currentColor" d="M105 8.62a46.17 46.17 0 0 1 46.12 46.12h6a52.14 52.14 0 0 0-104.27 0h6A46.17 46.17 0 0 1 105 8.62Zm41.18 50.67c-7.73 0-13.12 5.49-13.12 13.36V86c0 7.89 4.87 13.18 12.11 13.18a12.52 12.52 0 0 0 4.41-.77c-2.54 7.83-8.27 11.22-18.1 11.22H119a9 9 0 0 0-8.45-6H99.32a8.95 8.95 0 1 0 0 17.89h11.25a9 9 0 0 0 8.39-5.86h12.51c17.54 0 25.7-9.42 25.7-29.64V59.29Zm-35.6 56.2H99.32a2.93 2.93 0 0 1 0-5.86h11.25a2.93 2.93 0 1 1 0 5.86ZM151.16 86c0 4.49-2.24 7.17-6 7.17s-6.1-2.61-6.1-7.17V72.65c0-3.55 1.87-7.34 7.11-7.34h5Zm-14-44.19A3 3 0 0 0 140 43.69a3.17 3.17 0 0 0 1.12-.21 3 3 0 0 0 1.67-3.92 40.73 40.73 0 0 0-75.58 0 3 3 0 1 0 5.58 2.25 34.71 34.71 0 0 1 64.42 0ZM63.85 59.29h-11V86c0 7.89 4.82 13.18 12 13.18S77 93.89 77 86V72.65C77 64.78 71.58 59.29 63.85 59.29ZM71 86c0 4.56-2.23 7.17-6.11 7.17s-6-2.68-6-7.17V65.31h5c5.24 0 7.11 3.79 7.11 7.34Z"/></svg>`,
      sleigh:`<span class="nav-sleigh-icon-wrap" aria-hidden="true"><img class="nav-sleigh-icon nav-sleigh-off" src="./assets/nav-sleigh-unselected.webp" alt=""><img class="nav-sleigh-icon nav-sleigh-on" src="./assets/nav-sleigh-selected.webp" alt=""></span>`
    };
    return icons[id]||'';
  }
  function navBar(){ return `<nav class="nav" aria-label="Mission Control">${navButton('radar','Radar')}${navButton('missions','Missions')}${navButton('sleigh','Sleigh')}${navButton('comms','Comms')}</nav>`; }
  function navButton(id,label){
    const unread=id==='comms'?unreadCount():0;
    return `<button data-nav="${id}" class="${state.nav===id?'active':''}"><span class="ico">${navIcon(id)}${unread?`<span class="nav-badge">${unread>9?'9+':unread}</span>`:''}</span><span>${label}</span></button>`;
  }
  function topBar(){ return `<header class="topbar">${brand()}<img class="mission-control-logo" src="./assets/mission-control-logo.webp" alt="Mission Control"></header>`; }
  function statusStrip(){
    const cp=current();
    const activationDistance=distanceToActivation(cp,state.distance);
    const distanceValue=!cp?'GROTTO':state.targetVisible&&Number.isFinite(activationDistance)?`${Math.round(activationDistance)} M`:'SEARCHING';
    const condition=state.mode==='demo'?'DEMO':state.gpsCondition;
    return `<section class="telemetry-block"><div class="telemetry-heading">TELEMETRY</div><div class="status-strip panel">
      <div class="status-cell"><div class="status-label">GPS Accuracy</div><div class="status-value gps-${condition.toLowerCase()}">${condition}</div></div>
      <div class="status-cell"><div class="status-label">Sleigh System</div><div class="status-value">${recovery()}%</div></div>
      <div class="status-cell"><div class="status-label">Next Checkpoint</div><div class="status-value">${distanceValue}</div></div>
    </div></section>`;
  }

  function radarMessage(cp){
    if(cp&&state.targetInRange&&cp.playable){
      return `<div class="mission-card message-card panel target-message compact-target" id="radarMessage"><div><div class="kicker">${cp.location}</div><h3>${cp.name}</h3></div><button class="btn small primary" data-start-mission="${cp.id}">${cp.type==='activation'?'Start Activation':cp.type==='radio'?'Tune Signal':cp.type==='diagnostics'?'Start Diagnostics':'Start Mission'}</button></div>`;
    }
    if(state.messageAlert&&unreadCount()>0){
      return `<div class="mission-card message-card panel comms-alert" id="radarMessage"><div class="comms-alert-copy"><div class="kicker">Mission Control</div><h3>New Message</h3></div><div class="comms-alert-actions"><button class="linkbtn comms-action" data-read-messages>Read</button><button class="linkbtn comms-action" data-dismiss-messages>Dismiss</button></div></div>`;
    }
    if(!cp) return `<div class="mission-card message-card panel complete-message compact-message" id="radarMessage"><div><div class="kicker">Mission Control</div><h3>Mission Complete</h3></div></div>`;
    if(cp.type==='activation'){
      if(state.targetVisible) return `<div class="mission-card message-card panel compact-message" id="radarMessage"><div><div class="kicker">Mission Control</div><h3>Circuit Entry Ahead</h3></div></div>`;
      return `<div class="mission-card message-card panel compact-message" id="radarMessage"><div><div class="kicker">Mission Control</div><h3>Locating Circuit Entry</h3></div></div>`;
    }
    if(state.targetVisible){
      const activationDistance=Math.round(distanceToActivation(cp,state.distance)||0);
      const title=activationDistance<40?'Closing On Target':'Signal Detected';
      return `<div class="mission-card message-card panel compact-message" id="radarMessage"><div><div class="kicker">Mission Control</div><h3>${title}</h3></div></div>`;
    }
    return `<div class="mission-card message-card panel compact-message" id="radarMessage"><div><div class="kicker">Mission Control</div><h3>Radar Searching</h3></div></div>`;
  }


  function render(){
    if(IS_ADMIN){ renderAdmin(); return; }
    if(cleanupMission){ cleanupMission(); cleanupMission=null; }
    stopStatic();
    stopMc00Scan();
    if(!state.onboarded){
      app.innerHTML=shell(renderLaunch(),false);
      bindGlobal();
      bindMc00Scan(state.bootDone);
      return;
    }
    if(state.missionOpen){ app.innerHTML=shell(renderMission(state.missionOpen),false); bindGlobal(); bindMission(state.missionOpen); return; }
    if(state.nav==='comms') markAllMessagesRead();
    renderNavShell();
    bindGlobal();
    if(state.nav==='radar'){
      updateRadarLive();
      // Demo progression is re-armed whenever Radar is rendered. This makes
      // returning from Comms / Missions / Sleigh resilient if a pending demo
      // timer was interrupted while another panel was open.
      if(state.mode==='demo'&&!state.missionOpen){
        maybeStartDemoTarget(400);
        rearmDemoRoute(900);
      }
    }
  }
  function renderLaunch(){
    if(state.bootDone===false) return `<section class="hero"><div class="hero-content"><img class="hero-logo hero-logo-stacked" src="./assets/silverstone-logo-landing.webp" alt="Silverstone"><img class="hero-mission-logo" src="./assets/mission-control-logo.webp" alt="Mission Control"><div class="hero-actions"><button class="btn primary" data-onboard="mc00-live">Start Mission</button><button class="btn secondary" data-onboard="demo">Quick Demo</button></div></div></section>`;
    return renderOnboardStep(state.bootDone);
  }
  function renderOnboardStep(step){
    const setupHeader=topBar();
    if(step==='mc00-live'||step==='mc00-demo'){
      const systems=[
        {key:'power',label:'Power',status:'Standby'},
        {key:'propulsion',label:'Propulsion',status:'Standby'},
        {key:'comms',label:'Comms',status:'Standby'},
        {key:'response',label:'Response',status:'Standby'},
        {key:'core',label:'Core',status:'Standby'},
        {key:'navigation',label:'Navigation',status:'Standby'},
        {key:'control',label:'Control',status:'Standby'},
        {key:'launch',label:'Launch',status:'Standby'}
      ];
      return `<section class="onboard with-masthead setup-page mc00-page">${setupHeader}<div class="onboard-card panel mc00-card" data-mc00-mode="${step}"><div class="mc00-copy"><h1>System Scan</h1><p class="support-copy">Santa-1 Sleigh Recovery</p></div><div class="mc00-visual-wrap"><div class="mc00-sleigh-frame"><div class="sleigh-visual sleigh-stage-1 mc00-sleigh-visual"><div class="sleigh-glow" aria-hidden="true"></div><img class="sleigh-art" src="./assets/sleigh-stage-1.webp" alt="Santa-1 sleigh system scan visual"><div class="mc00-scan-beam" aria-hidden="true"></div></div></div></div>${systemStatusBank(systems,'mc00-system-bank','mc00')}<div class="mc00-progress-row"><div class="mc00-progress" role="progressbar" aria-label="System scan progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="mc00ProgressFill"></span></div><strong id="mc00ProgressValue">0%</strong></div><div class="mc00-complete-popup panel" id="mc00CompleteBlock" hidden><div class="mc00-complete-icon" aria-hidden="true">✓</div><h2>Scan Complete</h2><button class="btn primary wide" id="mc00Continue" data-mc00-continue="${step}">Continue</button></div></div></section>`;
    }
    if(step==='brief') return `<section class="onboard with-masthead setup-page briefing-page">${setupHeader}<div class="onboard-card panel setup-card"><div class="onboard-icon setup-icon"><span class="setup-icon-glyph"><img src="./assets/mission-briefing-icon.svg" alt=""></span></div><h1>Mission Briefing</h1><p class="support-copy">Santa-1 has lost power. Energy signatures have been detected around the circuit. Locate each source, complete its mission and restore the sleigh.</p><div class="setup-actions"><button class="btn primary wide" data-onboard="audio">Continue</button></div></div></section>`;
    if(step==='audio') return `<section class="onboard with-masthead setup-page audio-page">${setupHeader}<div class="onboard-card panel setup-card"><div class="onboard-icon setup-icon"><span class="setup-icon-glyph"><img src="./assets/mission-audio-icon.webp" alt=""></span></div><h1>Mission Audio</h1><p class="support-copy">Mission Control uses proximity alerts, system sounds and live transmissions. Audio can be muted at any time.</p><div class="setup-actions stack"><button class="btn primary wide" data-audio="on">Enable Mission Audio</button><button class="btn secondary wide" data-audio="off">Continue Without Audio</button></div></div></section>`;
    if(step==='demo-scan') return `<section class="onboard with-masthead setup-page demo-scan-page">${setupHeader}<div class="onboard-card panel setup-card demo-scan-card"><div class="onboard-icon setup-icon demo-system-icon" aria-hidden="true"><span class="demo-scan-radar"><span></span></span></div><h1>DEMO MODE</h1><p class="support-copy">The demo will simulate checkpoint proximity in the same order as the live route. Your first target is <strong>Mission 01 · Circuit Entry</strong> at Village.</p><div class="setup-actions"><button class="btn primary wide" data-onboard="demo-continue">Continue to Radar</button></div></div></section>`;
    return `<section class="onboard with-masthead setup-page radar-setup-page">${setupHeader}<div class="onboard-card panel setup-card"><div class="onboard-icon setup-icon"><span class="setup-icon-glyph"><img src="./assets/radar-setup-icon.svg" alt=""></span></div><h1>Enable Live Radar</h1><p class="support-copy">Mission Control uses your location to detect each installation as you move around the circuit.</p><div class="setup-actions stack"><button class="btn primary wide" data-location="request">Enable Location</button><button class="btn secondary wide" data-location="demo">Use Demo Mode</button></div></div></section>`;
  }
  function renderRadar(){
    const cp=current();
    const modeClass=state.mode==='demo'?' demo-radar-page':'';
    return `<section class="radar-page${modeClass}">${statusStrip()}<section class="radar-zone" aria-label="Live checkpoint radar"><section class="radar-wrap"><div class="radar"><div class="sweep"></div><div class="user-dot"></div>${cp?'<div class="target-dot hidden"></div>':''}</div></section></section>${radarMessage(cp)}</section>`;
  }
  function missionStatus(cp){
    const idx=checkpointIndex(cp.id);
    if(state.completed.includes(cp.id)) return 'COMPLETE';
    if(state.available.includes(cp.id)) return 'AVAILABLE';
    if(idx===state.routeIndex) return state.targetInRange?'IN RANGE':'NEXT';
    if(idx<state.routeIndex) return 'AVAILABLE';
    return 'LOCKED';
  }
  function renderMissions(){
    const rows=CHECKPOINTS.filter(c=>c.playable&&isRouteCheckpoint(c)).map(cp=>{
      const status=missionStatus(cp);
      const playable=status==='AVAILABLE'||status==='IN RANGE';
      const interaction=playable?` data-open-mission="${cp.id}" role="button" tabindex="0" aria-label="Open ${cp.name}"`:'';
      return `<div class="mission-row panel ${status==='COMPLETE'?'done':''} ${status==='AVAILABLE'?'available':''} ${playable?'interactive':''}"${interaction}><div class="mission-index">${cp.mc.replace('MC-','')}</div><div class="mission-row-copy"><div class="kicker">${cp.location}</div><h3>${cp.name}</h3></div><div class="row-action"><div class="row-status">${status}</div></div></div>`;
    }).join('');
    return `<div class="list missions-list">${rows}</div>`;
  }
  function renderSleigh(){
    const r=recovery();
    const info=sleighStage();
    const stage=info.stage;
    const postStatus=state.completed.includes('northern')
      ? {name:'Airborne',copy:'Northern Flight is underway. Santa-1 has launched successfully and the rebuilt sleigh is operating as intended.'}
      : state.completed.includes('lapland')
        ? {name:'Flight Ready',copy:'Lapland Launch has completed the final systems verification. Every rebuilt system is stable and Santa-1 is fully cleared for launch.'}
        : {name:info.name,copy:info.copy};
    const systems=[
      {key:'power',label:'Power',status:state.completed.includes('power')?'Online':'Offline',state:state.completed.includes('power')?'online':'offline'},
      {key:'comms',label:'Comms',status:state.completed.includes('luffield')?'Online':'Offline',state:state.completed.includes('luffield')?'online':'offline'},
      {key:'core',label:'Core',status:state.completed.includes('spirit')?'Online':'Offline',state:state.completed.includes('spirit')?'online':'offline'},
      {key:'control',label:'Control',status:state.completed.includes('comet')?'Online':'Offline',state:state.completed.includes('comet')?'online':'offline'},
      {key:'propulsion',label:'Propulsion',status:state.completed.includes('jingle')?'Online':'Offline',state:state.completed.includes('jingle')?'online':'offline'},
      {key:'response',label:'Response',status:state.completed.includes('lando')?'Online':'Offline',state:state.completed.includes('lando')?'online':'offline'},
      {key:'navigation',label:'Navigation',status:state.completed.includes('aurora')?'Online':'Offline',state:state.completed.includes('aurora')?'online':'offline'},
      {key:'launch',label:'Launch',status:state.completed.includes('lapland')?'Clear':'Blocked',state:state.completed.includes('lapland')?'clear':'blocked'}
    ];
    return `<div class="sleigh-card panel"><div class="sleigh-title-row"><div><div class="kicker sleigh-pretitle">Sleigh Rebuild</div><h1>Santa-1</h1></div><strong class="sleigh-percent">${r}%</strong></div><div class="sleigh-development-bar" role="progressbar" aria-label="Santa-1 development progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${r}"><div class="sleigh-development-spectrum" aria-hidden="true"></div><div class="sleigh-development-mask" style="left:${r}%" aria-hidden="true"></div></div><div class="sleigh-visual sleigh-stage-${stage}"><div class="sleigh-glow" aria-hidden="true"></div><img class="sleigh-art" src="${info.asset}" alt="Santa-1 ${postStatus.name} development stage"></div><div class="sleigh-update-box panel soft"><div class="kicker sleigh-systems-title">Engineering Update</div><p class="sleigh-systems-copy">${postStatus.copy}</p></div><div class="sleigh-systems panel soft"><div class="kicker sleigh-systems-title">System Status</div>${systemStatusBank(systems,'sleigh-system-bank')}</div></div>`;
  }

  function systemStatusBank(systems,extraClass='',dataPrefix=''){
    return `<div class="system-status-bank ${extraClass}">${systems.map((system,i)=>{
      const stateClass=system.state?` is-${system.state}`:'';
      const dataAttr=dataPrefix?` data-${dataPrefix}-system="${system.key}"`:'';
      return `<div class="system-status-item${stateClass}"${dataAttr}><div class="system-status-name"><span class="system-node" aria-hidden="true"></span><span>${system.label}</span></div><div class="system-status-value"${dataPrefix?` data-${dataPrefix}-status="${system.key}"`:''}>${system.status}</div></div>`;
    }).join('')}</div>`;
  }
  function messageActivationLabel(message){
    if(message.key==='opening') return 'MISSION CONTROL';
    if(message.checkpointId){
      const cp=CHECKPOINTS.find(c=>c.id===message.checkpointId||c.mc===message.checkpointId);
      if(cp){
        return cp.name||cp.location||'MISSION CONTROL';
      }
    }
    return message.sender||'MISSION CONTROL';
  }
  function renderComms(){
    const feed=[...state.messages].sort((a,b)=>b.timestamp-a.timestamp).map(m=>`<article class="comms-message panel ${m.read?'':'unread'}"><div class="comms-message-head"><div class="kicker">${messageActivationLabel(m)}</div><time datetime="${new Date(m.timestamp).toISOString()}">${formatMessageTime(m.timestamp)}</time></div><h3>${m.title}</h3><p>${m.body}</p></article>`).join('');
    const streamReady=Boolean(ELF_STREAM_URL);
    const toggle=`<button class="sound-toggle ${state.elfAudioOn?'on':'off'}" id="elfAudioToggle" data-elf-audio aria-pressed="${state.elfAudioOn?'true':'false'}" ${streamReady?'':'aria-disabled="true"'}><span>Sound</span><strong>${state.elfAudioOn?'On':'Off'}</strong></button>`;
    const radio=state.elfUnlocked
      ? `<section class="comms-radio panel tuned compact"><div class="comms-radio-head"><div><div class="kicker">ELF FM</div><h2>87.7</h2></div>${toggle}</div><div class="wave locked ${state.elfAudioOn?'live':''}">${'<i></i>'.repeat(28)}</div><div class="radio-state-line">Signal Locked</div></section>`
      : `<section class="comms-radio panel locked compact"><div class="comms-radio-head"><div><div class="kicker">ELF FM</div><h2>87.7</h2></div><button class="btn small primary" data-tune-elf>Tune In</button></div><div class="wave">${'<i></i>'.repeat(28)}</div><div class="radio-state-line muted">Signal Available</div></section>`;
    return `${radio}<section class="comms-feed"><div class="comms-section-title"><span>Message Feed</span></div>${feed||'<div class="comms-empty panel">No transmissions received.</div>'}</section>`;
  }



  function missionHeader(cp){
    const label=`${cp.mc} / ${cp.name}`;
    if(cp.type==='diagnostics'){
      return `<div class="mission-head diagnostics-head"><div class="meta"><div class="kicker">${label}</div><button class="linkbtn" data-exit-mission>Exit Mission</button></div><div class="diagnostics-brand"><img src="./assets/audi-rings.webp" alt="Audi"></div><h1>Performance Scan</h1><p class="support-copy">${missionInstruction(cp.type)}</p></div>`;
    }
    if(cp.type==='activation'){
      return `<div class="mission-head mc01-head"><div class="meta"><div class="kicker">${label}</div><button class="linkbtn" data-exit-mission>Exit Mission</button></div><h1>Circuit Entry</h1><p class="support-copy">${missionInstruction(cp.type)}</p></div>`;
    }
    return `<div class="mission-head"><div class="meta"><div class="kicker">${label}</div><button class="linkbtn" data-exit-mission>Exit Mission</button></div><h1>${cp.mission}</h1><p class="support-copy">${missionInstruction(cp.type)}</p></div>`;
  }
  function missionInstruction(type){
    return ({
      activation:'Kinetic energy generated on track has created enough power to initiate Santa-1’s recovery.',
      diagnostics:'Capture the engineering data needed for Santa-1.',
      radio:'Tune the receiver to 87.7 FM and establish a link with ELF FM.',
      commsrelay:'Relay the transmission and restore Santa-1 communications.',
      power:'Reach maximum velocity and capture racing power for Santa-1.',
      spirit:'Build a stable charging rhythm until all five energy cells are full.',
      placeholder:'This checkpoint is reserved while the final installation game is developed.',
      artifacts:'Clear the unstable artefacts and stabilise the Starstream.',
      comet:'Lock 10 directional signals to restore Santa-1’s guidance path.',
      jingle:'Time three propulsion pulses so each lands inside the target flight zone.',
      lando:'React the moment the lights go out to calibrate Santa-1 flight control.',
      aurora:'Align the navigation rings and lock Santa-1 onto the North Pole.',
      lapland:'Initiate a full-system verification and watch every restored system report ready.',
      northern:'Authorise the restored sleigh for its final Northern Flight.'
    })[type]||'';
  }
  function renderMission(id){
    const cp=id==='elf-radio'?ELF_RADIO_MISSION:CHECKPOINTS.find(c=>c.id===id); if(!cp) return '';
    return `<div class="mission-shell mission-${cp.type}">${topBar()}${missionHeader(cp)}<div class="mission-content" id="missionContent">${missionBody(cp)}</div></div>`;
  }
  function missionBody(cp){
    switch(cp.type){
      case 'activation': return circuitEntryBody();
      case 'diagnostics': return diagnosticsBody();
      case 'radio': return radioBody();
      case 'commsrelay': return commsRelayBody();
      case 'power': return powerBody();
      case 'spirit': return spiritBody();
      case 'placeholder': return placeholderBody(cp);
      case 'artifacts': return artifactBody();
      case 'comet': return cometBody();
      case 'jingle': return jingleBody();
      case 'lando': return landoBody();
      case 'aurora': return auroraBody();
      case 'lapland': return laplandBody();
      case 'northern': return northernBody();
      default:return '';
    }
  }
  function circuitEntryBody(){
    return `<div class="mission-instrument panel mc01-panel" id="mc01Activation" data-stage="detected">
      <div class="mc01-track-stage" aria-hidden="true">
        <div class="mc01-track-shadow"></div>
        <div class="mc01-track-outline"></div>
        <div class="mc01-track-energy"></div>
        <span class="mc01-energy-node"></span>
        <span class="mc01-energy-ripple ripple-a"></span>
        <span class="mc01-energy-ripple ripple-b"></span>
      </div>
      <div class="mc01-readout">
        <span class="mc01-bolt" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13.7 1.8 5.3 13h5.5l-.5 9.2L18.7 11h-5.5l.5-9.2Z"/></svg></span>
        <div class="mc01-readout-copy"><span id="mc01StateLabel">Circuit Energy</span><strong id="mc01State">Detected</strong></div>
        <div class="mc01-signal-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      </div>
      <div class="mc01-transfer" aria-label="Circuit energy transfer progress">
        <div class="mc01-transfer-meta"><span>Energy Transfer</span><strong id="mc01TransferValue">0%</strong></div>
        <div class="mc01-transfer-track"><i id="mc01TransferFill"></i></div>
      </div>
    </div>`;
  }

  function diagnosticsBody(){
    const sensors=[
      {name:'Aero',key:'aero',viz:`<svg viewBox="0 0 120 70" role="presentation"><path class="aero-car" d="M50 18h20l8 10 4 23H38l4-23 8-10Z"/><path class="aero-flow f1" d="M4 15 C26 12 29 8 45 8 S82 9 116 15"/><path class="aero-flow f2" d="M2 35 C22 35 28 24 41 24 S79 24 118 35"/><path class="aero-flow f3" d="M4 55 C26 58 31 62 47 62 S83 60 116 55"/></svg>`},
      {name:'Stability',key:'stability',viz:`<svg viewBox="0 0 120 70" role="presentation"><line class="stability-horizon" x1="10" y1="35" x2="110" y2="35"/><g class="stability-body"><path d="M42 20h36l8 15-8 15H42L34 35l8-15Z"/><line x1="60" y1="15" x2="60" y2="55"/><line x1="29" y1="35" x2="91" y2="35"/><circle cx="60" cy="35" r="4"/></g><circle class="stability-lock" cx="60" cy="35" r="27"/></svg>`},
      {name:'Power',key:'power',viz:'<span></span><span></span><span></span><span></span><span></span>'},
      {name:'Control',key:'control',viz:`<svg viewBox="0 0 120 70" role="presentation"><path class="control-trace trace-a" d="M8 23 C24 7 34 39 50 23 S75 7 92 23 S105 33 114 23"/><path class="control-trace trace-b" d="M8 47 C24 31 34 63 50 47 S75 31 92 47 S105 57 114 47"/><line class="control-lock" x1="12" y1="35" x2="108" y2="35"/></svg>`},
      {name:'Traction',key:'traction',viz:`<svg viewBox="20 8 80 54" role="presentation"><path class="traction-car" d="M49 13h22l8 12v20l-8 12H49l-8-12V25l8-12Z"/><rect class="patch p1" x="29" y="17" width="14" height="13" rx="5"/><rect class="patch p2" x="77" y="17" width="14" height="13" rx="5"/><rect class="patch p3" x="29" y="40" width="14" height="13" rx="5"/><rect class="patch p4" x="77" y="40" width="14" height="13" rx="5"/><path class="traction-drive" d="M60 18v34"/></svg>`},
      {name:'Recovery',key:'recovery',viz:'<i class="recovery-ring"></i><b></b>'}
    ];
    return `<div class="mission-instrument panel diagnostics-panel"><div class="sensor-grid diagnostics-grid">${sensors.map((x,i)=>`<button class="sensor sensor-${x.key}" data-sensor="${i}" data-diagnostic="${x.key}"><div class="sensor-head"><span class="num">0${i+1}</span><span class="name">${x.name}</span></div><div class="sensor-viz viz-${x.key}" aria-hidden="true">${x.viz}</div><div class="state">Ready to scan</div></button>`).join('')}</div></div><button class="btn primary wide" id="diagComplete" disabled>Confirm Performance Data</button>`;
  }

  function radioBody(){return `<div class="mission-instrument panel"><div class="wave" id="radioWave">${'<i></i>'.repeat(28)}</div><div class="frequency"><span id="freqVal">86.4</span> <small>FM</small></div><div class="range-wrap"><input id="freqRange" class="range" type="range" min="86" max="89" value="86.4" step="0.1"><div class="freq-marks"><span>86.0</span><span>87.0</span><span>87.7</span><span>89.0</span></div></div><div class="signal-state" id="signalState">Searching for signal</div><button class="btn primary wide" id="lockSignal" disabled>Lock Signal</button></div>`}
  function commsRelayBody(){
    return `<div class="mission-instrument panel comms-relay-panel">
      <div class="signal-state relay-instruction" id="relayState">Tap Relay 01 when the pulse meets the capture ring.</div>
      <div class="relay-network" id="relayNetwork" aria-label="Signal relay network">
        <svg class="relay-route" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">
          <line class="relay-hop-line" data-hop="0" x1="25" y1="25" x2="75" y2="25"></line>
          <line class="relay-hop-line" data-hop="1" x1="75" y1="25" x2="25" y2="75"></line>
          <line class="relay-hop-line" data-hop="2" x1="25" y1="75" x2="75" y2="75"></line>
          <line class="relay-hop-line" data-hop="3" x1="75" y1="75" x2="25" y2="125"></line>
          <line class="relay-hop-line" data-hop="4" x1="25" y1="125" x2="75" y2="125"></line>
        </svg>
        <div class="relay-cell relay-endpoint relay-origin"><span class="relay-radio-icon"><i></i><i></i><i></i></span><small>TRANSMITTER<br>MISSION CONTROL</small></div>
        ${[0,1,2,3].map(i=>`<div class="relay-cell relay-capture"><button class="relay-node ${i===0?'active':''}" data-relay="${i}" aria-label="Relay ${i+1}"><span class="relay-target"></span><span class="relay-pulse"></span><span class="relay-core">0${i+1}</span></button><small>RELAY 0${i+1}</small></div>`).join('')}
        <div class="relay-cell relay-endpoint relay-destination"><span class="relay-receiver-icon"></span><small>RECEIVER<br>SANTA-1</small></div>
      </div>
      <div class="relay-meter"><span>Signal Strength</span><div><i id="relayMeterFill"></i></div><strong id="relayMeterText">WEAK</strong></div>
    </div>`;
  }
  function powerBody(){
    const revSegments=Array.from({length:12},()=>'<i></i>').join('');
    return `<div class="mission-instrument panel power-run-panel">
      <div class="power-arcade" id="powerArcade">
        <div class="power-scanlines" aria-hidden="true"></div>
        <div class="power-hud">
          <div><span>Power Run</span><strong id="powerRunState">READY</strong></div>
          <div><span>Energy Output</span><strong id="powerOutput">0%</strong></div>
          <div class="power-speed-hud"><span>Speed</span><strong><b id="powerSpeed">000</b><small> MPH</small></strong></div>
        </div>
        <div class="power-rev-wrap"><span>POWER</span><div class="power-rev" id="powerRev">${revSegments}</div></div>
        <div class="power-road-scene" id="powerRoad">
          <div class="power-sky-sprite" aria-hidden="true"></div>
          <div class="power-ground" aria-hidden="true">
            <div class="power-grass-plane"></div>
            <div class="power-road-plane"></div>
          </div>
          <div class="power-horizon-seam" aria-hidden="true"></div>
          <div class="power-speed-lines" aria-hidden="true">${Array.from({length:12},()=>'<i></i>').join('')}</div>
          <div class="power-car" id="powerCar">
            <img class="power-car-sprite" src="./assets/power-car.webp" alt="Blue retro pixel racing car seen from behind">
            <span class="power-exhaust power-exhaust-left"></span><span class="power-exhaust power-exhaust-right"></span>
          </div>
          <div class="power-burst" id="powerBurst" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
        <div class="power-max-hold"><span>Sustain Max Power</span><div><i id="powerMaxFill"></i></div><strong id="powerMaxState">STANDBY</strong></div>
      </div>
      <div class="visually-hidden" id="powerState" aria-live="polite">Ready</div>
      <button class="btn primary wide power-accelerator" id="powerAccelerator">Press &amp; Hold to Accelerate</button>
    </div>`;
  }
  function spiritBody(){return `<div class="mission-instrument panel spirit-panel"><div class="signal-state spirit-stability" id="spiritState">Charge stability · balancing</div><div class="tanks-wrap" id="tanksWrap"><div class="tanks">${[0,1,2,3,4].map(i=>`<div class="tank ${i===0?'active':''}" data-tank="${i}"><div class="tank-smoke" aria-hidden="true"><i></i><i></i><i></i></div><div class="tank-spout"></div><div class="tank-vessel"><div class="tank-glass"></div><div class="tank-fill"></div><div class="tank-cap"></div></div></div>`).join('')}</div></div><div class="spirit-instruction">Alternate tap A + B to fill the energy tanks.</div><div class="ab"><button class="charge" data-charge="A">A</button><button class="charge" data-charge="B">B</button></div></div>`}
  function placeholderBody(cp){const location=cp?.location||'Checkpoint';return `<div class="mission-instrument panel" style="text-align:center;padding:30px 18px"><div class="onboard-icon">?</div><div class="kicker">${location} / Creative Hold</div><h2 style="font-family:var(--display);text-transform:uppercase;font-size:28px;margin:8px 0">Mission TBC</h2><p class="sub">This checkpoint is reserved while the final installation game is developed. GPS activation, route progression and completion behaviour remain active for testing.</p><button class="btn primary wide" style="margin-top:16px" id="completePlaceholder">Complete Demo Step</button></div>`}
  function artifactBody(){
    return `<div class="mission-instrument panel artifact-panel">
      <div class="artifact-score"><span>FIELD STABILITY</span><strong id="artifactProgress">0 / 12</strong></div>
      <div class="artifact-progress-track" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i data-artifact-step="${i}"></i>`).join('')}</div>
      <div class="artifact-instruction">Tap the unstable artefacts before they distort the Starstream.</div>
      <div class="artifact-field" id="artifactField" aria-label="Starstream energy interference field">
        <div class="artifact-grid" aria-hidden="true"></div>
        <div class="starstream-beam" id="starstreamBeam" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="artifact-layer" id="artifactLayer"></div>
        <div class="artifact-burst-layer" id="artifactBurstLayer" aria-hidden="true"></div>
      </div>
      <div class="signal-state artifact-state" id="artifactState">Starstream interference detected</div>
    </div>`;
  }
  function cometBody(){
    const lanes=[['L','left'],['D','down'],['U','up'],['R','right']];
    const btnLabel={L:'Left',D:'Down',U:'Up',R:'Right'};
    return `<div class="mission-instrument panel comet-panel">
      <div class="comet-score"><span>GUIDANCE LOCK</span><strong id="cometProgress">0 / 10</strong></div>
      <div class="comet-progress-track" aria-hidden="true">${Array.from({length:10},(_,i)=>`<i data-comet-step="${i}"></i>`).join('')}</div>
      <div class="comet-instruction">Tap the matching direction as each signal reaches the capture line.</div>
      <div class="comet-game" id="cometGame" aria-label="Directional guidance game">
        <div class="comet-lanes">${lanes.map(([key,dir])=>`<div class="comet-lane" data-comet-lane="${key}"><span class="comet-lane-guide comet-guide-${dir}" aria-hidden="true"><i></i><i></i></span></div>`).join('')}</div>
        <div class="comet-capture-line"><span>CAPTURE</span></div>
        <div class="comet-notes" id="cometNotes" aria-hidden="true"></div>
        <div class="comet-hit-flash" id="cometHitFlash"></div>
      </div>
      <div class="comet-controls">${lanes.map(([key,dir])=>`<button class="comet-btn comet-btn-${dir}" data-arrow="${key}" aria-label="${btnLabel[key]}"><span class="comet-btn-icon" aria-hidden="true"><i></i><i></i></span></button>`).join('')}</div>
      <div class="signal-state comet-state" id="cometState">Guidance stream armed</div>
    </div>`;
  }
  function jingleBody(){
    const rows=[
      {level:1,label:'Calibration Speed',status:'Armed'},
      {level:2,label:'Sync Speed',status:'Standby'},
      {level:3,label:'Precision Speed',status:'Standby'}
    ];
    return `<div class="mission-instrument panel jingle-panel">
      <div class="jingle-stack">${rows.map(r=>`<div class="jingle-stage ${r.level===1?'active':'standby'}" data-jingle-stage="${r.level}">
        <div class="jingle-stage-head"><span><strong>${r.level}</strong> · ${r.label}</span><em data-jingle-status="${r.level}">${r.status}</em></div>
        <div class="sync-lane sync-lane-${r.level}"><div class="flight-zone"></div><div class="pulse-dot ${r.level===1?'active':''}" data-pulse-dot="${r.level}"></div></div>
      </div>`).join('')}</div>
      <div class="signal-state" id="jingleState">Pulse 1 · calibration speed</div>
      <button class="btn primary wide" id="syncPulse">Sync Pulse</button>
    </div>`;
  }
  function landoBody(){
    return `<div class="mission-instrument panel lando-panel">
      <div class="lando-round-head"><span>REACTION TEST</span><strong id="landoRound">ROUND 1 / 4</strong></div>
      <div class="lando-gantry-art" id="landoGantry" aria-label="Five column start light gantry with four stacked lamps">
        <img src="./assets/lando-gantry.webp" alt="" aria-hidden="true">
        <div class="lando-light-overlay" aria-hidden="true">
          ${[0,1,2,3,4].map(col=>[0,1,2,3].map(row=>`<span class="lando-lamp" data-col="${col}" data-row="${row}"></span>`).join('')).join('')}
        </div>
      </div>
      <div class="reaction-read"><span id="reactionRead">READY</span><small id="reactionUnit"></small></div>
      <div class="signal-state lando-state" id="landoState">Lights will go out at a random time. Be ready.</div>
      <button class="btn primary wide lando-react-btn" id="reactionBtn">Start Test</button>
      <div class="lando-results" aria-label="Reaction test results">
        ${[1,2,3,4].map(i=>`<div class="lando-result ${i===1?'active':''}" data-lando-result="${i}"><strong>0${i}</strong><span>${i===1?'READY':'STANDBY'}</span></div>`).join('')}
      </div>
    </div>`;
  }
  function auroraBody(){
    const rings=[['outer','Outer Ring'],['middle','Middle Ring'],['inner','Inner Ring']];
    return `<div class="mission-instrument panel aurora-panel">
      <div class="aurora-atmosphere" aria-hidden="true"></div>
      <div class="aurora-north" aria-hidden="true"><span class="aurora-north-star">✦</span><strong>North Pole</strong><i></i></div>
      <div class="aurora-dial" id="auroraDial" aria-label="Navigation ring alignment control">
        <div class="aurora-field"></div>
        <div class="aurora-target-line"></div>
        ${rings.map(([key])=>`<div class="aurora-ring aurora-ring-${key}" data-aurora-ring="${key}"><img src="./assets/aurora-ring-${key}.webp" alt="" aria-hidden="true"><span class="aurora-lock-notch"></span></div>`).join('')}
        <div class="aurora-compass"><span>✦</span></div>
      </div>
      <div class="aurora-ring-statuses">${rings.map(([key,label],i)=>`<button type="button" class="aurora-ring-status ${i===0?'selected':''}" data-aurora-status="${key}" data-aurora-select="${key}"><span class="aurora-mini-ring"></span><div><strong>${label}</strong><small>${i===0?'Selected · align':'Align to lock'}</small></div></button>`).join('')}</div>
      <div class="visually-hidden" id="auroraState" aria-live="polite">Outer ring awaiting alignment.</div>
    </div>`;
  }
  function laplandBody(){
    const systems=[
      {key:'power',label:'Power',status:'Standby'},
      {key:'comms',label:'Comms',status:'Standby'},
      {key:'core',label:'Core',status:'Standby'},
      {key:'control',label:'Control',status:'Standby'},
      {key:'propulsion',label:'Propulsion',status:'Standby'},
      {key:'response',label:'Response',status:'Standby'},
      {key:'navigation',label:'Navigation',status:'Standby'},
      {key:'launch',label:'Launch',status:'Blocked',state:'blocked'}
    ];
    return `<div class="mission-instrument panel lapland-panel">${systemStatusBank(systems,'lapland-system-bank','verify')}<button class="btn primary wide" id="initiateTest">Initiate Final Test</button></div>`;
  }
  function northernBody(){return `<div class="mission-instrument panel" style="text-align:center;padding:30px 18px"><div class="onboard-icon">✦</div><div class="kicker">Santa-1</div><h2 style="font-family:var(--display);text-transform:uppercase;font-size:34px;margin:8px 0">Northern Flight</h2><p class="sub">All restored systems are ready. Authorise the final flight sequence to complete the recovery mission.</p><button class="btn primary wide" style="margin-top:18px" id="authoriseFlight">Authorise Northern Flight</button></div>`}



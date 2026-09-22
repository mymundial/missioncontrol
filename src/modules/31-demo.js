  function startDemoExperience(){
    clearDemo();
    demoHoldUntil=Date.now()+900;
    state={...state,onboarded:true,bootDone:true,mode:'demo',nav:'radar',completed:[],available:[],routeIndex:1,targetVisible:false,targetInRange:false,distance:null,gpsCondition:'DEMO'};
    save();
    ensureOpeningMessage();
    render();
    ping(480,.07,.025);
    maybeStartDemoTarget(650);
  }
  function clearDemo(){clearTimeout(demoTimer);clearInterval(demoInterval);demoTimer=null;demoInterval=null;}
  function rearmDemoRoute(delay=350){
    if(state.mode!=='demo') return;
    const expectedIndex=normaliseProgressRouteIndex(state.routeIndex,state.completed);
    if(expectedIndex!==state.routeIndex){state.routeIndex=expectedIndex;save();}
    const arm=()=>{
      if(state.mode!=='demo'||state.nav!=='radar'||state.missionOpen||state.routeIndex!==expectedIndex||state.targetInRange) return;
      if(!state.targetVisible) forceDemoTarget(0);
    };
    setTimeout(arm,Math.max(0,Number(delay)||0));
    // Fallback in case a navigation/render transition interrupted the first timer.
    setTimeout(arm,2600);
  }
  function beginDemoApproach(){
    if(!canRunDemoTarget()) return;
    const cp=current();
    const cfg=activeConfig(cp);
    if(!cp||!cfg) return;
    const activationRadius=Number(cfg.activationRadius)||30;
    let d=state.targetVisible&&Number.isFinite(state.distance)
      ? Math.max(activationRadius,state.distance)
      : 180;
    state.targetVisible=true;
    state.targetInRange=false;
    state.distance=d;
    state.bearing=Number.isFinite(state.bearing)?state.bearing:35;
    save();updateRadarLive();
    if(d<=activationRadius){
      state.targetInRange=true;state.distance=activationRadius;unlockMission(cp.id);save();updateRadarLive();ping(700,.08,.04);haptic(30);return;
    }
    demoInterval=setInterval(()=>{
      if(!canRunDemoTarget()){clearInterval(demoInterval);demoInterval=null;return;}
      const activeCp=current();
      const activeCfg=activeConfig(activeCp);
      if(!activeCp||!activeCfg){clearInterval(demoInterval);demoInterval=null;return;}
      const activeRadius=Number(activeCfg.activationRadius)||30;
      d-=16;
      state.distance=Math.max(activeRadius,d);
      state.bearing=(state.bearing+2)%360;
      if(d<=activeRadius){
        clearInterval(demoInterval);demoInterval=null;
        state.targetInRange=true;state.distance=activeRadius;unlockMission(activeCp.id);save();updateRadarLive();ping(700,.08,.04);haptic(30);
      }else{save();updateRadarLive();}
    },650);
  }
  function forceDemoTarget(delay=250){
    if(state.mode!=='demo'||state.nav!=='radar'||state.missionOpen||!current()) return;
    clearDemo();
    demoTimer=setTimeout(()=>{demoTimer=null;beginDemoApproach();},Math.max(0,Number(delay)||0));
  }
  function canRunDemoTarget(){
    return state.mode==='demo'&&state.nav==='radar'&&!state.missionOpen&&!!current()&&!state.targetInRange;
  }
  function maybeStartDemoTarget(delay=500){
    if(!canRunDemoTarget()||demoTimer!==null||demoInterval!==null) return;
    const wait=Math.max(0,Number(delay)||0,demoHoldUntil-Date.now());
    demoTimer=setTimeout(()=>{
      demoTimer=null;
      // If the guest opened another panel during the wait, stop here. The
      // next Radar render will call maybeStartDemoTarget() again.
      if(!canRunDemoTarget()) return;
      beginDemoApproach();
    },wait);
  }


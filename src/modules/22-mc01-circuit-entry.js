  let mc01Timers=[];

  function stopMc01Activation(){
    mc01Timers.forEach(clearTimeout);
    mc01Timers=[];
  }

  function mc01Later(fn,delay){
    const timer=setTimeout(()=>{
      mc01Timers=mc01Timers.filter(id=>id!==timer);
      fn();
    },delay);
    mc01Timers.push(timer);
  }

  function bindCircuitEntryActivation(){
    const panel=document.getElementById('mc01Activation');
    const stateLabel=document.getElementById('mc01StateLabel');
    const stateValue=document.getElementById('mc01State');
    const transferValue=document.getElementById('mc01TransferValue');
    const transferFill=document.getElementById('mc01TransferFill');
    if(!panel||!stateLabel||!stateValue||!transferValue||!transferFill) return;

    stopMc01Activation();

    const setProgress=value=>{
      const progress=Math.max(0,Math.min(100,Number(value)||0));
      transferValue.textContent=`${progress}%`;
      transferFill.style.transform=`scaleX(${progress/100})`;
    };
    const setStage=(stage,label,value,progress)=>{
      if(!document.getElementById('mc01Activation')) return;
      panel.dataset.stage=stage;
      stateLabel.textContent=label;
      stateValue.textContent=value;
      setProgress(progress);
    };

    setStage('detected','Circuit Energy','Detected',0);
    ping(560,.08,.025);

    mc01Later(()=>{
      setStage('routing','Track Energy','Routing',34);
      ping(640,.06,.025);
      haptic(18);
    },750);

    mc01Later(()=>{
      setStage('transfer','Power Transfer','Routing to Santa-1',72);
      ping(720,.08,.03);
      haptic([18,28,24]);
    },1850);

    mc01Later(()=>{
      setStage('recovery','Recovery Sequence','Initiated',100);
      ping(880,.14,.05);
      haptic([30,35,70]);
    },3150);

    mc01Later(()=>{
      stopMc01Activation();
      if(state.missionOpen!=='entry') return;
      showCompletion('Circuit Entry Complete',"Santa-1's recovery has begun.");
    },4350);
  }

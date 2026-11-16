/* Explicit autosync triggers; counters are acknowledged only by a successful request. */
(function(root){
 function create({run,enabled,changed=()=>{},now=Date.now,set=setTimeout,clear=clearTimeout}){
  let records=0,positions=0,ackedRecords=0,ackedPositions=0,moved=0,firstRecord=null,recordTimer,idleTimer,retryTimer,running=false,queued=false,retries=0;
  const dirty=()=>records>ackedRecords||positions>ackedPositions;
  function activity(){clear(idleTimer);idleTimer=set(()=>{if(dirty())request('idle')},300000)}
  function recordDue(){clear(recordTimer);if(records<=ackedRecords)return;const wait=Math.max(0,Math.min(3000,firstRecord+15000-now()));recordTimer=set(()=>request('records'),wait)}
  async function request(reason='poll'){
   if(reason!=='manual'&&!enabled())return false;if(running){queued=true;return false}running=true;const before={records,positions,moved};changed();let ok=false;
   try{ok=!!await run(reason);if(ok){ackedRecords=before.records;ackedPositions=before.positions;moved=Math.max(0,moved-before.moved);retries=0;if(records===ackedRecords)firstRecord=null;else firstRecord=now()}}finally{running=false;changed();if(ok){if(records>ackedRecords)recordDue();if(queued&&dirty()){queued=false;set(()=>request('queued'),1000)}}else if(enabled()&&retries<2){retries++;clear(retryTimer);retryTimer=set(()=>request('retry'),30000)}}return ok;
  }
  function notify(kind,{distance=0,direct=false}={}){if(kind==='records'){records++;if(firstRecord===null)firstRecord=now();recordDue()}else{positions++;moved+=distance;if(direct||moved>=6)request(direct?'jump':'pages')}activity();changed()}
  function stop(){clear(recordTimer);clear(idleTimer);clear(retryTimer);queued=false}
  function start(){retries=0;activity();return request('connect')}
  return {notify,activity,start,request,stop,dirty,inspect:()=>({records,positions,ackedRecords,ackedPositions,moved,running})};
 }
 root.AutoSyncPolicy={create};
})(globalThis);

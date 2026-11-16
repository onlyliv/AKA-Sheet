/* Fixed five-minute cycle. Local persistence never waits for this timer. */
(function(root){
 function create({run,enabled,changed=()=>{},set=setTimeout,clear=clearTimeout}){
  let records=0,positions=0,ackedRecords=0,ackedPositions=0,timer,running=false,started=false;
  const dirty=()=>records>ackedRecords||positions>ackedPositions;
  function arm(){clear(timer);if(started)timer=set(async()=>{await request('cycle');arm()},300000)}
  async function request(reason='cycle'){if(reason!=='manual'&&!enabled()||running)return false;running=true;const before={records,positions};changed();try{const ok=!!await run(reason);if(ok){ackedRecords=before.records;ackedPositions=before.positions}return ok}finally{running=false;changed()}}
  function notify(kind){if(kind==='records')records++;else positions++;changed()}
  function stop(){started=false;clear(timer)}
  function start(){if(started)return;started=true;arm();return request('startup')}
  return {ackLocal(){ackedRecords=records;ackedPositions=positions;changed()},notify,activity(){},start,stop,request,dirty,inspect:()=>({records,positions,ackedRecords,ackedPositions,running})};
 }
 root.AutoSyncPolicy={create};
})(globalThis);

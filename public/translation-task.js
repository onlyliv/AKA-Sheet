var L_translation_task_js=globalThis.I18n||{t:(s,v)=>v?s.replace(/\{(\w+)\}/g,(m,k)=>v[k]??m):s,error:s=>s,locale:undefined};
// A settled job is immutable: late model progress must not overwrite its error/result.
function createTranslationTask(worker,payload,onStatus,options={}){
 const now=options.now||Date.now,interval=options.interval||setInterval,clear=options.clear||clearInterval;
 let settled=false,lastActivity=now(),started=now(),lastMessage=L_translation_task_js.t("번역 엔진 시작 중"),timer,rejectJob;
 function settle(fn,value){if(settled)return;settled=true;if(timer)clear(timer);fn(value)}
 const promise=new Promise((resolve,reject)=>{rejectJob=reject;
  worker.onmessage=({data:d})=>{if(settled||d.id!==payload.id)return;lastActivity=now();if(d.type==='progress'||d.type==='phase'){lastMessage=L_translation_task_js.t(d.message);onStatus(lastMessage);return}if(d.type==='prepared'&&payload.operation==='prepare'&&d.engine===payload.engine){settle(resolve,d);return}if(d.type==='partial'){options.onPartial?.(d);return}if(d.type==='error'){settle(reject,Error(d.message));return}if(d.type==='result'){if(!d.text?.trim())settle(reject,Error(L_translation_task_js.t("EMPTY_TRANSLATION: 번역 결과가 비어 있습니다.")));else {options.onWarning?.(d.warning||'');settle(resolve,d.text)}}};
  worker.onerror=e=>{e.preventDefault?.();settle(reject,Error(L_translation_task_js.error(e.message)||L_translation_task_js.t("번역 실행 파일을 불러오지 못했습니다. 네트워크·브라우저 메모리 상태를 확인해 주세요.")))};
  worker.onmessageerror=()=>settle(reject,Error(L_translation_task_js.t("번역 결과 수신 중 오류가 발생했습니다.")));
  timer=interval(()=>{if(settled)return;if(now()-lastActivity>180000||now()-started>900000){worker.terminate();settle(reject,Error(L_translation_task_js.t("TRANSLATION_TIMEOUT: 번역 엔진이 응답하지 않아 종료했습니다. 캐시는 유지됩니다. 짧은 문장으로 다시 실행하거나 다른 엔진을 선택하세요.")));return}onStatus(lastMessage+' · '+Math.round((now()-started)/1000)+L_translation_task_js.t("초 경과"))},1000);
  worker.postMessage(payload);
 });
 return {promise,cancel(){if(settled)return;worker.terminate();settle(rejectJob,Error(L_translation_task_js.t("실행 취소")));}};
}

/* Explicit optional download; an evicted/incomplete cache never downloads during OCR. */
(function(root){
 const CACHE='akai-spacing-024',MANIFEST='models/kiwi-024/manifest.json',E=id=>document.getElementById(id),t=(s,v)=>root.I18n?.t(s,v)??s,abs=p=>new URL(p,location.href).href;
 let enabled=AppSettings.read().koreanSpacing,controller=null,worker=null,pending=null,job=0,working=false;
 function message(s){E('spacingStatus').textContent=s}
 function sync(){E('koreanSpacingToggle').checked=enabled||!!controller;E('koreanSpacingToggle').disabled=!!controller;E('spacingCancel').hidden=!controller;E('spacingRetry').disabled=!!controller;E('spacingDelete').disabled=!!controller}
 function save(value){const s=AppSettings.read();s.koreanSpacing=value;AppSettings.write(s);enabled=value;sync()}
 async function status(){if(!('caches'in root))return {ready:false,count:0,bytes:0};const c=await caches.open(CACHE),r=await c.match(abs(MANIFEST));if(!r)return {ready:false,count:(await c.keys()).length,bytes:0};const m=await r.json();let count=0;for(const a of m.assets)if(await c.match(abs(a.url)))count++;return {ready:count===m.assets.length,count,bytes:m.assets.reduce((n,a)=>n+a.bytes,0)}}
 const downloadUrl=path=>/^models\/kiwi-024\/.+\.gz\.\d+$/.test(path)?'https://raw.githubusercontent.com/onlyliv/AKA-Sheet/45c88d9d8961dd9a4c3d9947eac1b5143993b523/public/'+path:path;
 const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
 async function prepare(){if(controller)return;controller=new AbortController();const own=controller;sync();try{
  if(!('DecompressionStream'in root)||!('Worker'in root)||!('caches'in root))throw Error(t('이 브라우저는 띄어쓰기 보정을 지원하지 않습니다.'));
  const r=await fetch(MANIFEST,{signal:own.signal});if(!r.ok)throw Error(t('모델 다운로드에 실패했습니다. 다시 시도하세요.'));const m=await r.json(),c=await caches.open(CACHE),total=m.assets.reduce((n,a)=>n+a.bytes,0);let loaded=0;
  // The manifest is the commit marker, written only after all verified files exist.
  await c.delete(abs(MANIFEST));
  for(const a of m.assets){if(own.signal.aborted)throw new DOMException('Cancelled','AbortError');let response=await c.match(abs(a.url));if(response){const b=await response.arrayBuffer();if(b.byteLength===a.bytes&&hex(await crypto.subtle.digest('SHA-256',b))===a.sha256){loaded+=a.bytes;continue}await c.delete(abs(a.url))}
   const r=await fetch(downloadUrl(a.url),{signal:own.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});if(!r.ok)throw Error(t('모델 다운로드에 실패했습니다. 다시 시도하세요.'));const reader=r.body.getReader(),chunks=[];let size=0;
   while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);size+=value.length;message(t('띄어쓰기 모델 다운로드 중 · {percent}%',{percent:Math.min(99,Math.round((loaded+size)/total*100))}))}
   const b=await new Blob(chunks).arrayBuffer();if(b.byteLength!==a.bytes||hex(await crypto.subtle.digest('SHA-256',b))!==a.sha256)throw Error(t('모델 파일 확인에 실패했습니다. 다시 다운로드하세요.'));if(own.signal.aborted)throw new DOMException('Cancelled','AbortError');await c.put(abs(a.url),new Response(b,{headers:{'Content-Type':a.url.endsWith('.js')?'text/javascript':a.url.endsWith('.wasm')?'application/wasm':'application/octet-stream'}}));loaded+=a.bytes;
  }
  if(own.signal.aborted)throw new DOMException('Cancelled','AbortError');await c.put(abs(MANIFEST),new Response(JSON.stringify(m),{headers:{'Content-Type':'application/json'}}));save(true);message(t('띄어쓰기 보정 사용 가능 · 모델을 기기에 저장했습니다.'));
 }catch(e){save(false);message(e.name==='AbortError'?t('다운로드를 취소했습니다. 다시 켜면 이어서 준비합니다.'):t('띄어쓰기 보정 준비 실패: {reason}',{reason:e.message}));}finally{if(controller===own)controller=null;sync();root.ModelManager?.refresh()}}
 function stop(){job++;if(worker){worker.terminate();worker=null}const previous=pending;pending=null;working=false;previous?.reject(Error('CANCELLED'))}
 async function set(value){if(!value){controller?.abort();stop();save(false);message(t('띄어쓰기 보정 꺼짐'));return}if((await status()).ready){save(true);message(t('한국어 OCR 결과에 띄어쓰기 보정을 적용합니다.'));return}save(false);await prepare()}
 async function remove(){controller?.abort();stop();save(false);await caches.delete(CACHE);message(t('띄어쓰기 모델을 삭제했습니다.'));sync()}
 async function correct(text,writing,onProgress=()=>{}){
  if(!enabled||writing!=='korean'||!/[가-힣]/u.test(text))return {text,original:text};
  if(working)return {text,original:text,warning:t('띄어쓰기 보정을 건너뛰고 OCR 원문을 표시합니다.')};
  if(!(await status()).ready)return {text,original:text,warning:t('띄어쓰기 모델이 없습니다. OCR 원문을 표시합니다. 설정에서 다시 다운로드하세요.')};
  working=true;onProgress(t('한국어 띄어쓰기 보정 중…'));const id=++job;
  try{if(!worker)worker=new Worker('./korean-spacing-worker.js?v=1.10.0-beta.2',{type:'module'});
   const result=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{stop();reject(Error('TIMEOUT'))},30000);pending={reject:e=>{clearTimeout(timer);reject(e)}};worker.onerror=()=>{clearTimeout(timer);reject(Error('WORKER_ERROR'))};worker.onmessage=({data})=>{if(data.id!==id)return;clearTimeout(timer);data.error?reject(Error(data.error)):resolve(data.text)};worker.postMessage({id,text})});
   return {text:KoreanSpacingCore.characters(result)===KoreanSpacingCore.characters(text)?result:text,original:text};
  }catch(e){if(id===job)stop();return {text,original:text,warning:t('띄어쓰기 보정을 건너뛰고 OCR 원문을 표시합니다.')};}finally{if(id===job){pending=null;working=false}}
 }
 E('koreanSpacingToggle').onchange=e=>set(e.target.checked).catch(e=>{sync();message(e.message)});E('spacingCancel').onclick=()=>controller?.abort();E('spacingRetry').onclick=()=>set(true);E('spacingDelete').onclick=()=>remove();
 root.KoreanSpacing={status,prepare,set,remove,correct,cancel:stop,enabled:()=>enabled};sync();
})(globalThis);

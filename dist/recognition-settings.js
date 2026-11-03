/* One session-wide recognition preference. Saving defaults never stores model consent. */
(function(root){
 const writings=['horizontal','vertical','english','korean'],names={horizontal:'일본어 · 가로',vertical:'일본어 · 세로',english:'영어',korean:'한국어'},subscribers=new Set();
 const saved=AppSettings.read(),legacy=k=>{try{return localStorage.getItem('akai.translation.'+k)}catch{return null}},initial=saved.ocr||saved.translation||{};
 let state={writing:initial.writing||legacy('writing')||'vertical',ocr:(initial.ocr||legacy('ocr'))==='paddle'?'paddle':'best'};
 if(!writings.includes(state.writing))state.writing='vertical';if(!['best','paddle'].includes(state.ocr))state.ocr='best';
 const ids=['selectionWriting','betaWriting','betaDetailWriting','settingsWriting'];
 function sync(){for(const id of ids){const e=document.getElementById(id);if(e)e.value=state.writing}const model=document.getElementById('betaOcrEngine');if(model)model.value=state.ocr}
 function read(){return {...state}}
 function set(patch){const next={...state,...patch};if(!writings.includes(next.writing)||!['best','paddle'].includes(next.ocr))return;if(next.writing===state.writing&&next.ocr===state.ocr){sync();return}state=next;sync();for(const fn of subscribers)fn(read())}
 function save(){const settings=AppSettings.read();settings.ocr=read();AppSettings.write(settings)}
 for(const id of ids){const e=document.getElementById(id);if(e)e.onchange=()=>set({writing:e.value})}
 document.getElementById('betaOcrEngine').onchange=e=>set({ocr:e.target.value});sync();
 root.RecognitionSettings={read,set,save,names,subscribe(fn){subscribers.add(fn);return ()=>subscribers.delete(fn)},disable(disabled){for(const id of [...ids,'betaOcrEngine']){const e=document.getElementById(id);if(e)e.disabled=disabled}}};
})(globalThis);

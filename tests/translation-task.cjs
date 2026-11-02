const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
vm.runInThisContext(fs.readFileSync('dist/translation-task.js','utf8'));
function worker(){return{postMessage(p){this.payload=p},terminate(){this.terminated=true},emit(d){this.onmessage({data:{id:1,...d}})}}}
(async()=>{
 let w=worker(),states=[];let t=createTranslationTask(w,{id:1},s=>states.push(s));let failure=t.promise.catch(e=>e.message);w.emit({type:'error',message:'failed to initialize'});w.emit({type:'progress',message:'done'});assert.equal(await failure,'failed to initialize');assert.deepEqual(states,[],'late progress cannot overwrite error');
 w=worker();states=[];t=createTranslationTask(w,{id:1},s=>states.push(s));w.emit({type:'result',text:'오늘은 좋은 날씨입니다.'});w.emit({type:'progress',message:'done'});assert.equal(await t.promise,'오늘은 좋은 날씨입니다.');assert.deepEqual(states,[]);
 w=worker();t=createTranslationTask(w,{id:1},()=>{});failure=t.promise.catch(e=>e.message);w.emit({type:'result',text:'  '});assert.match(await failure,/EMPTY_TRANSLATION/);
 w=worker();let tick,time=0;t=createTranslationTask(w,{id:1},()=>{},{now:()=>time,interval:f=>{tick=f;return 1},clear:()=>{}});failure=t.promise.catch(e=>e.message);time=180001;tick();assert.match(await failure,/TRANSLATION_TIMEOUT/);assert.equal(w.terminated,true);
 w=worker();t=createTranslationTask(w,{id:1},()=>{});failure=t.promise.catch(e=>e.message);t.cancel();assert.equal(await failure,'실행 취소');assert.equal(w.terminated,true);
 console.log('오류 뒤 진행 알림·빈 결과·시간 제한·취소 회귀 검사 통과');
})().catch(e=>{console.error(e);process.exitCode=1});

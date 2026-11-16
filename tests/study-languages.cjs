const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
for(const f of ['study-languages','translation-text'])vm.runInThisContext(fs.readFileSync('public/'+f+'.js','utf8'));
for(const [name,src,ocr]of [['horizontal','ja','jpn'],['vertical','ja','jpn_vert'],['english','en','eng'],['korean','ko','kor']]){
 for(const target of ['ja','en','ko'])assert.deepEqual(StudyLanguages.pair(name,target),{source:src,target});
 assert.equal(StudyLanguages.sources[name].ocr,ocr);
}
assert.throws(()=>StudyLanguages.pair('xx','ko'));
assert.equal(TranslationText.normalize('오늘은 좋은 날씨입니다.\n내일 책을 읽습니다.','ko'),'오늘은 좋은 날씨입니다. 내일 책을 읽습니다.');
assert.equal(TranslationText.normalize('This is a book.\nI read every day.','en'),'This is a book. I read every day.');
const korean=('오늘은 도서관에서 한국어 공부를 합니다. ').repeat(40);assert.equal(TranslationText.chunks(korean,140,'ko').join(''),TranslationText.normalize(korean,'ko'));
// Exercise actual worker routing with a deterministic model, without model downloads.
(async()=>{for(const engine of ['m2m','nllb'])for(const sourceLanguage of ['ja','en','ko'])for(const targetLanguage of ['ja','en','ko']){if(sourceLanguage===targetLanguage)continue;let optsSeen;const sent=[];const model={tokenizer:{_build_translation_inputs:(chunks,opts,gen)=>{optsSeen=gen;return{}},batch_decode:()=>['translated']},model:{config:{eos_token_id:2},generate:async()=>({tolist:()=>[[1,2]]})}};const env={backends:{onnx:{wasm:{}}}};const ctx={StudyLanguages,TranslationText,env,pipeline:async()=>model,URL,console,self:{location:{href:'https://app.invalid/'},fetch:async()=>{},postMessage:m=>sent.push(m)}};vm.createContext(ctx);const code=fs.readFileSync('public/translation-worker.js','utf8').replace(/^import .*;\n/gm,'').replace('import.meta.url',"'https://app.invalid/translation-worker.js'");vm.runInContext(code,ctx);await ctx.self.onmessage({data:{id:1,engine,sourceLanguage,targetLanguage,text:'Test text',download:false}});assert.equal(optsSeen.src_lang,engine==='nllb'?StudyLanguages.nllb[sourceLanguage]:sourceLanguage);assert.equal(optsSeen.tgt_lang,engine==='nllb'?StudyLanguages.nllb[targetLanguage]:targetLanguage);assert.equal(sent.at(-1).type,'result')}
console.log('원문·결과 언어 조합, 한국어 띄어쓰기, 두 엔진 언어 전달 검사 통과')})().catch(e=>{console.error(e);process.exitCode=1});

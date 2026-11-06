import './study-languages.js?v=0.38.2-beta.1';
import './translation-text.js?v=0.38.2-beta.1';
import {pipeline,env} from './vendor/ai/transformers.min.js';
// Never probe a missing /models URL: static hosts may return index.html (HTTP 200).
env.allowLocalModels=false;env.allowRemoteModels=true;env.localModelPath='/__no_local_model_files__/';env.useBrowserCache=true;
env.backends.onnx.wasm.wasmPaths=new URL('./vendor/ai/',import.meta.url).href;
env.backends.onnx.wasm.numThreads=1;
const originalFetch=self.fetch.bind(self);let permitDownload=false;
self.fetch=async(input,init)=>{const url=new URL(typeof input==='string'?input:input.url||String(input),self.location.href);const method=init?.method||input?.method||'GET';if(!['GET','HEAD'].includes(method.toUpperCase()))throw Error('LOCAL_ONLY: 모델 다운로드 외 요청은 허용하지 않습니다.');if(url.origin!==self.location.origin&&!permitDownload)throw Error('MODEL_NOT_CACHED: 선택 모델이 저장되어 있지 않습니다. 모델 관리에서 다운로드해 주세요.');return originalFetch(input,init)};
let translator=null,key='';
self.onmessage=async({data})=>{const {id,engine,text,download,sourceLanguage='ja',targetLanguage='ko'}=data;let ended=false;const send=d=>{if(!ended)self.postMessage({id,...d})};try{
 permitDownload=!!download;
 const model=engine==='nllb'?'Xenova/nllb-200-distilled-600M':'Xenova/m2m100_418M';
 if(!StudyLanguages.names[sourceLanguage]||!StudyLanguages.names[targetLanguage])throw Error('지원하지 않는 언어입니다.');
 let warnings=[];
 if(key!==engine){if(translator)await translator.dispose();translator=null;key='';send({type:'phase',phase:'model',message:'모델 캐시 확인 및 다운로드 준비'});
 translator=await pipeline('translation',model,{device:'wasm',dtype:'q8',local_files_only:false,progress_callback:p=>{if(p.status==='done')send({type:'progress',message:'모델 파일 준비 중: '+(p.file||'')});else if(p.status==='progress')send({type:'progress',message:`${p.file}: ${Math.min(100,Math.round(p.progress||0))}%`});else if(p.status==='ready')send({type:'phase',phase:'initializing',message:'모델 파일 준비 완료 · 실행 엔진 초기화 중'})}});key=engine;}
 if(data.operation==='prepare'){send({type:'prepared',engine});ended=true;return}
 const chunks=TranslationText.chunks(text,140,sourceLanguage);
 async function one(chunk,depth=0){
  const opts={src_lang:engine==='nllb'?StudyLanguages.nllb[sourceLanguage]:sourceLanguage,tgt_lang:engine==='nllb'?StudyLanguages.nllb[targetLanguage]:targetLanguage,max_new_tokens:512,num_beams:1};
  const tokenizer=translator.tokenizer,inputs=tokenizer._build_translation_inputs([chunk],{padding:true,truncation:false},opts);
  const generated=await translator.model.generate({...inputs,...opts}),ids=generated.tolist()[0].map(Number);
  const eos=translator.model.generation_config?.eos_token_id??translator.model.config.eos_token_id;
  if(TranslationText.hitsLimit(ids,eos,512)){
   if(depth<2&&Array.from(chunk).length>40){const smaller=TranslationText.chunks(chunk,Math.ceil(Array.from(chunk).length/2),sourceLanguage);const parts=[];for(const part of smaller)parts.push(await one(part,depth+1));return parts.join(' ')}
   warnings.push('일부 문장이 출력 길이 한도에 도달했습니다. 원문을 더 작게 선택해 다시 번역해 주세요.');
  }
  const translated=tokenizer.batch_decode(generated,{skip_special_tokens:true})[0]?.trim();if(!translated)throw Error('EMPTY_TRANSLATION: 번역 결과가 비어 있습니다.');return translated;
 }
 send({type:'phase',phase:'inference',message:'번역 계산 중'});let result=[];
 for(let i=0;i<chunks.length;i++){send({type:'phase',phase:'inference',message:`번역 중 · ${i+1}/${chunks.length} 문장`});result.push(await one(chunks[i]));send({type:'partial',text:result.join('\n'),done:i+1,total:chunks.length})}
 send({type:'result',text:result.join('\n'),warning:[...new Set(warnings)].join(' ')});ended=true;
 }catch(e){const message=e.message||String(e);console.error('[Local translation failed]',engine,message);send({type:'error',message});ended=true;}};

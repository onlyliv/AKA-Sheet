import {pipeline,env} from './vendor/ai/transformers.min.js';
// Never probe a missing /models URL: static hosts may return index.html (HTTP 200).
env.allowLocalModels=false;env.allowRemoteModels=true;env.localModelPath='/__no_local_model_files__/';env.useBrowserCache=true;
env.backends.onnx.wasm.wasmPaths=new URL('./vendor/ai/',import.meta.url).href;
env.backends.onnx.wasm.numThreads=1;
const originalFetch=self.fetch.bind(self);let permitDownload=false;
self.fetch=async(input,init)=>{const url=new URL(typeof input==='string'?input:input.url||String(input),self.location.href);const method=init?.method||input?.method||'GET';if(!['GET','HEAD'].includes(method.toUpperCase()))throw Error('LOCAL_ONLY: 모델 다운로드 외 요청은 허용하지 않습니다.');if(url.origin!==self.location.origin&&!permitDownload)throw Error('MODEL_NOT_CACHED: 선택 모델이 저장되어 있지 않습니다. 최초 다운로드를 허용해 주세요.');return originalFetch(input,init)};
let translator=null,key='';
self.onmessage=async({data})=>{const {id,engine,text,download}=data;let ended=false;const send=d=>{if(!ended)self.postMessage({id,...d})};try{
 permitDownload=!!download;
 const model=engine==='nllb'?'Xenova/nllb-200-distilled-600M':'Xenova/m2m100_418M';
 const chunks=(text.match(/[^。！？!?\n]+[。！？!?]?|\n/g)||[text]).filter(s=>s.trim());if(chunks.some(s=>s.length>350))throw Error('한 문장은 350자 이하로 나눠 주세요.');
 if(key!==engine){if(translator)await translator.dispose();translator=null;key='';send({type:'phase',phase:'model',message:'모델 캐시 확인 및 다운로드 준비'});
 translator=await pipeline('translation',model,{device:'wasm',dtype:'q8',local_files_only:false,progress_callback:p=>{if(p.status==='done')send({type:'progress',message:'모델 파일 준비 중: '+(p.file||'')});else if(p.status==='progress')send({type:'progress',message:`${p.file}: ${Math.min(100,Math.round(p.progress||0))}%`});else if(p.status==='ready')send({type:'phase',phase:'initializing',message:'모델 파일 준비 완료 · 실행 엔진 초기화 중'})}});key=engine;}
 send({type:'phase',phase:'inference',message:'한국어 번역 계산 중'});let result=[];
 for(let i=0;i<chunks.length;i++){send({type:'phase',phase:'inference',message:`한국어 번역 중 · ${i+1}/${chunks.length} 문장`});const output=await translator(chunks[i],{src_lang:engine==='nllb'?'jpn_Jpan':'ja',tgt_lang:engine==='nllb'?'kor_Hang':'ko',max_new_tokens:256,num_beams:1});const translated=output?.[0]?.translation_text?.trim();if(!translated)throw Error('EMPTY_TRANSLATION: 번역 결과가 비어 있습니다. 엔진을 해제하고 짧은 문장으로 다시 실행해 주세요.');result.push(translated)}
 send({type:'result',text:result.join('\n')});ended=true;
 }catch(e){const message=e.message||String(e);console.error('[Local translation failed]',engine,message);send({type:'error',message});ended=true;}};

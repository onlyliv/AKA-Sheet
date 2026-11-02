import {pipeline,env} from './vendor/ai/transformers.min.js';
env.allowLocalModels=true;env.useBrowserCache=true;
env.backends.onnx.wasm.wasmPaths=new URL('./vendor/ai/',import.meta.url).href;
env.backends.onnx.wasm.numThreads=1;
let translator=null,key='';
self.onmessage=async({data})=>{const {id,engine,text,download}=data;try{
 env.allowRemoteModels=!!download;
 const model=engine==='nllb'?'Xenova/nllb-200-distilled-600M':'Xenova/m2m100_418M';
 if(key!==engine){if(translator)await translator.dispose();translator=null;key='';
 translator=await pipeline('translation',model,{device:'wasm',dtype:'q8',local_files_only:!download,progress_callback:p=>self.postMessage({id,type:'progress',message:p.status==='progress'?`${p.file}: ${Math.round(p.progress||0)}%`:p.status})});key=engine;}
 const chunks=text.match(/[^。！？!?\n]+[。！？!?]?|\n/g)||[text];let result=[];
 for(const chunk of chunks){if(!chunk.trim())continue;if(chunk.length>350)throw Error('한 문장은 350자 이하로 나눠 주세요.');const output=await translator(chunk,{src_lang:engine==='nllb'?'jpn_Jpan':'ja',tgt_lang:engine==='nllb'?'kor_Hang':'ko',max_new_tokens:256,num_beams:1});result.push(output[0].translation_text)}
 self.postMessage({id,type:'result',text:result.join('\n')});
 }catch(e){self.postMessage({id,type:'error',message:e.message||String(e)})}};

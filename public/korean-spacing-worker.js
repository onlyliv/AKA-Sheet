/* All text processing stays on-device. No model downloads from this worker. */
import './korean-spacing-core.js';
const CACHE='akai-spacing-024',absolute=p=>new URL(p,self.location.href).href;
let kiwi=null;
async function cached(path){const r=await(await caches.open(CACHE)).match(absolute(path));if(!r)throw Error('SPACING_NOT_READY');return r}
async function load(){if(kiwi)return kiwi;
 const manifest=await(await cached('models/kiwi-024/manifest.json')).json();
 const {KiwiBuilder}=await import('./vendor/kiwi/kiwi-builder.js');
 const wasm=await(await cached('vendor/kiwi/kiwi-wasm.wasm')).blob(),url=URL.createObjectURL(wasm);
 try{const builder=await KiwiBuilder.create(url),modelFiles={};
  for(const f of manifest.files){const parts=[];for(const p of f.chunks)parts.push(await(await cached(p)).arrayBuffer());const blob=new Blob(parts),bytes=new Uint8Array(await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());if(bytes.length!==f.bytes)throw Error('SPACING_NOT_READY');modelFiles[f.name]=bytes}
  kiwi=await builder.build({modelFiles,modelType:'cong',loadDefaultDict:false,loadTypoDict:false,loadMultiDict:false});return kiwi;
 }finally{URL.revokeObjectURL(url)}
}
self.onmessage=async({data})=>{const {id,text}=data;try{const k=await load();const result=KoreanSpacingCore.correct(text,(s,reset)=>k.space(s,reset));self.postMessage({id,text:result})}catch(e){kiwi=null;self.postMessage({id,error:String(e.message||e)})}};

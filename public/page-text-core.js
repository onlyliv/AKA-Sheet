/* Bounded, sequential extraction. No persistence or cloud transport. */
(function(root){
 const MAX=2000000;
 function pdfText(items){let out='',previous=null;for(const item of items){if(typeof item.str!=='string')continue;const tr=item.transform||[],p=previous?.transform||[],size=Math.abs(tr[3]||tr[0]||0),gap=(tr[4]||0)-((p[4]||0)+(previous?.width||0));if(previous&&!out.endsWith('\n')&&!/\s$/.test(out)&&!/^\s/.test(item.str)&&Math.abs((tr[5]||0)-(p[5]||0))<Math.max(2,size*.4)&&gap>Math.max(1,size*.18))out+=' ';out+=item.str;if(item.hasEOL)out+='\n';previous=item}return out.trim()}
 async function collect(indices,read,{signal,onProgress=()=>{},limit=MAX,yieldTask=()=>new Promise(r=>setTimeout(r,0))}={}){const sections=[];let chars=0,done=0,ocr=0,empty=0,error=null;
  try{for(const number of indices){if(signal?.aborted)throw new DOMException('Cancelled','AbortError');const result=await read(number);if(signal?.aborted)throw new DOMException('Cancelled','AbortError');const text=(result.text||'').trim();if(chars+text.length>limit)throw Error('TEXT_LIMIT');if(text){sections.push({number,text,ocr:!!result.ocr});chars+=text.length}else empty++;if(result.ocr)ocr++;done++;onProgress({done,total:indices.length,ocr,empty,chars});await yieldTask()}}catch(e){error=signal?.aborted?new DOMException('Cancelled','AbortError'):e}
  return {sections,done,total:indices.length,ocr,empty,chars,error,cancelled:error?.name==='AbortError'};
 }
 root.PageTextCore={MAX,pdfText,collect};
})(globalThis);

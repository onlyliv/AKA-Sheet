/* Local heuristics: script evidence + OCR confidence; short or mixed text remains ambiguous. */
(function(root){
 const count=(text,re)=>(text.match(re)||[]).length;
 function stats(text){return {latin:count(text,/[A-Za-z]/g),kana:count(text,/[\u3040-\u30ff]/g),han:count(text,/[\u3400-\u9fff]/g),hangul:count(text,/[\uac00-\ud7af\u1100-\u11ff]/g)}}
 function text(text,vertical=false){const s=stats(text);if(s.hangul>0&&s.hangul>=s.kana+s.han)return 'korean';if(s.kana+s.han>0)return vertical?'vertical':'horizontal';return 'english'}
 function score(candidate,direction){const s=stats(candidate.text),total=s.latin+s.kana+s.han+s.hangul;if(!total)return 0;const wanted=candidate.writing==='korean'?s.hangul:candidate.writing==='english'?s.latin:s.kana+s.han;const fit=wanted/total;return Math.max(0,Math.min(1,candidate.confidence||0))*(.25+.75*fit)+(candidate.writing===direction?.04:0)}
 function choose(candidates,direction='horizontal'){return candidates.filter(x=>x.text?.trim()).map(x=>({...x,rank:score(x,direction)})).sort((a,b)=>b.rank-a.rank)[0]||null}
 function direction(image){const {width:w,height:h,data}=image,rows=new Uint32Array(h),cols=new Uint32Array(w);let total=0;for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const i=(y*w+x)*4;if(data[i+3]>128&&Math.min(data[i],data[i+1],data[i+2])<140){rows[y]++;cols[x]++;total++}}if(total<20)return 'horizontal';const bands=values=>{let max=0;for(const v of values)max=Math.max(max,v);let n=0,on=false;for(let i=0;i<values.length;i+=2){const hit=values[i]>max*.15;if(hit&&!on)n++;on=hit}return n};return bands(cols)<bands(rows)*.65?'vertical':'horizontal'}
 root.RecognitionAuto={stats,text,choose,direction};
})(globalThis);

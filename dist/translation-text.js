(function(root){
 const jp='\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}';
 function normalize(text){return String(text).replace(/\r\n?/g,'\n').replace(new RegExp('(['+jp+'0-9])[^\\S\\n]+(?=['+jp+'0-9])','gu'),'$1').replace(/([^。！？!?\n])\n(?!\n)/g,(all,prev,offset,source)=>prev+(new RegExp('['+jp+']','u').test(prev+(source[offset+all.length]||''))?'':' ')).replace(/\n{3,}/g,'\n\n').trim()}
 function chunks(text,limit=140){const source=normalize(text),sentences=source.match(/[^。！？!?\n]+[。！？!?]?|\n+/g)||[];const out=[];for(const sentence of sentences){if(!sentence.trim()){if(out.length)out[out.length-1]+='\n';continue}let chars=Array.from(sentence);while(chars.length>limit){let cut=limit;for(let i=limit;i>=Math.floor(limit/2);i--)if(/[、，,；;\s]/u.test(chars[i-1])){cut=i;break}out.push(chars.slice(0,cut).join(''));chars=chars.slice(cut)}if(chars.length)out.push(chars.join(''))}return out}
 function hitsLimit(ids,eos,max){const endings=Array.isArray(eos)?eos:[eos];return ids.length>=max&&!endings.some(n=>n!=null&&Number(n)===Number(ids.at(-1)))}
 root.TranslationText={normalize,chunks,hitsLimit};
})(globalThis);

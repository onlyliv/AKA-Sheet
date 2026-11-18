/* Preserve all non-whitespace characters, including OCR mistakes. */
(function(root){
 const characters=s=>s.replace(/\s/gu,'');
 function paragraphs(text){
  // Rejoin Korean soft-wrapped lines before analysis (e.g. 있습니\n다).
  // Blank paragraphs, punctuation-ended lines, lists and non-Korean lines remain separate.
  return text.replace(/([가-힣])\r?\n(?=[가-힣])/gu,'$1');
 }
 function correct(text,space){
  const input=paragraphs(text);
  const result=input.split(/(\r?\n)/).map(line=>{
   if(!/[가-힣]/u.test(line)||/^\r?\n$/.test(line)||line.length>2000)return line;
   const fixed=space(line,false);return typeof fixed==='string'&&characters(fixed)===characters(line)?fixed:line;
  }).join('');
  return characters(result)===characters(text)?result:text;
 }
 root.KoreanSpacingCore={characters,correct,paragraphs};
})(globalThis);

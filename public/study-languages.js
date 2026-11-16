(function(root){
 const sources={auto:{code:'auto',ocr:null,psm:'6'},horizontal:{code:'ja',ocr:'jpn',psm:'6'},vertical:{code:'ja',ocr:'jpn_vert',psm:'5'},english:{code:'en',ocr:'eng',psm:'6'},korean:{code:'ko',ocr:'kor',psm:'6'}};
 const names={ja:'일본어',en:'영어',ko:'한국어'},nllb={ja:'jpn_Jpan',en:'eng_Latn',ko:'kor_Hang'};
 root.StudyLanguages={sources,names,nllb,pair(source,target){if(!sources[source]||!names[target])throw Error('지원하지 않는 언어 선택입니다.');return {source:sources[source].code,target}}};
})(globalThis);

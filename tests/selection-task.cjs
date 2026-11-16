// Exercise actual selection controller cancellation/error paths without an OCR/model download.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const elements=new Map();
const context2d={clearRect(){},fillRect(){},strokeRect(){}};
function el(id){if(!elements.has(id))elements.set(id,{id,value:'',hidden:false,disabled:false,open:false,textContent:'',style:{},classList:{toggle(){},remove(){}},getBoundingClientRect(){return {left:0,top:0,right:500,bottom:500,width:500,height:500}},getContext(){return context2d},setPointerCapture(){},close(){this.open=false},showModal(){this.open=true},focus(){},setAttribute(){},addEventListener(){},scrollIntoView(){}});return elements.get(id)}
let writing='english';let extracted={blocked:true,reason:'숨긴 글자'},capture=async()=>({toDataURL:()=>''});
const scope={console,setTimeout,clearTimeout,performance,URL,AppSettings:{read:()=>({translation:{engine:'m2m',writing:'english',target:'en',ocr:'fast'}})},StudyLanguages:{sources:{english:{ocr:'eng',psm:6}},names:{en:'영어',ko:'한국어'},pair:()=>({source:'en',target:'en'})},document:{getElementById:el,addEventListener(){},body:{classList:{toggle(){},remove(){}}}},localStorage:{getItem(){return null},setItem(){}},busy:false,$:el,RecognitionSettings:{read:()=>({writing,ocr:'fast'}),subscribe(){},disable(){},names:{english:'영어',korean:'한국어'}},ReaderSelection:{clear(){},showPending(){el('sourceReview').hidden=false},showResult(){el('sourceReview').hidden=false},place(){},areaStarted(){},areaFinished(){},setSource(){},extract:()=>extracted,capture:(...a)=>capture(...a)},navigator:{clipboard:{writeText:async()=>{}}}};
vm.createContext(scope);vm.runInContext(fs.readFileSync('public/study-languages.js','utf8'),scope);scope.ModelManager={ensure:async()=>true,isBusy:()=>false,ocrId:()=>"ocr:fast:jpn",open:()=>{}};vm.runInContext(fs.readFileSync('public/beta-translation.js','utf8'),scope);
const tick=()=>new Promise(r=>setImmediate(r));
async function choose(){el('quickTranslate').onclick();el('betaSelection').onpointerdown({preventDefault(){},button:0,isPrimary:true,clientX:10,clientY:10,currentTarget:el('betaSelection'),pointerId:1});return el('betaSelection').onpointerup({clientX:200,clientY:100})}
(async()=>{await tick();await choose();assert(!scope.BetaTranslation.isActive());assert(!el('quickTranslate').disabled);assert.match(el('quickStatus').textContent,/숨긴/);
 extracted={fallback:true};capture=async()=>{throw Error('capture failed')};await choose();assert(!scope.BetaTranslation.isActive());assert.match(el('quickStatus').textContent,/capture failed/);
 let finish;capture=()=>new Promise(r=>finish=r);const pending=choose();scope.BetaTranslation.contextChanged('페이지 변경');finish({toDataURL:()=>''});await pending;await tick();assert(el('sourceReview').hidden);assert.equal(el('inlineSource').value,'');assert(!scope.BetaTranslation.isActive());
 extracted={text:'Visible only',source:'PDF 원문'};capture=async()=>({toDataURL:()=>''});await choose();assert.equal(el('inlineSource').value,'Visible only');assert.equal(el('popupResult').textContent,'Visible only');assert.equal(el('inlineSourcePath').textContent,'PDF 원문');assert(!scope.BetaTranslation.isActive());await scope.BetaTranslation.acceptText('Original English','PDF 원문');writing='korean';el('popupResult').textContent='';await el('inlineTranslate').onclick();assert.equal(el('popupResult').textContent,'Original English');assert.match(el('quickStatus').textContent,/같아/);assert.equal(el('popupTranslation').hidden,false);assert.equal(el('quickTranslation').open,false);assert(!elements.has('quickResult'));await vocabularyChecks();await stageChecks();console.log('말풍선 결과·언어 스냅샷·숨김 차단·캡처 실패 복구·페이지 변경 중 취소·직접 원문 경로 검사 통과');})().catch(e=>{console.error(e);process.exitCode=1});

async function vocabularyChecks(){
 let opened=[],pending=0,ocrCalls=0;
 scope.VocabularyUI={openEntry:async seed=>opened.push(seed)};
 scope.ReaderSelection.showPending=()=>{pending++;el('sourceReview').hidden=false};
 scope.Tesseract={createWorker:async()=>({setParameters:async()=>{},recognize:async()=>{ocrCalls++;return {data:{text:'OCR word'}}},terminate:async()=>{}})};
 scope.location={href:'http://localhost/'};writing='english';
 async function add(){scope.BetaTranslation.contextChanged();el('sourceReview').hidden=true;await scope.BetaTranslation.selectVocabulary();el('betaSelection').onpointerdown({preventDefault(){},button:0,isPrimary:true,clientX:10,clientY:10,currentTarget:el('betaSelection'),pointerId:1});return el('betaSelection').onpointerup({clientX:200,clientY:100})}
 extracted={text:'native word',source:'PDF 원문'};await add();assert.equal(opened.length,1);assert.equal(opened[0].word,'native word');assert.equal(opened[0].sourceLang,'en');assert.equal(ocrCalls,0);assert.equal(pending,0);assert(el('sourceReview').hidden);
 extracted={fallback:true};await add();assert.equal(opened.length,2);assert.equal(opened[1].word,'OCR word');assert.equal(ocrCalls,1);assert.equal(pending,0);assert(el('sourceReview').hidden);
 scope.Tesseract.createWorker=async()=>{throw Error('OCR failed')};await scope.BetaTranslation.unload(true);await add();assert.equal(opened.length,2);assert.match(el('vocabQuickStatus').textContent,/OCR failed/);assert(!scope.BetaTranslation.isActive());
 let finish;capture=()=>new Promise(r=>finish=r);const job=add();await tick();scope.BetaTranslation.contextChanged();finish({toDataURL:()=>''});await job;assert.equal(opened.length,2);
 await scope.BetaTranslation.selectVocabulary();el('betaSelection').onpointercancel();assert(!scope.BetaTranslation.isActive());assert.equal(opened.length,2);
}

async function stageChecks(){
 await scope.BetaTranslation.unload(true);scope.BetaTranslation.contextChanged();writing='english';extracted={fallback:true};let releaseCapture,releaseModel,releaseInit,releaseInference;const hints=[];
 scope.ReaderSelection.setSource=(path,hint)=>{hints.push(hint);el('recognitionStatus').textContent=hint};
 capture=()=>new Promise(r=>releaseCapture=r);
 scope.ModelManager.ensure=()=>new Promise(r=>releaseModel=r);
 scope.Tesseract.createWorker=()=>new Promise(r=>releaseInit=r);
 await scope.BetaTranslation.selectArea();el('betaSelection').onpointerdown({button:0,isPrimary:true,clientX:10,clientY:10,preventDefault(){},currentTarget:el('betaSelection'),pointerId:1});const task=el('betaSelection').onpointerup({clientX:200,clientY:100});await tick();assert.match(el('recognitionStatus').textContent,/영역 처리 중/);
 releaseCapture({toDataURL:()=>''});await tick();assert.equal(el('inlineSource').value,'');assert.match(el('recognitionStatus').textContent,/엔진 준비 중/);assert(hints.every(t=>!t.includes('인식 완료')));
 releaseModel(true);await tick();assert.match(el('recognitionStatus').textContent,/엔진 준비 중/);
 releaseInit({setParameters:async()=>{},recognize:()=>new Promise(r=>releaseInference=r),terminate:async()=>{}});await tick();assert.match(el('recognitionStatus').textContent,/글자 인식 중/);assert(!el('inlineSource').value);
 releaseInference({data:{text:'Finished OCR'}});await task;assert.equal(el('inlineSource').value,'Finished OCR');assert(hints.at(-1).includes('OCR 인식 완료'));assert.match(el('recognitionStatus').textContent,/OCR 완료/);assert(!scope.BetaTranslation.isActive());
 console.log('지연된 캡처·모델 확인·엔진 초기화·실제 인식 전 완료 표시 금지 및 완료 시점 검사 통과');
}

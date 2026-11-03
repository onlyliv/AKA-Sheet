const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const store=new Map(),elements=new Map();const el=id=>{if(!elements.has(id))elements.set(id,{value:'',disabled:false});return elements.get(id)};
const scope={structuredClone,localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},document:{getElementById:el}};vm.createContext(scope);vm.runInContext(fs.readFileSync('dist/settings-store.js','utf8'),scope);
let settings=scope.AppSettings.read();settings.translation={engine:'m2m',writing:'english',target:'ko',ocr:'best'};scope.AppSettings.write(settings);
vm.runInContext(fs.readFileSync('dist/recognition-settings.js','utf8'),scope);const api=scope.RecognitionSettings;assert.equal(api.read().writing,'english');assert.equal(api.read().ocr,'best');let count=0;api.subscribe(()=>count++);
api.set({writing:'korean',ocr:'paddle'});for(const id of ['selectionWriting','betaWriting','betaDetailWriting','settingsWriting'])assert.equal(el(id).value,'korean');assert.equal(count,1);assert.equal(scope.AppSettings.read().ocr,undefined);api.set({writing:'bogus'});assert.equal(api.read().writing,'korean');assert.equal(count,1);
api.save();assert.equal(scope.AppSettings.read().ocr.writing,'korean');assert.equal('download'in scope.AppSettings.read().ocr,false);assert.equal(scope.AppSettings.read().translation.engine,'m2m');api.disable(true);assert(el('settingsWriting').disabled);assert(el('betaOcrEngine').disabled);
vm.runInContext(fs.readFileSync('dist/recognition-settings.js','utf8'),scope);assert.equal(scope.RecognitionSettings.read().writing,'korean');assert.equal(scope.RecognitionSettings.read().ocr,'paddle');
console.log('전역 OCR 이관·네 메뉴 언어 동기화·세션/기본값 분리·동의 미저장·재실행 복원 검사 통과');

settings=scope.AppSettings.read();settings.ocr={writing:'vertical',ocr:'fast'};scope.AppSettings.write(settings);assert.equal(scope.AppSettings.read().ocr.ocr,'best');

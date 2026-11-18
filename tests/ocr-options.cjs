const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const scope={structuredClone,localStorage:{getItem:()=>null}};vm.createContext(scope);for(const f of ['settings-store','korean-spacing-core'])vm.runInContext(fs.readFileSync('public/'+f+'.js','utf8'),scope);
assert.equal(scope.AppSettings.read().imageSharpen,false);assert.equal(scope.AppSettings.read().koreanSpacing,false);
for(const imageSharpen of [false,true])for(const koreanSpacing of [false,true]){const s=scope.AppSettings.normalize({imageSharpen,koreanSpacing});assert.equal(s.imageSharpen,imageSharpen);assert.equal(s.koreanSpacing,koreanSpacing)}
const c=scope.KoreanSpacingCore;
assert.equal(c.correct('파일을읽고, 씁니다.',()=> '파일을 읽고, 씁니다.'),'파일을 읽고, 씁니다.');
assert.equal(c.correct('택스트 dif 123',()=> '텍스트 diff 123'),'택스트 dif 123');
assert.equal(c.correct('파일을읽고\n씁니다.\n\n表 ABC',s=>s.replace('파일을읽고','파일을 읽고')),'파일을 읽고씁니다.\n\n表 ABC');
assert.equal(c.correct('English 日本語',()=>{throw Error('must bypass')}),'English 日本語');
console.log('독립 기본값·비공백 문자 보존·오인식 수정 차단·한국어 줄바꿈 연결·빈 문단 보존·비한국어 우회 검사 통과');

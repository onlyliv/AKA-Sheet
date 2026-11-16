const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('dist/index.html','utf8'),script=html.match(/<script>\n([\s\S]*?)<\/script>/)[1],total=(html.match(/onload="StartupUI.loaded\(\)"/g)||[]).length;
assert.equal(total,44);assert(html.indexOf('id="startupScreen"')<html.indexOf('rel="stylesheet"'));assert(html.includes('media="print"'));
function setup(){const nodes={};let tick,now=0;const c={document:{querySelector:()=>({removeAttribute(){}}),getElementById:id=>nodes[id]??=( {hidden:false,value:0,setAttribute(k,v){this[k]=v}} )},Date:{now:()=>now},navigator:{onLine:true},setInterval:f=>(tick=f,1),clearInterval(){},window:{addEventListener(){} }};vm.createContext(c);vm.runInContext(script,c);return {ui:c.window.StartupUI,nodes,tick:()=>tick(),time:n=>now=n,c}}
let a=setup();for(let i=0;i<total;i++)a.ui.loaded();assert(!a.nodes.startupScreen);a.ui.styled();assert(a.nodes.startupScreen.hidden);assert.equal(a.nodes.startupProgress.value,total);
a=setup();a.ui.styled();a.time(21000);a.tick();assert.equal(a.nodes.startupRetry.hidden,false);assert(a.nodes.startupDetail.textContent.includes('21초'));a.ui.fail('notes.js?v=1');a.ui.loaded();assert(a.nodes.startupStatus.textContent.includes('못했습니다'));a.ui.styled();assert(!a.nodes.startupScreen);a.ui.ocr('OCR 다운로드 · 1.2MB');assert.equal(a.nodes.ocrBootNotice.textContent,'OCR 다운로드 · 1.2MB');
a=setup();a.c.navigator.onLine=false;a.tick();assert(a.nodes.startupDetail.textContent.includes('오프라인'));
console.log('기동 파일/스타일 준비 동기화·지연·실패·오프라인·OCR 안내 검사 통과');

'use strict';
pdfjsLib.GlobalWorkerOptions.workerSrc='vendor/pdf.worker.min.js';
const $=id=>document.getElementById(id), canvas=$('page'),ctx=canvas.getContext('2d',{willReadFrequently:true});
let epub=null,epubSecond=null;
let tapSuppressedUntil=0;
let readingDirection='ltr';
let viewCount=1,scrollLock=0,scrollSum=0,scrollTime=0,arrivalBottom=false;
let pdf=null,img=null,raw=null,page=1,total=1,hidden=true,peeking=false,zoom=1,busy=false,fileKey='',sequence=0;
const status=s=>$('status').textContent=s;
function prefs(k,v){try{if(v!==undefined)localStorage.setItem(k,v);else return localStorage.getItem(k)}catch{} }
let sheetColor=['red','green','blue'].includes(prefs('sheetColor'))?prefs('sheetColor'):'red';
$('sensitivity').value=prefs('sensitivity:'+sheetColor)??prefs('sensitivity')??60;
function syncSheet(){document.body.dataset.sheet=sheetColor;document.querySelectorAll('[data-sheet]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sheet===sheetColor)));}
syncSheet();document.querySelectorAll('[data-sheet]').forEach(b=>b.onclick=()=>{prefs('sensitivity:'+sheetColor,$('sensitivity').value);sheetColor=b.dataset.sheet;prefs('sheetColor',sheetColor);$('sensitivity').value=prefs('sensitivity:'+sheetColor)??60;syncSheet();paint()});
viewCount=Number(prefs('viewCount'))===2?2:1;$('viewMode').value=String(viewCount);
readingDirection=prefs('readingDirection')==='rtl'?'rtl':'ltr';$('readingDirection').value=readingDirection;
function mask(data,level){return SheetColors.mask(data,level,sheetColor)}
function paint(){if(epubSecond)epubSecond.paint(hidden&&!peeking,+$('sensitivity').value);if(epub)epub.paint(hidden&&!peeking,+$('sensitivity').value);if(!raw&&!epub)return;if(!epub){const copy=new ImageData(new Uint8ClampedArray(raw.data),raw.width,raw.height);ctx.putImageData(hidden&&!peeking?mask(copy,+$('sensitivity').value):copy,0,0);}$('toggle').textContent=hidden?'◉ 정답 보기':'◉ 정답 숨기기';$('toggle').setAttribute('aria-pressed',String(hidden));$('badge').textContent=hidden&&!peeking?'정답 숨김':'정답 표시';$('strength').value=$('sensitivity').value;}
function applyDirection(){if(epub)epub.frame.style.order=readingDirection==='rtl'&&epubSecond?'2':'0';if(epubSecond)epubSecond.frame.style.order=readingDirection==='rtl'?'1':'2';$('readingDirection').disabled=total<2;}
function size(){$('epubInput').hidden=!epub;$('epubInput').style.top=$('status').offsetHeight+'px';applyDirection();if(epub)epub.size(zoom);if(epubSecond)epubSecond.size(zoom);const w=Math.max(150,$('viewport').clientWidth);canvas.style.width=Math.round(w*zoom)+'px';canvas.style.height='auto';$('zoomLabel').textContent=Math.round(zoom*100)+'%'}
function demo(){ctx.fillStyle='#fffdf6';ctx.fillRect(0,0,1100,1450);ctx.fillStyle='#a83c35';ctx.font='22px sans-serif';ctx.fillText('漢字検定 ２級　／　書き取り',90,100);ctx.fillStyle='#333b30';ctx.font='46px serif';ctx.fillText('今日の一歩が、明日の力に。',90,210);ctx.font='23px sans-serif';ctx.fillText('次のカタカナを漢字に直しましょう。',90,290);const rows=[['01','自然のオンケイを受ける。','恩恵'],['02','物事のホンシツを見極める。','本質'],['03','困難をコクフクする。','克服'],['04','自分の意見をシュチョウする。','主張'],['05','学習をケイゾクする。','継続']];rows.forEach((r,i)=>{let y=415+i*180;ctx.fillStyle='#888d7b';ctx.font='20px sans-serif';ctx.fillText(r[0],90,y);ctx.fillStyle='#333b30';ctx.font='32px serif';ctx.fillText(r[1],155,y);ctx.strokeStyle='#dddccf';ctx.beginPath();ctx.moveTo(155,y+100);ctx.lineTo(980,y+100);ctx.stroke();ctx.fillStyle='#df5043';ctx.font='42px serif';ctx.fillText(r[2],175,y+75)});ctx.fillStyle='#90947f';ctx.font='18px sans-serif';ctx.fillText('AKA Sheet　·　체험용으로 제작한 예제입니다.',90,1380)}
async function render(){if(busy)return;busy=true;const token=++sequence;$('prev').disabled=$('next').disabled=true;try{if(epub){status('EPUB 본문을 준비하고 있습니다…');await epub.show(page);if(viewCount===2&&page<total){if(!epubSecond)epubSecond=new LocalEpub(epub.zip,epub.chapters,epub.types);await epubSecond.show(page+1)}else if(epubSecond){epubSecond.destroy();epubSecond=null;canvas.hidden=true;}}else if(pdf){status('페이지를 준비하고 있습니다…');const sheets=[];for(let n=page;n<=Math.min(total,page+viewCount-1);n++){const p=await pdf.getPage(n);const base=p.getViewport({scale:1});const v=p.getViewport({scale:Math.min(2,1600/Math.max(base.width,base.height))});const c=document.createElement('canvas');c.width=Math.ceil(v.width);c.height=Math.ceil(v.height);await p.render({canvasContext:c.getContext('2d'),viewport:v}).promise;sheets.push(c)}canvas.width=sheets.reduce((w,c)=>w+c.width,0);canvas.height=Math.max(...sheets.map(c=>c.height));ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);if(readingDirection==='rtl')sheets.reverse();let x=0;for(const c of sheets){ctx.drawImage(c,x,0);x+=c.width}}else if(img){const s=Math.min(1,1800/Math.max(img.width,img.height));canvas.width=Math.round(img.width*s);canvas.height=Math.round(img.height*s);ctx.drawImage(img,0,0,canvas.width,canvas.height);}else{canvas.width=1100;canvas.height=1450;demo()}if(token!==sequence)return;if(!epub)raw=ctx.getImageData(0,0,canvas.width,canvas.height);paint();size();$('number').value=page;$('number').max=total;$('total').textContent=total;$('viewMode').disabled=total<2;if(fileKey)prefs('page:'+fileKey,page);$('number').setAttribute('aria-label',epub?'본문 번호':'페이지 번호');status(epub||pdf?'좌우 절반 클릭·탭으로 넘기기 · 아래 스크롤: 다음 · 위 스크롤: 이전.'+(viewCount===2?' 현재 '+page+'–'+Math.min(total,page+1)+' / '+total:''):img?'선택한 색의 글씨가 남으면 숨김 감도를 조절하세요.':'선택한 색의 글자를 숨깁니다. 예제 정답은 빨강입니다.');}catch(e){status('페이지를 표시하지 못했습니다: '+e.message)}finally{busy=false;positionPages(arrivalBottom);arrivalBottom=false;scrollLock=Date.now()+150;$('prev').disabled=page<=1;$('next').disabled=page+viewCount>total;}}
async function open(file){if(!file||busy)return;busy=true;status('파일을 여는 중입니다…');let url;try{let newPdf=null,newImg=null,newEpub=null;if(/\.epub$/i.test(file.name)||file.type==='application/epub+zip'){newEpub=await LocalEpub.load(file);}else if(file.type==='application/pdf'||/\.pdf$/i.test(file.name)){newPdf=await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;}else if(/^image\//.test(file.type)){url=URL.createObjectURL(file);newImg=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('이미지를 읽을 수 없습니다. PNG 또는 JPEG로 변환해 주세요.'));i.src=url});}else throw Error('EPUB, PDF, PNG, JPEG, WebP 파일을 선택해 주세요.');if(pdf)await pdf.destroy();if(epubSecond){epubSecond.destroy();epubSecond=null;}if(epub)epub.destroy();epub=newEpub;pdf=newPdf;img=newImg;canvas.hidden=!!epub;total=epub?epub.chapters.length:pdf?pdf.numPages:1;fileKey=file.name+':'+file.size+':'+file.lastModified;page=Math.min(total,Math.max(1,Number(prefs('page:'+fileKey))||1));$('filename').textContent=file.name;zoom=1;hidden=true;}catch(e){status(e.name==='PasswordException'?'암호가 걸린 PDF입니다. 암호를 해제한 사본을 열어 주세요.':'파일을 열지 못했습니다: '+e.message);return}finally{if(url)URL.revokeObjectURL(url);busy=false;$('file').value=''}await render()}
function positionPages(bottom){const outer=$('viewport');outer.scrollTop=bottom?outer.scrollHeight:0;for(const book of [epub,epubSecond]){const d=book?.frame.contentDocument;if(d){const e=d.scrollingElement;const w=book.frame.contentWindow;w.scrollTo(w.scrollX,bottom?e.scrollHeight:0)}}}
const wheelGesture=new WheelPageGesture();
function turnPages(step,bottom=false){if(busy||Date.now()<scrollLock||total<2)return false;const target=Math.max(1,page+step*viewCount);if((step<0&&page<=1)||target>total)return false;go(target,bottom);return true}
function atVerticalEdge(scroller,step){const top=Math.max(0,scroller.scrollTop),max=Math.max(0,scroller.scrollHeight-scroller.clientHeight);return step>0?top>=max-3:top<=3}
function epubScroller(e){const x=e.clientX??e.touches?.[0]?.clientX??0;const book=[epub,epubSecond].find(b=>{if(!b)return false;const r=b.frame.getBoundingClientRect();return x>=r.left&&x<=r.right})||epub;return book?.frame.contentDocument.scrollingElement||$('viewport')}
function bindPageScroll(target,getScroller){
 let touch=null;
 target.addEventListener('wheel',e=>{
  if(e.ctrlKey)return;
  const s=getScroller(e),overlay=target===$('epubInput');
  if(Math.abs(e.deltaY)<=Math.abs(e.deltaX)){if(overlay){$('viewport').scrollLeft+=e.deltaX;if(e.cancelable)e.preventDefault()}return;}
  tapSuppressedUntil=Date.now()+250;
  const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?500:1);
  const step=Math.sign(delta),edge=atVerticalEdge(s,step);
  const blocked=busy||Date.now()<scrollLock||total<2;
  const turn=wheelGesture.sample(delta,edge,blocked);
  if(overlay){if(!edge)s.scrollTop+=delta;if(e.cancelable)e.preventDefault()}
  else if(edge&&total>1&&e.cancelable)e.preventDefault();
  if(turn)turnPages(turn,turn<0);
 },{passive:false});
 target.addEventListener('touchstart',e=>{
  if(e.touches.length!==1){touch=null;return}
  const t=e.touches[0],s=getScroller(e);
  touch={id:t.identifier,x:t.clientX,y:t.clientY,time:Date.now(),scroller:s,lastX:t.clientX,lastY:t.clientY,top:atVerticalEdge(s,-1),bottom:atVerticalEdge(s,1)};
 },{passive:true});
 target.addEventListener('touchmove',e=>{
  if(!touch)return;if(e.touches.length!==1){touch=null;return}
  const t=e.touches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;
  if(Math.hypot(dx,dy)>12)tapSuppressedUntil=Date.now()+500;
  if(target===$('epubInput')){if(Math.abs(dy)>=Math.abs(dx))touch.scroller.scrollTop+=touch.lastY-t.clientY;else if(zoom>1.05)$('viewport').scrollLeft+=touch.lastX-t.clientX;touch.lastX=t.clientX;touch.lastY=t.clientY;if(e.cancelable)e.preventDefault();}
  if(zoom<=1.05&&Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.4&&e.cancelable)e.preventDefault();
 },{passive:false});
 target.addEventListener('touchcancel',()=>{touch=null},{passive:true});
 target.addEventListener('touchend',e=>{
  const start=touch;touch=null;if(!start)return;
  const t=[...e.changedTouches].find(t=>t.identifier===start.id);if(!t)return;
  const dx=t.clientX-start.x,dy=t.clientY-start.y;
  const step=zoom<=1.05?swipePageStep(dx,dy,Date.now()-start.time,readingDirection):0;
  if(step){turnPages(step);return}
  // Vertical movement follows page numbers, regardless of the book layout.
  if(Math.abs(dy)>70&&Math.abs(dy)>Math.abs(dx)*1.4){const vertical=dy<0?1:-1;if((vertical>0&&start.bottom)||(vertical<0&&start.top))turnPages(vertical,vertical<0)}
 },{passive:true});
}
function bindPageTap(target,frame=null){
 let press=null;
 const scroller=()=>frame?frame.contentDocument.scrollingElement:$('viewport');
 target.addEventListener('mousedown',e=>{
  if(e.button!==0){press=null;return}
  if(e.target.closest?.('button,input,select,textarea,a[href],summary,[contenteditable="true"]'))return;
  const s=scroller();press={id:e.pointerId,x:e.clientX,y:e.clientY,time:Date.now(),top:s.scrollTop,left:s.scrollLeft,moved:false};
 },{passive:true});
 target.addEventListener('mousemove',e=>{if(press&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>12)press.moved=true},{passive:true});
 target.addEventListener('pointercancel',()=>{press=null},{passive:true});
 target.addEventListener('click',e=>{
  const start=press;press=null;if(!start||start.moved||Date.now()-start.time>700||Date.now()<tapSuppressedUntil)return;
  const s=scroller();if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>12||Math.abs(s.scrollTop-start.top)>3||Math.abs(s.scrollLeft-start.left)>3)return;
  const selection=frame?frame.contentWindow.getSelection():window.getSelection();if(selection&&!selection.isCollapsed)return;
  const view=$('viewport').getBoundingClientRect();
  const x=e.clientX+(frame?frame.getBoundingClientRect().left:0);
  const step=tapPageStep(x,view.left,view.width,readingDirection);
  if(step&&turnPages(step))tapSuppressedUntil=Date.now()+250;
 },{passive:true});
}
bindPageTap($('viewport'));bindPageTap($('epubInput'));bindPageScroll($('epubInput'),epubScroller);
bindPageScroll($('viewport'),()=>$('viewport'));
$('file').onchange=e=>open(e.target.files[0]);$('toggle').onclick=()=>{hidden=!hidden;paint()};
$('peek').onpointerdown=e=>{e.preventDefault();$('peek').setPointerCapture(e.pointerId);peeking=true;paint()};for(const event of ['pointerup','pointercancel','lostpointercapture'])$('peek').addEventListener(event,()=>{peeking=false;paint()});$('peek').onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();peeking=true;paint()}};$('peek').onkeyup=()=>{peeking=false;paint()};window.onblur=()=>{peeking=false;paint()};
$('sensitivity').oninput=()=>{prefs('sensitivity:'+sheetColor,$('sensitivity').value);paint()};function go(n,bottom=false){if(busy)return;const target=Math.min(total,Math.max(1,n||1));if(target===page)return;arrivalBottom=bottom;page=target;scrollLock=Date.now()+1200;scrollSum=0;render()}$('prev').onclick=()=>go(page-viewCount);$('next').onclick=()=>go(page+viewCount);$('number').onchange=e=>go(Number(e.target.value));$('plus').onclick=()=>{zoom=Math.min(3,zoom+.25);size()};$('minus').onclick=()=>{zoom=Math.max(.5,zoom-.25);size()};$('fit').onclick=()=>{zoom=1;size()};window.onresize=size;$('viewMode').onchange=()=>{if(busy){$('viewMode').value=String(viewCount);return}viewCount=Number($('viewMode').value);prefs('viewCount',viewCount);render()};$('readingDirection').onchange=()=>{if(busy){$('readingDirection').value=readingDirection;return}readingDirection=$('readingDirection').value;prefs('readingDirection',readingDirection);if(pdf)render();else applyDirection()};$('demo').onclick=async()=>{if(busy)return;if(pdf)await pdf.destroy();if(epubSecond){epubSecond.destroy();epubSecond=null;}if(epub)epub.destroy();epub=null;pdf=img=null;fileKey='';page=total=1;$('filename').textContent='체험용 학습지';render()};window.addEventListener('keydown',e=>{if(e.target.closest?.('#quickTranslation,#storageDialog,#cacheConfirm'))return;if($('storageDialog')?.open||$('cacheConfirm')?.open||$('devLog').open||$('betaDialog')?.open||(typeof BetaTranslation!=='undefined'&&BetaTranslation.isActive()))return;if(/INPUT|BUTTON|SELECT/.test(e.target.tagName))return;if(e.key==='ArrowRight')go(page+viewCount);if(e.key==='ArrowLeft')go(page-viewCount);if(e.code==='Space'){e.preventDefault();hidden=!hidden;paint()}});render();
initializeReleaseLog();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});

/* In-memory vocabulary documents use the existing sandboxed EPUB reader.
   No book files or generated documents are sent to a server. */
(function(root){
 'use strict';
 const t=(s,v)=>root.I18n?.t(s,v)??s,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fields=['word','meaning','example','exampleMeaning'];
 const signature=r=>JSON.stringify([r.word,r.reading,r.meaning,r.example||'',r.exampleMeaning||'']);
 function options(value={}){return {format:value.format==='single'?'single':'table',order:value.order==='word'?'word':'saved',pageSize:[2,4,6].includes(+value.pageSize)?+value.pageSize:4}}
 function model(notebook,entries,preferences={}){
  const config=options(preferences),rows=entries.filter(VocabularyStore.valid).map(r=>({...r,example:r.example||'',exampleMeaning:r.exampleMeaning||''}));
  rows.sort((a,b)=>config.order==='word'?a.word.localeCompare(b.word)||a.id.localeCompare(b.id):(a.createdAt||0)-(b.createdAt||0)||a.id.localeCompare(b.id));
  const groups=[];let group=[],count=0;for(const row of rows){const length=signature(row).length;if(group.length&&(group.length>=(config.format==='single'?1:config.pageSize)||count+length>24000)){groups.push(group);group=[];count=0}group.push(row);count+=length}if(group.length||!groups.length)groups.push(group);
  const keys=groups.map(g=>'vocabpage:'+config.format+':'+g.map(r=>encodeURIComponent(r.id)).join('|'));
  return {notebook:structuredClone(notebook),config,rows,groups,keys,entryMap:new Map(rows.map(r=>[r.id,r])),entryPage:id=>groups.findIndex(g=>g.some(r=>r.id===id))+1};
 }
 function content(data,n){
  const wrap=(r,field,color='')=>`<span data-vocab-field="${field}"${color?` class="${color}"`:''}>${esc(r[field])}</span>`;
  const word=r=>r.sourceLang==='ja'&&r.reading?`<ruby>${wrap(r,'word')}<rt class="green">${esc(r.reading)}</rt></ruby>`:wrap(r,'word');
  const example=r=>(r.example||r.exampleMeaning)?`<div class="example">${r.example?`<div>${wrap(r,'example')}</div>`:''}${r.exampleMeaning?`<div>${wrap(r,'exampleMeaning','red')}</div>`:''}</div>`:'';
  const rows=data.groups[n-1]||[],single=data.config.format==='single';
  const body=single?rows.map(r=>`<article class="single" data-vocab-entry="${esc(r.id)}"><div class="word">${word(r)}</div><div class="red meaning">${wrap(r,'meaning')}</div>${example(r)}</article>`).join(''):
   `<table><thead><tr><th>${esc(t('단어/표현'))}</th><th>${esc(t('뜻'))}</th><th>${esc(t('예문 / 해석'))}</th></tr></thead><tbody>`+rows.map(r=>`<tr data-vocab-entry="${esc(r.id)}"><td class="word">${word(r)}</td><td class="red meaning">${wrap(r,'meaning')}</td><td class="examples">${example(r)}</td></tr>`).join('')+'</tbody></table>';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0!important;font:17px/1.8 system-ui,sans-serif!important;background:#fffdf8;color:#30352e}*{box-sizing:border-box}main{max-width:1000px;margin:auto;padding:25px 28px 50px}header{display:flex;justify-content:space-between;gap:16px;border-bottom:2px solid #d8dcd1;padding-bottom:17px}h1{font-size:23px;margin:0}small,footer{color:#70776a;font-size:12px}table{width:100%;table-layout:fixed;border-collapse:collapse}th{font-size:13px;font-weight:500;color:#70776a;text-align:left;padding:13px 8px}th:first-child{width:28%}th:nth-child(2){width:24%}th:nth-child(3){width:48%}td{padding:22px 8px;border-top:1px solid #d8dcd1;vertical-align:middle;overflow-wrap:anywhere}.word{font-size:23px}ruby{ruby-position:over;ruby-align:center}rt{font-size:12px}.red{color:#c93631}.green{color:#257342}.example{display:grid;gap:7px;font-size:16px}.example span,.meaning span{white-space:pre-wrap}.single{padding:38px 0;display:grid;gap:25px;text-align:center}.single .word{font-size:43px}.single .meaning{font-size:25px}.single .example{text-align:left;border-top:1px solid #d8dcd1;padding-top:22px;margin-top:12px}footer{display:flex;justify-content:space-between;gap:12px;margin-top:25px}
  @media(max-width:600px){main{padding:20px 16px 45px}table,thead,tbody{display:block}tr{display:grid;grid-template-columns:1fr 1fr}th:first-child,th:nth-child(2){width:auto}th:nth-child(3){display:none}td{padding:22px 4px;font-size:17px}.word{font-size:23px}td.examples{grid-column:1/-1;padding-top:0;border-top:0}td.examples:empty{display:none}.examples .example:before{content:'${esc(t('예문'))}';font-size:12px;color:#70776a}.single .word{font-size:38px}.single rt{font-size:14px}}
  </style></head><body><main><header><div><h1>${esc(data.notebook.icon)} ${esc(data.notebook.name)}</h1><small>${data.rows.length} ${esc(t('개'))}</small></div><small>${n} / ${data.groups.length}</small></header>${body}<footer><span>AKA Sheet</span><span>${esc(data.notebook.name)}</span></footer></main></body></html>`;
 }
 class VocabularyBook extends LocalEpub{
  constructor(data){const chapters=data.groups.map((_,i)=>'vocabulary/'+i+'.html');super({file:path=>({async:async()=>content(data,chapters.indexOf(path)+1)})},chapters,{});this.vocabulary=true;this.model=data;this.number=1;this.frame.title=t('단어장 학습 본문')}
  copy(){return new VocabularyBook(this.model)}
  pageKey(n){return this.model.keys[n-1]}
  async show(n){this.number=n;const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([this.model.config,this.model.groups[n-1].map(signature)])));this.layoutFingerprint=Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');await super.show(n)}
 }
 root.VocabularyBookData={model,content,options,signature};root.VocabularyBook=VocabularyBook;
 const E=id=>document.getElementById(id);let held=null,opening=false,refreshing=false,pending=false,timer=0;
 const current=()=>typeof epub!=='undefined'&&epub?.vocabulary?epub:null;
 const positionKey=id=>'vocabulary-position:'+id;
 function positionValue(value){try{const v=JSON.parse(value);return typeof v.entry==='string'&&v.entry.length<=100?{entry:v.entry,...options(v)}:null}catch{return null}}
 function busyEditor(){return busy||root.Notes?.isEditing()||root.Highlights?.isActive()||root.ReaderSelection?.isPreparing()||root.ReaderSelection?.isSelect()||root.BetaTranslation?.isActive()}
 function controls(){const b=current();E('vocabReaderBar').hidden=!b;E('vocabReaderOptions').hidden=!b;if(!b)return;E('vocabReaderName').textContent=b.model.notebook.icon+' '+b.model.notebook.name;for(const [id,key]of [['vocabBookFormat','format'],['vocabBookOrder','order'],['vocabBookPageSize','pageSize']])E(id).value=String(b.model.config[key]);E('vocabBookPageSize').disabled=b.model.config.format==='single';E('vocabReaderRefresh').hidden=!pending}
 function persist(){const b=current();if(!b)return;const entry=b.model.groups[page-1]?.[0]?.id;if(entry)prefs(positionKey(b.model.notebook.id),JSON.stringify({entry,...b.model.config}));controls()}
 async function open(id){
  if(opening||busyEditor()){SettingsUI.toast(t('현재 작업을 저장하거나 취소한 뒤 단어장을 여세요.'));return false}opening=true;
  try{const notebook=(await VocabularyStore.books()).find(b=>b.id===id),rows=await VocabularyStore.entries(id);if(!notebook||!rows.length)throw Error(t('책으로 열 단어가 없습니다.'));if(root.DrawingMode&&await DrawingMode.close()===false)return false;
   const saved=positionValue(prefs(positionKey(id))),data=model(notebook,rows,saved||{}),next=new VocabularyBook(data);
   if(!held)held={epub,epubSecond,pdf,img,imageBook,fileKey,page,total,zoom,title:E('filename').textContent};else{epub?.destroy();epubSecond?.destroy()}
   if(held.epub)held.epub.frame.hidden=true;if(held.epubSecond)held.epubSecond.frame.hidden=true;
   ReaderSelection.documentChanged();epub=next;epubSecond=null;pdf=img=imageBook=null;fileKey='vocabulary-v1:'+id;total=data.groups.length;page=Math.max(1,data.entryPage(saved?.entry)||Number(prefs('page:'+fileKey))||1);page=Math.min(total,page);zoom=1;pending=false;
   E('vocabManager').close();await Highlights.load(fileKey);E('filename').textContent=notebook.name;applySheetDefaults(false);controls();await render();return true;
  }catch(e){SettingsUI.toast(t('단어장을 열지 못했습니다: ')+(root.I18n?.error(e.message)||e.message));return false}finally{opening=false}
 }
 async function refresh(config=null,remote=false){
  const b=current();if(!b||refreshing)return false;if(busyEditor()||root.DrawingMode?.active()){pending=true;controls();return false}refreshing=true;
  try{if(root.DrawingMode&&await DrawingMode.flush()===false)return false;const id=b.model.notebook.id,notebook=(await VocabularyStore.books()).find(x=>x.id===id);if(!notebook){await back();SettingsUI.toast(t('열린 단어장이 삭제되어 이전 책으로 돌아갔습니다.'));return false}
   const rows=await VocabularyStore.entries(id);if(!rows.length){await back();return false}const saved=remote?positionValue(prefs(positionKey(id))):null,entry=saved?.entry||b.model.groups[page-1]?.[0]?.id,data=model(notebook,rows,config||saved||b.model.config),next=new VocabularyBook(data);
   ReaderSelection.documentChanged();epubSecond?.destroy();b.destroy();epub=next;epubSecond=null;total=data.groups.length;page=Math.max(1,data.entryPage(entry)||Math.min(page,total));E('filename').textContent=notebook.name;pending=false;controls();await render();return true;
  }catch(e){pending=true;controls();SettingsUI.toast(root.I18n?.error(e.message)||e.message);return false}finally{refreshing=false}
 }
 async function back(){if(busyEditor()){SettingsUI.toast(t('현재 작업을 저장하거나 취소한 뒤 책으로 돌아가세요.'));return false}if(root.DrawingMode&&await DrawingMode.close()===false)return false;persist();ReaderSelection.documentChanged();current()?.destroy();epubSecond?.destroy();const old=held;held=null;if(!old)return false;({epub,epubSecond,pdf,img,imageBook,fileKey,page,total,zoom}=old);if(epub)epub.frame.hidden=false;if(epubSecond)epubSecond.frame.hidden=false;canvas.hidden=!!epub;pending=false;E('vocabReaderBar').hidden=true;E('vocabReaderOptions').hidden=true;await Highlights.load(fileKey||'demo:v1');E('filename').textContent=epub?.vocabulary?epub.model.notebook.name:old.title||t('체험용 학습지');await render();return true}
 async function discardHeld(){if(!current())return;persist();const old=held;held=null;E('vocabReaderBar').hidden=true;E('vocabReaderOptions').hidden=true;pending=false;if(old){for(const b of [old.epub,old.epubSecond])b?.destroy();if(old.pdf)await old.pdf.destroy().catch(()=>{});old.imageBook?.dispose()}}
 function changed(){if(!current())return;pending=true;controls();clearTimeout(timer);timer=setTimeout(()=>refresh(),350)}
 function character(v,node,offset){if(!v.book?.vocabulary)return null;const entry=node.closest('[data-vocab-entry]')?.dataset.vocabEntry,field=node.closest('[data-vocab-field]')?.dataset.vocabField,r=v.book.model.entryMap.get(entry);return r&&fields.includes(field)?{entry,field,offset,signature:r[field]||''}:null}
 function surfaceFor(anchor){if(!anchor.vocabulary)return null;return Highlights.available().find(s=>s.v?.book?.vocabulary&&s.v.book.model.groups[s.v.book.number-1].some(r=>r.id===anchor.vocabulary.entry))||null}
 function anchor(s,area,characters){
  if(characters){const groups=new Map();s.v.records.forEach((r,i)=>{const meta=r.vocabulary;if(!meta||!characters.some(b=>TextGeometry.included(ReaderSelection.box(s.v,r),b)))return;const key=JSON.stringify([meta.entry,meta.field]);if(!groups.has(key))groups.set(key,{kind:'epub-text',page:s.page,indices:[],vocabulary:{entry:meta.entry,field:meta.field,signature:meta.signature,offsets:[]}});const a=groups.get(key);a.indices.push(i);a.vocabulary.offsets.push(meta.offset)});return [...groups.values()]}
  const d=s.v.book.frame.contentDocument,x=(area.left+area.right)/2-s.box.left,y=(area.top+area.bottom)/2-s.box.top,node=d.elementFromPoint(x,y)?.closest('[data-vocab-entry]');if(!node)return [];const r=s.v.book.model.entryMap.get(node.dataset.vocabEntry),b=node.getBoundingClientRect();if(!r||!b.width||!b.height)return [];
  return [{kind:'epub-region',page:s.page,path:[],indices:[],ratio:b.width/b.height,rect:{x:(area.left-s.box.left-b.left)/b.width,y:(area.top-s.box.top-b.top)/b.height,w:(area.right-area.left)/b.width,h:(area.bottom-area.top)/b.height},vocabulary:{entry:r.id,field:'row',signature:signature(r)}}];
 }
 function locate(a,s){const meta=a.vocabulary,r=s?.v?.book?.model.entryMap.get(meta.entry);if(!r)return [];if(meta.field==='row'){if(signature(r)!==meta.signature)return [];const node=[...s.v.book.frame.contentDocument.querySelectorAll('[data-vocab-entry]')].find(n=>n.dataset.vocabEntry===meta.entry);if(!node)return [];const b=node.getBoundingClientRect();if(!b.width||!b.height||Math.abs((b.width/b.height)/a.ratio-1)>.08)return [];const box=HighlightStore.project(a.rect,b);return [{left:box.left+s.box.left,top:box.top+s.box.top,right:box.right+s.box.left,bottom:box.bottom+s.box.top}]}
  if((r[meta.field]||'')!==meta.signature)return [];const offsets=new Set(meta.offsets||[]);return s.v.records.filter(v=>v.vocabulary?.entry===meta.entry&&v.vocabulary.field===meta.field&&offsets.has(v.vocabulary.offset)).map(v=>ReaderSelection.box(s.v,v));
 }
 function blocks(a,r){return a.vocabulary&&r.vocabulary&&a.vocabulary.entry===r.vocabulary.entry&&a.vocabulary.field===r.vocabulary.field&&a.vocabulary.signature===r.vocabulary.signature&&a.vocabulary.offsets?.includes(r.vocabulary.offset)}
 function pageNumber(anchor){const b=current();if(!b)return null;return anchor.vocabulary?b.model.entryPage(anchor.vocabulary.entry):b.model.keys.indexOf(anchor.page)+1}
 root.VocabularyReader={open,back,refresh,changed,current,controls,persist,discardHeld,character,anchor,locate,surfaceFor,blocks,pageNumber,positionValue};
 E('openBookVocabulary').onclick=()=>{E('bookOpenMenu').hidden=true;E('openBook').setAttribute('aria-expanded','false');VocabularyUI.open()};
 E('vocabReaderBack').onclick=back;E('vocabReaderManage').onclick=()=>VocabularyUI.open(current()?.model.notebook.id);E('vocabReaderRefresh').onclick=()=>refresh();
 for(const id of ['vocabBookFormat','vocabBookOrder','vocabBookPageSize'])E(id).onchange=async()=>{const b=current();if(!b)return;const config={format:E('vocabBookFormat').value,order:E('vocabBookOrder').value,pageSize:+E('vocabBookPageSize').value};if(!await refresh(config))controls()};
 window.addEventListener('storage',e=>{if(e.key==='aka.vocabulary.changed')changed()});
})(globalThis);

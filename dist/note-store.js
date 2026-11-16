var L_note_store_js=globalThis.I18n||{t:(s,v)=>v?s.replace(/\{(\w+)\}/g,(m,k)=>v[k]??m):s,error:s=>s,locale:undefined};
/* User notes are local data, independent of replaceable app/model caches. */
(function(root){
 const colors=['black','red','green','blue'],fonts=['default','serif','hand'],backgrounds=['transparent','white','yellow','red','green','blue'];
 function valid(r){return !!(r&&typeof r.id==='string'&&typeof r.book==='string'&&colors.includes(r.color)&&fonts.includes(r.font)&&backgrounds.includes(r.background)&&Number.isFinite(r.width)&&r.width>=.000001&&r.width<=1&&(r.height===undefined||Number.isFinite(r.height)&&r.height>=.000001&&r.height<=2)&&[r.dx,r.dy].every(n=>n===undefined||Number.isFinite(n)&&Math.abs(n)<=100)&&HighlightStore.valid({...r,color:'red'})&&(r.type==='drawing'?NoteDrawing.valid(r.strokes)&&r.strokes.length>0:(!r.type||r.type==='text')&&typeof r.text==='string'&&r.text.trim()&&r.text.length<=12000))}

 let pending;function db(){if(!pending)pending=new Promise((resolve,reject)=>{const q=indexedDB.open('aka-notes',1);q.onupgradeneeded=()=>q.result.createObjectStore('notes',{keyPath:'id'}).createIndex('book','book');q.onsuccess=()=>{q.result.onversionchange=()=>{q.result.close();pending=null};resolve(q.result)};q.onerror=()=>{pending=null;reject(q.error)};q.onblocked=()=>{pending=null;reject(Error(L_note_store_js.t("다른 앱 창을 닫고 다시 시도하세요.")))}});return pending}
 async function tx(mode,run){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('notes',mode);let result;run(t.objectStore('notes'),v=>result=v);t.oncomplete=()=>resolve(result);t.onerror=t.onabort=()=>reject(t.error||Error(L_note_store_js.t("메모를 저장하지 못했습니다.")))})}
 const list=book=>tx('readonly',(s,set)=>{const q=s.index('book').getAll(book);q.onsuccess=()=>set(q.result)});
 async function put(r){if(!valid(r))throw Error(L_note_store_js.t("메모 정보가 올바르지 않습니다."));await tx('readwrite',s=>s.put(r));return r}
 const remove=id=>tx('readwrite',s=>s.delete(id));
 root.NoteStore={valid,list,put,remove,colors,fonts,backgrounds};
})(globalThis);

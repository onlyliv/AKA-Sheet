/* Replaceable, offline dictionary packs; separate from books, notes and model caches. */
(function(root){
 const key=s=>String(s).normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');let pending;
 function db(){if(!pending)pending=new Promise((resolve,reject)=>{const r=indexedDB.open('aka-dictionaries',1);r.onupgradeneeded=()=>{const d=r.result,s=d.createObjectStore('entries',{keyPath:'id'});s.createIndex('lookup','keys',{multiEntry:true});s.createIndex('pack','pack');d.createObjectStore('packs',{keyPath:'id'})};r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();pending=null};resolve(r.result)};r.onerror=()=>{pending=null;reject(r.error)};r.onblocked=()=>{pending=null;reject(Error('다른 앱 창을 닫고 다시 시도하세요.'))}});return pending}
 async function transaction(stores,mode,run){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction(stores,mode);let result;run(t,v=>result=v);t.oncomplete=()=>resolve(result);t.onabort=t.onerror=()=>reject(t.error||Error('사전 저장 공간을 확인하세요.'))})}
 const status=id=>transaction(['packs'],'readonly',(t,set)=>{const r=t.objectStore('packs').get(id);r.onsuccess=()=>set(r.result||null)});
 const list=()=>transaction(['packs'],'readonly',(t,set)=>{const r=t.objectStore('packs').getAll();r.onsuccess=()=>set(r.result)});
 const batch=rows=>transaction(['entries'],'readwrite',t=>{for(const r of rows)t.objectStore('entries').put(r)});
 const commit=m=>transaction(['packs'],'readwrite',t=>t.objectStore('packs').put(m));
 const lookup=(revision,word)=>transaction(['entries'],'readonly',(t,set)=>{const r=t.objectStore('entries').index('lookup').getAll(revision+'\t'+key(word),100);r.onsuccess=()=>set(r.result)});
 const purge=revision=>transaction(['entries'],'readwrite',t=>{const s=t.objectStore('entries'),r=s.index('pack').openCursor(IDBKeyRange.only(revision));r.onsuccess=()=>{const c=r.result;if(c){c.delete();c.continue()}}});
 async function remove(id){const m=await status(id);await transaction(['packs'],'readwrite',t=>t.objectStore('packs').delete(id));if(m)await purge(m.revision)}
 function valid(r){return r&&typeof r.w==='string'&&r.w.length>0&&r.w.length<=500&&Array.isArray(r.k)&&r.k.length<=64&&r.k.every(k=>typeof k==='string'&&k.length<=500)&&Array.isArray(r.s)&&r.s.length>0&&r.s.every(s=>typeof s==='string'&&s.length<=200000)&&typeof r.p==='string'&&Array.isArray(r.r)&&r.r.every(s=>typeof s==='string')}
 root.DictionaryStore={key,status,list,batch,commit,lookup,purge,remove,valid};
})(globalThis);

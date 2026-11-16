var L_sync_apply_js=globalThis.I18n||{t:(s,v)=>v?s.replace(/\{(\w+)\}/g,(m,k)=>v[k]??m):s,error:s=>s,locale:undefined};
/* Cross-database apply with durable recovery snapshot; caller holds user-data lock. */
(function(root){
 'use strict';
 const C=root.UserDataCore;
 const groups=p=>[['aka-highlights',{marks:p.marks}],['aka-notes',{notes:p.notes}],['aka-vocabulary',{books:p.notebooks,entries:p.entries}],['akai-image-library',{books:p.imageBooks}]];
 async function write(p){C.validate(p);for(const [name,stores]of groups(p)){const d=await new Promise((resolve,reject)=>{const q=indexedDB.open(name,1);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});try{await new Promise((resolve,reject)=>{const t=d.transaction(Object.keys(stores),'readwrite');for(const [store,rows]of Object.entries(stores)){const s=t.objectStore(store);s.clear();for(const r of rows)s.put(r)}t.oncomplete=resolve;t.onerror=t.onabort=()=>reject(t.error||Error(L_sync_apply_js.t("동기화 적용 실패")))})}finally{d.close()}}
  const current=await C.snapshot();for(const k of Object.keys(current.preferences))if(!Object.hasOwn(p.preferences,k))localStorage.removeItem(k);for(const [k,v]of Object.entries(p.preferences))localStorage.setItem(k,v);
 }
 async function apply(p,commit,journalKey=null){C.validate(p);const before=await C.snapshot();const journal=journalKey?await C.metaGet(journalKey):null;await C.metaPut('driveRecovery',{before,journalKey,journal,createdAt:Date.now()});try{await write(p);await commit();await C.metaPut('driveRecovery',null)}catch(error){try{await write(before);if(journalKey)await C.metaPut(journalKey,journal);await C.metaPut('driveRecovery',null)}catch{throw Error(L_sync_apply_js.t("적용이 중단됐습니다. 복구 버튼으로 적용 전 데이터를 복구하세요."))}throw error}}
 async function recover(){const record=await C.metaGet('driveRecovery');if(!record)return;await write(record.before);if(record.journalKey)await C.metaPut(record.journalKey,record.journal);await C.metaPut('driveRecovery',null)}
 root.SyncApply={apply,recover};
})(globalThis);

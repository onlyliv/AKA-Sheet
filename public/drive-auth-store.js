/* Expiring device credential only; never part of portable user data. */
(function(root){
 'use strict';let chain=Promise.resolve();
 function exclusive(fn){const p=chain.then(fn,fn);chain=p.catch(()=>{});return p}
 function db(){return new Promise((resolve,reject)=>{const q=indexedDB.open('aka-drive-auth',1);q.onupgradeneeded=()=>q.result.createObjectStore('session');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
 async function transaction(mode,fn){const d=await db();try{return await new Promise((resolve,reject)=>{const t=d.transaction('session',mode);let result;fn(t.objectStore('session'),v=>result=v);t.oncomplete=()=>resolve(result);t.onerror=t.onabort=()=>reject(t.error)})}finally{d.close()}}
 const remove=()=>transaction('readwrite',s=>s.clear());
 const aad=id=>new TextEncoder().encode(location.origin+'\n'+id);
 function save({clientId,token,subject,expires}){return exclusive(async()=>{if(!token||!subject||expires<=Date.now()||expires>Date.now()+3600000)throw Error('잘못된 인증 유효기간');const key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']),iv=crypto.getRandomValues(new Uint8Array(12)),bytes=new TextEncoder().encode(JSON.stringify({token,subject,expires})),data=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad(clientId)},key,bytes);await transaction('readwrite',s=>{s.put({clientId,key,iv,data,expires},'current')})})}
 function load(clientId){return exclusive(async()=>{const row=await transaction('readonly',(s,set)=>{const q=s.get('current');q.onsuccess=()=>set(q.result)});if(!row)return null;if(row.clientId!==clientId||row.expires<=Date.now()||row.expires>Date.now()+3600000){await remove();return null}try{const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:row.iv,additionalData:aad(clientId)},row.key,row.data),value=JSON.parse(new TextDecoder().decode(bytes));if(value.expires!==row.expires||typeof value.token!=='string'||typeof value.subject!=='string')throw Error('인증 검증 실패');return value}catch{await remove();return null}})}
 root.DriveAuthStore={save,load,clear:()=>exclusive(remove)};
})(globalThis);

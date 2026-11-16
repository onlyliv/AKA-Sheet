/* Local annotations only; independent of disposable model/application caches. */
(function(root){
 const colors=['red','green','blue'];
 function clip(a,b){const r={left:Math.max(a.left,b.left),top:Math.max(a.top,b.top),right:Math.min(a.right,b.right),bottom:Math.min(a.bottom,b.bottom)};return r.right>r.left&&r.bottom>r.top?r:null}
 function normalize(a,b){const r=clip(a,b);return r?{x:(r.left-b.left)/(b.right-b.left),y:(r.top-b.top)/(b.bottom-b.top),w:(r.right-r.left)/(b.right-b.left),h:(r.bottom-r.top)/(b.bottom-b.top)}:null}
 function project(r,b){return {left:b.left+r.x*(b.right-b.left),top:b.top+r.y*(b.bottom-b.top),right:b.left+(r.x+r.w)*(b.right-b.left),bottom:b.top+(r.y+r.h)*(b.bottom-b.top)}}
 function valid(r){return !!(r&&typeof r.id==='string'&&colors.includes(r.color)&&typeof r.book==='string'&&Array.isArray(r.anchors)&&r.anchors.length>0&&r.anchors.length<=5000&&r.anchors.every(a=>a&&typeof a.page==='string'&&['page','epub-text','epub-region'].includes(a.kind)&&(a.kind==='epub-text'?Array.isArray(a.indices)&&a.indices.length>0&&a.indices.length<=30000&&a.indices.every(i=>Number.isInteger(i)&&i>=0&&i<30000):a.rect&&['x','y','w','h'].every(k=>Number.isFinite(a.rect[k])&&Math.abs(a.rect[k])<100000)&&a.rect.w>0&&a.rect.h>0)))}
 let dbPromise;function db(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const q=indexedDB.open('aka-highlights',1);q.onupgradeneeded=()=>{q.result.createObjectStore('marks',{keyPath:'id'}).createIndex('book','book')};q.onsuccess=()=>{q.result.onversionchange=()=>{q.result.close();dbPromise=null};resolve(q.result)};q.onerror=()=>{dbPromise=null;reject(q.error)};q.onblocked=()=>{dbPromise=null;reject(Error('다른 앱 창을 닫고 다시 시도하세요.'))}});return dbPromise}
 async function transact(mode,fn){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('marks',mode);let value;fn(tx.objectStore('marks'),v=>value=v);tx.oncomplete=()=>resolve(value);tx.onerror=tx.onabort=()=>reject(tx.error||Error('하이라이트를 저장하지 못했습니다.'))})}
 const list=book=>transact('readonly',(s,set)=>{const q=s.index('book').getAll(book);q.onsuccess=()=>set(q.result)});
 async function put(r){if(!valid(r))throw Error('하이라이트 정보가 올바르지 않습니다.');await transact('readwrite',s=>s.put(r));return r}
 async function patch(id,book,values){return transact('readwrite',(s,set)=>{const q=s.get(id);q.onsuccess=()=>{const old=q.result;if(!old||old.book!==book){set(null);return}const next={...old,...values};if(!valid(next))throw Error('형광펜 정보가 올바르지 않습니다.');s.put(next);set(next)}})}
 const remove=id=>transact('readwrite',s=>s.delete(id));
 root.HighlightStore={colors,clip,normalize,project,list,put,patch,remove,valid};
})(globalThis);

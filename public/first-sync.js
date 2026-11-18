/* First connection imports local-only data without treating connection time as edit time. */
(function(root){
 'use strict';
 const C=root.UserDataCore,S=root.SyncCore,groups=['marks','notes','notebooks','entries','imageBooks','positions'];
 const clone=structuredClone,same=(a,b)=>C.canonical(a)===C.canonical(b);
 const trusted=s=>!!(s?.firstSyncAccepted||s?.v2Initialized||s?.legacyInitialized);
 const count=p=>groups.reduce((n,g)=>n+p[g].length,0);
 async function plan(remote,local){
  C.validate(local);S.check(remote);const view=await S.project(remote),cloud=S.payload(view,{marks:[],notes:[],notebooks:[],entries:[],imageBooks:[],preferences:{}}),payload=clone(cloud);payload.preferences={...local.preferences,...cloud.preferences};
  // Source metadata from an unrelated account/journal is never adopted as a cloud parent.
  const removed=new Set(remote.flatMap(o=>o.parents)),known=new Set(remote.map(o=>S.key(o.group,o.entity))),active=new Set(remote.filter(o=>!removed.has(o.id)&&o.value!==null).map(o=>S.key(o.group,o.entity)));
  const dead=(g,id)=>known.has(S.key(g,id))&&!active.has(S.key(g,id)),stats={local:count(S.portable(local)),cloud:count(view.data),added:0,conflicts:0,deleted:0,positions:0},books=new Map();
  const newId=async(g,r)=>'first-'+(await C.hash([g,r])).slice(0,48);
  const items=[],label=r=>String(r.word||r.text||r.name||r.title||'').slice(0,100);const note=(group,kind,r)=>{if(items.length<100)items.push({group,kind,label:label(r),page:/^\d+$/.test(r.anchors?.[0]?.page||'')?r.anchors[0].page:''})};
  const add=(g,r,details=true)=>{payload[g].push(r);stats.added++;if(details)note(g,'added',r)};
  for(const g of ['marks','notes','notebooks'])for(const source of local[g]){
   const r=clone(source);if(dead(g,r.id)){stats.deleted++;note(g,'deleted',r);if(g==='notebooks')books.set(r.id,null);continue}const old=payload[g].find(x=>x.id===r.id);
   if(!old){add(g,r);if(g==='notebooks')books.set(source.id,r.id);continue}
   const comparable=x=>g==='notebooks'?{name:x.name,icon:x.icon}:x;
   if(same(comparable(old),comparable(r))){if(g==='notebooks')books.set(source.id,old.id);continue}
   stats.conflicts++;note(g,'conflict',r);r.id=await newId(g,r);if(!payload[g].some(x=>x.id===r.id))add(g,r,false);if(g==='notebooks')books.set(source.id,r.id);
  }
  const dedupes=new Set(payload.entries.map(root.VocabularyStore.dedupe));
  for(const source of local.entries){const r=clone(source),notebook=books.get(r.notebook);if(notebook===null||dead('entries',r.id)){stats.deleted++;note('entries','deleted',r);continue}r.notebook=notebook||r.notebook;delete r.expectedUpdatedAt;r.dedupe=root.VocabularyStore.dedupe(r);if(dedupes.has(r.dedupe))continue;const old=payload.entries.find(x=>x.id===r.id);if(old){stats.conflicts++;note('entries','conflict',r);r.id=await newId('entries',r)}dedupes.add(r.dedupe);add('entries',r,!old)}
  // A book manifest and its reading position are one record: keep the cloud manifest on collision.
  for(const r of local.imageBooks){if(dead('imageBooks',r.id)){stats.deleted++;continue}const old=payload.imageBooks.find(x=>x.id===r.id);if(!old)add('imageBooks',clone(r));else if(!same(old,r))stats.positions++}
  for(const {id:k,value:v} of S.portable(local).positions){
   if(Object.hasOwn(cloud.preferences,k)||dead('positions',k)){if(cloud.preferences[k]!==v)stats.positions++;if(dead('positions',k))delete payload.preferences[k]} // Cloud positions always win first contact.
  }
  // Remove stale positions before capture: a deleted cloud position must not be recreated.
  C.validate(payload);const localHash=await C.hash(S.portable(local)),remoteHash=await C.hash(S.join([],remote));
  return {view,cloud,payload,stats,items,localHash,remoteHash,needsReview:stats.local>0&&remote.length>0};
 }
 root.FirstSync={plan,trusted,count};
})(globalThis);

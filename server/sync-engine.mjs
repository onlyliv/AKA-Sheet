// Generated from public/sync-core.js; use scripts/build-sync-engine.mjs.
export function createEngine(){
const canonical=v=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v);
const normalize=s=>String(s).normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
const scope={UserDataCore:{canonical,hash:async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(typeof v==='string'?v:canonical(v)))),b=>b.toString(16).padStart(2,'0')).join('')},VocabularyStore:{dedupe:r=>JSON.stringify([r.notebook,normalize(r.word),r.sourceLang,r.targetLang,normalize(r.meaning),String(r.example||'').trim(),String(r.exampleMeaning||'').trim()])}};
var L_sync_core_js=globalThis.I18n||{t:(s,v)=>v?s.replace(/\{(\w+)\}/g,(m,k)=>v[k]??m):s,error:s=>s,locale:undefined};
/* Immutable operation graph. Parents supersede only versions actually observed. */
(function(root){
 'use strict';
 const C=root.UserDataCore,groups=['marks','notes','notebooks','entries','imageBooks','positions'];
 const clone=v=>JSON.parse(JSON.stringify(v)),same=(a,b)=>C.canonical(a)===C.canonical(b);
 const isPosition=k=>/^page:(file-v1:|images-v1:|vocabulary-v1:)/.test(k)||k.startsWith('vocabulary-position:');
 const key=(group,id)=>JSON.stringify([group,id]);
 function portable(p){C.validate(p);const out={};for(const g of groups)out[g]=g==='positions'?Object.entries(p.preferences).filter(([k])=>isPosition(k)).map(([id,value])=>({id,value})):clone(p[g]);return out}
 function empty(){return Object.fromEntries(groups.map(g=>[g,[]]))}
 function state(device=crypto.randomUUID()){return {schema:1,device,ops:[],baseline:empty(),refs:{}}}
 function check(ops,partial=false){if(!Array.isArray(ops)||ops.length>100000)throw Error(L_sync_core_js.t("동기화 기록 한도를 초과했습니다."));const ids=new Map();for(const o of ops){if(!o||typeof o.id!=='string'||!/^[a-zA-Z0-9-]{1,100}$/.test(o.id)||!Number.isFinite(o.time)||!groups.includes(o.group)||typeof o.entity!=='string'||!o.entity||o.entity.length>2048||!Array.isArray(o.parents)||o.parents.length>1000||!o.parents.every(p=>typeof p==='string'&&p!==o.id)||o.value!==null&&(!o.value||o.value.id!==o.entity))throw Error(L_sync_core_js.t("잘못된 동기화 기록입니다."));if(ids.has(o.id)&&!same(ids.get(o.id),o)){const prior=ids.get(o.id),meta=v=>({id:v.id,group:v.group,entity:v.entity,parents:v.parents,time:v.time});if(!same(meta(prior),meta(o))||!((prior.pruned&&prior.value===null)||(o.pruned&&o.value===null)))throw Error(L_sync_core_js.t("동기화 기록 ID 충돌"));ids.set(o.id,prior.pruned?prior:o)}else ids.set(o.id,o)}
  for(const o of ids.values())if(o.group==='entries'&&o.value)for(const parent of o.parents){const previous=ids.get(parent)?.value;if(previous&&['example','exampleMeaning'].some(k=>previous[k]&&o.value[k]===undefined))throw Error(L_sync_core_js.t("단어장 데이터 형식이 변경되었습니다. 앱을 다시 열어 최신 버전으로 동기화하세요."))}
  const visiting=new Set(),done=new Set();function visit(o){if(done.has(o.id))return;if(visiting.has(o.id))throw Error(L_sync_core_js.t("동기화 기록 순환 오류"));visiting.add(o.id);for(const id of o.parents){const p=ids.get(id);if(!p){if(partial)continue;throw Error(L_sync_core_js.t("동기화 기록의 이전 버전이 없습니다."))}if(p.group!==o.group||p.entity!==o.entity)throw Error(L_sync_core_js.t("동기화 기록의 이전 버전이 없습니다."));visit(p)}visiting.delete(o.id);done.add(o.id)}for(const o of ids.values())visit(o);return [...ids.values()]}
 function join(a,b){return check([...a,...b],true).sort((a,b)=>a.id.localeCompare(b.id))}
 function capture(s,p){const next=clone(s),now=portable(p);for(const group of groups){const before=new Map(next.baseline[group].map(r=>[r.id,r])),after=new Map(now[group].map(r=>[r.id,r]));for(const id of new Set([...before.keys(),...after.keys()])){const a=before.get(id),b=after.get(id);if(same(a??null,b??null))continue;const k=key(group,id),prior=next.refs[k],sources=prior?.sources||[{entity:prior?.entity||id,heads:prior?.heads||[]}],updated=[];for(const source of sources){const op={id:crypto.randomUUID(),group,entity:source.entity,parents:source.heads,time:Date.now(),value:b?{...clone(b),id:source.entity}:null};next.ops.push(op);updated.push({entity:source.entity,heads:[op.id]})}next.refs[k]={...updated[0],sources:updated}}}next.baseline=now;next.ops=check(next.ops);return next}
 async function project(ops){ops=check(ops);const removed=new Set(ops.flatMap(o=>o.parents)),active=new Map(),result=empty(),refs={},conflicts=[];
  for(const o of ops)if(!removed.has(o.id)&&o.value!==null){const k=key(o.group,o.entity);if(!active.has(k))active.set(k,[]);active.get(k).push(o)}
  for(const [k,versions]of [...active].sort(([a],[b])=>a.localeCompare(b))){const variants=[];for(const o of versions.sort((a,b)=>(['positions','imageBooks'].includes(a.group)?b.time-a.time:0)||a.id.localeCompare(b.id))){let v=variants.find(v=>same(o.group==='notebooks'?{name:v.value.name,icon:v.value.icon}:v.value,o.group==='notebooks'?{name:o.value.name,icon:o.value.icon}:o.value));if(v)v.heads.push(o.id);else variants.push({value:o.value,heads:[o.id]})}const [group,entity]=JSON.parse(k);
   for(const [i,v]of variants.entries()){const r=clone(v.value);r.id=i===0?entity:'sync-'+(await C.hash(v.heads[0])).slice(0,48);if(['positions','imageBooks'].includes(group)&&i>0)continue;result[group].push(r);refs[key(group,r.id)]={entity,heads:v.heads};if(i>0)conflicts.push({group,id:r.id,original:entity})}
  }
  // A concurrently edited entry must survive deletion of its notebook.
  const books=new Set(result.notebooks.map(r=>r.id));for(const r of result.entries)if(!books.has(r.notebook)){const old=ops.filter(o=>o.group==='notebooks'&&o.entity===r.notebook&&o.value).sort((a,b)=>a.id.localeCompare(b.id)).at(-1);if(!old)throw Error(L_sync_core_js.t("단어장의 원본 기록이 없습니다."));result.notebooks.push({...clone(old.value),id:r.notebook});books.add(r.notebook);refs[key('notebooks',r.notebook)]={entity:r.notebook,heads:ops.filter(o=>o.group==='notebooks'&&o.entity===r.notebook&&!removed.has(o.id)).map(o=>o.id)};conflicts.push({group:'notebooks',id:r.notebook,original:r.notebook})}
  // Unique vocabulary index: collapse identical entries while keeping every head.
  const dedupes=new Map();result.entries=result.entries.filter(r=>{r.dedupe=root.VocabularyStore.dedupe(r);const old=dedupes.get(r.dedupe);if(!old){dedupes.set(r.dedupe,r);return true}const target=refs[key('entries',old.id)],extra=refs[key('entries',r.id)];target.sources=target.sources||[{entity:target.entity,heads:[...target.heads]}];target.sources.push(...(extra.sources||[{entity:extra.entity,heads:extra.heads}]));return false});
  return {data:result,refs,conflicts};
 }
 function payload(view,current){const p=clone(current);for(const g of groups)if(g!=='positions')p[g]=clone(view.data[g]);for(const k of Object.keys(p.preferences))if(isPosition(k))delete p.preferences[k];for(const r of view.data.positions)p.preferences[r.id]=r.value;C.validate(p);return p}
 async function encode(ops){ops=check(ops,true);return JSON.stringify({format:'aka-sheet-sync',schema:1,checksum:await C.hash(ops),ops})}
 async function decode(text){if(typeof text!=='string'||new TextEncoder().encode(text).length>25*1024*1024)throw Error(L_sync_core_js.t("동기화 파일은 25MB 이하만 지원합니다."));const v=JSON.parse(text);if(v.format!=='aka-sheet-sync'||v.schema!==1||!Array.isArray(v.ops)||v.checksum!==await C.hash(v.ops))throw Error(L_sync_core_js.t("동기화 파일 검증 실패"));return v.ops}
 function compact(ops,partial=false){ops=check(ops,partial);const old=new Set(ops.flatMap(o=>o.parents));return ops.map(o=>old.has(o.id)&&o.group!=='notebooks'&&o.value!==null?{...o,value:null,pruned:true}:o)}
 root.SyncCore={compact,state,portable,capture,join,project,payload,encode,decode,check,key};
})(scope);

return scope.SyncCore;
}

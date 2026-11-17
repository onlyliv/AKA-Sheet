import {readFile,writeFile} from 'node:fs/promises';
const source=await readFile('public/sync-core.js','utf8');
await writeFile('server/sync-engine.mjs',`// Generated from public/sync-core.js; use scripts/build-sync-engine.mjs.
export function createEngine(){
const canonical=v=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v);
const normalize=s=>String(s).normalize('NFKC').trim().toLowerCase().replace(/\\s+/g,' ');
const scope={UserDataCore:{canonical,hash:async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(typeof v==='string'?v:canonical(v)))),b=>b.toString(16).padStart(2,'0')).join('')},VocabularyStore:{dedupe:r=>JSON.stringify([r.notebook,normalize(r.word),r.sourceLang,r.targetLang,normalize(r.meaning),String(r.example||'').trim(),String(r.exampleMeaning||'').trim()])}};
${source.replace('})(globalThis);','})(scope);')}
return scope.SyncCore;
}
`);

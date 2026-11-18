await import('./build-i18n.mjs');
import {cp,mkdir,readdir,rm,writeFile,readFile} from 'node:fs/promises';
await rm('dist/client',{recursive:true,force:true});
await mkdir('dist/client',{recursive:true});
for(const entry of await readdir('public',{withFileTypes:true}))if(!['client','server','.openai'].includes(entry.name))await cp('public/'+entry.name,'dist/client/'+entry.name,{recursive:true,filter:source=>!(source.includes('/kiwi-024/')&&/\.gz\.\d+$/.test(source))});
await mkdir('dist/server',{recursive:true});
const engine=(await readFile('server/sync-engine.mjs','utf8')).replace('export function createEngine','function createEngine'),service=(await readFile('server/sync-service.mjs','utf8')).replace('export function createSyncService','function createSyncService'),worker=(await readFile('server/worker.mjs','utf8')).replace(/^import .*;\n/gm,'');await writeFile('dist/server/index.js',engine+'\n'+service+'\n'+worker);
await writeFile('dist/server/wrangler.json',JSON.stringify({name:'aka-drive-beta',main:'index.js',compatibility_date:'2026-11-01',assets:{directory:'../client',binding:'ASSETS',run_worker_first:['/api/*']},d1_databases:[{binding:'DB',database_name:'site-creator-d1',database_id:'00000000-0000-4000-8000-000000000000'}]}));

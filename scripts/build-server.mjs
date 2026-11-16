import {cp,mkdir,readdir,rm,writeFile} from 'node:fs/promises';
await rm('dist/client',{recursive:true,force:true});
await mkdir('dist/client',{recursive:true});
for(const entry of await readdir('public',{withFileTypes:true}))if(!['client','server','.openai'].includes(entry.name))await cp('public/'+entry.name,'dist/client/'+entry.name,{recursive:true});
await mkdir('dist/server',{recursive:true});
await cp('server/worker.mjs','dist/server/index.js');
await writeFile('dist/server/wrangler.json',JSON.stringify({name:'aka-drive-beta',main:'index.js',compatibility_date:'2026-11-01',assets:{directory:'../client',binding:'ASSETS',run_worker_first:['/api/*']},d1_databases:[{binding:'DB',database_name:'site-creator-d1',database_id:'00000000-0000-4000-8000-000000000000'}]}));

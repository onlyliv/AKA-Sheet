import {readFile,writeFile} from 'node:fs/promises';
const directory=process.argv[2]||'public';
const messages=JSON.parse(await readFile(directory+'/locales/messages.json','utf8'));
const placeholders=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort().join(',');
for(const [source,row]of Object.entries(messages))for(const language of ['en','ja']){
 if(typeof row[language]!=='string'||!row[language].trim())throw Error('Missing '+language+' translation: '+source);
 if(placeholders(source)!==placeholders(row[language]))throw Error('Mismatched placeholders: '+source+' / '+language);
}
await writeFile(directory+'/locales/catalog.js','/* Generated from messages.json by scripts/build-i18n.mjs. */\nglobalThis.AKA_UI_MESSAGES='+JSON.stringify(messages)+';\n');
console.log(Object.keys(messages).length+' UI messages validated for Korean, English and Japanese.');

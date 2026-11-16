import pathlib,json,gzip,hashlib
base=pathlib.Path(__file__).resolve().parents[1];out=base/'public/dictionaries'
for mfile in out.glob('*.meta.json'):
 m=json.loads(mfile.read_text());source=base/'public'/m['file']
 if not m.get('files') and m['bytes']>20*1048576:
  files=[];f=None
  try:
   for n,line in enumerate(gzip.open(source,'rb')):
    if n%100000==0:
     if f:f.close()
     path=out/f"{m['id']}-{len(files)+1:02}.jsonl.gz";files.append(path);f=gzip.open(path,'wb',compresslevel=6)
    f.write(line)
  finally:
   if f:f.close()
  m['files']=[{'file':'dictionaries/'+p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
  m['bytes']=sum(p['bytes'] for p in m['files']);m['sha256']=hashlib.sha256(''.join(p['sha256'] for p in m['files']).encode()).hexdigest();m['file']=m['files'][0]['file'];source.unlink()
 textBytes=0
 for part in m.get('files',[m]):
  with gzip.open(base/'public'/part['file'],'rb') as f:
   while chunk:=f.read(1048576):textBytes+=len(chunk)
 m['textBytes']=textBytes;mfile.write_text(json.dumps(m,ensure_ascii=False,indent=2))
packs=[json.loads(p.read_text()) for p in out.glob('*.meta.json')]
packs.sort(key=lambda p:(p['source'],p['target'],0 if 'jmdict' in p['id'] else 1))
(out/'catalog.json').write_text(json.dumps(packs,ensure_ascii=False,indent=2))
(base/'public/dictionary-catalog.js').write_text('globalThis.DictionaryCatalog='+json.dumps(packs,ensure_ascii=False,separators=(',',':'))+';\n')
text='''AKA Sheet offline dictionary packs — 2026-11-04\n\nWiktionary text: copyright Wiktionary contributors. Extracted by Kaikki.org / Wiktextract.\nDistributed and adapted under CC BY-SA 4.0 International. Full legal code: LICENSE.txt.\nThe derived JSONL packs are also CC BY-SA 4.0. Changes: select language/fields, flatten glosses, add lookup keys, gzip compression. No audio, illustrations or quoted usage examples are included.\nEach result links to the original word page, with its contributor history. Entries may have errors, omissions or incomplete readings. These are pinned snapshots from Kaikki's postprocessed language downloads (deprecated by upstream); regeneration may require migrating the builder to raw Wiktextract editions.\n\nJMdict Japanese/English text (when installed): copyright James William BREEN and the Electronic Dictionary Research and Development Group. CC BY-SA 4.0. Usage: https://www.edrdg.org/edrdg/licence.html\nChanges: convert XML to compact JSONL, index readings, retain sense restrictions as display text.\nEDRDG requires source acknowledgement and a regular update procedure. Run build-jmdict.py and finalize-dictionaries.py to refresh the published pack, including its version/hash. Review at least monthly.\n\nRebuild: scripts/build-dictionaries.py; scripts/build-jmdict.py; scripts/finalize-dictionaries.py\nNo dictionary is fetched automatically by the app. Installed packs remain available offline, independent of OCR/translation engine caches and user annotations.\n\nSources:\n'''
for p in packs:text+=f"\n{p['id']}\nOriginal: {p['page']}\nData: {p['upstream']}\nRetrieved: {p['version']}\n"
(out/'SOURCES.txt').write_text(text)
print(len(packs),'packs',sum(p['bytes'] for p in packs),'compressed bytes')

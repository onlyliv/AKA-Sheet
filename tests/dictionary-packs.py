import json,gzip,hashlib,pathlib
root=pathlib.Path(__file__).resolve().parents[1]/'dist';packs=json.loads((root/'dictionaries/catalog.json').read_text());pairs=set();terms={}
for p in packs:
 count=0;textBytes=0
 for part in p.get('files',[p]):
  path=root/part['file'];assert path.stat().st_size==part['bytes'];assert part['bytes']<25*1048576;assert hashlib.sha256(path.read_bytes()).hexdigest()==part['sha256']
  for line in gzip.open(path,'rb'):
   textBytes+=len(line);r=json.loads(line);count+=1
   assert isinstance(r['w'],str) and 0<len(r['w'])<=500,(p['id'],r)
   assert r['k'] and len(r['k'])<=64 and all(isinstance(x,str) and len(x)<=500 for x in r['k']),(p['id'],r)
   assert r['s'] and all(isinstance(x,str) and len(x)<=200000 for x in r['s']),(p['id'],r)
   assert isinstance(r['p'],str) and all(isinstance(x,str) for x in r['r']),(p['id'],r)
   if 'りんご' in r['k'] or 'apple' in r['k'] or '사과' in r['k']:terms.setdefault(p['id'],[]).append(r['w'])
 assert count==p['entries'],(p['id'],count,p['entries']);assert textBytes==p['textBytes'];pairs.add((p['source'],p['target']))
assert len(pairs)==9;assert len(packs)==10;assert 'ja-ko-wiktionary' in terms and 'ja-en-jmdict' in terms
print('10개 실제 사전팩 무결성/전체 항목 검증·9방향·파일 크기 상한·사과 표제어 검사 통과')

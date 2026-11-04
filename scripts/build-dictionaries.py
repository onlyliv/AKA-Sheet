"""Build versioned, redistributable offline text packs from Kaikki Wiktionary snapshots.
No audio/images or external book content. Each compact record preserves its source word.
"""
import urllib.request,urllib.parse,re,json,gzip,hashlib,datetime,concurrent.futures,pathlib,time,sys
BASE=pathlib.Path(__file__).resolve().parents[1];OUT=BASE/'dist/dictionaries';OUT.mkdir(exist_ok=True)
names={'ko':'한국어','ja':'일본어','en':'영어'}
langs={'ko':{'ko':'한국어','ja':'일본어','en':'영어'},'ja':{'ko':'朝鮮語','ja':'日本語','en':'英語'},'en':{'ko':'Korean','ja':'Japanese','en':'English'}}
def norm(s):
 import unicodedata
 return unicodedata.normalize('NFKC',s).strip().lower()
def build(source,target):
 pid=f'{source}-{target}-wiktionary';out=OUT/(pid+'.jsonl.gz');meta=OUT/(pid+'.meta.json')
 if meta.exists():
  saved=json.loads(meta.read_text())
  if out.exists() or saved.get('files') and all((BASE/'dist'/f['file']).exists() for f in saved['files']):return saved
 edition={'ko':'kowiktionary','ja':'jawiktionary','en':'dictionary'}[target];lang=langs[target][source]
 page='https://kaikki.org/'+edition+'/'+urllib.parse.quote(lang)+'/index.html'
 html=urllib.request.urlopen(page,timeout=90).read().decode();href=next(x for x in re.findall(r'href="([^"]+)"',html) if x.endswith('.jsonl'))
 url=urllib.parse.urljoin(page,href);count=0;raw=0;start=time.time();temp=out.with_suffix('.compressed.tmp')
 print('START',pid,url,flush=True)
 with urllib.request.urlopen(urllib.request.Request(url,headers={'Accept-Encoding':'gzip'}),timeout=60) as response,gzip.open(temp,'wt',encoding='utf8',compresslevel=6) as f:
  input=gzip.GzipFile(fileobj=response) if response.headers.get('Content-Encoding')=='gzip' else response
  checkpoint=0
  for line in input:
   raw+=len(line)
   if raw-checkpoint>10000000:checkpoint=raw;print('READ',pid,round(raw/1000000),'MB',flush=True)
   entry=json.loads(line);word=entry.get('word','');senses=[]
   if not word or len(word)>500:continue
   for sense in entry.get('senses',[]):
    for gloss in sense.get('glosses',[]):
     if isinstance(gloss,str) and gloss.strip() and len(gloss)<=200000 and gloss not in senses:senses.append(gloss)
   if not senses:continue
   forms=[v.get('form','') for v in entry.get('forms',[]) if isinstance(v,dict)]
   keys=list(dict.fromkeys(norm(x) for x in [word]+forms if x and len(x)<=160))[:32]
   row={'w':word,'k':keys,'p':entry.get('pos',''),'s':senses,'r':list(dict.fromkeys(forms))[:16]}
   f.write(json.dumps(row,ensure_ascii=False,separators=(',',':'))+'\n');count+=1
 temp.replace(out)
 m={'id':pid,'source':source,'target':target,'label':'Wiktionary · Kaikki','version':'2026-11-04','file':str(out.relative_to(BASE/'dist')),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'entries':count,'upstream':url,'page':page,'edition':target,'license':'CC BY-SA 4.0','licenseUrl':'https://creativecommons.org/licenses/by-sa/4.0/','rawBytes':raw}
 meta.write_text(json.dumps(m,ensure_ascii=False,indent=2));print('DONE',pid,count,m['bytes'],round(time.time()-start),flush=True);return m
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
  jobs=[pool.submit(build,s,t) for t in ['ko','ja','en'] for s in ['ko','ja','en'] if len(sys.argv)==1 or s+'-'+t in sys.argv[1:]]
  results=[j.result() for j in jobs]
 (OUT/'catalog.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))

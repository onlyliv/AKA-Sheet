"""Optional Japanese-English pack. Retain reading/sense restrictions in display."""
import urllib.request,gzip,xml.etree.ElementTree as ET,json,pathlib,hashlib,sys
root=pathlib.Path(__file__).resolve().parents[1];out=root/'public/dictionaries';url='https://www.edrdg.org/pub/Nihongo/JMdict_e.gz'
data=gzip.decompress(pathlib.Path(sys.argv[1]).read_bytes() if len(sys.argv)>1 else urllib.request.urlopen(url,timeout=90).read());tree=ET.fromstring(data);path=out/'ja-en-jmdict.jsonl.gz';count=0
with gzip.open(path,'wt',encoding='utf8',compresslevel=9) as f:
 for entry in tree.findall('entry'):
  words=[n.text for n in entry.findall('k_ele/keb')];readings=[n.text for n in entry.findall('r_ele/reb')];allkeys=words+readings
  if not allkeys:continue
  senses=[];pos=[]
  for sense in entry.findall('sense'):
   pos+= [n.text for n in sense.findall('pos') if n.text not in pos]
   restrictions=[n.text for n in sense.findall('stagk')+sense.findall('stagr')];glosses=[n.text for n in sense.findall('gloss') if n.text]
   if glosses:senses.append((', '.join(restrictions)+' — ' if restrictions else '')+'; '.join(glosses))
  if not senses:continue
  import unicodedata
  keys=list(dict.fromkeys(unicodedata.normalize('NFKC',k).strip().lower() for k in allkeys))[:32]
  f.write(json.dumps({'w':allkeys[0],'k':keys,'r':readings,'p':'; '.join(pos),'s':senses},ensure_ascii=False,separators=(',',':'))+'\n');count+=1
meta={'id':'ja-en-jmdict','source':'ja','target':'en','label':'JMdict · EDRDG','version':'2026-11-04','file':'dictionaries/'+path.name,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'entries':count,'upstream':url,'page':'https://www.edrdg.org/jmdict/j_jmdict.html','edition':'jmdict','license':'CC BY-SA 4.0','licenseUrl':'https://www.edrdg.org/edrdg/licence.html'}
(out/'ja-en-jmdict.meta.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2));print(count,meta['bytes'])

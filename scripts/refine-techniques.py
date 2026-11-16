import json,re,unicodedata,tempfile,hashlib,urllib.request
from pathlib import Path
from html import unescape
root=Path(__file__).resolve().parents[1];p=root/'web/data.js';s=p.read_text(encoding='utf-8');records=json.loads(s[s.index('['):s.index(';\nexport const attributeLabels')])
cache=Path(tempfile.gettempdir())/'digidex-official-cache'
def norm(text):return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',text).encode('ascii','ignore').decode().lower())
missing=[]
for d in records:
 path=cache/hashlib.sha256(d['source'].encode()).hexdigest()
 html=path.read_bytes().decode('utf-8') if path.exists() else urllib.request.urlopen(d['source'],timeout=20).read().decode('utf-8')
 m=re.search(r'<p[^>]*-txtProfile[^>]*>(.*?)</p>',html,re.S);profile=unescape(re.sub('<[^>]+>',' ',m.group(1))) if m else ''
 sentences=re.split(r'(?<=[.!?])\s+',re.sub(r'\s+',' ',profile));budget=175
 for detail in d['attackDetails']:
  excerpt=next((sentence for sentence in sentences if norm(detail['name']) in norm(sentence)), '')
  words=len(excerpt.split())
  detail['originalExcerpt']=excerpt if words<=budget else ''
  if excerpt and words<=budget:budget-=words
  if not detail['originalExcerpt']:missing.append((d['id'],detail['name']))
p.write_text('// Fontes e processamento das artes identificados por registro.\nexport const digimon = '+json.dumps(records,ensure_ascii=False,indent=2)+';\nexport const attributeLabels = {Vaccine:"Vacina",Data:"Dados",Virus:"Vírus",Free:"Livre",Unknown:"Não identificado"};\n',encoding='utf-8')
print('Sem trecho individual:',missing)

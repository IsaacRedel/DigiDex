"""Inventaria artes e obtém referências oficiais; não transforma imagens."""
import concurrent.futures,json,re,urllib.request,tempfile
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from PIL import Image
root=Path(__file__).resolve().parents[1];text=(root/'web/data.js').read_text(encoding='utf-8');records=json.loads(text[text.index('['):text.index(';\nexport const attributeLabels')])
folder=root/'docs/art-standardization';folder.mkdir(parents=True,exist_ok=True)
targets=[d for d in records if int(d['number'])<=48 or d['id'] in ['aquilamon','submarimon']]
def prepare(d):
 path=root/'web'/d['image']
 with Image.open(path) as image:before={'width':image.width,'height':image.height,'mode':image.mode}
 directory=parse_qs(urlparse(d['source']).query)['directory_name'][0]
 source=f'https://digimon.net/cimages/digimon/{directory}.jpg';target=folder/f"{d['id']}-reference.jpg"
 if not target.exists():
  for attempt in range(3):
   try:target.write_bytes(urllib.request.urlopen(source,timeout=20).read());break
   except Exception:
    if attempt==2:raise
 with Image.open(target) as image:assert image.width>0
 return {'id':d['id'],'name':d['name'],'number':d['number'],'before':before,'originalImage':d['image'],'reference':target.relative_to(root).as_posix(),'referenceSource':source,'output':f"assets/digimon/standard/{d['id']}.png"}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:items=list(pool.map(prepare,targets))
(folder/'inventory.json').write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'web/assets/digimon/standard').mkdir(parents=True,exist_ok=True)
print(json.dumps({'targets':len(items),'inventory':str(folder/'inventory.json')},ensure_ascii=False))

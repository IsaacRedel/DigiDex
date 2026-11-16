"""Obtém PNGs transparentes existentes, sem transformar os pixels das artes."""
import concurrent.futures, json, urllib.request, shutil
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
text=(root/'web/data.js').read_text(encoding='utf-8')
records=json.loads(text[text.index('['):text.index(';\nexport const attributeLabels')])
lines={
 'agumon':['agumon','greymon','metalgreymon','wargreymon'],
 'gabumon':['gabumon','garurumon','weregarurumon','metalgarurumon'],
 'piyomon':['biyomon','birdramon','garudamon','phoenixmon'],
 'tentomon':['tentomon','kabuterimon','megakabuterimon','herculeskabuterimon'],
 'palmon':['palmon','togemon','lillymon','rosemon'],
 'gomamon':['gomamon','ikkakumon','zudomon','vikemon'],
 'patamon':['patamon','angemon','magnaangemon','seraphimon'],
 'tailmon':['gatomon','angewomon'],
}
sources={id:f'https://www.toei-anim.co.jp/movie/digimon-adventure/tri/images/evolution/{line}_{i:02}.png' for line,ids in lines.items() for i,id in enumerate(ids,1)}
def fetch(item):
 id,url=item
 path=root/'web/assets/digimon'/f'{id}-transparent.png'
 path.write_bytes(urllib.request.urlopen(url,timeout=40).read())
 with Image.open(path) as im:
  assert im.mode=='RGBA' and im.getchannel('A').getextrema()==(0,255),id
 return id,url
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 for id,url in pool.map(fetch,sources.items()):
  record=next(d for d in records if d['id']==id)
  record['image']=f'assets/digimon/{id}-transparent.png'
  record['artSource']=url
shutil.copyfile(root/'images/omegamon.png',root/'web/assets/digimon/omegamon-transparent.png')
record=next(d for d in records if d['id']=='omegamon')
record['image']='assets/digimon/omegamon-transparent.png'
record['artSource']='https://github.com/IsaacRedel/DigiDex/blob/main/images/omegamon.png'
(root/'web/data.js').write_text('// Classificações e técnicas: Digimon Encyclopedia. Artes: Toei Adventure tri. e créditos individuais.\nexport const digimon = '+json.dumps(records,ensure_ascii=False,indent=2)+';\nexport const attributeLabels = {Vaccine:"Vacina",Data:"Dados",Virus:"Vírus",Free:"Livre",Unknown:"Não identificado"};\n',encoding='utf-8')
print('30 PNGs oficiais transparentes e Omegamon original integrados.')

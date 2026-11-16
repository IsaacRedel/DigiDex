"""Importa um recorte editorial de Adventure 02 e Tamers, preservando o catálogo."""
import concurrent.futures, json, re, urllib.request, io
from pathlib import Path
from html import unescape
from PIL import Image
root=Path(__file__).resolve().parents[1]
p=root/'web/data.js';text=p.read_text(encoding='utf-8');records=json.loads(text[text.index('['):text.index(';\nexport const attributeLabels')])
entries=[
('guilmon','guilmon','Guilmon','ギルモン','guilmon','Réptil curioso e impulsivo, com potencial de combate escondido sob seu comportamento infantil.'),
('growlmon','growmon','Growlmon','グラウモン','graumon','Dragão de grande porte que conserva traços de Guilmon e ataca com suas lâminas e chamas.'),
('wargrowlmon','megalogrowmon','WarGrowlmon','メガログラウモン','megarograumon','Ciborgue equipado com armamento e lâminas nos braços; sua parte superior é mecanizada.'),
('gallantmon','dukemon','Gallantmon','デュークモン','dukemon','Cavaleiro sagrado armado com a lança Gram e o escudo Aegis, apesar de seu atributo Vírus.'),
('renamon','renamon','Renamon','レナモン','renamon','Digimon de aparência vulpina que combina inteligência, disciplina e movimentos velozes.'),
('kyubimon','kyubimon','Kyubimon','キュウビモン','kyubimon','Raposa de nove caudas associada a chamas espirituais e técnicas místicas.'),
('taomon','taomon','Taomon','タオモン','taomon','Especialista em feitiços, talismãs e técnicas que canalizam energia espiritual.'),
('sakuyamon','sakuyamon','Sakuyamon','サクヤモン','sakuyamon','Divindade de armadura dourada que utiliza espíritos auxiliares e um cajado ritual.'),
('terriermon','terriermon','Terriermon','テリアモン','terriermon','Pequeno Digimon de longas orelhas cuja aparência delicada esconde grande força.'),
('gargomon','galgomon','Gargomon','ガルゴモン','garugomon','Fera mecanizada equipada com metralhadoras nos braços e grande capacidade de salto.'),
('rapidmon','rapidmon','Rapidmon','ラピッドモン','rapidmon','Ciborgue de alta velocidade que usa sensores para localizar o adversário.'),
('megagargomon','saintgalgomon','MegaGargomon','セントガルゴモン','saintgulgomon','Grande máquina de combate, equipada com armamentos distribuídos por todo o corpo.'),
('veemon','v-mon','Veemon','ブイモン','buimon','Sobrevivente de uma antiga espécie, com um corpo pequeno e grande potencial para evolução Armor.'),
('exveemon','xv-mon','ExVeemon','エクスブイモン','x-veemon','Dragão humanoide alado que combina força física com técnicas de energia.'),
('wormmon','wormmon','Wormmon','ワームモン','warmmon','Larva de temperamento tímido que se defende com fios resistentes.'),
('stingmon','stingmon','Stingmon','スティングモン','stingmon','Inseto humanoide de movimentos ágeis, especializado em ataques precisos.'),
('hawkmon','hawkmon','Hawkmon','ホークモン','hawkmon','Pássaro de temperamento calmo e educado, pertencente a uma espécie antiga.'),
('aquilamon','aquilamon','Aquilamon','アクィラモン','aquilamon','Ave gigante com grandes chifres, capaz de localizar alvos a longa distância.'),
('armadillomon','armadimon','Armadillomon','アルマジモン','arumajimon','Mamífero de carapaça resistente e temperamento tranquilo, apto à evolução Armor.'),
('ankylomon','ankylomon','Ankylomon','アンキロモン','ankylomon','Dinossauro revestido por uma armadura espessa, com uma grande maça na cauda.'),
]
def clean(s):return unescape(re.sub('<[^>]+>',' ',s)).replace('・','').strip()
def fetch(e):
 id,directory,name,jp,page,description=e;collection='tamers' if entries.index(e)<12 else '02'
 source=f'https://digimon.net/reference_en/detail.php?directory_name={directory}'
 html=urllib.request.urlopen(source,timeout=40).read().decode('utf-8')
 fields={clean(k):clean(v) for k,v in re.findall(r'<dt[^>]*>(.*?)</dt>\s*<dd[^>]*>(.*?)</dd>',html,re.S)}
 assert fields.get('Level') and fields.get('Type'),id
 artpage=f'https://www.toei-anim.co.jp/tv/digimon_t/chara/{page}.html' if collection=='tamers' else f'https://www.toei-anim.co.jp/tv/digimon02/char-file/{page}.htm'
 arthtml=urllib.request.urlopen(artpage,timeout=40).read().decode('shift_jis',errors='replace')
 imgs=re.findall(r'<img[^>]+src=["\']([^"\']+)',arthtml,re.I)
 image=next((url for url in imgs if not any(x in url for x in ['list.gif','back.gif','evolution.gif','textbox']) and re.search(r'\.(gif|png)$',url,re.I)),None)
 from urllib.parse import urljoin
 art=urljoin(artpage,image);data=urllib.request.urlopen(art,timeout=40).read()
 if collection=='02' and id in {'veemon','wormmon','hawkmon','armadillomon'}:
  asset={'veemon':'vuimon','wormmon':'wormmon','hawkmon':'forkmon','armadillomon':'arumajimon'}[id]
  art=f'https://www.toei-anim.co.jp/movie/digimon-adventure/eng/character/img/{asset}.png'
  data=urllib.request.urlopen(art,timeout=40).read()
 print(id,art,flush=True)
 with Image.open(io.BytesIO(data)) as im:
  assert im.convert('RGBA').getchannel('A').getextrema()==(0,255),f'{id}: arte sem transparência'
 ext='.gif' if data[:3]==b'GIF' else '.png';path=f'assets/digimon/{id}-transparent{ext}';(root/'web'/path).write_bytes(data)
 moves=re.split(r'<br\s*/?>|・',re.search(r'Special Move</dt><dd>(.*?)</dd>',html,re.S).group(1))
 return dict(id=id,name=name,japaneseName=jp,aliases=[directory.replace('-',''),{'gallantmon':'Dukemon','megagargomon':'SaintGalgomon','veemon':'V-mon'}.get(id,name)],level=fields['Level'],attribute=fields.get('Attribute','Unknown'),families=[fields['Type']],element=fields['Type'],type=fields['Type'],image=path,color='ice' if fields.get('Attribute')=='Data' else 'sand',description=description,attacks=[clean(x) for x in moves if clean(x)],source=source,artSource=art,collection=collection)
selected=entries[:12]+[entries[i] for i in [12,14,16,18]]
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:new=list(pool.map(fetch,selected))
for d in records:d.setdefault('collection','adventure')
for d in new:
 if not any(old['id']==d['id'] for old in records):d['number']=str(len(records)+1).zfill(3);records.append(d)
p.write_text('// Fontes de dados e de arte identificadas por registro.\nexport const digimon = '+json.dumps(records,ensure_ascii=False,indent=2)+';\nexport const attributeLabels = {Vaccine:"Vacina",Data:"Dados",Virus:"Vírus",Free:"Livre",Unknown:"Não identificado"};\n',encoding='utf-8')
print(f'{len(records)} registros nas três coleções.')

"""Acrescenta formas de Adventure 02 e trechos curtos de técnicas, sem substituir favoritos/IDs."""
import concurrent.futures,json,re,urllib.request,tempfile,hashlib,time
from pathlib import Path
from html import unescape
root=Path(__file__).resolve().parents[1];p=root/'web/data.js';text=p.read_text(encoding='utf-8');records=json.loads(text[text.index('['):text.index(';\nexport const attributeLabels')])
entries=[
('exveemon','xv-mon','ExVeemon','エクスブイモン','Dragão alado que combina força física e ataques de energia.'),
('stingmon','stingmon','Stingmon','スティングモン','Inseto humanoide de movimentos ágeis e golpes precisos.'),
('aquilamon','aquilamon','Aquilamon','アクィラモン','Ave gigante com chifres, conhecida por sua visão aguçada.'),
('ankylomon','ankylomon','Ankylomon','アンキロモン','Dinossauro protegido por placas de armadura e uma maça na cauda.'),
('flamedramon','fladramon','Flamedramon','フレイドラモン','Forma Armor associada ao Digiovo da Coragem, que envolve seus golpes em chamas.'),
('raidramon','lighdramon','Raidramon','ライドラモン','Forma Armor associada ao Digiovo da Amizade, com técnicas elétricas.'),
('magnamon','magnamon','Magnamon','マグナモン','Cavaleiro de armadura dourada associado ao Digiovo dos Milagres.'),
('halsemon','holsmon','Halsemon','ホルスモン','Forma Armor associada ao Digiovo do Amor, com grande capacidade de voo.'),
('shurimon','shurimon','Shurimon','シュリモン','Forma Armor associada ao Digiovo da Sinceridade, com técnicas de ninja.'),
('digmon','digmon','Digmon','ディグモン','Forma Armor associada ao Digiovo do Conhecimento, equipada com brocas.'),
('submarimon','sabmarimon','Submarimon','サブマリモン','Forma Armor associada ao Digiovo da Confiança, adaptada à exploração subaquática.'),
('pegasusmon','pegasmon','Pegasusmon','ペガスモン','Forma Armor associada ao Digiovo da Esperança, com aparência de cavalo alado.'),
('nefertimon','nefertimon','Nefertimon','ネフェルティモン','Forma Armor associada ao Digiovo da Luz, inspirada em uma esfinge alada.'),
('paildramon','paildramon','Paildramon','パイルドラモン','Combina características de dragão e inseto na união de ExVeemon e Stingmon.'),
('silphymon','silphymon','Silphymon','シルフィーモン','Guerreiro alado que combina as características de Aquilamon e Gatomon.'),
('shakkoumon','shakkoumon','Shakkoumon','シャッコウモン','Digimon de aparência semelhante a uma figura de argila, associado à união de Ankylomon e Angemon.'),
('imperialdramon','imperialdramondragonmode','Imperialdramon: Dragon Mode','インペリアルドラモン','Dragão ancestral de enorme poder, capaz de assumir uma forma de combate humanoide.'),
('imperialdramonfm','imperialdramonfightermode','Imperialdramon: Fighter Mode','インペリアルドラモン：ファイターモード','Forma de combate humanoide de Imperialdramon, com controle aprimorado de seu poder.'),
]
cache=Path(tempfile.gettempdir())/'digidex-official-cache';cache.mkdir(exist_ok=True)
def load(url):
 path=cache/hashlib.sha256(url.encode()).hexdigest()
 if path.exists():return path.read_bytes()
 for attempt in range(3):
  try:
   data=urllib.request.urlopen(url,timeout=20).read();path.write_bytes(data);return data
  except Exception:
   if attempt==2:raise
   time.sleep(1)
def clean(s):return re.sub(r'\s+',' ',unescape(re.sub('<[^>]+>',' ',s))).replace('・','').strip()
def fetch(e):
 id,directory,name,jp,description=e;source='https://digimon.net/reference_en/detail.php?directory_name='+directory
 html=load(source).decode('utf-8')
 fields={clean(k):clean(v) for k,v in re.findall(r'<dt[^>]*>(.*?)</dt>\s*<dd[^>]*>(.*?)</dd>',html,re.S)};assert fields.get('Level'),id
 art=f'https://digimon.net/cimages/digimon/{directory}.jpg';path=root/f'web/assets/digimon/{id}-original.jpg'
 if not path.exists():path.write_bytes(load(art))
 moves=[clean(x) for x in re.split(r'<br\s*/?>|・',re.search(r'Special Move</dt><dd>(.*?)</dd>',html,re.S).group(1)) if clean(x)]
 return dict(id=id,name=name,japaneseName=jp,aliases=[directory],level=fields['Level'],attribute=fields.get('Attribute','Unknown'),families=[fields['Type']],type=fields['Type'],element=fields['Type'],image=f'assets/digimon/{id}-transparent.png',color='ice' if fields.get('Attribute')=='Data' else 'sand',description=description,attacks=moves,source=source,artSource=art,collection='02',artProcessing='Fundo removido com ImageGen; arquivo original preservado.')
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:new=list(pool.map(fetch,entries))
for d in new:
 if not any(old['id']==d['id'] for old in records):d['number']=str(len(records)+1).zfill(3);records.append(d)
aliases={'omegamon':['Omnimon'],'gatomon':['Tailmon'],'biyomon':['Piyomon'],'phoenixmon':['Hououmon'],'megakabuterimon':['AtlurKabuterimon'],'herculeskabuterimon':['HerakleKabuterimon'],'magnaangemon':['HolyAngemon'],'magnadramon':['Holydramon'],'gallantmon':['Dukemon'],'megagargomon':['SaintGalgomon'],'veemon':['V-mon','Vmon'],'raidramon':['Lighdramon'],'halsemon':['Holsmon'],'pegasusmon':['Pegasmon'],'submarimon':['Sabmarimon'],'armadillomon':['Armadimon'],'wargrowlmon':['MegaloGrowmon']}
def enrich(d):
 html=load(d['source']).decode('utf-8');m=re.search(r'<p[^>]*-txtProfile[^>]*>(.*?)</p>',html,re.S)
 profile=clean(m.group(1)) if m else ''
 sentences=re.split(r'(?<=[.!?])\s+',profile);budget=45;details=[]
 for attack in d['attacks']:
  matching=next((s for s in sentences if attack.lower() in s.lower()),'')
  words=matching.split()
  if words and len(words)<=budget:excerpt=matching;budget-=len(words)
  else:excerpt=''
  details.append({'name':attack,'originalExcerpt':excerpt,'source':d['source']})
 d['attackDetails']=details;d['aliases']=sorted(set([a for a in d['aliases']+aliases.get(d['id'],[]) if a and a!=d['name']]))
 d['artScale']=0.9 if d['id'] in ['omegamon','magnadramon','imperialdramon','imperialdramonfm','herculeskabuterimon'] else 1
 return d
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:records=list(pool.map(enrich,records))
p.write_text('// Fontes e processamento das artes identificados por registro.\nexport const digimon = '+json.dumps(records,ensure_ascii=False,indent=2)+';\nexport const attributeLabels = {Vaccine:"Vacina",Data:"Dados",Virus:"Vírus",Free:"Livre",Unknown:"Não identificado"};\n',encoding='utf-8')
print(f'{len(records)} registros, com aliases e detalhes de técnicas.')

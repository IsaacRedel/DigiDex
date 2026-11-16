"""Importação editorial pontual das fichas oficiais; não executada pelo site."""
import concurrent.futures, json, re, urllib.request
from pathlib import Path
from html import unescape

root = Path(__file__).resolve().parents[1]
entries = [
('agumon','agumon','Agumon','アグモン','Réptil bípede com garras afiadas e um temperamento destemido.'),
('gabumon','gabumon','Gabumon','ガブモン','Tímido por natureza, veste uma pele de Garurumon para ganhar coragem.'),
('wargreymon','wargreymon','WarGreymon','ウォーグレイモン','Guerreiro dragão protegido por armadura de Chrome Digizoid.'),
('metalgarurumon','metalgarurumon','MetalGarurumon','メタルガルルモン','Forma mecanizada de Garurumon, equipada com sensores e armamentos.'),
('omegamon','omegamon','Omegamon','オメガモン','Cavaleiro sagrado que reúne características de WarGreymon e MetalGarurumon.'),
('greymon','greymon-first','Greymon','グレイモン','Dinossauro com uma carapaça endurecida que protege a cabeça.'),
('metalgreymon','metalgreymon-v','MetalGreymon','メタルグレイモン','Ciborgue que combina um corpo orgânico poderoso com partes mecanizadas.'),
('garurumon','garurumon','Garurumon','ガルルモン','Fera semelhante a um lobo, com pelagem resistente e grande agilidade.'),
('weregarurumon','weregarrumon','WereGarurumon','ワーガルルモン','Guerreiro bípede que concentra sua força em golpes e garras.'),
('biyomon','piyomon','Biyomon','ピヨモン','Pequeno pássaro que usa as asas também como braços.'),
('birdramon','birdramon','Birdramon','バードラモン','Ave gigante envolta em chamas, que cruza o céu com suas grandes asas.'),
('garudamon','garudamon','Garudamon','ガルダモン','Guerreiro alado associado à proteção da natureza e da ordem.'),
('phoenixmon','hououmon','Phoenixmon','ホウオウモン','Ave sagrada de quatro asas, reconhecida como líder dos Digimon pássaros.'),
('tentomon','tentomon','Tentomon','テントモン','Inseto com carapaça resistente e uma personalidade amigável.'),
('kabuterimon','kabuterimon','Kabuterimon','カブテリモン','Inseto de grande porte que combina força e uma carapaça protetora.'),
('megakabuterimon','atlurkabuterimon','MegaKabuterimon','アトラーカブテリモン','Forma vermelha de grande porte, com um chifre desenvolvido para combate.'),
('herculeskabuterimon','heraklekabuterimon','HerculesKabuterimon','ヘラクルカブテリモン','Inseto de armadura dourada, com um grande chifre e pinças poderosas.'),
('palmon','palmon','Palmon','パルモン','Digimon planta que obtém energia por fotossíntese com a flor da cabeça.'),
('togemon','togemon','Togemon','トゲモン','Cacto gigante que luta com socos e espinhos.'),
('lillymon','lilimon','Lillymon','リリモン','Pequena fada nascida de uma flor, capaz de voar com suas pétalas.'),
('rosemon','rosemon','Rosemon','ロゼモン','Fada com aparência de rosa, conhecida como rainha das flores.'),
('gomamon','gomamon','Gomamon','ゴマモン','Criatura marinha de pelagem espessa e personalidade brincalhona.'),
('ikkakumon','ikkakumon','Ikkakumon','イッカクモン','Fera marinha adaptada ao frio, com pelagem densa e um grande chifre.'),
('zudomon','zudomon','Zudomon','ズドモン','Guerreiro marinho que usa um martelo de Chrome Digizoid.'),
('vikemon','vikemon','Vikemon','ヴァイクモン','Guerreiro das regiões geladas, armado com grandes maças.'),
('patamon','patamon','Patamon','パタモン','Pequeno mamífero que usa suas grandes orelhas para voar.'),
('angemon','angemon','Angemon','エンジェモン','Anjo de seis asas dedicado a combater as forças das trevas.'),
('magnaangemon','holyangemon','MagnaAngemon','ホーリーエンジェモン','Arcanjo de oito asas que exerce um papel de vigilância e proteção.'),
('seraphimon','seraphimon','Seraphimon','セラフィモン','Anjo de armadura sagrada e dez asas douradas.'),
('gatomon','tailmon','Gatomon','テイルモン','Pequeno Digimon sagrado com um anel na cauda e garras protegidas por luvas.'),
('angewomon','angewomon','Angewomon','エンジェウーモン','Arcanjo de oito asas que combate com um arco de energia sagrada.'),
('magnadramon','holydramon','Magnadramon','ホーリードラモン','Dragão sagrado de dez asas, associado ao combate contra o mal.'),
]
def clean(s): return unescape(re.sub('<[^>]+>', ' ', s)).replace('・','').strip()
def fetch(entry):
    id, directory, name, jp, description = entry
    source = 'https://digimon.net/reference_en/detail.php?directory_name=' + directory
    html = urllib.request.urlopen(source, timeout=40).read().decode('utf-8')
    fields = {clean(k): clean(v) for k,v in re.findall(r'<dt[^>]*>(.*?)</dt>\s*<dd[^>]*>(.*?)</dd>', html, re.S)}
    if not fields.get('Level') or not fields.get('Type'): raise ValueError(directory)
    image = 'https://digimon.net/cimages/digimon/' + directory + '.jpg'
    path = root/'web/assets/digimon'/f'{id}.jpg'
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(urllib.request.urlopen(image,timeout=40).read())
    moves = re.split(r'<br\s*/?>|・', re.search(r'Special Move</dt><dd>(.*?)</dd>',html,re.S).group(1))
    return dict(id=id,name=name,japaneseName=jp,aliases=[fields.get('Name',''), 'Omnimon' if id=='omegamon' else name.replace('Metal','Metal ').strip()],level=fields['Level'],attribute=fields.get('Attribute','Unknown'),families=[fields['Type']],element=fields['Type'],type=fields['Type'],image=f'assets/digimon/{id}.jpg',color='ice' if fields.get('Attribute')=='Data' else 'sand',description=description,attacks=[clean(x) for x in moves if clean(x)],source=source,artSource=image)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    records=list(pool.map(fetch,entries))
for n,d in enumerate(records,1): d['number']=str(n).zfill(3)
(root/'web/data.js').write_text('// Perfis editoriais resumidos em português; classificações e técnicas: Digimon Encyclopedia.\nexport const digimon = '+json.dumps(records,ensure_ascii=False,indent=2)+';\nexport const attributeLabels = {Vaccine:"Vacina",Data:"Dados",Virus:"Vírus",Free:"Livre",Unknown:"Não identificado"};\n',encoding='utf-8')
print(f'{len(records)} fichas e artes oficiais importadas.')

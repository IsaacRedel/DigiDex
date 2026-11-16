import json
from pathlib import Path
root=Path(__file__).resolve().parents[1];p=root/'web/data.js';s=p.read_text(encoding='utf-8');records=json.loads(s[s.index('['):s.index(';\nexport const attributeLabels')])
aliases={'exveemon':['XV-mon','Ex Veemon'],'flamedramon':['Fladramon'],'raidramon':['Lighdramon'],'halsemon':['Holsmon'],'submarimon':['Sabmarimon'],'pegasusmon':['Pegasmon'],'imperialdramon':['Imperialdramon','Imperialdramon Dragon Mode'],'imperialdramonfm':['Imperialdramon Fighter Mode']}
for d in records:
 if d['id'] in aliases:d['aliases']=aliases[d['id']]
 d['aliases']=[a for a in d['aliases'] if a.casefold()!=d['name'].casefold()]
p.write_text('// Fontes e processamento das artes identificados por registro.\nexport const digimon = '+json.dumps(records,ensure_ascii=False,indent=2)+';\nexport const attributeLabels = {Vaccine:"Vacina",Data:"Dados",Virus:"Vírus",Free:"Livre",Unknown:"Não identificado"};\n',encoding='utf-8')

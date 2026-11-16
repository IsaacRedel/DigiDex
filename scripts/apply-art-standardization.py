"""Aplica somente artes padronizadas já verificadas; preserva arquivos anteriores."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
path = root / 'web/data.js'
text = path.read_text(encoding='utf-8')
start, end = text.index('['), text.index(';\nexport const attributeLabels')
records = json.loads(text[start:end])
inventory = json.loads((root/'docs/art-standardization/inventory.json').read_text(encoding='utf-8'))
targets = {item['id']: item for item in inventory}
for record in records:
    if record['id'] not in targets:
        continue
    item = targets[record['id']]
    with Image.open(root/'web'/item['output']) as image:
        assert min(image.size) >= 1024, record['id']
        low, high = image.convert('RGBA').getchannel('A').getextrema()
        assert low == 0 and high >= 250, record['id']
    record.setdefault('previousArtSource', record['artSource'])
    record['originalArtImage'] = item['originalImage']
    record['image'] = item['output']
    record['artSource'] = item['referenceSource']
    record['artProcessing'] = 'Reilustração assistida por ImageGen a partir da referência oficial, com acabamento inspirado na arte do Imperialdramon e fundo transparente. Pode haver diferenças nos detalhes; original preservado.'
    record['artStyleReference'] = 'assets/digimon/imperialdramon-transparent.png'
    record['artScale'] = 1
    record['artPosition'] = '50% 50%'
path.write_text(text[:start]+json.dumps(records, ensure_ascii=False, indent=2)+text[end:], encoding='utf-8')
print(f'{len(targets)} artes padronizadas aplicadas; originais preservados.')

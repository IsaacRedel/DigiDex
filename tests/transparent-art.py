"""Verifica os canais alpha dos assets usados pelo catálogo, sem editar imagens."""
import json
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1]
text = (root/'web/data.js').read_text(encoding='utf-8')
records = json.loads(text[text.index('['):text.index(';\nexport const attributeLabels')])
for record in records:
    with Image.open(root/'web'/record['image']) as image:
        low, high = image.convert('RGBA').getchannel('A').getextrema()
        # Alguns PNGs com antialiasing têm alpha máximo 254 (99,6% opaco).
        assert low == 0 and high >= 250, record['id']
print(f'{len(records)} artes com áreas transparentes e corpo opaco ou praticamente opaco.')

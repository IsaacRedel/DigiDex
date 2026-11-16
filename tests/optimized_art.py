"""Confere WebP, dimensões, alpha e orçamento sem regenerar os arquivos."""
import json
from pathlib import Path
from PIL import Image, ImageChops

root = Path(__file__).resolve().parents[1]
text = (root/'web/data.js').read_text(encoding='utf-8')
records = json.loads(text[text.index('['):text.index(';\nexport const attributeLabels')])
total = 0
for d in records:
    with Image.open(root/'web'/d['sourceImage']) as source:
        source = source.convert('RGBA')
        for name, edge in [('thumbnail', 160), ('medium', 480), ('large', 960)]:
            path = root/'web'/d['imageVariants'][name]
            expected = source.copy()
            expected.thumbnail((edge, edge), Image.Resampling.LANCZOS)
            with Image.open(path) as image:
                assert image.format == 'WEBP', (d['id'], name)
                assert image.size == expected.size, (d['id'], name, image.size)
                alpha = image.convert('RGBA').getchannel('A')
                low, high = alpha.getextrema()
                assert low == 0 and high >= 250, (d['id'], name, low, high)
                assert ImageChops.difference(alpha, expected.getchannel('A')).getbbox() is None, (d['id'], name, 'alpha modificado')
            total += path.stat().st_size
assert total <= 15*1024*1024, f'Orçamento de 15 MiB excedido: {total} bytes'
print(json.dumps({'images': len(records), 'variants': len(records)*3, 'bytes': total, 'budgetBytes': 15*1024*1024, 'alpha': 'preservado'}))

"""Inspeciona resolução, alpha e ocupação do quadro sem modificar pixels."""
import json
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1]
inventory = json.loads((root/'docs/art-standardization/inventory.json').read_text(encoding='utf-8'))
report = []
for item in inventory:
    path = root/'web'/item['output']
    if not path.exists():
        report.append({'id': item['id'], 'status': 'pending'})
        continue
    with Image.open(path) as image:
        alpha = image.convert('RGBA').getchannel('A')
        low, high = alpha.getextrema()
        bbox = alpha.point(lambda value: 255 if value > 128 else 0).getbbox()
        occupancy = max((bbox[2]-bbox[0])/image.width, (bbox[3]-bbox[1])/image.height) if bbox else 0
        report.append({'id': item['id'], 'width': image.width, 'height': image.height, 'alpha': [low, high], 'occupancy': round(occupancy, 3), 'bytes': path.stat().st_size, 'status': 'ready' if min(image.size) >= 1024 and low == 0 and high >= 250 else 'review'})
(root/'docs/art-standardization/qa.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'ready': sum(i['status']=='ready' for i in report), 'pending': sum(i['status']=='pending' for i in report), 'review': [i for i in report if i['status']=='review']}, ensure_ascii=False))

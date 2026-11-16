"""Converte as artes para WebP e gera variantes, preservando as fontes."""
import concurrent.futures
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SIZES = {'thumbnail': 160, 'medium': 480, 'large': 960}

def optimize(record):
    source = record.get('sourceImage', record['image'])
    variants, metrics = {}, {}
    with Image.open(ROOT/'web'/source) as original:
        original = original.convert('RGBA')
        for name, edge in SIZES.items():
            image = original.copy()
            image.thumbnail((edge, edge), Image.Resampling.LANCZOS)
            relative = f'assets/digimon/optimized/{record["id"]}-{edge}.webp'
            target = ROOT/'web'/relative
            target.parent.mkdir(parents=True, exist_ok=True)
            image.save(target, 'WEBP', quality=88, method=6, exact=True)
            variants[name] = relative
            metrics[name] = {'bytes': target.stat().st_size, 'width': image.width, 'height': image.height}
    record.update(sourceImage=source, image=variants['large'], imageVariants=variants)
    return {'id': record['id'], 'source': source, 'sourceBytes': (ROOT/'web'/source).stat().st_size, 'variants': metrics}

def main():
    path = ROOT/'web/data.js'
    text = path.read_text(encoding='utf-8')
    start, end = text.index('['), text.index(';\nexport const attributeLabels')
    records = json.loads(text[start:end])
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        metrics = list(pool.map(optimize, records))
    path.write_text(text[:start]+json.dumps(records, ensure_ascii=False, indent=2)+text[end:], encoding='utf-8')
    before = sum(x['sourceBytes'] for x in metrics)
    after = sum(v['bytes'] for x in metrics for v in x['variants'].values())
    report = {'quality': 88, 'count': len(records), 'sourceBytes': before, 'optimizedBytes': after, 'reductionPercent': round((1-after/before)*100, 2), 'images': metrics}
    (ROOT/'docs/image-optimization.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k != 'images'}))

if __name__ == '__main__':
    main()

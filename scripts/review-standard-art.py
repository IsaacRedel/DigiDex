"""Gera capturas de revisão no navegador; não altera os arquivos das imagens."""
import json
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
inventory = json.loads((root/'docs/art-standardization/inventory.json').read_text(encoding='utf-8'))
items = [item for item in inventory if (root/'web'/item['output']).exists()]
artifacts = Path(tempfile.mkdtemp(prefix='digidex-art-review-'))
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1400, 'height': 850}, device_scale_factor=1)
    for offset in range(0, len(items), 10):
        cards = ''
        for item in items[offset:offset+10]:
            cards += f'<article><h2>{item["name"]}</h2><img class="art" src="{(root/"web"/item["output"]).as_uri()}"><footer><img src="{(root/item["reference"]).as_uri()}">Referência original</footer></article>'
        html = artifacts/f'review-{offset//10+1}.html'
        html.write_text('<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:20px;background:#071526;color:#e4eff9;font:14px system-ui}main{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}article{background:#0d2137;border:1px solid #294764;border-radius:12px;padding:10px}h2{font-size:16px;margin:0}img.art{width:100%;height:260px;object-fit:contain}footer{display:flex;align-items:center;gap:10px;color:#a4b6c9;font-size:11px}footer img{width:64px;height:64px;object-fit:contain;background:white}</style><main>'+cards+'</main>', encoding='utf-8')
        page.goto(html.as_uri(), wait_until='networkidle')
        assert page.evaluate('[...document.images].every(i=>i.complete && i.naturalWidth>0)')
        page.screenshot(path=str(artifacts/f'review-{offset//10+1}.png'), full_page=True)
    browser.close()
print(str(artifacts))

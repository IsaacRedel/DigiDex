"""Fluxos da experiência completa; requer build e preview em 127.0.0.1:4173."""
import json,tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
artifacts=Path(tempfile.mkdtemp(prefix='digidex-complete-'))
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 context=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce',accept_downloads=True)
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:4173',wait_until='networkidle')
 expect(page.locator('.digi-card')).to_have_count(66)
 page.locator('#search').fill('Mega de atributo Dados')
 assert page.locator('.digi-card').count()>0
 page.reload(wait_until='networkidle');expect(page.locator('#search')).to_have_value('Mega de atributo Dados')
 page.locator('#search').fill('Omnimon');expect(page.locator('.digi-card')).to_have_count(1)
 page.get_by_role('button',name='Limpar busca e filtros').click();expect(page.locator('.digi-card')).to_have_count(66)
 page.locator('#map-collection').select_option('02');page.locator('#path-from').select_option('veemon');page.locator('#path-to').select_option('imperialdramonfm')
 page.get_by_role('button',name='Encontrar caminho').click()
 expect(page.locator('#path-result')).to_contain_text('Stingmon')
 expect(page.locator('#path-result')).to_contain_text('ambos os parceiros')
 page.locator('#branch-origin').select_option('veemon')
 expect(page.locator('#branch-connections')).to_contain_text('Flamedramon')
 expect(page.locator('#branch-connections')).to_contain_text('Magnamon')
 page.locator('#path-from').select_option('imperialdramonfm');page.locator('#path-to').select_option('veemon');page.get_by_role('button',name='Encontrar caminho').click()
 expect(page.locator('#path-status')).to_contain_text('Nenhum caminho')
 page.locator('#new-list-name').fill('Time de teste');page.get_by_role('button',name='Criar lista',exact=True).click()
 page.get_by_role('button',name='Abrir ficha de Agumon',exact=True).click()
 expect(page.locator('#explored-progress')).to_contain_text('1 de 66')
 expect(page.locator('.attack-list details')).to_have_count(1)
 page.locator('.attack-list summary').click();expect(page.locator('.attack-list details')).to_contain_text('rajada de fogo')
 options=page.locator('#detail-list option').evaluate_all("items => items.map(i => ({value:i.value,text:i.textContent}))")
 target=next(o['value'] for o in options if o['text']=='Time de teste')
 page.locator('#detail-list').select_option(target);page.get_by_role('button',name='Adicionar à lista',exact=True).click()
 expect(page.locator('#detail-list-status')).to_contain_text('adicionado')
 page.keyboard.press('Escape');page.wait_for_function("document.body.style.overflow === ''")
 page.locator('#personal-list').select_option(target);expect(page.locator('#personal-records')).to_contain_text('Agumon')
 page.reload(wait_until='networkidle');page.locator('#personal-list').select_option(target);expect(page.locator('#personal-records')).to_contain_text('Agumon')
 with page.expect_download() as download_event:page.get_by_role('button',name='Exportar coleção').click()
 download=download_event.value;backup=artifacts/'collection.json';download.save_as(backup)
 saved=json.loads(backup.read_text(encoding='utf-8'));assert any(l['name']=='Time de teste' and 'agumon' in l['ids'] for l in saved['lists'])
 page.locator('#import-library').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{"version":99,"lists":[]}'})
 expect(page.locator('#personal-status')).to_contain_text('Não foi possível importar')
 page.locator('#import-library').set_input_files(str(backup));expect(page.locator('#personal-status')).to_contain_text('Backup incorporado')
 page.locator('#quiz-mode').select_option('silhouette');expect(page.locator('#quiz-art img')).to_have_class('silhouette')
 page.get_by_role('button',name='Mostrar pista').click();assert len(page.locator('#quiz-clue').inner_text())>15
 page.locator('#quiz-options button').first.click();expect(page.locator('#quiz-next')).to_be_visible();expect(page.locator('#quiz-score')).to_contain_text('1 resposta')
 assert page.locator('#quiz-options button:disabled').count()==4
 expect(page.locator('#quiz-next')).to_be_focused()
 expect(page.locator('#quiz-art img')).not_to_have_class('silhouette')
 page.get_by_role('button',name='Próximo desafio').press('Enter');expect(page.locator('#quiz-options button:disabled')).to_have_count(0)
 expect(page.locator('#quiz-options button').first).to_be_focused()
 page.locator('#quiz-mode').select_option('clues');expect(page.locator('.quiz-question-mark')).to_be_visible()
 page.get_by_role('tab',name='Comparar parceiros').click();page.locator('#compare-left').select_option('paildramon');page.locator('#compare-right').select_option('silphymon')
 page.reload(wait_until='networkidle');expect(page.locator('#compare-left')).to_have_value('paildramon');expect(page.locator('#compare-panel')).to_be_visible()
 for width in [320,390,768,1024,1440]:
  page.set_viewport_size({'width':width,'height':844})
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'Overflow em {width}'
  page.get_by_role('tab',name='Evoluções').click();page.locator('#map-collection').select_option('02');page.locator('#branch-origin').select_option('veemon')
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'Grafo transborda em {width}'
  if width==390:
   page.locator('#branch-connections').scroll_into_view_if_needed();page.screenshot(path=str(artifacts/'branches-mobile.png'))
   page.locator('#discovery').scroll_into_view_if_needed();page.screenshot(path=str(artifacts/'discovery-mobile.png'))
 page.set_viewport_size({'width':1440,'height':1000});page.locator('#branch-map' if page.locator('#branch-map').count() else '.branch-map').scroll_into_view_if_needed();page.screenshot(path=str(artifacts/'branches-desktop.png'))
 page.get_by_role('button',name='Preparar uso offline').click();expect(page.locator('#offline-status')).to_contain_text('pronto para uso offline',timeout=90000)
 page.reload(wait_until='networkidle');page.wait_for_function('navigator.serviceWorker.controller !== null');context.set_offline(True);page.reload(wait_until='networkidle')
 expect(page.locator('.digi-card')).to_have_count(66);page.locator('#personal-list').select_option(target);expect(page.locator('#personal-records')).to_contain_text('Agumon')
 page.get_by_role('button',name='Selecionar Magnamon',exact=True).click();page.wait_for_function("document.querySelector('#partner-image').complete && document.querySelector('#partner-image').naturalWidth>0")
 assert not errors,errors
 browser.close();print(json.dumps({'status':'passed','catalog':66,'backup':True,'offline':True,'errors':errors,'artifacts':str(artifacts)},ensure_ascii=False))

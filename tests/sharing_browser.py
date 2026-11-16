from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True);page=browser.new_page()
 page.goto('http://127.0.0.1:4173',wait_until='networkidle')
 page.locator('#map-tab').focus();page.keyboard.press('ArrowRight')
 expect(page.locator('#compare-panel')).to_be_visible()
 assert 'view=compare' in page.url,'A aba selecionada pelo teclado deve ser compartilhável'
 page.evaluate("history.pushState(null, '', '?q=agumon'); dispatchEvent(new PopStateEvent('popstate'))")
 expect(page.locator('#map-panel')).to_be_visible()
 expect(page.locator('#compare-panel')).not_to_be_visible()
 expect(page.locator('#search')).to_have_value('agumon')
 page.locator('#favorites-nav').click()
 assert 'favorites=1' in page.url
 page.reload(wait_until='networkidle')
 expect(page.locator('#favorites-nav')).to_have_attribute('aria-pressed','true')
 page.locator('#explore-nav').click();assert 'favorites=1' not in page.url
 browser.close();print('Abas por teclado e restauração de URL verificadas.')

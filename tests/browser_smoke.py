"""Validação opcional: pip install playwright; playwright install chromium.

Inicie npm run dev ou npm run preview e execute python tests/browser_smoke.py.
As capturas são salvas na pasta temporária do sistema.
"""
import json
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

artifacts = Path(tempfile.mkdtemp(prefix="digidex-qa-"))
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto("http://127.0.0.1:4173", wait_until="networkidle")
    page.evaluate("document.fonts.ready")
    assert page.evaluate("document.fonts.check('30px DigimonBasic')"), "Fonte temática não carregou"
    expect(page.locator(".digi-card")).to_have_count(66)
    expect(page.locator("#partner-name")).to_have_text("Agumon")
    page.get_by_role("button", name="Selecionar Gabumon", exact=True).click()
    expect(page.locator("#partner-name")).to_have_text("Gabumon")
    expect(page.locator("#partner-image")).to_have_attribute("src", "./assets/digimon/standard/gabumon.png")
    expect(page.locator("#partner-element")).to_have_text("Reptile")
    page.get_by_role("button", name="Próximo parceiro").click()
    expect(page.locator("#partner-name")).to_have_text("WarGreymon")
    page.get_by_role("button", name="Abrir ficha de WarGreymon", exact=True).click()
    expect(page.locator("#detail-name")).to_have_text("WarGreymon")
    page.keyboard.press("Escape")
    page.wait_for_function("document.body.style.overflow === ''")
    page.get_by_role("button", name="Selecionar Agumon", exact=True).click()
    page.get_by_role("button", name="Salvar parceiro nos favoritos", exact=True).click()
    expect(page.get_by_role("button", name="Remover Agumon dos favoritos", exact=True)).to_have_attribute("aria-pressed", "true")
    page.get_by_role("button", name="Remover parceiro dos favoritos", exact=True).click()
    expect(page.locator("#favorite-count")).to_have_text("0")
    page.locator("img").evaluate_all("images => images.forEach(i => i.loading = 'eager')")
    page.wait_for_function("[...document.images].every(i => i.complete && i.naturalWidth > 0)")
    page.screenshot(path=str(artifacts / "desktop.png"), full_page=True)
    page.get_by_label("Estágio", exact=True).select_option("Rookie", timeout=1500)
    expect(page.locator(".digi-card")).to_have_count(14)
    page.get_by_role("button", name="Limpar busca e filtros").click()

    page.get_by_label("Buscar Digimon", exact=True).fill("  ÁGUMON ")
    expect(page.locator(".digi-card")).to_have_count(1)
    page.get_by_label("Estágio", exact=True).select_option("Mega")
    expect(page.locator("#empty-state")).to_be_visible()
    page.get_by_role("button", name="Limpar busca e filtros").click()
    expect(page.locator(".digi-card")).to_have_count(66)
    page.get_by_label("Estágio", exact=True).select_option("Mega")
    page.get_by_label("Atributo", exact=True).select_option("Vaccine")
    assert page.locator(".digi-card").count() > 0
    page.get_by_role("button", name="Limpar busca e filtros").click()
    expect(page.locator(".digi-card")).to_have_count(66)

    page.get_by_role("button", name="Adicionar Agumon aos favoritos").click()
    page.reload(wait_until="networkidle")
    expect(page.get_by_role("button", name="Remover Agumon dos favoritos")).to_have_attribute("aria-pressed", "true")
    page.locator("#favorites-nav").click()
    expect(page.locator(".digi-card")).to_have_count(1)
    page.get_by_role("button", name="Remover Agumon dos favoritos").click()
    expect(page.get_by_text("Sua coleção começa com uma estrela.")).to_be_visible()
    page.get_by_role("button", name="Explorar o catálogo").click()
    expect(page.locator(".digi-card")).to_have_count(66)

    page.get_by_role("link", name="Ver ficha de WarGreymon", exact=True).click()
    expect(page.get_by_role("dialog")).to_be_visible()
    expect(page.locator("#detail-name")).to_have_text("WarGreymon")
    assert page.locator(".attack-list li").count() > 0
    page.get_by_role("button", name="Explorar Greymon", exact=True).click()
    expect(page.locator("#detail-name")).to_have_text("Greymon")
    page.get_by_role("button", name="Explorar WarGreymon", exact=True).click()
    page.get_by_role("button", name="Salvar favorito").click()
    expect(page.get_by_role("button", name="Salvo nos favoritos")).to_have_attribute("aria-pressed", "true")
    page.screenshot(path=str(artifacts / "detail.png"))
    page.keyboard.press("Escape")
    expect(page.get_by_role("dialog")).not_to_be_visible()
    page.wait_for_function("document.body.style.overflow === ''")
    expect(page.get_by_role("link", name="Ver ficha de WarGreymon", exact=True)).to_be_focused()
    page.goto("http://127.0.0.1:4173/#digimon/metalgarurumon", wait_until="networkidle")
    expect(page.locator("#detail-name")).to_have_text("MetalGarurumon")
    page.get_by_role("button", name="Fechar ficha").click()
    page.get_by_role("button", name="Surpreenda-me").click()
    expect(page.get_by_role("dialog")).to_be_visible()
    page.get_by_role("button", name="Fechar ficha").click()

    for width in [320, 390, 768, 1024, 1440]:
        page.set_viewport_size({"width": width, "height": 844})
        page.goto("http://127.0.0.1:4173", wait_until="networkidle")
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), f"Overflow at {width}"
        for name in ["Gabumon", "WarGreymon", "MetalGarurumon", "Omegamon", "Agumon"]:
            page.get_by_role("button", name=f"Selecionar {name}", exact=True).click()
            expect(page.locator("#partner-name")).to_have_text(name)
            assert page.locator("#partner-name").evaluate("el => el.scrollWidth <= el.clientWidth"), f"Nome cortado: {name} em {width}"
        if width == 390:
            page.screenshot(path=str(artifacts / "mobile.png"), full_page=True)
        page.get_by_role("button", name="Abrir ficha de Agumon", exact=True).click()
        assert page.locator("#detail-dialog").evaluate("el => el.scrollWidth <= el.clientWidth"), f"Dialog overflow at {width}"
        if width == 390:
            page.screenshot(path=str(artifacts / "mobile-detail.png"))
        page.keyboard.press("Escape")

    # Dado inválido não deve impedir a consulta.
    page.evaluate("localStorage.setItem('digidex:favorites:v1', '{broken')")
    page.reload(wait_until="networkidle")
    expect(page.locator("#favorite-count")).to_have_text("0")
    expect(page.locator(".digi-card")).to_have_count(66)

    # Armazenamento bloqueado preserva o uso da sessão e informa a limitação.
    blocked = browser.new_context()
    blocked.add_init_script("Object.defineProperty(window, 'localStorage', {get() {throw new Error('blocked')}})")
    blocked_page = blocked.new_page()
    blocked_page.goto("http://127.0.0.1:4173", wait_until="networkidle")
    blocked_page.get_by_role("button", name="Adicionar Agumon aos favoritos").click()
    expect(blocked_page.locator("#favorite-count")).to_have_text("1")
    expect(blocked_page.locator("#toast")).to_contain_text("não permitiu salvar")
    blocked.close()
    missing_art = browser.new_context()
    missing_art.route("**/assets/digimon/standard/agumon.png", lambda route: route.abort())
    missing_page = missing_art.new_page()
    missing_page.goto("http://127.0.0.1:4173", wait_until="networkidle")
    missing_page.get_by_role("button", name="Selecionar Gabumon", exact=True).click()
    expect(missing_page.locator("#partner-image")).to_be_visible()
    expect(missing_page.locator("#partner-image")).to_have_attribute("src", "./assets/digimon/standard/gabumon.png")
    expect(missing_page.locator("#partner-element")).to_have_text("Reptile")
    missing_art.close()
    assert not errors, errors
    browser.close()
    print(json.dumps({"status": "passed", "widths": [320, 390, 768, 1024, 1440], "page_errors": errors, "artifacts": str(artifacts)}, ensure_ascii=False))

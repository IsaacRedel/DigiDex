# DigiDex — Terminal Adventure

[![Checks](https://github.com/IsaacRedel/DigiDex/actions/workflows/checks.yml/badge.svg)](https://github.com/IsaacRedel/DigiDex/actions/workflows/checks.yml)

Catálogo web de **66 Digimon** com mapa de evoluções, busca de caminhos, comparador e listas pessoais. Funciona offline e pode ser instalado como app.

## ✨ Destaques

- **Mapa de evoluções:** ramificações normais, Armor, Jogress e mudanças de modo, com busca de caminho entre duas formas.
- **Arquivo:** busca por nome, alias e características, com filtros por coleção (Adventure, Adventure 02 e Tamers), estágio e atributo, além de favoritos.
- **Comparador:** dois parceiros lado a lado. Filtros e comparações ficam na URL e podem ser compartilhados.
- **Arquivo pessoal:** até 20 listas, progresso de fichas exploradas e backup em JSON com validação na importação.
- **Descoberta:** quiz com artes, silhuetas e pistas.
- **Offline e instalável (PWA):** um service worker guarda os arquivos do build para uso sem internet.

## 🚀 Como rodar

Node.js 22 ou superior, sem dependências npm:

```bash
npm run dev       # desenvolvimento em http://127.0.0.1:4173
npm test          # testes
npm run build     # gera dist/, o site estático para hospedagem
npm run preview   # testa o build e o modo offline
```

Encerre o `dev` antes de iniciar o `preview`. Em produção, o modo offline exige HTTPS.

## 🧪 Testes

- **`npm test`:** cobre busca, filtros, comparação, grafo de evoluções, backup e quiz.
- **`npm run check`:** testes, validação de imagens e build.
- **`npm run test:browser`:** quatro roteiros Chromium, incluindo teclado, backup e recarga offline, em larguras de 320 a 1440 px. Inicia e encerra seu próprio preview.
- **GitHub Actions:** executa os checks em cada push e pull request. [Preparação e detalhes](docs/webp-and-checks.md).

## 🛠️ Stack

JavaScript puro (sem frameworks nem dependências), HTML, CSS e Service Worker. Scripts de manutenção e testes de navegador em Python.

<details>
<summary><b>Estrutura do código</b></summary>

- `web/data.js`: os 66 registros, coleções, aliases, resumos, técnicas e URLs de origem.
- `web/evolutions.js`, `web/graph.js` e `web/experience-model.js`: caminhos, relações e busca de caminhos.
- `web/app.js` e `web/terminal.js`: arquivo, ficha, favoritos e navegação.
- `web/exploration.js` e `web/exploration-model.js`: mapa e comparação.
- `web/personal.js`: listas, backup, progresso e descoberta.
- `web/sharing.js`: estado na URL.
- `web/techniques.js`: explicações das técnicas.
- `web/offline.js`, `web/sw.js` e `web/manifest.webmanifest`: modo offline e instalação.
- `scripts/`: importação editorial e auditoria das artes (não são executados pelo site).

</details>

<details>
<summary><b>Dados e artes</b></summary>

- Classificações e técnicas vêm da Digimon Encyclopedia oficial. Os perfis em português são resumos editoriais, e os nomes dos ataques seguem a fonte em inglês.
- As linhas de evolução são recortes editoriais (Adventure 2020, Adventure 02 e Tamers), não todas as variantes possíveis.
- As 66 artes usam WebP em três tamanhos. O conjunto passou de 74,6 MiB para 13,6 MiB (−81,72%), incluindo todas as variantes. As fontes originais foram preservadas. [Relatório](docs/image-optimization.json).
- 50 artes são reilustrações assistidas por IA a partir das referências oficiais, não artes oficiais. Cada registro guarda a referência (`artSource`), o processamento (`artProcessing`) e o arquivo anterior (`originalArtImage`). O inventário fica em `docs/art-standardization/`.
- `python tests/transparent-art.py` e `python scripts/audit-standard-art.py` conferem transparência, resolução e enquadramento das artes.

</details>

## 📜 Créditos

Projeto de fã, sem afiliação oficial. Os materiais pertencem aos respectivos titulares.

- Artes e fichas: [Digimon Encyclopedia](https://digimon.net/reference_en/)
- Conexões evolutivas: [Toei Animation — Digimon Adventure](https://www.toei-anim.co.jp/tv/digimon/character/)
- Personagens de Tamers: [Toei Animation — Digimon Tamers](https://www.toei-anim.co.jp/tv/digimon_t/chara/chara.html)
- Parceiros de Adventure 02: [Toei Animation](https://www.toei-anim.co.jp/movie/digimon-adventure/eng/character/)
- Logo: Digimon Web. Fonte Digimon Basic: Lothus Marque, baseada no trabalho de Jyx.

A lista completa de fontes está em `web/assets/credits.html`.

## 🕹️ Versão original

O app desktop original (`digidex.py`, `status.py`, imagens e música) continua preservado. Ele requer Windows e Tkinter: rode `pip install -r requirements.txt` e depois `python digidex.py` na raiz do projeto.

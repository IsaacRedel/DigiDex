# WebP e verificações automáticas

## Preparação

Node.js 22 ou superior e Python 3.12 são as versões usadas no CI. O frontend não tem dependências npm. As ferramentas Python de desenvolvimento ficam separadas das dependências do aplicativo desktop original.

```bash
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
npm run check
npm run test:browser
```

O último comando inicia e encerra seu próprio preview. Deixe a porta 4173 livre. Os quatro roteiros conferem responsividade, navegação por teclado, restauração de URL, listas, backup e recarga offline. As capturas ficam nas pastas temporárias informadas pelos testes. Instalação real em Android/iOS ainda exige validação nesses dispositivos.

## Imagens

As 66 artes são servidas em WebP, com versões de 160, 480 e 960 pixels. Catálogo, seletor, coleção e miniaturas das evoluções usam 160 pixels. Mapas, comparações e desafios usam a versão intermediária. Terminal e fichas oferecem `srcset` para escolher entre 480 e 960 pixels conforme a tela e a densidade de pixels.

`npm run images:optimize` regenera as variantes a partir de `sourceImage`, preserva os originais e grava as medidas em `docs/image-optimization.json`. Pillow redimensiona sem ampliar fontes pequenas e comprime o RGB em qualidade 88. A conversão preserva o desenho e o canal alpha; não usa reilustração.

Nesta revisão, as 66 fontes somavam 78.264.863 bytes (74,6 MiB). As 198 variantes somam 14.308.820 bytes (13,6 MiB): redução de 81,72%, incluindo os três tamanhos. Esses bytes não representam uma medição de Core Web Vitals.

O build publica somente os arquivos usados pelo site; fontes PNG/JPG/GIF e assets desktop ficam no repositório. Todas as variantes entram no pacote offline. Após uma atualização, use **Atualizar pacote offline** para substituir o pacote anterior. Em produção, o funcionamento offline exige HTTPS.

## Checks

O GitHub Actions executa os checks em cada push e pull request. O workflow fixa as revisões das ações, usa permissões de leitura e limite de 15 minutos. Ele não publica o site automaticamente e não configura proteção de branch.

- `npm test`: catálogo, lógica e integridade do build, inclusive ausência de originais e arquivos obsoletos no pacote.
- `npm run check:images`: formato, dimensões, transparência, igualdade do canal alpha em relação à fonte redimensionada e orçamento de 15 MiB para as 198 variantes.
- `npm run build`: pacote estático e lista de arquivos offline com hash do conteúdo.
- `npm run test:browser`: quatro roteiros Playwright/Chromium, com preview iniciado e encerrado pelo próprio comando.

Ao ampliar o catálogo, reavalie o orçamento de imagens e regenere as variantes antes de executar os checks. Scripts editoriais antigos representam etapas anteriores e não devem ser executados indiscriminadamente.

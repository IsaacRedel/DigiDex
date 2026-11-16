# DigiDex — Terminal Adventure

Catálogo responsivo com **66 Digimon**, mapa com ramificações, busca de caminhos, comparador, listas pessoais, desafios e pacote offline. Classificações e técnicas vêm da Digimon Encyclopedia oficial; as artes transparentes têm sua própria fonte por registro. Os perfis em português são resumos editoriais; os nomes dos ataques seguem a fonte em inglês.

[Prévia no Sites](https://digidex-isaac-web.workspace-322786.chatgpt.site) — acesso privado. Para explorar sem acesso à prévia, execute o projeto localmente com as instruções abaixo.

## Executar

Node.js 22 ou superior, sem dependências npm:

```bash
npm run dev
npm test
npm run build
npm run preview
```

Servidor local: http://127.0.0.1:4173. Encerre o desenvolvimento antes de iniciar o preview. `dist/` é o pacote estático para hospedagem.

## Explorar

Selecione parceiros no terminal ou use os comandos anterior/próximo. A ficha completa mostra o perfil, tipo, atributo, técnicas e conexões evolutivas. Os oito caminhos usam o recorte de **Adventure (2020)**, com fonte na página oficial de personagens da Toei. O mapa apresenta as formas principais cadastradas, não todas as variantes nem todos os caminhos possíveis. A fusão WarGreymon + MetalGarurumon é exibida separadamente.

O arquivo oferece busca por nomes, aliases e características, filtros combinados por coleção, estágio e atributo, ordenação e favoritos. Exemplo de consulta: `Mega de atributo Dados`. As coleções incluem 32 registros de Adventure, 12 de Tamers e 22 de Adventure 02. O recorte de 02 inclui as formas normais dos quatro novos parceiros, nove formas Armor, três fusões Jogress e Imperialdramon nos modos Dragon e Fighter. Não é uma lista de todas as criaturas que aparecem na série. As linhas são recortes editoriais, não regras universais de evolução.

O modo Evoluções permite selecionar coleção e linha, ajustar a escala e abrir fichas pelos nós. A área de ramificações mostra transformações normais, Armor, Jogress e mudanças de modo, com os Digiovos e participantes necessários. A busca de caminho é dirigida e restrita ao contexto selecionado. Um ramo que chega a uma fusão não dispensa os outros participantes, explicitados em cada etapa.

O modo Comparar mostra dois parceiros, permite trocar os lados e confronta estágio, atributo, tipo, coleção, perfil e técnicas. A comparação é descritiva: não inventa barras de poder. Filtros e comparação são mantidos na URL e podem ser compartilhados. As fichas explicam a diferença entre termos japoneses e ingleses dos estágios e o significado contextual dos atributos.

O filtro Favoritos também é restaurado pela URL, mas usa os favoritos locais de quem abre o link. Para transferir os parceiros de uma coleção pessoal, use a exportação/importação do backup.

As 113 técnicas podem ser expandidas para consultar um trecho curto da fonte em inglês, além de explicações em português onde cadastradas. Cada técnica mantém o link da ficha oficial. Nomes localizados e variantes de escrita ficam separados do nome principal; detalhes de perfil selecionados possuem referência explícita.

## Arquivo pessoal e descoberta

Crie até 20 listas com nomes de até 60 caracteres, adicione parceiros pela ficha e acompanhe a contagem de fichas exploradas. “Meu time” e “Quero conhecer” são listas iniciais. Para renomear, digite o nome no campo de texto e acione “Renomear lista”. Uma lista só pode ser excluída depois de ficar vazia.

O backup JSON exporta listas, progresso e favoritos. A importação aceita até 2 MB, valida a versão e a estrutura, descarta IDs desconhecidos e incorpora os registros sem apagar as listas existentes. Listas com o mesmo ID são unidas; nomes existentes são preservados. Se a união ultrapassar 20 listas, o arquivo é rejeitado. Os dados ficam locais ao navegador; armazenamento bloqueado permite uso durante a sessão, com mensagens quando não for possível persistir. Exporte para preservar a coleção.

O modo Descoberta oferece reconhecimento de arte, silhuetas e pistas. Cada rodada tem quatro opções distintas, uma resposta, revelação após a escolha e acesso à ficha. A pontuação é da sessão, enquanto as fichas efetivamente abertas entram no progresso persistente. As pistas usam dados do próprio catálogo.

Os favoritos usam a mesma chave da versão anterior e preservam os IDs existentes. São locais ao navegador e à origem. Armazenamento bloqueado permite uso durante a sessão.

## Instalação e pacote offline

Execute o build e use `npm run preview` para testar o pacote offline. Em produção, o site precisa de HTTPS. Clique em **Preparar uso offline**, aguarde a confirmação e mantenha o dispositivo conectado durante o download. A aplicação armazena somente os arquivos estáticos listados pelo build; fontes externas não estão disponíveis sem rede. O navegador pode remover o cache quando precisar de espaço.

O manifest fornece instalação em navegadores compatíveis. Quando o navegador disponibiliza o evento de instalação, aparece o botão **Instalar DigiDex**. Em outros navegadores, use o menu de instalação ou a opção de adicionar à tela inicial. A instalação no celular depende do navegador e não é comprovada apenas pelo teste em desktop.

O pacote é local ao dispositivo: depois do download, o conteúdo estático pode ser consultado offline mesmo sem uma sessão online ativa. As restrições do Site privado continuam sendo aplicadas ao acesso pela rede. O service worker recusa redirecionamentos e respostas HTML de login ao preparar o pacote; não guarda credenciais. Após uma atualização do site, clique em **Atualizar pacote offline** para baixar a nova versão. A troca de cache ocorre apenas após a conclusão de todos os arquivos.

## Dados e manutenção

- `web/data.js`: 66 registros, coleções, aliases, resumos, técnicas e URLs de origem.
- `web/evolutions.js`: caminhos e fonte contextual.
- `web/terminal.js`: seleção e atualização do terminal.
- `web/app.js`: arquivo, ficha, favoritos e navegação.
- `web/exploration.js` e `web/exploration-model.js`: mapa, comparação e explicações.
- `web/experience-model.js` e `web/graph.js`: relações, requisitos e busca de caminhos.
- `web/personal.js`: listas, backup, progresso e descoberta.
- `web/sharing.js`: serialização e restauração dos filtros e da comparação pela URL.
- `web/techniques.js`: explicações e detalhes editoriais com fonte nas fichas.
- `web/offline.js`, `web/sw.js` e `web/manifest.webmanifest`: download, cache estático e instalação.
- `web/assets/digimon/`: artes usadas em PNG ou GIF transparente, além dos originais preservados.
- `scripts/expand-collections.py`: importação editorial dos 16 novos registros e artes transparentes da Toei.
- `scripts/import-official.py`: importação editorial pontual com lista explícita; requer Python e rede, não é executada pelo site. Alterações editoriais posteriores devem ser revisadas antes de reimportar.

A classificação por tipo substitui os antigos elementos e famílias sem fonte uniforme. As descrições anteriores eram genéricas; as novas resumem características documentadas. A numeração é interna. Todos os assets são locais durante o uso do site, que não depende de API.

## Verificação

`npm test` valida integridade, busca, favoritos, comparação, coleções, requisitos do grafo, caminhos, backup e opções do quiz. Com o preview ativo, execute `python tests/browser_smoke.py`, `python tests/exploration_browser.py` e `python tests/experience_browser.py`. Os roteiros usam Chromium e larguras de 320, 390, 768, 1024 e 1440 pixels; verificam persistência, exportação/importação, restauração de URL, mapa, quiz e recarga offline. Requerem Playwright instalado. As capturas ficam nas pastas temporárias informadas pelos testes. Instalação real em Android/iOS ainda exige validação nesses dispositivos.

## Créditos

### Artes transparentes

O catálogo usa 50 artes reprocessadas por ImageGen com base nas referências da Digimon Encyclopedia, seguindo o acabamento do Imperialdramon: contornos definidos, sombreamento suave, maior resolução e fundo transparente. Os arquivos ficam em `web/assets/digimon/standard/`. São reilustrações assistidas por IA e podem apresentar diferenças nos detalhes; não são novas artes oficiais. Cada registro identifica a referência em `artSource`, o processamento em `artProcessing` e o arquivo anterior em `originalArtImage`. As fontes dos dados e das conexões evolutivas são independentes das ilustrações.

Execute `python tests/transparent-art.py` para verificar se as 66 imagens usadas têm áreas transparentes e corpo opaco ou praticamente opaco. Execute `python scripts/audit-standard-art.py` para conferir resolução, alpha e ocupação do quadro das 50 substituições. A revisão visual é preparada por `python scripts/review-standard-art.py`, com Chromium via Playwright. Os scripts não editam pixels. O inventário e as referências estão em `docs/art-standardization/`. Os scripts de importação e revisão registram etapas editoriais; não são executados pelo site. Uma nova importação deve preservar as artes, aliases e registros selecionados; os scripts antigos não devem ser executados indiscriminadamente.

Os 18 registros da expansão de Adventure 02 mantêm as ilustrações originais em `*-original.jpg`. Dezesseis preservam as versões transparentes anteriores, incluindo o Imperialdramon; Aquilamon e Submarimon entram no novo conjunto padronizado. Os campos `artScale` e `artPosition` permitem ajustar o enquadramento sem alterar os pixels.

O acervo anterior foi preservado: artes de Adventure tri., Omegamon do projeto original, 12 assets de Tamers das páginas oficiais de personagens de `https://www.toei-anim.co.jp/tv/digimon_t/chara/chara.html` e quatro parceiros iniciais de 02 de `https://www.toei-anim.co.jp/movie/digimon-adventure/eng/character/`. As novas versões usam referências oficiais registradas no inventário; o ganho de definição vem de reilustração, não de mera ampliação dos arquivos antigos.

Projeto de fã, sem afiliação oficial. Logo: Digimon Web. Fonte Digimon Basic: Lothus Marque, baseada no trabalho de Jyx; fonte de fã. Artes e fichas: https://digimon.net/reference_en/. Conexões: https://www.toei-anim.co.jp/tv/digimon/character/. A página `web/assets/credits.html` registra as fontes. Os materiais pertencem aos respectivos titulares.

O aplicativo desktop original (`digidex.py`, `status.py`, imagens e música) permanece preservado. Requer Windows, Tkinter e `pip install -r requirements.txt`; execute `python digidex.py` na raiz do projeto.

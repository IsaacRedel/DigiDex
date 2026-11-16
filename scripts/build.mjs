import { mkdir, cp, readdir, writeFile, readFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { digimon } from '../web/data.js';
const root = new URL('../', import.meta.url);
const modules = [
  './index.html', './styles.css', './app.js', './catalog.js', './data.js',
  './art.js', './terminal.js', './evolutions.js', './exploration.js',
  './exploration-model.js', './offline.js', './favicon.svg',
  './manifest.webmanifest', './exploration.css', './experience-model.js',
  './personal.js', './graph.js', './sharing.js', './techniques.js',
  './experience.css', './assets/digimon-basic.woff2',
  './assets/digimon-logo.png', './assets/app-icon-192.png', './assets/app-icon-512.png',
];
export async function buildSite(output = new URL('dist/', root)) {
  // O destino é a pasta gerada do projeto ou um diretório temporário dos testes.
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const file of await readdir(new URL('web/', root))) {
    await cp(new URL(`web/${file}`, root), new URL(file, output), {
      recursive: true,
      filter: source => !/[\\/]assets[\\/]digimon(?:[\\/]|$)/.test(source),
    });
  }
  const art = [...new Set(digimon.flatMap(d => Object.values(d.imageVariants)))];
  for (const file of art) {
    const target = new URL(file, output);
    await mkdir(new URL('./', target), { recursive: true });
    await cp(new URL(`web/${file}`, root), target);
  }
  const files = [...modules, ...art.map(path => './' + path)];
  const hash = createHash('sha256');
  for (const file of files) hash.update(await readFile(new URL(file, output)));
  await writeFile(new URL('offline-assets.json', output), JSON.stringify({ version: hash.digest('hex').slice(0, 16), files }));
  console.log('Build concluído: variantes WebP e pacote offline; originais preservados no repositório.');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildSite();

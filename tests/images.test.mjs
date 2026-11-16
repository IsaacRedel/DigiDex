import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { digimon } from '../web/data.js';
import { renderEvolution } from '../web/evolutions.js';

test('as evoluções dentro das fichas usam miniaturas', () => {
  const catalog = digimon.map(d => ({ ...d, image: 'large.webp', imageVariants: { thumbnail: 'tiny.webp' } }));
  const html = renderEvolution('agumon', catalog);
  assert.equal((html.match(/src="\.\/tiny\.webp"/g) || []).length, 4);
  assert.ok(!html.includes('large.webp'));
});

test('todas as artes oferecem variantes WebP e preservam a fonte original', async () => {
  for (const d of digimon) {
    assert.ok(d.sourceImage, `${d.id}: fonte preservada`);
    assert.equal(d.image, d.imageVariants?.large, `${d.id}: imagem principal`);
    for (const size of ['thumbnail', 'medium', 'large']) {
      assert.match(d.imageVariants?.[size] || '', /\.webp$/);
      await access(new URL(`../web/${d.imageVariants[size]}`, import.meta.url));
    }
    await access(new URL(`../web/${d.sourceImage}`, import.meta.url));
  }
});

test('o build inclui variantes offline e exclui originais e arquivos obsoletos', async () => {
  const { buildSite } = await import('../scripts/build.mjs');
  assert.equal(typeof buildSite, 'function');
  const temporary = await mkdtemp(join(tmpdir(), 'digidex-build-'));
  const output = pathToFileURL(temporary + '/');
  try {
    await writeFile(new URL('stale.txt', output), 'old');
    await buildSite(output);
    const offline = JSON.parse(await readFile(new URL('offline-assets.json', output), 'utf8'));
    assert.equal(new Set(offline.files).size, offline.files.length);
    for (const d of digimon) {
      for (const path of Object.values(d.imageVariants)) {
        assert.ok(offline.files.includes('./' + path));
        await access(new URL(path, output));
      }
      await assert.rejects(access(new URL(d.sourceImage, output)));
    }
    await assert.rejects(access(new URL('stale.txt', output)));
    await assert.rejects(access(new URL('images/', output)));
    await access(new URL('assets/digimon-logo.png', output));
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});

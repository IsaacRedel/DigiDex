import test from 'node:test';
import assert from 'node:assert/strict';
import {digimon} from '../web/data.js';
import {evolutionLines, relatedLines, renderEvolution} from '../web/evolutions.js';
test('as oito linhas usam registros existentes e não repetem etapas',()=>{
  assert.equal(evolutionLines.length,8);
  for(const line of evolutionLines){assert.equal(new Set(line).size,line.length); for(const id of line) assert.ok(digimon.some(d=>d.id===id),id);}
});
test('navegação inclui o contexto e a fusão sem inventar uma evolução linear',()=>{
  assert.deepEqual(relatedLines('agumon')[0],['agumon','greymon','metalgreymon','wargreymon']);
  assert.match(renderEvolution('omegamon',digimon),/Fusão/);
  assert.match(renderEvolution('agumon',digimon),/Adventure \(2020\)/);
});

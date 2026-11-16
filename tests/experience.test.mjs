import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeLibrary,
  mergeLibrary,
  createQuestion,
  findEvolutionPath,
  edges,
} from "../web/experience-model.js";
import { digimon } from "../web/data.js";
import { filterCatalog } from "../web/catalog.js";
test("backup valida formato, limita nomes e filtra IDs desconhecidos sem perder listas", () => {
  assert.throws(() => normalizeLibrary({ version: 99, lists: [] }, digimon));
  assert.throws(() =>
    normalizeLibrary(
      { version: 1, lists: [{ id: "a", name: "x".repeat(61), ids: [] }] },
      digimon,
    ),
  );
  const state = normalizeLibrary(
    {
      version: 1,
      lists: [
        { id: "a", name: "Meu time", ids: ["agumon", "missing", "agumon"] },
      ],
      explored: ["gabumon", "missing"],
    },
    digimon,
  );
  assert.deepEqual(state.lists[0].ids, ["agumon"]);
  assert.deepEqual(state.explored, ["gabumon"]);
  assert.equal(
    mergeLibrary(state, {
      ...state,
      lists: [{ id: "b", name: "Outro", ids: [] }],
    }).lists.length,
    2,
  );
});
test("quiz produz opções distintas com uma resposta válida", () => {
  const q = createQuestion(digimon, () => 0.5);
  assert.equal(new Set(q.options.map((d) => d.id)).size, 4);
  assert.equal(q.options.filter((d) => d.id === q.answer.id).length, 1);
});
test("grafo contextual preserva requisitos das fusões e encontra caminhos dirigidos", () => {
  assert.deepEqual(edges.find((e) => e.to === "paildramon").from, [
    "exveemon",
    "stingmon",
  ]);
  assert.ok(
    findEvolutionPath("veemon", "imperialdramonfm", "02").some(
      (e) => e.kind === "jogress",
    ),
  );
  assert.deepEqual(findEvolutionPath("imperialdramonfm", "veemon", "02"), []);
  assert.deepEqual(findEvolutionPath("veemon", "paildramon", "tamers"), []);
});
test("caminhos exibidos de Adventure 02 também existem no modelo de busca", () => {
  assert.equal(findEvolutionPath("patamon", "magnaangemon", "02").length, 2);
});
test("busca aceita aliases e características em português", () => {
  assert.equal(filterCatalog(digimon, { query: "Omnimon" })[0].id, "omegamon");
  assert.ok(
    filterCatalog(digimon, { query: "Mega de atributo Dados" }).every(
      (d) => d.level === "Mega" && d.attribute === "Data",
    ),
  );
  assert.ok(
    filterCatalog(digimon, { query: "Mega de atributo Dados" }).length > 0,
  );
});
test("todas as conexões usam registros e fontes existentes; fusões declaram participantes", () => {
  const known = new Set(digimon.map((d) => d.id));
  for (const edge of edges) {
    assert.ok(known.has(edge.to));
    assert.ok(edge.from.every((id) => known.has(id)));
    assert.match(edge.source, /^https:\/\//);
    if (["fusion", "jogress"].includes(edge.kind))
      assert.ok(edge.from.length >= 2);
  }
  assert.ok(
    digimon.every((d) =>
      d.attacks.every((name) =>
        d.attackDetails.some(
          (a) => a.name === name && a.originalExcerpt && a.source === d.source,
        ),
      ),
    ),
  );
});

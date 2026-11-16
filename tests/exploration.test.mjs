import test from "node:test";
import assert from "node:assert/strict";
import { digimon } from "../web/data.js";
import { filterCatalog } from "../web/catalog.js";
import { comparisonRows, collectionLabels } from "../web/exploration-model.js";
test("filtro por coleção combina com busca e estágio", () => {
  assert.equal(filterCatalog(digimon, { collection: "tamers" }).length, 12);
  assert.equal(
    filterCatalog(digimon, {
      collection: "02",
      query: "veemon",
      level: "Rookie",
    })[0].id,
    "veemon",
  );
  assert.equal(
    filterCatalog(digimon, { collection: "adventure", query: "guilmon" })
      .length,
    0,
  );
});
test("comparação preserva colunas e usa dados descritivos", () => {
  const pair = [
    digimon.find((d) => d.id === "agumon"),
    digimon.find((d) => d.id === "gabumon"),
  ];
  const rows = comparisonRows(pair);
  assert.deepEqual(rows.find((r) => r.label === "Atributo").values, [
    "Vacina",
    "Dados",
  ]);
  assert.equal(collectionLabels.tamers, "Tamers");
  assert.ok(rows.every((row) => row.values.length === 2));
});

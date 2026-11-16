import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { digimon } from "../web/data.js";
import {
  filterCatalog,
  readFavorites,
  saveFavorites,
  toggleFavorite,
} from "../web/catalog.js";

test("o catálogo contém 66 IDs únicos, fontes e imagens existentes", async () => {
  assert.equal(digimon.length, 66);
  assert.equal(new Set(digimon.map((d) => d.id)).size, 66);
  for (const d of digimon) {
    assert.ok(
      d.name && d.japaneseName && d.attacks.length && d.families.length,
    );
    assert.ok(d.source.startsWith('https://digimon.net/'));
    await access(new URL(`../web/${d.image}`, import.meta.url));
  }
});

test("a busca aceita caixa, espaços, acentos e nome japonês", () => {
  assert.equal(filterCatalog(digimon, { query: "  ÁGUMON " })[0].id, "agumon");
  assert.equal(filterCatalog(digimon, { query: "ガブモン" })[0].id, "gabumon");
});

test("nome alternativo encontra o cadastro original", () => {
  assert.equal(
    filterCatalog(digimon, { query: "Metal Garurumon" })[0].id,
    "metalgarurumon",
  );
});

test("busca, estágio, atributo e favoritos combinam sem alterar os dados", () => {
  const ids = digimon.map((d) => d.id);
  assert.deepEqual(
    filterCatalog(digimon, {
      level: "Mega",
      attribute: "Vaccine",
      favoritesOnly: true,
      favorites: ["omegamon"],
    }).map((d) => d.id),
    ["omegamon"],
  );
  assert.equal(
    filterCatalog(digimon, { query: "agumon", level: "Mega" }).length,
    0,
  );
  filterCatalog(digimon, { sort: "name" });
  assert.deepEqual(
    digimon.map((d) => d.id),
    ids,
  );
});

test("favoritos inválidos são recuperados e IDs desconhecidos são descartados", () => {
  const storage = (value) => ({ getItem: () => value });
  assert.deepEqual(readFavorites(storage("{oops"), digimon), []);
  assert.deepEqual(readFavorites(storage("{}"), digimon), []);
  assert.deepEqual(
    readFavorites(storage('["agumon","agumon","missing",2]'), digimon),
    ["agumon"],
  );
  assert.deepEqual(
    readFavorites(
      {
        getItem() {
          throw Error("blocked");
        },
      },
      digimon,
    ),
    [],
  );
});

test("favoritos alternam sem mutar a coleção e são persistidos", () => {
  const original = ["agumon"];
  assert.deepEqual(toggleFavorite(original, "agumon"), []);
  const added = toggleFavorite(original, "gabumon");
  assert.deepEqual(added, ["agumon", "gabumon"]);
  assert.deepEqual(original, ["agumon"]);
  const storage = {
    setItem(key, value) {
      this.value = value;
    },
    getItem() {
      return this.value;
    },
  };
  assert.equal(saveFavorites(storage, added), true);
  assert.deepEqual(readFavorites(storage, digimon), added);
  assert.equal(
    saveFavorites(
      {
        setItem() {
          throw Error("quota");
        },
      },
      added,
    ),
    false,
  );
});

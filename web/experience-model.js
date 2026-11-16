export const libraryKey = "digidex:library:v1";
export function defaultLibrary() {
  return {
    version: 1,
    lists: [
      { id: "team", name: "Meu time", ids: [] },
      { id: "discover", name: "Quero conhecer", ids: [] },
    ],
    explored: [],
  };
}
export function normalizeLibrary(value, catalog) {
  if (
    !value ||
    value.version !== 1 ||
    !Array.isArray(value.lists) ||
    value.lists.length > 20
  )
    throw Error("Formato de backup inválido ou mais de 20 listas.");
  const known = new Set(catalog.map((d) => d.id));
  const ids = (values) => {
    if (
      !Array.isArray(values) ||
      values.length > 2000 ||
      values.some((v) => typeof v !== "string")
    )
      throw Error("Lista de registros inválida.");
    return [...new Set(values.filter((id) => known.has(id)))];
  };
  const seen = new Set();
  const lists = value.lists.map((list) => {
    if (
      !list ||
      typeof list.id !== "string" ||
      !/^[a-zA-Z0-9_-]{1,80}$/.test(list.id) ||
      seen.has(list.id) ||
      typeof list.name !== "string" ||
      !list.name.trim() ||
      list.name.length > 60
    )
      throw Error("Nome ou identificador de lista inválido.");
    seen.add(list.id);
    return { id: list.id, name: list.name.trim(), ids: ids(list.ids) };
  });
  return { version: 1, lists, explored: ids(value.explored || []) };
}
export function mergeLibrary(current, incoming) {
  const lists = current.lists.map((list) => ({ ...list, ids: [...list.ids] }));
  for (const list of incoming.lists) {
    const existing = lists.find((l) => l.id === list.id);
    if (existing) existing.ids = [...new Set([...existing.ids, ...list.ids])];
    else lists.push({ ...list, ids: [...list.ids] });
  }
  if (lists.length > 20)
    throw Error("A importação ultrapassa o limite de 20 listas.");
  return {
    version: 1,
    lists,
    explored: [...new Set([...current.explored, ...incoming.explored])],
  };
}
export function createQuestion(catalog, random = Math.random, previous = "") {
  const candidates = catalog.filter((d) => d.id !== previous);
  const answer = candidates[Math.floor(random() * candidates.length)];
  const others = catalog.filter((d) => d.id !== answer.id);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const options = [answer, ...others.slice(0, 3)];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { answer, options };
}
const source02 = "https://www.toei-anim.co.jp/tv/digimon02/char-navi.htm";
export const edges = [
  ...[
    ["veemon", "exveemon"],
    ["wormmon", "stingmon"],
    ["hawkmon", "aquilamon"],
    ["armadillomon", "ankylomon"],
    ["patamon", "angemon"],
    ["angemon", "magnaangemon"],
    ["gatomon", "angewomon"],
    ["paildramon", "imperialdramon"],
  ].map(([from, to]) => ({
    from: [from],
    to,
    kind: "normal",
    collection: "02",
    requirement: "Evolução normal",
    source: source02,
  })),
  ...[
    ["veemon", "flamedramon", "da Coragem"],
    ["veemon", "raidramon", "da Amizade"],
    ["veemon", "magnamon", "dos Milagres"],
    ["hawkmon", "halsemon", "do Amor"],
    ["hawkmon", "shurimon", "da Sinceridade"],
    ["armadillomon", "digmon", "do Conhecimento"],
    ["armadillomon", "submarimon", "da Confiança"],
    ["patamon", "pegasusmon", "da Esperança"],
    ["gatomon", "nefertimon", "da Luz"],
  ].map(([from, to, egg]) => ({
    from: [from],
    to,
    kind: "armor",
    collection: "02",
    requirement: "Digiovo " + egg,
    source: source02,
  })),
  {
    from: ["exveemon", "stingmon"],
    to: "paildramon",
    kind: "jogress",
    collection: "02",
    requirement: "Jogress: ambos os parceiros são necessários",
    source:
      "https://www.toei-anim.co.jp/tv/digimon02/char-file/paildoramon.htm",
  },
  {
    from: ["aquilamon", "gatomon"],
    to: "silphymon",
    kind: "jogress",
    collection: "02",
    requirement: "Jogress: ambos os parceiros são necessários",
    source: "https://www.toei-anim.co.jp/tv/digimon02/char-file/sylphimon.htm",
  },
  {
    from: ["ankylomon", "angemon"],
    to: "shakkoumon",
    kind: "jogress",
    collection: "02",
    requirement: "Jogress: ambos os parceiros são necessários",
    source: "https://www.toei-anim.co.jp/tv/digimon02/char-file/syakkoumon.htm",
  },
  {
    from: ["imperialdramon"],
    to: "imperialdramonfm",
    kind: "mode",
    collection: "02",
    requirement: "Mudança para Fighter Mode",
    source:
      "https://digimon.net/reference_en/detail.php?directory_name=imperialdramonfightermode",
  },
  {
    from: ["wargreymon", "metalgarurumon"],
    to: "omegamon",
    kind: "fusion",
    collection: "adventure",
    requirement: "Fusão: ambos os parceiros são necessários",
    source:
      "https://www.toei-anim.co.jp/movie/digimon-adventure/tri/evolution/agumon.php",
  },
];
export function findEvolutionPath(from, to, collection, relations = edges) {
  const queue = [{ id: from, path: [] }],
    seen = new Set([from]);
  while (queue.length) {
    const item = queue.shift();
    if (item.id === to) return item.path;
    for (const edge of relations.filter(
      (e) => e.collection === collection && e.from.includes(item.id),
    )) {
      if (!seen.has(edge.to)) {
        seen.add(edge.to);
        queue.push({ id: edge.to, path: [...item.path, edge] });
      }
    }
  }
  return [];
}
const mainLines = [
  ["agumon", "greymon", "metalgreymon", "wargreymon"],
  ["gabumon", "garurumon", "weregarurumon", "metalgarurumon"],
  ["biyomon", "birdramon", "garudamon", "phoenixmon"],
  ["tentomon", "kabuterimon", "megakabuterimon", "herculeskabuterimon"],
  ["palmon", "togemon", "lillymon", "rosemon"],
  ["gomamon", "ikkakumon", "zudomon", "vikemon"],
  ["patamon", "angemon", "magnaangemon", "seraphimon"],
  ["gatomon", "angewomon", "magnadramon"],
];
for (const line of mainLines)
  for (let i = 1; i < line.length; i++)
    edges.push({
      from: [line[i - 1]],
      to: line[i],
      kind: "normal",
      collection: "adventure",
      requirement: "Forma principal em Adventure (2020)",
      source: "https://www.toei-anim.co.jp/tv/digimon/character/",
    });
for (const line of [
  ["guilmon", "growlmon", "wargrowlmon", "gallantmon"],
  ["renamon", "kyubimon", "taomon", "sakuyamon"],
  ["terriermon", "gargomon", "rapidmon", "megagargomon"],
])
  for (let i = 1; i < line.length; i++)
    edges.push({
      from: [line[i - 1]],
      to: line[i],
      kind: i === 3 ? "biomerge" : "normal",
      collection: "tamers",
      requirement:
        i === 3
          ? "A forma Mega em Tamers envolve união com o parceiro humano"
          : "Evolução principal em Tamers",
      source: "https://www.toei-anim.co.jp/tv/digimon_t/chara/chara.html",
    });

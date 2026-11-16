const FAVORITES_KEY = "digidex:favorites:v1";
const normalize = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");

export function filterCatalog(
  catalog,
  {
    query = "",
    level = "",
    attribute = "",
    favoritesOnly = false,
    favorites = [],
    sort = "number",
    collection = "",
  } = {},
) {
  const terms = normalize(query)
    .split(/\s+/)
    .filter(
      (t) =>
        t &&
        ![
          "de",
          "do",
          "da",
          "dos",
          "das",
          "e",
          "com",
          "atributo",
          "estagio",
          "tipo",
        ].includes(t),
    );
  const result = catalog.filter(
    (d) =>
      terms.every((term) =>
        ["rookie", "champion", "ultimate", "mega", "armor"].includes(term)
          ? normalize(d.level) === term
          : normalize(
              [
                d.name,
                d.japaneseName,
                ...d.aliases,
                d.level,
                d.attribute,
                {
                  Vaccine: "Vacina",
                  Data: "Dados",
                  Virus: "Vírus",
                  Free: "Livre",
                }[d.attribute],
                d.type,
                d.collection === "02" ? "Adventure 02" : d.collection,
              ].join(" "),
            ).includes(term),
      ) &&
      (!level || d.level === level) &&
      (!attribute || d.attribute === attribute) &&
      (!collection || d.collection === collection) &&
      (!favoritesOnly || favorites.includes(d.id)),
  );
  return result.sort(
    sort === "name"
      ? (a, b) => a.name.localeCompare(b.name, "pt-BR")
      : (a, b) => a.number.localeCompare(b.number),
  );
}

export function readFavorites(storage, catalog) {
  try {
    const saved = JSON.parse(storage.getItem(FAVORITES_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    const validIds = new Set(catalog.map((d) => d.id));
    return [...new Set(saved.filter((id) => validIds.has(id)))];
  } catch {
    return [];
  }
}

export function saveFavorites(storage, favorites) {
  try {
    storage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch {
    return false;
  }
}

export function toggleFavorite(favorites, id) {
  return favorites.includes(id)
    ? favorites.filter((value) => value !== id)
    : [...favorites, id];
}

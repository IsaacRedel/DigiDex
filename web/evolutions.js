import { edges } from "./experience-model.js";
import { artPath } from "./art.js";
export const evolutionSource =
  "https://www.toei-anim.co.jp/tv/digimon/character/";
export const evolutionLines = [
  ["agumon", "greymon", "metalgreymon", "wargreymon"],
  ["gabumon", "garurumon", "weregarurumon", "metalgarurumon"],
  ["biyomon", "birdramon", "garudamon", "phoenixmon"],
  ["tentomon", "kabuterimon", "megakabuterimon", "herculeskabuterimon"],
  ["palmon", "togemon", "lillymon", "rosemon"],
  ["gomamon", "ikkakumon", "zudomon", "vikemon"],
  ["patamon", "angemon", "magnaangemon", "seraphimon"],
  ["gatomon", "angewomon", "magnadramon"],
];
export function relatedLines(id) {
  return [...evolutionLines, ...tamersLines].filter((line) =>
    line.includes(id),
  );
}
export const tamersLines = [
  ["guilmon", "growlmon", "wargrowlmon", "gallantmon"],
  ["renamon", "kyubimon", "taomon", "sakuyamon"],
  ["terriermon", "gargomon", "rapidmon", "megagargomon"],
];
export function renderEvolution(id, catalog) {
  const lines = relatedLines(id);
  const fusion = ["wargreymon", "metalgarurumon", "omegamon"].includes(id);
  const record = catalog.find((d) => d.id === id);
  const context =
    record?.collection === "tamers"
      ? "Tamers · formas principais; a forma Mega envolve a união com o parceiro humano."
      : record?.collection === "02"
        ? "Adventure 02 · conexões normais, Armor, Jogress e mudança de modo. Confira os participantes e requisitos."
        : "Recorte de Adventure (2020). Outras obras podem apresentar caminhos diferentes.";
  const source =
    record?.collection === "tamers"
      ? "https://www.toei-anim.co.jp/tv/digimon_t/chara/chara.html"
      : record?.collection === "02"
        ? "https://www.toei-anim.co.jp/tv/digimon02/char-navi.htm"
        : evolutionSource;
  if (record?.collection === "02") {
    const related = edges.filter(
      (e) => e.collection === "02" && (e.from.includes(id) || e.to === id),
    );
    return `<section class="evolution-panel" aria-label="Evoluções"><h3>Conexões de Adventure 02</h3><p>${context}</p>${related.map((edge) => `<div class="detail-edge"><span>${edge.from.map((key) => `<button data-evolution="${key}" aria-label="Explorar ${catalog.find((d) => d.id === key).name}">${catalog.find((d) => d.id === key).name}</button>`).join(" + ")} → <button data-evolution="${edge.to}" aria-label="Explorar ${catalog.find((d) => d.id === edge.to).name}">${catalog.find((d) => d.id === edge.to).name}</button></span><p>${edge.requirement}</p></div>`).join("")}${!related.length ? "<p>Nenhuma conexão cadastrada neste recorte.</p>" : ""}<a href="${source}" target="_blank" rel="noopener noreferrer">Consultar fonte ↗</a></section>`;
  }
  return `<section class="evolution-panel" aria-label="Evoluções"><h3>Conexões evolutivas</h3><p>${context}</p>${lines
    .map(
      (line) =>
        `<div class="evolution-line">${line
          .map((key) => {
            const d = catalog.find((item) => item.id === key);
            return `<button data-evolution="${d.id}" aria-label="Explorar ${d.name}" aria-current="${key === id ? "true" : "false"}"><img src="${artPath(d, "thumbnail")}" alt="" loading="lazy"><strong>${d.name}</strong><span>${d.level}</span></button>`;
          })
          .join(
            '<span class="evolution-arrow" aria-hidden="true">→</span>',
          )}</div>`,
    )
    .join(
      "",
    )}${fusion ? '<p class="fusion-note">Fusão: <button data-evolution="wargreymon">WarGreymon</button> + <button data-evolution="metalgarurumon">MetalGarurumon</button> → <button data-evolution="omegamon">Omegamon</button></p>' : ""}${!lines.length && !fusion ? "<p>Nenhuma conexão cadastrada neste recorte.</p>" : ""}<a href="${source}" target="_blank" rel="noopener noreferrer">Consultar personagens e formas na Toei ↗</a></section>`;
}

import { digimon } from "./data.js";
import { evolutionLines, evolutionSource } from "./evolutions.js";
import { comparisonRows, collectionLabels } from "./exploration-model.js";
const $ = (s) => document.querySelector(s);
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const paths = [
  ...evolutionLines.map((ids, i) => ({
    id: "adventure-" + i,
    ids,
    collection: "adventure",
    name: digimon.find((d) => d.id === ids[0]).name,
    context: "Adventure (2020) · formas principais",
    source: evolutionSource,
  })),
  ...[
    ["guilmon", "growlmon", "wargrowlmon", "gallantmon"],
    ["renamon", "kyubimon", "taomon", "sakuyamon"],
    ["terriermon", "gargomon", "rapidmon", "megagargomon"],
  ].map((ids) => ({
    id: ids[0],
    ids,
    collection: "tamers",
    name: ids[0],
    context:
      "Tamers · evolução até a forma resultante da união com o parceiro humano",
    source: "https://www.toei-anim.co.jp/tv/digimon_t/chara/chara.html",
  })),
  ...[
    ["veemon", "exveemon"],
    ["wormmon", "stingmon"],
    ["hawkmon", "aquilamon"],
    ["armadillomon", "ankylomon"],
    ["paildramon", "imperialdramon", "imperialdramonfm"],
    ["patamon", "angemon", "magnaangemon"],
    ["gatomon", "angewomon"],
  ].map((ids) => ({
    id: "02-" + ids[0],
    ids,
    collection: "02",
    name: ids[0],
    context:
      "Adventure 02 · linha principal. As ramificações Armor e os requisitos de Jogress aparecem abaixo.",
    source: "https://www.toei-anim.co.jp/tv/digimon02/char-navi.htm",
  })),
];
export function setupExploration(onOpen) {
  const root = document.createElement("section");
  root.id = "exploration";
  root.className = "exploration page-width";
  root.innerHTML = `<div class="section-heading"><div><span class="section-kicker">Além da ficha</span><h2>Descubra as conexões.</h2></div></div><div class="mode-tabs" role="tablist" aria-label="Modo de exploração"><button id="map-tab" role="tab" aria-selected="true" aria-controls="map-panel">Evoluções</button><button id="compare-tab" role="tab" aria-selected="false" aria-controls="compare-panel" tabindex="-1">Comparar parceiros</button></div><section id="map-panel" role="tabpanel" aria-labelledby="map-tab"><div class="map-toolbar"><label>Coleção<select id="map-collection">${Object.entries(
    collectionLabels,
  )
    .map(([k, v]) => `<option value="${k}">${v}</option>`)
    .join(
      "",
    )}</select></label><label>Linha<select id="map-line"></select></label><label class="map-scale">Escala<input id="map-scale" type="range" min="80" max="130" value="100"><output id="scale-value">100%</output></label></div><p id="map-context"></p><div id="map-canvas" class="map-canvas" tabindex="0" aria-label="Mapa evolutivo; role horizontalmente para explorar"><div id="map-nodes" class="map-nodes"></div></div><div id="map-fusion" class="map-fusion"></div><a id="map-source" target="_blank" rel="noopener noreferrer">Consultar fonte da linha ↗</a></section><section id="compare-panel" role="tabpanel" aria-labelledby="compare-tab" hidden><p>Compare características documentadas. Estágio e atributo não são uma escala universal de poder.</p><div class="compare-selectors"><label>Primeiro parceiro<select id="compare-left"></select></label><button id="swap-comparison" class="icon-button" aria-label="Trocar parceiros de lado">⇄</button><label>Segundo parceiro<select id="compare-right"></select></label></div><div id="comparison-result"></div></section>`;
  $("#catalogo").before(root);
  function map() {
    const path = paths.find((p) => p.id === $("#map-line").value);
    if (!path) return;
    $("#map-context").textContent = path.context;
    $("#map-source").href = path.source;
    $("#map-nodes").innerHTML = path.ids
      .map((id, i) => {
        const d = digimon.find((d) => d.id === id);
        return `${i ? '<span class="map-arrow" aria-hidden="true">→</span>' : ""}<button class="map-node" data-open-map="${id}" aria-label="Abrir ${escape(d.name)}"><span class="map-stage">${d.level}</span><img src="./${d.image}" alt="" loading="lazy"><strong>${escape(d.name)}</strong><span>${escape(d.japaneseName)}</span></button>`;
      })
      .join("");
    $("#map-fusion").innerHTML =
      path.collection === "adventure" &&
      ["adventure-0", "adventure-1"].includes(path.id)
        ? `<span>Fusão</span><div>${["wargreymon", "metalgarurumon", "omegamon"].map((id, i) => `<button data-open-map="${id}">${digimon.find((d) => d.id === id).name}</button>${i === 0 ? " + " : i === 1 ? " → " : ""}`).join("")}</div><p>WarGreymon e MetalGarurumon são participantes da mesma fusão.</p>`
        : "";
    $("#map-canvas").scrollLeft = 0;
  }
  function collection() {
    const list = paths.filter(
      (p) =>
        p.collection === $("#map-collection").value &&
        p.ids.every((id) => digimon.some((d) => d.id === id)),
    );
    $("#map-line").replaceChildren(
      ...list.map(
        (p) => new Option(digimon.find((d) => d.id === p.ids[0]).name, p.id),
      ),
    );
    map();
  }
  $("#map-collection").addEventListener("change", collection);
  $("#map-line").addEventListener("change", map);
  $("#map-scale").addEventListener("input", (e) => {
    $("#map-nodes").style.setProperty(
      "--node-size",
      `${(168 * Number(e.target.value)) / 100}px`,
    );
    $("#scale-value").textContent = e.target.value + "%";
  });
  root.addEventListener("click", (e) => {
    const button = e.target.closest("[data-open-map]");
    if (button) onOpen(button.dataset.openMap);
  });
  for (const select of [$("#compare-left"), $("#compare-right")]) {
    select.replaceChildren(
      ...digimon.map(
        (d) =>
          new Option(`${d.name} · ${collectionLabels[d.collection]}`, d.id),
      ),
    );
    select.addEventListener("change", compare);
  }
  $("#compare-right").value = "gabumon";
  function compare() {
    const pair = [$("#compare-left").value, $("#compare-right").value].map(
      (id) => digimon.find((d) => d.id === id),
    );
    $("#comparison-result").innerHTML =
      `<div class="comparison-portraits">${pair.map((d) => `<button data-open-map="${d.id}"><img src="./${d.image}" alt=""><strong>${escape(d.name)}</strong><span>Abrir ficha ↗</span></button>`).join("")}</div><table class="comparison-table"><caption class="sr-only">Comparação de ${pair.map((d) => d.name).join(" e ")}</caption><thead><tr><th scope="col">Característica</th>${pair.map((d) => `<th scope="col">${escape(d.name)}</th>`).join("")}</tr></thead><tbody>${comparisonRows(
        pair,
      )
        .map(
          (row) =>
            `<tr><th scope="row">${row.label}</th>${row.values.map((v) => `<td>${escape(v)}</td>`).join("")}</tr>`,
        )
        .join("")}</tbody></table>`;
  }
  $("#swap-comparison").addEventListener("click", () => {
    const left = $("#compare-left").value;
    $("#compare-left").value = $("#compare-right").value;
    $("#compare-right").value = left;
    compare();
  });
  function tab(which) {
    for (const name of ["map", "compare"]) {
      const active = name === which;
      $(`#${name}-panel`).hidden = !active;
      $(`#${name}-tab`).setAttribute("aria-selected", String(active));
      $(`#${name}-tab`).tabIndex = active ? 0 : -1;
    }
    window.dispatchEvent(
      new CustomEvent("digidex:mode-change", { detail: which }),
    );
  }
  for (const name of ["map", "compare"]) {
    $(`#${name}-tab`).addEventListener("click", () => tab(name));
    $(`#${name}-tab`).addEventListener("keydown", (e) => {
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
        e.preventDefault();
        const target =
          e.key === "Home"
            ? "map"
            : e.key === "End"
              ? "compare"
              : name === "map"
                ? "compare"
                : "map";
        tab(target);
        $(`#${target}-tab`).focus();
      }
    });
  }
  collection();
  compare();
}

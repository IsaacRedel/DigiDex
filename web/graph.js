import { artPath } from "./art.js";
import { digimon } from "./data.js";
import { edges, findEvolutionPath } from "./experience-model.js";
const $ = (s) => document.querySelector(s);
const label = (id) => digimon.find((d) => d.id === id)?.name || id;
const kinds = {
  normal: "Normal",
  armor: "Armor",
  jogress: "Jogress",
  fusion: "Fusão",
  mode: "Mudança de modo",
  biomerge: "União com o parceiro",
};
export function setupGraph(onOpen) {
  const root = document.createElement("section");
  root.className = "branch-map";
  root.innerHTML =
    '<h3>Ramificações e requisitos</h3><p>O caminho acompanha uma origem. Fusões mostram também os outros participantes necessários; não são uma evolução individual.</p><div class="path-controls"><label>Origem<select id="path-from"></select></label><label>Destino<select id="path-to"></select></label><button id="find-path" class="button primary">Encontrar caminho</button></div><p id="path-status" role="status" aria-live="polite"></p><div id="path-result"></div><div class="path-controls"><label>Parceiro no mapa<select id="branch-origin"></select></label></div><div id="branch-connections" class="branch-connections"></div>';
  $("#map-panel").append(root);
  function options() {
    const collection = $("#map-collection").value;
    const ids = new Set(
      edges
        .filter((e) => e.collection === collection)
        .flatMap((e) => [...e.from, e.to]),
    );
    const list = digimon.filter((d) => ids.has(d.id));
    for (const id of ["path-from", "path-to", "branch-origin"]) {
      const select = $("#" + id),
        previous = select.value;
      select.replaceChildren(...list.map((d) => new Option(d.name, d.id)));
      if (list.some((d) => d.id === previous)) select.value = previous;
    }
    $("#path-to").value =
      collection === "02"
        ? "imperialdramonfm"
        : collection === "tamers"
          ? "gallantmon"
          : "omegamon";
    $("#path-status").textContent = "";
    $("#path-result").replaceChildren();
    branches();
  }
  function renderEdge(edge) {
    const div = document.createElement("article");
    div.className = "branch-edge";
    const header = document.createElement("div");
    header.className = "branch-kind";
    header.textContent = kinds[edge.kind];
    div.append(header);
    const flow = document.createElement("div");
    flow.className = "branch-flow";
    for (const [index, id] of edge.from.entries()) {
      if (index) {
        const plus = document.createElement("span");
        plus.textContent = " + ";
        flow.append(plus);
      }
      flow.append(node(id));
    }
    const arrow = document.createElement("span");
    arrow.textContent = " → ";
    flow.append(arrow, node(edge.to));
    div.append(flow);
    const note = document.createElement("p");
    note.textContent = edge.requirement;
    div.append(note);
    const source = document.createElement("a");
    source.href = edge.source;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    source.textContent = "Ver fonte ↗";
    div.append(source);
    return div;
  }
  function node(id) {
    const d = digimon.find((d) => d.id === id);
    const button = document.createElement("button");
    button.className = "branch-node";
    button.setAttribute("aria-label", "Consultar " + d.name);
    const img = document.createElement("img");
    img.src = artPath(d, "thumbnail");
    img.alt = "";
    img.loading = "lazy";
    const name = document.createElement("span");
    name.textContent = d.name;
    button.append(img, name);
    button.addEventListener("click", () => onOpen(id));
    return button;
  }
  function branches() {
    const id = $("#branch-origin").value;
    const relations = edges.filter(
      (e) =>
        e.collection === $("#map-collection").value &&
        (e.from.includes(id) || e.to === id),
    );
    $("#branch-connections").replaceChildren(...relations.map(renderEdge));
  }
  $("#map-collection").addEventListener("change", options);
  $("#branch-origin").addEventListener("change", branches);
  $("#find-path").addEventListener("click", () => {
    const from = $("#path-from").value,
      to = $("#path-to").value;
    const path = findEvolutionPath(from, to, $("#map-collection").value);
    $("#path-status").textContent =
      from === to
        ? "Origem e destino são o mesmo parceiro."
        : path.length
          ? `${path.length} transformações documentadas neste recorte. Confira os requisitos de cada etapa.`
          : "Nenhum caminho cadastrado nesta direção e neste contexto.";
    $("#path-result").replaceChildren(...path.map(renderEdge));
  });
  options();
}

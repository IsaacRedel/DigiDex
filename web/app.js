import { renderEvolution } from "./evolutions.js";
import { setupPersonal, markExplored, listControls } from "./personal.js";
import { setupGraph } from "./graph.js";
import { setupSharing } from "./sharing.js";
import { techniqueExplanation, curiosityFor } from "./techniques.js";
import { setupExploration } from "./exploration.js";
import { setupOffline } from "./offline.js";
import {
  attributeNotes,
  levelNotes,
  collectionLabels,
} from "./exploration-model.js";
import { digimon, attributeLabels } from "./data.js";
import {
  setupTerminal,
  selectPartner,
  updateTerminalFavorites,
} from "./terminal.js";
import {
  filterCatalog,
  readFavorites,
  saveFavorites,
  toggleFavorite,
} from "./catalog.js";

const $ = (selector) => document.querySelector(selector);
const star =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/></svg>';
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let storage;
try {
  storage = window.localStorage;
} catch {
  storage = null;
}
let favorites = readFavorites(storage, digimon);
let favoritesOnly = false;
let selected = null;
let returnFocus = null;
let returnFocusCard = null;
let toastTimer;
const dialog = $("#detail-dialog");

function notify(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 4200);
}

function handleImageErrors(root) {
  root.querySelectorAll("img").forEach((img) => {
    if (img.id === "partner-image") return;
    const fallback = () => {
      const replacement = document.createElement("span");
      replacement.className = "image-fallback";
      replacement.textContent = "Imagem indisponível";
      img.replaceWith(replacement);
    };
    img.addEventListener("error", fallback, { once: true });
    if (img.complete && !img.naturalWidth) fallback();
  });
}

function card(d) {
  const saved = favorites.includes(d.id);
  return `<article class="digi-card ${d.color}" aria-label="${escape(d.name)}">
    <div class="record-identity"><span class="card-number">${d.number}</span><a class="card-art" href="#digimon/${d.id}" data-open="${d.id}" aria-label="Ver ficha de ${escape(d.name)}"><img src="./${d.image}" alt="${escape(d.name)}" loading="lazy" width="64" height="64"></a><div><a class="card-title" href="#digimon/${d.id}" data-open="${d.id}">${escape(d.name)}</a><p class="card-japanese" lang="ja">${d.japaneseName}</p></div></div>
    <span class="card-level">${d.level}</span><span class="record-attribute">${attributeLabels[d.attribute]}</span><span class="record-element">${d.element}</span><div class="record-actions"><button class="favorite-button" data-favorite="${d.id}" aria-pressed="${saved}" aria-label="${saved ? "Remover" : "Adicionar"} ${escape(d.name)} ${saved ? "dos" : "aos"} favoritos">${star}</button><a class="card-arrow" href="#digimon/${d.id}" data-open="${d.id}" aria-label="Abrir ficha de ${escape(d.name)}">↗</a></div></article>`;
}

function renderCatalog() {
  const activeFavorite = document.activeElement?.dataset.favorite;
  const result = filterCatalog(digimon, {
    query: $("#search").value,
    level: $("#level").value,
    attribute: $("#attribute").value,
    sort: $("#sort").value,
    favoritesOnly,
    collection: $("#collection").value,
    favorites,
  });
  $("#catalog-grid").innerHTML = result.map(card).join("");
  $("#result-count").textContent =
    `${result.length} ${result.length === 1 ? "Digimon encontrado" : "Digimon encontrados"}${favoritesOnly ? " nos favoritos" : " no catálogo"}`;
  $("#favorite-count").textContent = favorites.length;
  $("#empty-state").hidden = result.length > 0;
  $("#catalog-title").textContent = favoritesOnly
    ? "Seus parceiros favoritos."
    : "Explore os registros.";
  const noFavorites = favoritesOnly && !favorites.length;
  $("#empty-title").textContent = noFavorites
    ? "Sua coleção começa com uma estrela."
    : "Nenhum parceiro por aqui.";
  $("#empty-description").textContent = noFavorites
    ? "Toque na estrela de um Digimon para guardar sua ficha aqui."
    : "Tente outro nome ou remova alguns filtros.";
  $("#empty-reset").textContent = noFavorites
    ? "Explorar o catálogo"
    : "Limpar filtros";
  $("#explore-nav").classList.toggle("active", !favoritesOnly);
  $("#favorites-nav").classList.toggle("active", favoritesOnly);
  $("#explore-nav").setAttribute("aria-pressed", String(!favoritesOnly));
  $("#favorites-nav").setAttribute("aria-pressed", String(favoritesOnly));
  handleImageErrors($("#catalog-grid"));
  if (activeFavorite && !dialog.open) {
    const next =
      $(`[data-favorite="${activeFavorite}"]`) ||
      $(".favorite-button") ||
      $("#empty-reset");
    next.focus({ preventScroll: true });
  }
}

function renderDetails(d) {
  const saved = favorites.includes(d.id);
  $("#detail-content").innerHTML =
    `<div class="detail-layout"><div class="detail-art ${d.color}"><span class="detail-number">Arquivo Adventure / #${d.number}</span><img src="./${d.image}" alt="${escape(d.name)}" width="320" height="310"><span class="detail-japanese" lang="ja">${d.japaneseName}</span></div><div class="detail-info"><span class="card-level">${d.level}</span><h2 id="detail-name">${escape(d.name)}</h2><p class="detail-description">${d.description}</p><dl class="detail-stats"><div><dt>Atributo</dt><dd>${attributeLabels[d.attribute]}</dd></div><div><dt>Tipo</dt><dd>${d.element}</dd></div><div class="wide"><dt>Classificação</dt><dd>${d.families.map(escape).join(" / ")}</dd></div></dl><h3>Técnicas</h3><ul class="attack-list">${d.attacks.map((a) => `<li>${escape(a)}</li>`).join("")}</ul>${renderEvolution(d.id, digimon)}<div class="detail-actions"><button class="button primary" data-detail-favorite="${d.id}" aria-pressed="${saved}">${star}${saved ? "Salvo nos favoritos" : "Salvar favorito"}</button><button class="button secondary" id="share-digimon">Copiar link</button></div><p class="source-note">Perfil resumido em português. Classificação, técnicas e arte: <a href="${d.source}" target="_blank" rel="noopener noreferrer">Digimon Encyclopedia ↗</a>. Numeração interna do catálogo.</p></div></div>`;
  handleImageErrors($("#detail-content"));
  const repeated = $(".detail-stats .wide");
  if (repeated) repeated.remove();
  const context = document.createElement("section");
  context.className = "profile-context";
  const heading = document.createElement("h3");
  heading.textContent = "Entenda a classificação";
  context.append(heading);
  for (const text of [
    levelNotes[d.level],
    attributeNotes[d.attribute],
    `Coleção: ${collectionLabels[d.collection]}. A coleção é um recorte editorial de personagens; um Digimon pode aparecer em outras obras.`,
  ])
    if (text) {
      const p = document.createElement("p");
      p.textContent = text;
      context.append(p);
    }
  $(".detail-description").after(context);
  $(".source-note").innerHTML =
    `Perfil resumido em português. <a href="${d.source}" target="_blank" rel="noopener noreferrer">Dados e técnicas ↗</a> · <a href="${d.artSource}" target="_blank" rel="noopener noreferrer">Origem da arte ↗</a>. Numeração interna do catálogo.`;
  $(".detail-number").textContent =
    `${collectionLabels[d.collection]} / #${d.number}`;
  $(".attack-list").innerHTML = d.attacks
    .map((name) => {
      const detail = d.attackDetails?.find((a) => a.name === name);
      const translated = techniqueExplanation(name);
      return `<li><details><summary>${escape(name)}</summary>${translated ? `<p>${escape(translated)}</p>` : ""}${detail?.originalExcerpt ? `<p class="technique-original">Trecho da fonte em inglês:</p><blockquote>${escape(detail.originalExcerpt)}</blockquote>` : !translated ? "<p>A descrição individual ainda não foi cadastrada. Consulte o perfil oficial.</p>" : ""}<a href="${d.source}" target="_blank" rel="noopener noreferrer">Perfil oficial ↗</a></details></li>`;
    })
    .join("");
  const extra = document.createElement("section");
  extra.className = "profile-extra";
  extra.innerHTML = `${d.aliases.length ? `<h3>Nomes e variantes de escrita</h3><p>${d.aliases.map(escape).join(" / ")}</p>` : ""}${curiosityFor(d.id) ? `<h3>Detalhe do perfil</h3><p>${escape(curiosityFor(d.id))}</p><a href="${d.source}" target="_blank" rel="noopener noreferrer">Conferir na fonte ↗</a>` : ""}${listControls(d)}`;
  $(".source-note").before(extra);
}

function openDetails(id) {
  const d = digimon.find((item) => item.id === id);
  if (!d) {
    notify("Este Digimon ainda não está no catálogo.");
    return;
  }
  if (!dialog.open) {
    returnFocus = document.activeElement;
    returnFocusCard = returnFocus?.dataset.open || null;
  }
  selected = d;
  markExplored(d.id);
  selectPartner(d.id, false);
  renderDetails(d);
  if (!dialog.open) {
    dialog.showModal();
    document.body.style.overflow = "hidden";
    $("#close-dialog").focus();
  }
  document.title = `${d.name} — DigiDex`;
}

function visitDetails(id) {
  const hash = `#digimon/${id}`;
  if (location.hash !== hash) history.pushState({ digimon: id }, "", hash);
  openDetails(id);
}

function route() {
  if (location.hash.startsWith("#digimon/"))
    openDetails(location.hash.slice(9));
  else if (dialog.open) dialog.close();
}

function updateFavorite(id) {
  favorites = toggleFavorite(favorites, id);
  updateTerminalFavorites(favorites);
  const persisted = saveFavorites(storage, favorites);
  renderCatalog();
  if (selected && dialog.open) {
    const saved = favorites.includes(selected.id);
    const button = $("[data-detail-favorite]");
    button.setAttribute("aria-pressed", String(saved));
    button.innerHTML = `${star}${saved ? "Salvo nos favoritos" : "Salvar favorito"}`;
  }
  if (!persisted)
    notify(
      "Favorito atualizado nesta sessão. O navegador não permitiu salvar a coleção.",
    );
  else
    notify(
      favorites.includes(id)
        ? "Parceiro salvo nos favoritos."
        : "Parceiro removido dos favoritos.",
    );
}

function setView(onlyFavorites) {
  favoritesOnly = onlyFavorites;
  renderCatalog();
  $("#catalogo").scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
}

$("#catalog-grid").addEventListener("click", (event) => {
  const favorite = event.target.closest("[data-favorite]");
  if (favorite) {
    updateFavorite(favorite.dataset.favorite);
    return;
  }
  const link = event.target.closest("[data-open]");
  if (
    link &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey
  ) {
    event.preventDefault();
    visitDetails(link.dataset.open);
  }
});

$("#detail-content").addEventListener("click", async (event) => {
  const evolution = event.target.closest("[data-evolution]");
  if (evolution) {
    visitDetails(evolution.dataset.evolution);
    $("#detail-dialog").scrollTop = 0;
    $("#close-dialog").focus();
    return;
  }
  const favorite = event.target.closest("[data-detail-favorite]");
  if (favorite) updateFavorite(favorite.dataset.detailFavorite);
  if (event.target.closest("#share-digimon")) {
    try {
      await navigator.clipboard.writeText(location.href);
      notify("Link da ficha copiado.");
    } catch {
      notify(
        "Não foi possível copiar. Você pode usar o endereço desta página.",
      );
    }
  }
});

$("#filters").addEventListener("submit", (event) => event.preventDefault());
$("#search").addEventListener("input", renderCatalog);
$("#level").addEventListener("change", renderCatalog);
$("#attribute").addEventListener("change", renderCatalog);
$("#collection").addEventListener("change", renderCatalog);
$("#sort").addEventListener("change", renderCatalog);
$("#filters").addEventListener("reset", () => setTimeout(renderCatalog, 0));
$("#empty-reset").addEventListener("click", () => {
  if (favoritesOnly && !favorites.length) favoritesOnly = false;
  $("#filters").reset();
  $("#search").focus();
});
$("#explore-nav").addEventListener("click", () => setView(false));
$("#favorites-nav").addEventListener("click", () => setView(true));
$("#random-button").addEventListener("click", () => {
  const choices = digimon.filter((d) => d.id !== selected?.id);
  visitDetails(choices[Math.floor(Math.random() * choices.length)].id);
});
$("#close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    dialog.close();
});
dialog.addEventListener("close", () => {
  document.body.style.overflow = "";
  document.title = "DigiDex — Terminal do Mundo Digital";
  if (location.hash.startsWith("#digimon/"))
    history.replaceState(
      null,
      "",
      location.pathname + location.search + "#catalogo",
    );
  const focusTarget = returnFocus?.isConnected
    ? returnFocus
    : returnFocusCard && $(`.card-art[data-open="${returnFocusCard}"]`);
  (focusTarget || $("#search")).focus({ preventScroll: true });
});
window.addEventListener("popstate", route);
window.addEventListener("hashchange", route);
window.addEventListener("storage", () => {
  favorites = readFavorites(storage, digimon);
  updateTerminalFavorites(favorites);
  renderCatalog();
  if (dialog.open && selected) {
    const saved = favorites.includes(selected.id);
    const button = $("[data-detail-favorite]");
    button.setAttribute("aria-pressed", String(saved));
    button.innerHTML = `${star}${saved ? "Salvo nos favoritos" : "Salvar favorito"}`;
  }
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "/" &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !dialog.open &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
  ) {
    event.preventDefault();
    $("#search").focus();
  }
});
setupTerminal({ onOpen: visitDetails, onFavorite: updateFavorite, favorites });
setupExploration(visitDetails);
setupGraph(visitDetails);
setupPersonal(visitDetails, () => favorites);
setupSharing(renderCatalog, {
  getFavoritesOnly: () => favoritesOnly,
  setFavoritesOnly: (value) => {
    favoritesOnly = value;
  },
});
setupOffline();
handleImageErrors(document);
renderCatalog();
route();
window.addEventListener("digidex:import-favorites", (event) => {
  favorites = event.detail;
  updateTerminalFavorites(favorites);
  renderCatalog();
});

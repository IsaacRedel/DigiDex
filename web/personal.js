import { artPath } from "./art.js";
import { digimon } from "./data.js";
import {
  libraryKey,
  defaultLibrary,
  normalizeLibrary,
  mergeLibrary,
  createQuestion,
} from "./experience-model.js";
import { readFavorites, saveFavorites } from "./catalog.js";
const $ = (s) => document.querySelector(s);
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let state = defaultLibrary(),
  storage,
  onOpen;
function persist() {
  try {
    storage.setItem(libraryKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
function message(text) {
  $("#personal-status").textContent = text;
}
export function markExplored(id) {
  if (!state.explored.includes(id)) {
    state.explored.push(id);
    persist();
    renderProgress();
  }
}
function renderProgress() {
  if ($("#explored-progress"))
    $("#explored-progress").textContent =
      `${state.explored.length} de ${digimon.length} fichas exploradas`;
}
export function listControls(d) {
  return `<div class="detail-list-control"><label for="detail-list">Lista pessoal</label><select id="detail-list">${state.lists.map((l) => `<option value="${escape(l.id)}">${escape(l.name)}</option>`).join("")}</select><button class="button secondary" id="save-to-list" data-list-record="${d.id}">Adicionar à lista</button><p id="detail-list-status" role="status"></p></div>`;
}
export function setupPersonal(
  open,
  getFavorites = () => readFavorites(storage, digimon),
) {
  onOpen = open;
  try {
    storage = window.localStorage;
    state = normalizeLibrary(
      JSON.parse(storage.getItem(libraryKey) || "null"),
      digimon,
    );
  } catch {
    state = defaultLibrary();
  }
  const root = document.createElement("section");
  root.id = "personal";
  root.className = "personal-section page-width";
  root.innerHTML = `<div class="section-heading"><div><span class="section-kicker">Seu arquivo pessoal</span><h2>Uma coleção com a sua história.</h2></div><span id="explored-progress" role="status"></span></div><div class="personal-toolbar"><form id="new-list-form"><label for="new-list-name">Nova lista</label><input id="new-list-name" maxlength="60" required placeholder="Ex.: Meu time de Tamers"><button class="button secondary">Criar lista</button></form><div class="backup-actions"><button id="export-library" class="button secondary">Exportar coleção</button><label class="button secondary import-label">Importar backup<input id="import-library" type="file" accept="application/json,.json"></label></div></div><div class="personal-toolbar"><label>Lista<select id="personal-list"></select></label><button id="rename-list" class="button quiet">Renomear lista</button><button id="remove-list" class="button quiet">Excluir lista vazia</button></div><p id="personal-status" role="status" aria-live="polite">Listas e progresso ficam neste navegador. Exporte para guardar uma cópia.</p><div id="personal-records" class="personal-records"></div>`;
  $("#catalogo").after(root);
  function render() {
    const previous = $("#personal-list").value;
    $("#personal-list").replaceChildren(
      ...state.lists.map(
        (l) => new Option(`${l.name} (${l.ids.length})`, l.id),
      ),
    );
    if (state.lists.some((l) => l.id === previous))
      $("#personal-list").value = previous;
    const list = state.lists.find((l) => l.id === $("#personal-list").value);
    $("#personal-records").innerHTML = list?.ids.length
      ? list.ids
          .map((id) => {
            const d = digimon.find((d) => d.id === id);
            return `<article><button data-personal-open="${id}"><img src="${artPath(d, "thumbnail")}" alt="" loading="lazy"><strong>${escape(d.name)}</strong></button><button class="button quiet" data-remove-member="${id}" aria-label="Remover ${escape(d.name)} desta lista">Remover</button></article>`;
          })
          .join("")
      : "<p>Escolha um parceiro no terminal e use “Adicionar à lista” na ficha para começar.</p>";
    renderProgress();
  }
  $("#personal-list").addEventListener("change", render);
  $("#new-list-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#new-list-name");
    const name = input.value.trim();
    if (!name) return;
    if (state.lists.length >= 20) {
      message("Você atingiu o limite de 20 listas.");
      return;
    }
    const created = { id: crypto.randomUUID(), name, ids: [] };
    state.lists.push(created);
    input.value = "";
    message(
      persist()
        ? "Lista criada."
        : "Lista criada nesta sessão; não foi possível salvar no navegador.",
    );
    render();
    $("#personal-list").value = created.id;
    render();
  });
  root.addEventListener("click", (e) => {
    const open = e.target.closest("[data-personal-open]");
    if (open) onOpen(open.dataset.personalOpen);
    const remove = e.target.closest("[data-remove-member]");
    if (remove) {
      const list = state.lists.find((l) => l.id === $("#personal-list").value);
      list.ids = list.ids.filter((id) => id !== remove.dataset.removeMember);
      message(
        persist()
          ? "Parceiro removido da lista."
          : "Alteração mantida apenas nesta sessão.",
      );
      render();
    }
  });
  $("#remove-list").addEventListener("click", () => {
    const list = state.lists.find((l) => l.id === $("#personal-list").value);
    if (!list) return;
    if (list.ids.length) {
      message("Remova os parceiros antes de excluir esta lista.");
      return;
    }
    state.lists = state.lists.filter((l) => l.id !== list.id);
    persist();
    render();
    message("Lista vazia excluída.");
  });
  $("#rename-list").addEventListener("click", () => {
    const list = state.lists.find((l) => l.id === $("#personal-list").value);
    if (!list) return;
    const name = $("#new-list-name").value.trim();
    if (!name) {
      message(
        "Digite o novo nome no campo “Nova lista” e clique em “Renomear lista”.",
      );
      $("#new-list-name").focus();
      return;
    }
    list.name = name;
    $("#new-list-name").value = "";
    persist();
    render();
    message("Lista renomeada.");
  });
  $("#export-library").addEventListener("click", () => {
    const blob = new Blob(
      [JSON.stringify({ ...state, favorites: getFavorites() }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "digidex-colecao.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message("Backup exportado com listas, progresso e favoritos.");
  });
  $("#import-library").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2_000_000)
        throw Error("O arquivo ultrapassa o limite de 2 MB.");
      const raw = JSON.parse(await file.text());
      const incoming = normalizeLibrary(raw, digimon);
      const merged = mergeLibrary(state, incoming);
      const valid = new Set(digimon.map((d) => d.id));
      if (
        raw.favorites !== undefined &&
        (!Array.isArray(raw.favorites) ||
          raw.favorites.length > 2000 ||
          raw.favorites.some((id) => typeof id !== "string"))
      )
        throw Error("Favoritos inválidos no backup.");
      state = merged;
      const saved = persist();
      const favorites = [
        ...new Set([
          ...getFavorites(),
          ...(raw.favorites || []).filter((id) => valid.has(id)),
        ]),
      ];
      const savedFavorites = saveFavorites(storage, favorites);
      window.dispatchEvent(
        new CustomEvent("digidex:import-favorites", { detail: favorites }),
      );
      render();
      message(
        saved && savedFavorites
          ? "Backup incorporado. Listas existentes foram preservadas."
          : "Backup incorporado nesta sessão; o navegador não permitiu persistir todos os dados.",
      );
    } catch (error) {
      message("Não foi possível importar: " + error.message);
    } finally {
      e.target.value = "";
    }
  });
  document.querySelector("#detail-content").addEventListener("click", (e) => {
    const button = e.target.closest("[data-list-record]");
    if (!button) return;
    const list = state.lists.find((l) => l.id === $("#detail-list").value);
    if (!list) {
      $("#detail-list-status").textContent =
        "Crie uma lista no arquivo pessoal primeiro.";
      return;
    }
    if (!list.ids.includes(button.dataset.listRecord))
      list.ids.push(button.dataset.listRecord);
    const saved = persist();
    $("#detail-list-status").textContent = saved
      ? "Parceiro adicionado à lista."
      : "Adicionado nesta sessão; armazenamento indisponível.";
    render();
  });
  window.addEventListener("storage", (e) => {
    if (e.key === libraryKey) {
      try {
        state = normalizeLibrary(JSON.parse(e.newValue), digimon);
        render();
      } catch {}
    }
  });
  render();
  setupDiscovery(open);
}
function setupDiscovery(open) {
  const root = document.createElement("section");
  root.id = "discovery";
  root.className = "discovery-section page-width";
  root.innerHTML =
    '<div class="section-heading"><div><span class="section-kicker">Modo descoberta</span><h2>Você conhece este parceiro?</h2></div><p id="quiz-score" role="status">0 acertos em 0 respostas</p></div><div class="quiz-toolbar"><label>Desafio<select id="quiz-mode"><option value="image">Reconhecer a arte</option><option value="silhouette">Silhueta</option><option value="clues">Pistas do arquivo</option></select></label><button id="quiz-hint" class="button quiet">Mostrar pista</button></div><div class="quiz-layout"><div id="quiz-art"></div><div><p id="quiz-clue"></p><div id="quiz-options" class="quiz-options"></div><p id="quiz-feedback" role="status" aria-live="polite"></p><div class="quiz-toolbar"><button id="quiz-next" class="button primary" hidden>Próximo desafio</button><button id="quiz-profile" class="button secondary" hidden>Abrir ficha</button></div></div></div>';
  $("#personal").after(root);
  let question,
    answered = false,
    correct = 0,
    total = 0;
  function next(focusOptions = false) {
    question = createQuestion(digimon, Math.random, question?.answer.id);
    answered = false;
    const mode = $("#quiz-mode").value;
    $("#quiz-art").innerHTML =
      mode === "clues"
        ? '<span class="quiz-question-mark" aria-hidden="true">?</span>'
        : `<img class="${mode === "silhouette" ? "silhouette" : ""}" src="${artPath(question.answer, "medium")}" alt="${mode === "silhouette" ? "Silhueta de um Digimon para identificar" : "Arte de um Digimon para identificar"}">`;
    $("#quiz-clue").textContent =
      mode === "clues"
        ? `Estágio ${question.answer.level}. Atributo ${question.answer.attribute}. Tipo ${question.answer.type}.`
        : "Escolha o nome do parceiro.";
    $("#quiz-options").replaceChildren(
      ...question.options.map((d) => {
        const button = document.createElement("button");
        button.textContent = d.name;
        button.addEventListener("click", () => answer(d.id));
        return button;
      }),
    );
    $("#quiz-feedback").textContent = "";
    $("#quiz-next").hidden = true;
    $("#quiz-profile").hidden = true;
    if (focusOptions) $("#quiz-options button").focus();
  }
  function answer(id) {
    if (answered) return;
    answered = true;
    total++;
    if (id === question.answer.id) correct++;
    $("#quiz-score").textContent =
      `${correct} ${correct === 1 ? "acerto" : "acertos"} em ${total} ${total === 1 ? "resposta" : "respostas"}`;
    $("#quiz-feedback").textContent =
      id === question.answer.id
        ? `Acertou! É ${question.answer.name}.`
        : `A resposta é ${question.answer.name}.`;
    $("#quiz-art").innerHTML =
      `<img src="${artPath(question.answer, "medium")}" alt="${escape(question.answer.name)}">`;
    $("#quiz-options")
      .querySelectorAll("button")
      .forEach((button) => {
        button.disabled = true;
        if (button.textContent === question.answer.name)
          button.classList.add("correct-answer");
      });
    $("#quiz-next").hidden = false;
    $("#quiz-profile").hidden = false;
    $("#quiz-next").focus();
  }
  $("#quiz-hint").addEventListener("click", () => {
    $("#quiz-clue").textContent = question.answer.description;
  });
  $("#quiz-mode").addEventListener("change", () => next());
  $("#quiz-next").addEventListener("click", () => next(true));
  $("#quiz-profile").addEventListener("click", () => open(question.answer.id));
  next();
}

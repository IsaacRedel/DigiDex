import { digimon, attributeLabels } from "./data.js";

const $ = (selector) => document.querySelector(selector);
const colors = {
  sand: "#ffa648",
  ice: "#78caff",
  peach: "#f69652",
  lavender: "#b3a2ff",
  sky: "#80e2df",
};
let currentId = "agumon";
let savedIds = [];

export function selectPartner(id, announce = true) {
  const index = digimon.findIndex((d) => d.id === id);
  if (index < 0) return;
  const d = digimon[index];
  currentId = d.id;
  $("#partner-name").textContent = d.name;
  $("#partner-number").textContent = d.number;
  $("#partner-japanese").textContent = d.japaneseName;
  $("#partner-image").src = `./${d.image}`;
  $("#partner-image").alt = d.name;
  $("#partner-image").style.scale = String(d.artScale || 1);
  $("#partner-image").style.objectPosition = d.artPosition || "50% 50%";
  $("#partner-image").hidden = false;
  $("#partner-image-error").hidden = true;
  $("#partner-stage-level").textContent = d.level;
  $("#partner-level").textContent = d.level;
  $("#partner-attribute").textContent = attributeLabels[d.attribute];
  $("#partner-element").textContent = d.element;
  $("#partner-families").textContent = d.description;
  $(".family-block .section-kicker").textContent = "Sobre o parceiro";
  $("#partner-total").textContent = String(digimon.length).padStart(2, "0");
  $("#partner-position").textContent = String(index + 1).padStart(2, "0");
  $("#attack-count").textContent = String(d.attacks.length).padStart(2, "0");
  $("#partner-attacks").replaceChildren(
    ...d.attacks.map((attack) => {
      const li = document.createElement("li");
      li.textContent = attack;
      return li;
    }),
  );
  $("#hero-detail").setAttribute("aria-label", `Abrir ficha de ${d.name}`);
  document
    .querySelector(".terminal-shell")
    .style.setProperty("--partner-accent", colors[d.color]);
  document
    .querySelectorAll("[data-partner]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.partner === id),
      ),
    );
  updateTerminalFavorites(savedIds);
  if (announce) {
    $("#partner-announcement").textContent =
      `${d.name} selecionado. ${d.level}, ${attributeLabels[d.attribute]}, ${d.element}.`;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      $("#partner-image")
        .getAnimations()
        .forEach((animation) => animation.cancel());
      $("#partner-image").animate(
        [
          { opacity: 0.15, transform: "translateY(12px) scale(.96)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        { duration: 350, easing: "ease-out" },
      );
    }
  }
}

export function updateTerminalFavorites(favorites) {
  savedIds = favorites;
  const saved = favorites.includes(currentId);
  $("#partner-favorite").textContent = saved ? "★" : "☆";
  $("#partner-favorite").setAttribute("aria-pressed", String(saved));
  $("#partner-favorite").setAttribute(
    "aria-label",
    saved ? "Remover parceiro dos favoritos" : "Salvar parceiro nos favoritos",
  );
}

export function setupTerminal({ onOpen, onFavorite, favorites }) {
  savedIds = favorites;
  const image = $("#partner-image");
  const imageError = document.createElement("p");
  imageError.id = "partner-image-error";
  imageError.className = "stage-image-error";
  imageError.textContent =
    "Arte indisponível. Você ainda pode consultar os dados e escolher outro parceiro.";
  imageError.hidden = true;
  imageError.setAttribute("role", "status");
  $("#partner-stage").append(imageError);
  image.addEventListener("error", () => {
    image.hidden = true;
    imageError.hidden = false;
  });
  image.addEventListener("load", () => {
    image.hidden = false;
    imageError.hidden = true;
  });
  $("#partner-selector").replaceChildren(
    ...digimon.map((d) => {
      const button = document.createElement("button");
      button.className = "partner-choice";
      button.dataset.partner = d.id;
      button.setAttribute("aria-label", `Selecionar ${d.name}`);
      const img = document.createElement("img");
      img.src = `./${d.image}`;
      img.alt = "";
      img.loading = "lazy";
      const name = document.createElement("span");
      name.textContent = d.name;
      button.append(img, name);
      button.addEventListener("click", () => selectPartner(d.id));
      return button;
    }),
  );
  function move(direction) {
    const index = digimon.findIndex((d) => d.id === currentId);
    selectPartner(
      digimon[(index + direction + digimon.length) % digimon.length].id,
    );
  }
  $("#previous-partner").addEventListener("click", () => move(-1));
  $("#next-partner").addEventListener("click", () => move(1));
  $("#hero-detail").addEventListener("click", () => onOpen(currentId));
  $("#partner-favorite").addEventListener("click", () => onFavorite(currentId));
  $(".terminal-top-right").textContent =
    `${digimon.length} registros disponíveis`;
  for (const level of [...new Set(digimon.map((d) => d.level))]) {
    if (![...$("#level").options].some((o) => o.value === level))
      $("#level").add(new Option(level, level));
  }
  for (const attribute of [...new Set(digimon.map((d) => d.attribute))]) {
    if (![...$("#attribute").options].some((o) => o.value === attribute))
      $("#attribute").add(
        new Option(attributeLabels[attribute] || attribute, attribute),
      );
  }
  selectPartner(currentId, false);
}

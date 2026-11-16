import { digimon } from "./data.js";
const $ = (s) => document.querySelector(s);
const ids = new Set(digimon.map((d) => d.id));
export function setupSharing(
  renderCatalog,
  { getFavoritesOnly = () => false, setFavoritesOnly = () => {} } = {},
) {
  let restoring = false;
  const queryControls = {
    q: "search",
    level: "level",
    attribute: "attribute",
    collection: "collection",
    sort: "sort",
  };
  function restore() {
    restoring = true;
    try {
      const params = new URLSearchParams(location.search);
      setFavoritesOnly(params.get("favorites") === "1");
      for (const [key, id] of Object.entries(queryControls)) {
        const el = $("#" + id),
          value = params.get(key) || "";
        if (el.tagName === "SELECT") {
          if ([...el.options].some((o) => o.value === value)) el.value = value;
          else el.selectedIndex = 0;
        } else el.value = value;
      }
      const pair = (params.get("compare") || "").split(",");
      if (pair.length === 2 && pair.every((id) => ids.has(id))) {
        $("#compare-left").value = pair[0];
        $("#compare-right").value = pair[1];
        $("#compare-left").dispatchEvent(new Event("change"));
      }
      $(params.get("view") === "compare" ? "#compare-tab" : "#map-tab").click();
      renderCatalog();
    } finally {
      restoring = false;
    }
  }
  function write() {
    if (restoring) return;
    const url = new URL(location.href);
    if (getFavoritesOnly()) url.searchParams.set("favorites", "1");
    else url.searchParams.delete("favorites");
    for (const [key, id] of Object.entries(queryControls)) {
      const value = $("#" + id).value;
      if (value && (key !== "sort" || value !== "number"))
        url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    if ($("#compare-tab").getAttribute("aria-selected") === "true") {
      url.searchParams.set(
        "compare",
        [$("#compare-left").value, $("#compare-right").value].join(","),
      );
      url.searchParams.set("view", "compare");
    } else {
      url.searchParams.delete("compare");
      url.searchParams.delete("view");
    }
    history.replaceState(history.state, "", url);
  }
  for (const id of [
    "search",
    "level",
    "attribute",
    "collection",
    "sort",
    "compare-left",
    "compare-right",
  ])
    $("#" + id).addEventListener(id === "search" ? "input" : "change", write);
  for (const id of ["compare-tab", "map-tab", "swap-comparison"])
    $("#" + id).addEventListener("click", write);
  for (const id of ["favorites-nav", "explore-nav"])
    $("#" + id).addEventListener("click", write);
  window.addEventListener("digidex:mode-change", write);
  $("#filters").addEventListener("reset", () => setTimeout(write, 0));
  window.addEventListener("popstate", restore);
  const button = document.createElement("button");
  button.className = "button secondary";
  button.id = "share-search";
  button.textContent = "Copiar link desta consulta";
  const status = document.createElement("span");
  status.id = "share-status";
  status.setAttribute("role", "status");
  button.addEventListener("click", async () => {
    write();
    try {
      await navigator.clipboard.writeText(location.href);
      status.textContent = "Link copiado.";
    } catch {
      status.textContent = "Use o endereço da página para compartilhar.";
    }
  });
  $(".results-bar").after(button, status);
  restore();
}

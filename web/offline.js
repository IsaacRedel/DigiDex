export function setupOffline() {
  const box = document.createElement("aside");
  box.className = "offline-box page-width";
  box.innerHTML =
    '<div><h2>Leve o terminal com você.</h2><p>Baixe as fichas e artes deste catálogo para consultar sem internet neste navegador. Os links das fontes exigem conexão.</p><p id="offline-status" role="status" aria-live="polite">O conteúdo baixado fica salvo neste dispositivo.</p></div><div class="offline-actions"><button id="download-offline" class="button secondary">Preparar uso offline</button><button id="install-app" class="button primary" hidden>Instalar DigiDex</button></div>';
  document.querySelector(".site-footer").before(box);
  const hint = document.createElement("p");
  hint.textContent =
    "Para instalar, use o botão quando disponível ou o menu do navegador: Instalar aplicativo / Adicionar à tela inicial.";
  box.firstElementChild.append(hint);
  const button = box.querySelector("#download-offline");
  const status = box.querySelector("#offline-status");
  let prompt;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    prompt = event;
    box.querySelector("#install-app").hidden = false;
  });
  box.querySelector("#install-app").addEventListener("click", async () => {
    if (prompt) {
      await prompt.prompt();
      prompt = null;
      box.querySelector("#install-app").hidden = true;
    }
  });
  if (!("serviceWorker" in navigator)) {
    button.disabled = true;
    status.textContent =
      "Este navegador não oferece suporte ao pacote offline.";
    return;
  }
  const registration = navigator.serviceWorker
    .register("./sw.js")
    .then(() => navigator.serviceWorker.ready)
    .catch((error) => {
      status.textContent =
        "Não foi possível ativar o modo offline neste ambiente.";
      throw error;
    });
  registration.catch(() => {});
  button.addEventListener("click", async () => {
    button.disabled = true;
    status.textContent = "Preparando download…";
    try {
      const reg = await registration;
      const channel = new MessageChannel();
      await new Promise((resolve, reject) => {
        let timer;
        const timeout = () => {
          clearTimeout(timer);
          timer = setTimeout(
            () =>
              reject(
                Error(
                  "O download demorou demais. Tente novamente com conexão estável.",
                ),
              ),
            45000,
          );
        };
        timeout();
        channel.port1.onmessage = (event) => {
          timeout();
          const data = event.data;
          if (data.progress)
            status.textContent = `Baixando ${data.progress} de ${data.total} arquivos…`;
          if (data.done) {
            clearTimeout(timer);
            resolve();
          }
          if (data.error) {
            clearTimeout(timer);
            reject(Error(data.error));
          }
        };
        reg.active.postMessage({ type: "PREPARE_OFFLINE" }, [channel.port2]);
      });
      status.textContent =
        "Catálogo pronto para uso offline neste dispositivo.";
    } catch (error) {
      status.textContent =
        error.message || "Não foi possível concluir o download.";
    } finally {
      button.disabled = false;
      button.textContent = "Atualizar pacote offline";
    }
  });
}

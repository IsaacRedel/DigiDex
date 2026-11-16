const PREFIX = "digidex-static-";
function manifest() {
  return fetch("./offline-assets.json", { cache: "no-store" }).then((r) => {
    if (!r.ok) throw Error("Lista offline indisponível");
    return r.json();
  });
}
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);
self.addEventListener("message", (event) => {
  if (event.data?.type !== "PREPARE_OFFLINE") return;
  const port = event.ports[0];
  event.waitUntil(
    (async () => {
      try {
        const list = await manifest();
        const name = PREFIX + list.version;
        const cache = await caches.open(name);
        let count = 0;
        for (const file of list.files) {
          const url = new URL(file, self.registration.scope);
          const fetchUrl = file === "./index.html" ? new URL("./", self.registration.scope) : url;
          const response = await fetch(fetchUrl, {
            cache: "reload",
            redirect: "error",
          });
          if (!response.ok) throw Error("Falha ao baixar " + file);
          if (
            file === "./index.html" &&
            !(await response.clone().text()).includes(
              'name="application-name" content="DigiDex"',
            )
          )
            throw Error(
              "A sessão expirou. Entre novamente e tente baixar o catálogo.",
            );
          if (
            file !== "./index.html" &&
            (response.headers.get("Content-Type") || "").includes("text/html")
          )
            throw Error("Resposta de autenticação recebida para " + file);
          await cache.put(url, response);
          port.postMessage({ progress: ++count, total: list.files.length });
        }
        await cache.put(
          new URL("./offline-ready", self.registration.scope),
          new Response("ready"),
        );
        for (const key of await caches.keys())
          if (key.startsWith(PREFIX) && key !== name) await caches.delete(key);
        port.postMessage({ done: true });
      } catch (error) {
        port.postMessage({ error: error.message });
      }
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  event.respondWith(
    (async () => {
      try {
        return await fetch(event.request);
      } catch {
        for (const key of (await caches.keys())
          .filter((k) => k.startsWith(PREFIX))
          .reverse()) {
          const cache = await caches.open(key);
          if (
            !(await cache.match(
              new URL("./offline-ready", self.registration.scope),
            ))
          )
            continue;
          const response =
            (await cache.match(event.request, { ignoreSearch: true })) ||
            (event.request.mode === "navigate"
              ? await cache.match(
                  new URL("./index.html", self.registration.scope),
                )
              : null);
          if (response) return response;
        }
        return Response.error();
      }
    })(),
  );
});

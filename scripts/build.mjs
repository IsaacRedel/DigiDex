import { mkdir, cp, readdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { digimon } from "../web/data.js";
const root = new URL("../", import.meta.url);
await mkdir(new URL("dist/", root), { recursive: true });
for (const file of await readdir(new URL("web/", root))) {
  await cp(new URL(`web/${file}`, root), new URL(`dist/${file}`, root), {
    recursive: true,
  });
}
await cp(new URL("images/", root), new URL("dist/images/", root), {
  recursive: true,
});
console.log(
  "Build concluído em dist/. Código web e imagens locais; nenhum serviço externo necessário.",
);
const files = [
  "./index.html",
  "./styles.css",
  "./app.js",
  "./catalog.js",
  "./data.js",
  "./terminal.js",
  "./evolutions.js",
  "./exploration.js",
  "./exploration-model.js",
  "./offline.js",
  "./favicon.svg",
  "./manifest.webmanifest",
  "./assets/digimon-basic.woff2",
  "./assets/digimon-logo.png",
  "./assets/app-icon-192.png",
  "./assets/app-icon-512.png",
  ...digimon.map((d) => "./" + d.image),
];
files.push("./exploration.css");
files.push(
  "./experience-model.js",
  "./personal.js",
  "./graph.js",
  "./sharing.js",
  "./techniques.js",
  "./experience.css",
);
const hash = createHash("sha256");
for (const file of files)
  hash.update(await readFile(new URL("dist/" + file.slice(2), root)));
await writeFile(
  new URL("dist/offline-assets.json", root),
  JSON.stringify({ version: hash.digest("hex").slice(0, 16), files }),
);

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
const project = fileURLToPath(new URL("../", import.meta.url));
const built = process.argv[2] === "dist";
const root = resolve(project, built ? "dist" : "web");
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".gif": "image/gif",
  ".webmanifest": "application/manifest+json",
};
const server = createServer(async (req, res) => {
  try {
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      res.end();
      return;
    }
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const asset = !built && pathname.startsWith("/images/");
    const base = asset ? resolve(project, "images") : root;
    const relative = asset
      ? pathname.slice("/images/".length)
      : pathname.slice(1) || "index.html";
    const path = resolve(base, relative);
    if (!path.startsWith(base + sep) || !(await stat(path)).isFile()) {
      res.writeHead(404);
      res.end("Não encontrado");
      return;
    }
    const data = await readFile(path);
    res.writeHead(200, {
      "Content-Type": types[extname(path)] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    res.writeHead(404);
    res.end("Não encontrado");
  }
});
server.on("error", (error) => {
  console.error(`Não foi possível iniciar o servidor: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () =>
  console.log(`DigiDex: http://127.0.0.1:${port}`),
);

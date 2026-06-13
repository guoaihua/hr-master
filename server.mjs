import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const root = resolve(".");
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    let pathname = url.pathname;
    if (pathname === "/") pathname = "/index.html";

    const filePath = join(root, pathname);
    const ext = extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    const body = await readFile(filePath);

    res.writeHead(200, { "Content-Type": contentType });
    res.end(body);
  } catch {
    const body = await readFile(join(root, "index.html"));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(body);
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Serving on http://localhost:${port}/`);
});

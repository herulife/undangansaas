import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { Readable } from "node:stream";

import app from "./dist/server/server.js";

const port = Number(process.env.PORT || 80);
const host = process.env.HOST || "0.0.0.0";
const clientDir = resolve("dist/client");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function staticPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const clean = normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
  const target = resolve(join(clientDir, clean));
  return target === clientDir || target.startsWith(clientDir + sep) ? target : null;
}

function sendStatic(req, res, pathname) {
  const target = staticPath(pathname);
  if (!target || !existsSync(target)) return false;

  const stats = statSync(target);
  if (!stats.isFile()) return false;

  const ext = extname(target).toLowerCase();
  const immutable = pathname.startsWith("/assets/");
  res.writeHead(200, {
    "content-type": contentTypes[ext] || "application/octet-stream",
    "content-length": stats.size,
    "cache-control": immutable ? "public, max-age=31536000, immutable" : "public, max-age=300",
  });

  if (req.method === "HEAD") {
    res.end();
  } else {
    createReadStream(target).pipe(res);
  }
  return true;
}

function requestBody(req) {
  return req.method === "GET" || req.method === "HEAD" ? undefined : Readable.toWeb(req);
}

async function sendApp(req, res) {
  const url = `http://${req.headers.host || "localhost"}${req.url || "/"}`;
  const response = await app.fetch(
    new Request(url, {
      method: req.method,
      headers: req.headers,
      body: requestBody(req),
      duplex: "half",
    }),
    process.env,
  );

  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  if (req.method === "HEAD" || !response.body) {
    res.end();
    return;
  }
  Readable.fromWeb(response.body).pipe(res);
}

createServer((req, res) => {
  const pathname = new URL(req.url || "/", "http://localhost").pathname;
  if (sendStatic(req, res, pathname)) return;

  sendApp(req, res).catch((error) => {
    console.error(error);
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("Internal Server Error");
  });
}).listen(port, host, () => {
  console.log(`cintabuku web listening on ${host}:${port}`);
});

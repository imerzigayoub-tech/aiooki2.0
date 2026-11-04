import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const portFlag = process.argv.find((argument) => argument.startsWith("--port="));
const port = Number(portFlag ? portFlag.split("=")[1] : process.env.PORT || 4173);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

const notFound = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 — AIOOOKI®</title>
    <style>
      body { margin: 0; min-height: 100svh; display: grid; place-items: center; background: #080b0f; color: #f6efe5; font-family: monospace; }
      main { text-align: center; padding: 32px; }
      h1 { font-size: clamp(64px, 18vw, 180px); margin: 0; line-height: .8; color: #ff8eb3; }
      p { color: rgba(246,239,229,.6); }
      a { color: #3fe9c7; }
    </style>
  </head>
  <body>
    <main>
      <h1>404</h1>
      <p>This surface doesn't exist — yet.</p>
      <a href="/">Return to the studio ↗</a>
    </main>
  </body>
</html>`;

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", Allow: "GET, HEAD" });
    response.end("Method not allowed");
    return;
  }

  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    let pathname = decodeURIComponent(requestUrl.pathname);
    if (pathname.endsWith("/")) pathname += "index.html";

    const relativePath = pathname.replace(/^[/\\]+/, "");
    let filePath = resolve(root, relativePath);

    if (filePath !== root && !filePath.startsWith(root + sep)) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    let fileInfo = await stat(filePath);

    if (fileInfo.isDirectory()) {
      filePath = resolve(filePath, "index.html");
      fileInfo = await stat(filePath);
    }

    const data = await readFile(filePath);
    const extension = extname(filePath).toLowerCase();

    response.writeHead(200, {
      "Content-Type": mime[extension] || "application/octet-stream",
      "Content-Length": data.length,
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*"
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    response.end(data);
  } catch (error) {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(notFound);
  }
});

server.listen(port, () => {
  console.log(`AIOOOKI® portfolio running at http://localhost:${port}`);
  console.log("Press Ctrl+C to stop.");
});

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

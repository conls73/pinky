// Local mirror of the self-contained api/index handler, to verify it serves
// pages and API routes WITHOUT the buggy @expo/server Vercel adapter.
const http = require("http");
const path = require("path");
const fs = require("fs");
const { createRequestHandler } = require("@expo/server");

const buildDir = path.join(__dirname, "..", "dist", "server");
const handleRequest = createRequestHandler(buildDir);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function toWebRequest(req) {
  const host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  const proto = req.headers["x-forwarded-proto"] || "http";
  const url = `${proto}://${host}${req.url}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v == null) continue;
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
    else headers.set(k, v);
  }
  const init = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await readBody(req);
    if (body.length) init.body = body;
  }
  return new Request(url, init);
}

const server = http.createServer(async (req, res) => {
  try {
    const response = await handleRequest(await toWebRequest(req));
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      const lk = key.toLowerCase();
      if (lk === "content-length" || lk === "transfer-encoding") return;
      res.setHeader(key, value);
    });
    const ab = await response.arrayBuffer();
    res.end(Buffer.from(ab));
  } catch (err) {
    console.error("HANDLER ERROR", req.url, err && err.stack ? err.stack : err);
    res.statusCode = 500;
    res.end("err");
  }
});
server.listen(8787, () => console.log("test server on http://localhost:8787"));

// Vercel serverless entry — renders Expo Router web pages and runs the
// app/*+api.ts routes from the exported server bundle (dist/server).
//
// We deliberately do NOT use @expo/server's bundled Vercel adapter: in the
// SDK 51 version its respond() calls res.writeHead(status, statusText,
// [...headers.entries()]) with header *tuples*, which Vercel's runtime
// rejects ("The argument 'headers' is invalid") and crashes every route with
// FUNCTION_INVOCATION_FAILED. Instead we drive the core request handler and
// write the Node response ourselves with setHeader, which is universally
// supported. See expo/expo#29374.
const path = require("path");
const fs = require("fs");
const { createRequestHandler } = require("@expo/server");

// @vercel/node can rewrite __dirname when bundling, so probe the locations the
// server bundle can actually land in (cwd is the lambda root) and use the real
// one.
function resolveServerBuild(): string | null {
  const candidates = [
    path.join(process.cwd(), "dist/server"),
    path.join(__dirname, "../dist/server"),
    path.join(__dirname, "dist/server"),
    path.join(__dirname, "../../dist/server"),
  ];
  for (const dir of candidates) {
    try {
      if (fs.existsSync(path.join(dir, "_expo/routes.json"))) return dir;
    } catch {
      // try next
    }
  }
  return null;
}

const buildDir = resolveServerBuild();
const handleRequest = buildDir ? createRequestHandler(buildDir) : null;

function readBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function toWebRequest(req: any): Promise<Request> {
  const host =
    req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const url = `${proto}://${host}${req.url}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else headers.set(key, value as string);
  }
  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await readBody(req);
    if (body.length) (init as any).body = body;
  }
  return new Request(url, init);
}

module.exports = async (req: any, res: any) => {
  try {
    if (!handleRequest) {
      throw new Error(
        "Expo server bundle (dist/server) not found from " + process.cwd()
      );
    }
    const response = await handleRequest(await toWebRequest(req));
    res.statusCode = response.status;
    response.headers.forEach((value: string, key: string) => {
      const lower = key.toLowerCase();
      // Let Node manage framing; copying these can conflict with the body.
      if (lower === "content-length" || lower === "transfer-encoding") return;
      res.setHeader(key, value);
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (err: any) {
    console.error("[api/index] request failed:", err);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Server error");
  }
};

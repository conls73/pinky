// Vercel serverless entry — forwards all requests to Expo's server bundle
// (dist/server), which renders the web pages and runs the app/*+api.ts routes.
const { createRequestHandler } = require("@expo/server/adapter/vercel");
const path = require("path");
const fs = require("fs");

// The bundler (@vercel/node) can rewrite __dirname during bundling, which
// breaks a hard-coded "../dist/server" relative path at runtime and crashes
// every route with FUNCTION_INVOCATION_FAILED. Resolve the server bundle by
// probing the locations it can actually land in on Vercel (cwd is the lambda
// root where includeFiles are copied) and pick the one that really exists.
function resolveServerBuild() {
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
      // ignore and try the next candidate
    }
  }
  // Nothing matched — fall back to the conventional path so the handler can
  // surface a clear error instead of a silent crash.
  return path.join(process.cwd(), "dist/server");
}

module.exports = createRequestHandler({ build: resolveServerBuild() });

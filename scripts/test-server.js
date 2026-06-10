// Reproduce the Vercel serverless runtime locally against the exported
// dist/server bundle USING THE VERCEL ADAPTER (the one that actually runs in
// production), so we see the real crash.
const http = require("http");
const path = require("path");
const {
  createRequestHandler,
} = require("@expo/server/build/vendor/vercel");

const handler = createRequestHandler({
  build: path.join(__dirname, "..", "dist", "server"),
});

const server = http.createServer((req, res) => {
  Promise.resolve(handler(req, res)).catch((err) => {
    console.error("\n===== VERCEL HANDLER ERROR for", req.url, "=====");
    console.error(err && err.stack ? err.stack : err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end("crashed: " + (err && err.message));
    }
  });
});

server.listen(8787, () => console.log("test server on http://localhost:8787"));

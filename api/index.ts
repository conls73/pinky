// Vercel serverless entry — forwards all requests to Expo's server bundle
// (dist/server), which renders the web pages and runs the app/*+api.ts routes.
//
// TEMPORARY DEBUG MODE: catches any crash and returns the real error + path
// diagnostics in the response body, because Vercel's runtime logs aren't
// accessible right now. Revert to the plain handler once the cause is found.
const path = require("path");
const fs = require("fs");

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
      // try next
    }
  }
  return null;
}

module.exports = async (req: any, res: any) => {
  try {
    const { createRequestHandler } = require("@expo/server/adapter/vercel");
    const build = resolveServerBuild();
    if (!build) {
      throw new Error(
        "dist/server not found. cwd=" +
          process.cwd() +
          " __dirname=" +
          __dirname +
          " listing=" +
          safeList(process.cwd()) +
          " distListing=" +
          safeList(path.join(process.cwd(), "dist"))
      );
    }
    const handler = createRequestHandler({ build });
    return await handler(req, res);
  } catch (err: any) {
    try {
      res.statusCode = 500;
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.end(
        "PINKY_DEBUG\n" +
          "message: " +
          (err && err.message) +
          "\n\nstack:\n" +
          (err && err.stack ? err.stack : String(err)) +
          "\n\ncwd=" +
          process.cwd() +
          "\n__dirname=" +
          __dirname +
          "\nresolvedBuild=" +
          resolveServerBuild() +
          "\ncwdListing=" +
          safeList(process.cwd()) +
          "\ndistListing=" +
          safeList(path.join(process.cwd(), "dist")) +
          "\ndistServerListing=" +
          safeList(path.join(process.cwd(), "dist", "server"))
      );
    } catch {
      // response already partially sent; nothing more we can do
    }
  }
};

function safeList(dir: string): string {
  try {
    return fs.readdirSync(dir).join(",");
  } catch (e: any) {
    return "<" + (e && e.code ? e.code : "err") + ">";
  }
}

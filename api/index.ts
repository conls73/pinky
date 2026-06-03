// Vercel serverless entry — forwards all requests to Expo's server bundle
// (dist/server), which renders the web pages and runs the app/*+api.ts routes.
const { createRequestHandler } = require("@expo/server/adapter/vercel");

module.exports = createRequestHandler({
  build: require("path").join(__dirname, "../dist/server"),
});

import "dotenv/config";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createApp, loadServerConfig } from "./server/app.mjs";

const config = loadServerConfig();
const staticDir = resolve("dist");
const app = createApp({
  config,
  staticDir: existsSync(staticDir) ? staticDir : null,
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});

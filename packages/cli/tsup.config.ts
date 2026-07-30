import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  // Bundle workspace packages + their runtime deps for a self-contained bin
  noExternal: [
    "@openwisdom/core",
    "@openwisdom/schema",
    "@openwisdom/providers",
    "zod",
  ],
});

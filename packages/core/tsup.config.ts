import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  outDir: "dist",
  clean: true,
  dts: true,
  sourcemap: true,
  external: ["@openwisdom/schema", "@openwisdom/providers"],
});

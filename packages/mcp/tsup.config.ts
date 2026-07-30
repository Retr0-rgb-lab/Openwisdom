import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/mcp.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  // Bundle workspace packages for a self-contained bin (like CLI).
  // Keep MCP SDK external so optional native/peer bits resolve from node_modules.
  noExternal: [
    "@openwisdom/core",
    "@openwisdom/schema",
    "@openwisdom/providers",
  ],
  external: ["@modelcontextprotocol/server", "zod"],
});

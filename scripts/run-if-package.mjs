#!/usr/bin/env node
/**
 * Run a shell command only if <packageDir>/package.json exists.
 * Usage: node scripts/run-if-package.mjs packages/mcp "pnpm --filter openwisdom-mcp build"
 *
 * Allows root build/test to include openwisdom-mcp when packages/mcp appears
 * without failing when the package is not yet scaffolded.
 */
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const packageDir = process.argv[2];
const command = process.argv[3];

if (!packageDir || !command) {
  console.error(
    "Usage: node scripts/run-if-package.mjs <packageDir> \"<command>\"",
  );
  process.exit(1);
}

const pkgJson = resolve(join(packageDir, "package.json"));
if (!existsSync(pkgJson)) {
  console.log(
    `[run-if-package] skip: ${packageDir}/package.json not found`,
  );
  process.exit(0);
}

const result = spawnSync(command, {
  shell: true,
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);

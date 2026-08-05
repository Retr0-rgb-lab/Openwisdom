/**
 * CLI version — single source of truth is packages/cli/package.json `version`.
 * Resolved at runtime by walking up from this module (src/ or dist/).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function resolvePackageVersion(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    const candidate = join(dir, "package.json");
    if (existsSync(candidate)) {
      try {
        const pkg = JSON.parse(readFileSync(candidate, "utf8")) as {
          name?: string;
          version?: string;
        };
        if (pkg.name === "openwisdom" && typeof pkg.version === "string") {
          return pkg.version;
        }
      } catch {
        /* keep walking */
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    "openwisdom CLI: could not read version from package.json (name=openwisdom)",
  );
}

export const CLI_VERSION = resolvePackageVersion();

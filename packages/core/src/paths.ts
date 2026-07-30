/**
 * Resolve package / monorepo roots without assuming cwd.
 * Snapshot resolves relative to this package (`@openwisdom/core`) unless injected.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Packages that ship catalog-snapshot / skills-snapshot next to package.json. */
const PACKAGE_NAMES = new Set([
  "@openwisdom/core",
  "openwisdom",
  "openwisdom-mcp",
]);

/**
 * Walk up from a start path until package.json name is core, CLI, or MCP.
 * When bundled into a host bin, falls back to parent of the entry file (dist/ → package root).
 */
export function getPackageRoot(fromUrl: string = import.meta.url): string {
  let dir = path.dirname(fileURLToPath(fromUrl));
  for (let i = 0; i < 8; i++) {
    const pkgPath = path.join(dir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
          name?: string;
        };
        if (pkg.name && PACKAGE_NAMES.has(pkg.name)) return dir;
      } catch {
        /* continue */
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Bundled dist/*.js → parent is package root
  return path.resolve(path.dirname(fileURLToPath(fromUrl)), "..");
}

/**
 * Find monorepo root that contains skills/official (or pnpm-workspace + skills).
 */
export function findMonorepoRoot(startDir: string = process.cwd()): string | null {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 12; i++) {
    const skillsOfficial = path.join(dir, "skills", "official");
    const workspace = path.join(dir, "pnpm-workspace.yaml");
    if (existsSync(skillsOfficial)) return dir;
    if (existsSync(workspace) && existsSync(path.join(dir, "skills"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/** Catalog snapshot path shipped with the npm package. */
export function catalogSnapshotPath(packageRoot?: string): string {
  const root = packageRoot ?? getPackageRoot();
  return path.join(root, "catalog-snapshot", "catalog.json");
}

/** Skills payload snapshot path shipped with the npm package (install source). */
export function skillsSnapshotPath(packageRoot?: string): string {
  const root = packageRoot ?? getPackageRoot();
  return path.join(root, "skills-snapshot");
}

/**
 * True when dir looks like a usable skills tree (has official/ or a SKILL.md child).
 */
export function looksLikeSkillsTree(dir: string): boolean {
  if (!existsSync(dir)) return false;
  // Fast path: official scenarios (v1 layout)
  if (
    existsSync(path.join(dir, "official", "scenarios")) ||
    existsSync(path.join(dir, "official"))
  ) {
    return true;
  }
  // Generic: any immediate child is a skill dir
  try {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      if (!ent.isDirectory() || ent.name.startsWith(".")) continue;
      if (existsSync(path.join(dir, ent.name, "SKILL.md"))) return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * Single source of truth: packages/mcp/package.json "version".
 * Read at runtime from package root (works for src tests and bundled dist/mcp.js).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { getMcpPackageRoot } from "./lib/package-root.js";

function readPackageVersion(): string {
  try {
    const raw = readFileSync(
      path.join(getMcpPackageRoot(), "package.json"),
      "utf8",
    );
    const pkg = JSON.parse(raw) as { version?: string };
    if (typeof pkg.version === "string" && pkg.version.trim()) {
      return pkg.version.trim();
    }
  } catch {
    /* fall through */
  }
  return "0.0.0";
}

export const MCP_VERSION = readPackageVersion();

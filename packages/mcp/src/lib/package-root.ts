/**
 * Resolve openwisdom-mcp package root (catalog-snapshot / skills-snapshot).
 *
 * - Unbundled (vitest / src): walks from this file to packages/mcp
 * - Bundled (dist/mcp.js): walks from dist/ to packages/mcp
 *
 * openwisdom-mcp is registered in core getPackageRoot PACKAGE_NAMES.
 */
import { getPackageRoot } from "@openwisdom/core";

export function getMcpPackageRoot(): string {
  return getPackageRoot(import.meta.url);
}

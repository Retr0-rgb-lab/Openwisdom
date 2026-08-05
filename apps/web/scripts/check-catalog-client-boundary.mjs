/**
 * Guard: client components must not import the server catalog merge.
 * Usage: node scripts/check-catalog-client-boundary.mjs
 * Exit 0 if clean; 1 if a "use client" file imports @/data/catalog/server
 * or getCatalog from a non-server path.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.resolve(__dirname, "../src");

/** @type {string[]} */
const violations = [];

/**
 * @param {string} dir
 */
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(tsx?|jsx?)$/.test(name)) continue;
    const text = fs.readFileSync(full, "utf8");
    const isClient =
      /^["']use client["']\s*;?/m.test(text) ||
      text.startsWith('"use client"') ||
      text.startsWith("'use client'");
    if (!isClient) continue;

    if (
      /from\s+["']@\/data\/catalog\/server["']/.test(text) ||
      /from\s+["']\.\.\/.*data\/catalog\/server["']/.test(text)
    ) {
      violations.push(`${path.relative(srcRoot, full)}: imports catalog/server`);
    }
    if (/\bgetCatalog\s*\(/.test(text)) {
      violations.push(`${path.relative(srcRoot, full)}: calls getCatalog(`);
    }
    if (/import\s*\{[^}]*\bgetCatalog\b[^}]*\}\s*from\s*["']@\/data\/catalog["']/.test(text)) {
      violations.push(
        `${path.relative(srcRoot, full)}: imports getCatalog from @/data/catalog`,
      );
    }
  }
}

walk(srcRoot);

if (violations.length) {
  console.error("catalog client boundary violations:");
  for (const v of violations) console.error(" -", v);
  process.exit(1);
}
console.log("catalog client boundary OK");
process.exit(0);

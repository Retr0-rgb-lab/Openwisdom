/**
 * Red-capable structural check: sticky skills filter bar must stay compact
 * and must not embed a multi-section stacked filter form in the sticky chrome.
 *
 * Exit 1 = FAIL (bug present). Exit 0 = pass.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "src/components/skills/SkillsCatalog.tsx");
const s = fs.readFileSync(file, "utf8");

const stickyIdx = s.indexOf("sticky top-14");
if (stickyIdx < 0) {
  console.log(
    JSON.stringify({ error: "no sticky top-14 toolbar found", FAIL: true }),
  );
  process.exit(1);
}

// Only the sticky *usage* block (~closing after SkillsToolbar), not the whole file
const stickyUsage = s.slice(stickyIdx, stickyIdx + 450);
const stickyEmbedsPanelInChrome =
  /<(FiltersBody|FiltersPanel)\b/.test(stickyUsage);
const stickyUsesCompactComponent =
  stickyUsage.includes("SkillsToolbar") ||
  stickyUsage.includes('data-skills-toolbar="compact"') ||
  stickyUsage.includes("toolbar-compact");

const hasCompactToolbarDef =
  /function SkillsToolbar|data-skills-toolbar="compact"|toolbar-compact/.test(
    s,
  ) && /max-h-1[46]|max-h-14|max-h-16/.test(s);

// Full multi-section form may exist only inside Sheet (OK)
const panelOnlyInSheet =
  !/function SkillsToolbar[\s\S]*?return \([\s\S]*?<(FiltersPanel|FiltersBody)/.test(
    s,
  ) || /SheetContent[\s\S]{0,1200}?<FiltersPanel/.test(s);

const estimatedStickyPx = stickyEmbedsPanelInChrome ? 420 : 56;

const FAIL =
  stickyEmbedsPanelInChrome ||
  !stickyUsesCompactComponent ||
  !hasCompactToolbarDef ||
  estimatedStickyPx > 200;

const report = {
  stickyEmbedsPanelInChrome,
  stickyUsesCompactComponent,
  hasCompactToolbarDef,
  panelOnlyInSheet,
  estimatedStickyPx,
  FAIL,
  pass: !FAIL,
  symptom:
    "Sticky filter bar too tall — covers most of skills page when scrolling",
};

console.log(JSON.stringify(report, null, 2));
process.exit(FAIL ? 1 : 0);

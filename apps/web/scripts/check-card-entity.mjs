/**
 * Red-capable check: skill/catalog cards must not rest at low opacity or sit
 * on translucent section bands (ghost plates over ShapeGrid).
 *
 * Symptom: cards look washed-out / lack solid entity in some cases.
 * Root causes encoded here:
 *   1) StaggerItem (or parent Stagger) entrance opacity floor << 1
 *   2) SkillCard article not solid surface
 *   3) Catalog section under cards using translucent bg (e.g. /40)
 *
 * Exit 1 = FAIL (bug present). Exit 0 = pass.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const staggerPath = path.join(root, "src/components/bits/Stagger.tsx");
const cardPath = path.join(root, "src/components/skills/SkillCard.tsx");
const catalogPath = path.join(root, "src/components/skills/SkillsCatalog.tsx");

const stagger = fs.readFileSync(staggerPath, "utf8");
const card = fs.readFileSync(cardPath, "utf8");
const catalog = fs.readFileSync(catalogPath, "utf8");

const failures = [];

// --- 1) StaggerItem must not paint entity content below opacity floor ---
// Match hidden variant opacity: e.g. hidden: { opacity: 0.22, y: 22 }
const hiddenOpacityMatches = [
  ...stagger.matchAll(
    /hidden\s*:\s*\{[^}]*opacity\s*:\s*([0-9]*\.?[0-9]+)/g,
  ),
];
const OPACITY_FLOOR = 0.95; // transform-only preferred; never ghost over ShapeGrid

if (hiddenOpacityMatches.length === 0) {
  // No opacity on hidden is OK (transform-only)
} else {
  for (const m of hiddenOpacityMatches) {
    const v = Number(m[1]);
    if (!Number.isFinite(v) || v < OPACITY_FLOOR) {
      failures.push({
        id: "stagger-opacity-floor",
        detail: `Stagger hidden opacity ${v} < ${OPACITY_FLOOR} — cards ghost over ShapeGrid when whileInView delayed/stuck`,
      });
    }
  }
}

// Also catch show: starting mid-animation if initial opacity is set inline
const initialOpacity = [
  ...stagger.matchAll(/initial\s*=\s*\{\{[^}]*opacity\s*:\s*([0-9]*\.?[0-9]+)/g),
];
for (const m of initialOpacity) {
  const v = Number(m[1]);
  if (Number.isFinite(v) && v < OPACITY_FLOOR) {
    failures.push({
      id: "stagger-initial-opacity",
      detail: `Stagger initial opacity ${v} < ${OPACITY_FLOOR}`,
    });
  }
}

// --- 2) SkillCard plate must be solid surface (not /xx translucent) ---
const articleBlock = card.match(
  /<article[\s\S]*?className=\{cn\(([\s\S]*?)\)\}/,
);
if (!articleBlock) {
  failures.push({ id: "skillcard-article", detail: "no article className found" });
} else {
  const cls = articleBlock[1];
  if (!/\bbg-surface\b/.test(cls) && !/\bbg-\[#fff/.test(cls)) {
    failures.push({
      id: "skillcard-bg",
      detail: "SkillCard article missing solid bg-surface",
    });
  }
  if (/\bbg-surface\/\d+/.test(cls) || /\bbg-white\/\d+/.test(cls)) {
    failures.push({
      id: "skillcard-translucent",
      detail: "SkillCard article uses translucent bg-*/*",
    });
  }
  // Must not rely solely on parent opacity for fill
  if (!/\bborder-line-strong\b/.test(cls) && !/\bborder-line\b/.test(cls)) {
    failures.push({
      id: "skillcard-border",
      detail: "SkillCard article missing border for plate edge",
    });
  }
}

// --- 3) Catalog sections that wrap SkillGrid must not use translucent fills ---
// Flag section classNames with opacity modifiers on surface/field under grids
const translucentSection =
  /className="[^"]*bg-(?:surface|surface-muted|field)\/\d+[^"]*"/.test(
    catalog,
  ) ||
  /className=\{[^}]*bg-(?:surface|surface-muted|field)\/\d+/.test(catalog);

// Official band historically used bg-surface-muted/40 — fails entity contrast
if (/bg-surface-muted\/\d+/.test(catalog) || /bg-field\/\d+/.test(catalog)) {
  // sticky toolbar may use bg-field/95 — allow only sticky chrome, not CatalogSection
  const sectionTranslucent = [
    ...catalog.matchAll(
      /CatalogSection[\s\S]{0,200}?className="([^"]+)"/g,
    ),
  ];
  for (const m of sectionTranslucent) {
    if (/\/\d+/.test(m[1]) && /bg-/.test(m[1])) {
      failures.push({
        id: "catalog-section-translucent",
        detail: `CatalogSection className translucent: ${m[1]}`,
      });
    }
  }
  // Also catch className prop with template
  if (
    /CatalogSection[\s\S]{0,120}?className="bg-surface-muted\/\d+"/.test(
      catalog,
    )
  ) {
    // already pushed if match above
  }
}

// Direct known-bad pattern
if (/bg-surface-muted\/40/.test(catalog)) {
  failures.push({
    id: "catalog-muted-40",
    detail: "SkillsCatalog uses bg-surface-muted/40 under skill cards",
  });
}

const result = {
  FAIL: failures.length > 0,
  failures,
  checks: {
    staggerHiddenOpacities: hiddenOpacityMatches.map((m) => Number(m[1])),
    opacityFloor: OPACITY_FLOOR,
  },
};

console.log(JSON.stringify(result, null, 2));
process.exit(failures.length > 0 ? 1 : 0);

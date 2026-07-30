/**
 * Skill cards: no Magnet, no Specular; Magic Bento plate required.
 * Exit 1 = FAIL.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const card = fs.readFileSync(
  path.join(root, "src/components/skills/SkillCard.tsx"),
  "utf8",
);
const catalog = fs.readFileSync(
  path.join(root, "src/components/skills/SkillsCatalog.tsx"),
  "utf8",
);

const failures = [];
if (/from ["']@\/components\/bits\/Magnet["']/.test(card) || /<Magnet[\s>]/.test(card)) {
  failures.push({ id: "legacy-magnet", detail: "SkillCard still uses Magnet component" });
}
if (/Specular(Rim|Button)|specularShader/.test(card)) {
  failures.push({ id: "legacy-specular", detail: "SkillCard still uses Specular*" });
}
if (!/MagicBentoCard/.test(card)) {
  failures.push({ id: "no-magic-card", detail: "SkillCard missing MagicBentoCard" });
}
if (!/MagicBentoGrid/.test(catalog)) {
  failures.push({ id: "no-magic-grid", detail: "SkillsCatalog grid missing MagicBentoGrid" });
}

const result = { FAIL: failures.length > 0, failures };
console.log(JSON.stringify(result, null, 2));
process.exit(failures.length > 0 ? 1 : 0);

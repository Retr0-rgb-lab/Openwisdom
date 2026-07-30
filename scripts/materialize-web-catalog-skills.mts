/**
 * Materialize every web catalog skill that lacks a monorepo SKILL.md
 * into skills/community/{scenarios|references}/<slug>/ so CLI + MCP
 * can install the same set users see on the site.
 *
 * Usage (repo root):
 *   pnpm exec tsx scripts/materialize-web-catalog-skills.mts
 *   pnpm catalog:build
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getCatalog, type CatalogEntry } from "../apps/web/src/data/catalog/index.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function skillMdExists(slug: string, repoPath: string | null): boolean {
  const candidates = [
    repoPath ? path.join(ROOT, repoPath, "SKILL.md") : null,
    path.join(ROOT, "skills/official/scenarios", slug, "SKILL.md"),
    path.join(ROOT, "skills/official/references", slug, "SKILL.md"),
    path.join(ROOT, "skills/community/scenarios", slug, "SKILL.md"),
    path.join(ROOT, "skills/community/references", slug, "SKILL.md"),
  ].filter(Boolean) as string[];
  return candidates.some((p) => existsSync(p));
}

function yamlScalar(s: string): string {
  return JSON.stringify(s);
}

function pickText(
  loc: { zh: string; en: string } | undefined,
  lang: string,
): string {
  if (!loc) return "";
  if (lang === "en") return loc.en || loc.zh || "";
  return loc.zh || loc.en || "";
}

function truncate(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function buildBody(entry: CatalogEntry): string {
  const lang = entry.language || "zh";
  const title = pickText(entry.title, lang) || entry.slug;
  const summary = pickText(entry.summary, lang);
  const when = pickText(entry.when, lang);
  const definition = pickText(entry.definition, lang);
  const bounds = pickText(entry.bounds, lang);
  const misuse = pickText(entry.misuse, lang);

  const lines: string[] = [`# ${title}`, ""];

  if (summary) {
    lines.push("## Summary", "", summary, "");
  }
  if (when) {
    lines.push("## When to use", "", when, "");
  }
  if (definition) {
    lines.push("## Definition", "", definition, "");
  }
  if (bounds) {
    lines.push("## Bounds", "", bounds, "");
  }
  if (misuse) {
    lines.push("## Common misuse", "", misuse, "");
  }

  if (entry.steps && entry.steps.length > 0) {
    lines.push("## Steps", "");
    entry.steps.forEach((step, i) => {
      const text = pickText(step, lang);
      if (text) lines.push(`${i + 1}. ${text}`);
    });
    lines.push("");
  }

  if (entry.questions && entry.questions.length > 0) {
    lines.push("## Guiding questions", "");
    for (const q of entry.questions) {
      const text = pickText(q, lang);
      if (text) lines.push(`- ${text}`);
    }
    lines.push("");
  }

  if (entry.output && entry.output.length > 0) {
    lines.push("## Output skeleton", "");
    for (const o of entry.output) {
      const text = pickText(o, lang);
      if (text) lines.push(`- ${text}`);
    }
    lines.push("");
  }

  if (entry.bias && entry.bias.length > 0) {
    lines.push("## Bias checkpoints", "");
    for (const b of entry.bias) {
      const text = pickText(b, lang);
      if (text) lines.push(`- ${text}`);
    }
    lines.push("");
  }

  if (entry.externalUrl) {
    lines.push(
      "## Upstream",
      "",
      entry.externalUrl,
      "",
      "This skill was curated into Openwisdom for discovery and local install.",
      "Prefer the upstream repository for the latest author intent and license terms.",
      "",
    );
  }

  if (entry.attribution || entry.author || entry.license) {
    lines.push("## Provenance", "");
    if (entry.author) lines.push(`- Author: ${entry.author}`);
    if (entry.attribution) lines.push(`- Attribution: ${entry.attribution}`);
    if (entry.license) lines.push(`- License: ${entry.license}`);
    lines.push("- Openwisdom provenance: curated-external (installable community pack)");
    lines.push("");
  }

  lines.push(
    "## Agent instructions",
    "",
    "You are applying this Openwisdom skill in the current coding-agent session.",
    "Follow the summary and steps above. Do not invent hosted Openwisdom chat.",
    "Analysis runs here in this agent, not on openwisdom.vercel.app.",
    "",
  );

  return lines.join("\n");
}

function materialize(entry: CatalogEntry): string {
  const kind = entry.layer === "reference" ? "references" : "scenarios";
  const dir = path.join(
    ROOT,
    "skills",
    "community",
    kind,
    entry.slug,
  );
  mkdirSync(dir, { recursive: true });

  const lang = entry.language || "en";
  const desc = truncate(
    pickText(entry.summary, lang) || pickText(entry.title, lang) || entry.slug,
    1024,
  );

  const tags = [...new Set([...(entry.tags || []), "curated-external", "openwisdom"])]
    .filter(Boolean)
    .filter((t) => /^[\w./+-]+$/.test(t) || t.length > 0);

  const disciplines = (entry.disciplines || []).filter(Boolean);
  const fmLines = [
    "---",
    `name: ${entry.slug}`,
    `description: ${yamlScalar(desc)}`,
    `layer: ${entry.layer}`,
    "scope: community",
    `disciplines: [${disciplines.map((d) => yamlScalar(d)).join(", ")}]`,
    `language: ${yamlScalar(lang)}`,
    `tags: [${tags.map((t) => yamlScalar(t)).join(", ")}]`,
    `version: ${yamlScalar(entry.version || "0.1.0")}`,
  ];
  if (entry.license) fmLines.push(`license: ${yamlScalar(entry.license)}`);
  if (entry.references && entry.references.length > 0) {
    const refs = entry.references.filter((r) =>
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r),
    );
    if (refs.length) {
      fmLines.push(
        `references: [${refs.map((r) => yamlScalar(r)).join(", ")}]`,
      );
    }
  }
  fmLines.push("metadata:");
  fmLines.push("  openwisdom: true");
  fmLines.push('  provenance: "curated-external"');
  if (entry.externalUrl) {
    fmLines.push(`  upstream: ${yamlScalar(entry.externalUrl)}`);
  }
  fmLines.push("---", "");

  const file = path.join(dir, "SKILL.md");
  writeFileSync(file, `${fmLines.join("\n")}${buildBody(entry)}`, "utf8");
  return path.relative(ROOT, file);
}

function main(): void {
  const all = getCatalog();
  let wrote = 0;
  let skipped = 0;
  const paths: string[] = [];

  for (const entry of all) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)) {
      console.warn(`skip non-kebab slug: ${entry.slug}`);
      continue;
    }
    if (skillMdExists(entry.slug, entry.repoPath)) {
      skipped++;
      continue;
    }
    paths.push(materialize(entry));
    wrote++;
  }

  console.log(
    JSON.stringify(
      {
        webCatalog: all.length,
        wrote,
        alreadyOnDisk: skipped,
        sample: paths.slice(0, 5),
      },
      null,
      2,
    ),
  );
  console.log(
    "Next: pnpm catalog:build  # refresh registry + MCP/CLI skills-snapshot",
  );
}

main();

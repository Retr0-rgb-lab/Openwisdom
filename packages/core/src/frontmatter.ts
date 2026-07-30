/**
 * Minimal YAML frontmatter parser for SKILL.md (no gray-matter dep).
 * Handles the Openwisdom skill frontmatter shape used in-repo.
 */
import { parseSkillFrontmatter, type SkillFrontmatter } from "@openwisdom/schema";

export function extractFrontmatterBlock(raw: string): string | null {
  const text = raw.replace(/^\uFEFF/, "");
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return null;
  return text.slice(3, end).replace(/^\r?\n/, "");
}

/**
 * Very small YAML subset: keys, strings, folded `>-`, arrays of scalars / inline.
 * Good enough for official scenario frontmatter; fails open to Zod after shape.
 */
export function parseSimpleYaml(yaml: string): Record<string, unknown> {
  const lines = yaml.split(/\r?\n/);
  const root: Record<string, unknown> = {};
  let i = 0;

  const unwrap = (s: string): string | number | boolean => {
    const t = s.trim();
    if (
      (t.startsWith('"') && t.endsWith('"')) ||
      (t.startsWith("'") && t.endsWith("'"))
    ) {
      return t.slice(1, -1);
    }
    if (t === "true") return true;
    if (t === "false") return false;
    if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
    return t;
  };

  while (i < lines.length) {
    const line = lines[i]!;
    if (!line.trim() || line.trimStart().startsWith("#")) {
      i++;
      continue;
    }

    const m = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!m) {
      i++;
      continue;
    }
    const key = m[1]!;
    const rest = m[2]!;

    // Inline array: [a, b]
    if (rest.startsWith("[") && rest.endsWith("]")) {
      const inner = rest.slice(1, -1).trim();
      root[key] = inner
        ? inner.split(",").map((x) => unwrap(x.replace(/^\[|\]$/g, "")))
        : [];
      i++;
      continue;
    }

    // Folded / literal block scalars
    if (rest === ">" || rest === ">-" || rest === "|" || rest === "|-") {
      i++;
      const chunks: string[] = [];
      while (i < lines.length) {
        const next = lines[i]!;
        if (next.trim() === "") {
          chunks.push("");
          i++;
          continue;
        }
        if (/^\s+/.test(next)) {
          chunks.push(next.replace(/^\s+/, ""));
          i++;
          continue;
        }
        break;
      }
      root[key] = chunks.join(rest.startsWith("|") ? "\n" : " ").trim();
      continue;
    }

    // Nested map (indent children)
    if (rest === "") {
      i++;
      const obj: Record<string, unknown> = {};
      const arr: unknown[] = [];
      let mode: "map" | "list" | null = null;
      while (i < lines.length) {
        const next = lines[i]!;
        if (!next.trim()) {
          i++;
          continue;
        }
        if (!/^\s+/.test(next)) break;
        const body = next.trim();
        if (body.startsWith("- ")) {
          mode = "list";
          arr.push(unwrap(body.slice(2)));
          i++;
          continue;
        }
        const km = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(body);
        if (km) {
          mode = "map";
          const v = km[2]!.trim();
          obj[km[1]!] = v === "" ? true : unwrap(v);
          i++;
          continue;
        }
        break;
      }
      root[key] = mode === "list" ? arr : obj;
      continue;
    }

    root[key] = unwrap(rest);
    i++;
  }

  return root;
}

export function parseSkillMarkdown(raw: string): SkillFrontmatter {
  const block = extractFrontmatterBlock(raw);
  if (!block) {
    throw new Error("SKILL.md missing YAML frontmatter (---)");
  }
  const data = parseSimpleYaml(block);
  return parseSkillFrontmatter(data);
}

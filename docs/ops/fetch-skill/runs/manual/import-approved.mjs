/**
 * One-shot importer: approved fetch-skill candidates → skills/community/**
 * Run from repo root: node docs/ops/fetch-skill/runs/manual/import-approved.mjs
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  statSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..", "..", "..", "..");
const UP = join(__dirname, "upstream");
const COMMUNITY_SCEN = join(ROOT, "skills", "community", "scenarios");

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

function readText(p) {
  return readFileSync(p, "utf8");
}

function splitFrontmatter(raw) {
  if (!raw.startsWith("---")) {
    return { fm: "", body: raw };
  }
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { fm: "", body: raw };
  const fm = raw.slice(3, end).trim();
  let body = raw.slice(end + 4);
  if (body.startsWith("\n")) body = body.slice(1);
  return { fm, body };
}

function yamlScalar(key, text) {
  // multiline description: key: > or key: "..."
  const reBlock = new RegExp(`^${key}:\\s*>\\s*\\n((?:\\s+.+(?:\\n|$))+)`, "m");
  const mBlock = text.match(reBlock);
  if (mBlock) {
    return mBlock[1]
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  const re = new RegExp(`^${key}:\\s*(.+)$`, "m");
  const m = text.match(re);
  if (!m) return "";
  let v = m[1].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  return v.replace(/\\"/g, '"').trim();
}

function escapeYamlDouble(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildFrontmatter(opts) {
  const {
    name,
    description,
    layer = "scenario",
    disciplines,
    language = "en",
    tags,
    version = "0.1.0",
    license,
    upstream,
    provenanceNote,
  } = opts;
  const tagLine = tags.map((t) => `"${t}"`).join(", ");
  const discLine = disciplines.map((d) => `"${d}"`).join(", ");
  const lines = [
    "---",
    `name: ${name}`,
    `description: "${escapeYamlDouble(description.slice(0, 1000))}"`,
    `layer: ${layer}`,
    "scope: community",
    `disciplines: [${discLine}]`,
    `language: "${language}"`,
    `tags: [${tagLine}]`,
    `version: "${version}"`,
    `license: "${license}"`,
    "metadata:",
    "  openwisdom: true",
    "  provenance: curated-external",
    `  upstream: "${upstream}"`,
  ];
  if (provenanceNote) {
    lines.push(`  note: "${escapeYamlDouble(provenanceNote)}"`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

function provenanceFooter(opts) {
  const { author, attribution, license, upstream, extra = [] } = opts;
  const lines = [
    "",
    "## Upstream",
    "",
    upstream,
    "",
    "This skill was curated into Openwisdom for discovery and local install.",
    "Prefer the upstream repository for the latest author intent and license terms.",
    "",
    "## Provenance",
    "",
    `- Author: ${author}`,
    `- Attribution: ${attribution}`,
    `- License: ${license}`,
    "- Openwisdom provenance: curated-external (installable community pack)",
    ...extra.map((e) => `- ${e}`),
    "",
    "## Agent instructions",
    "",
    "You are applying this Openwisdom skill in the current coding-agent session.",
    "Follow the workflow in this skill. Do not invent hosted Openwisdom chat.",
    "Analysis runs here in this agent, not on openwisdom.vercel.app.",
    "",
  ];
  return lines.join("\n");
}

function writeSkill(dirName, frontmatterOpts, body, footerOpts, extraFiles = null) {
  const dest = join(COMMUNITY_SCEN, dirName);
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }
  ensureDir(dest);
  if (extraFiles && existsSync(extraFiles)) {
    // copy tree then overwrite SKILL.md
    cpSync(extraFiles, dest, {
      recursive: true,
      filter: (src) => {
        const base = src.split(/[/\\]/).pop();
        if (base === ".git" || base === "node_modules") return false;
        // skip huge binary hero assets if any
        if (base && base.endsWith(".png") && src.includes("assets")) return false;
        return true;
      },
    });
  }
  let bodyClean = body.trimEnd() + "\n";
  // strip trailing provenance if re-running
  if (!bodyClean.includes("## Provenance")) {
    bodyClean = bodyClean + provenanceFooter(footerOpts);
  } else {
    bodyClean = bodyClean + "\n";
  }
  writeFileSync(
    join(dest, "SKILL.md"),
    buildFrontmatter(frontmatterOpts) + bodyClean,
    "utf8",
  );
  console.log("wrote", relative(ROOT, dest));
}

// --- 1) skills-for-decision-making (8 skills, full dirs) ---
const dmRoot = join(UP, "decision-making");
const dmSkills = readdirSync(dmRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(dmRoot, d.name, "SKILL.md")))
  .map((d) => d.name);

for (const name of dmSkills) {
  const srcDir = join(dmRoot, name);
  const raw = readText(join(srcDir, "SKILL.md"));
  const { fm, body } = splitFrontmatter(raw);
  const description =
    yamlScalar("description", fm) ||
    "Decision-making agent skill from Algorithms for Decision Making.";
  writeSkill(
    name,
    {
      name,
      description,
      disciplines: ["psychology", "economics"],
      tags: [
        "decision-making",
        "expected-utility",
        "critical-thinking",
        "algorithms-for-decision-making",
        "curated-external",
        "openwisdom",
      ],
      license: "MIT",
      upstream: `https://github.com/romainsimon/skills-for-decision-making/tree/main/${name}`,
    },
    body,
    {
      author: "Romain Simon",
      attribution: "romainsimon/skills-for-decision-making",
      license: "MIT",
      upstream: `https://github.com/romainsimon/skills-for-decision-making/tree/main/${name}`,
      extra: [
        "Source book: Kochenderfer, Wheeler & Wray, Algorithms for Decision Making (MIT Press, 2022)",
      ],
    },
    srcDir,
  );
}

// --- 2) education selective: historical-thinking + SRL (skip study-strategy-selector) ---
const eduSelect = [
  ["historical-thinking", "history", ["history", "historical-thinking", "education", "sourcing"]],
  ["self-regulated-learning", "psychology", ["psychology", "metacognition", "self-regulated-learning", "education"]],
];

for (const [domain, primaryDisc, tagBase] of eduSelect) {
  const domainDir = join(UP, "education", "skills", domain);
  if (!existsSync(domainDir)) {
    console.warn("missing", domainDir);
    continue;
  }
  for (const ent of readdirSync(domainDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    if (ent.name === "study-strategy-selector") {
      console.log("skip study-strategy-selector (already curated)");
      continue;
    }
    const name = ent.name;
    if (name.length > 64) {
      console.warn("name too long, skip", name);
      continue;
    }
    const srcDir = join(domainDir, name);
    const skillPath = join(srcDir, "SKILL.md");
    if (!existsSync(skillPath)) continue;
    const raw = readText(skillPath);
    const { fm, body } = splitFrontmatter(raw);
    const description =
      yamlScalar("description", fm) ||
      yamlScalar("skill_name", fm) ||
      `Education agent skill: ${name}`;
    const disciplines =
      domain === "historical-thinking"
        ? ["history"]
        : ["psychology"];
    writeSkill(
      name,
      {
        name,
        description,
        disciplines,
        tags: [...tagBase, "cc-by-sa-4.0", "curated-external", "openwisdom"],
        license: "CC-BY-SA-4.0",
        upstream: `https://github.com/GarethManning/education-agent-skills/tree/main/skills/${domain}/${name}`,
        provenanceNote:
          "CC-BY-SA-4.0 share-alike; attribute GarethManning/education-agent-skills",
      },
      body,
      {
        author: "Gareth Manning / contributors (see upstream)",
        attribution: "GarethManning/education-agent-skills",
        license: "CC-BY-SA-4.0",
        upstream: `https://github.com/GarethManning/education-agent-skills/tree/main/skills/${domain}/${name}`,
        extra: [
          "Share-alike: derivatives must use a compatible license and attribution",
        ],
      },
      srcDir,
    );
  }
}

// --- 3) DishantPal deep-research ---
{
  const srcDir = join(UP, "deep-research", "deep-research");
  const raw = readText(join(srcDir, "SKILL.md"));
  const { fm, body } = splitFrontmatter(raw);
  // avoid clashing with generic name; keep descriptive id
  const name = "dishant-deep-research";
  const description =
    yamlScalar("description", fm) ||
    "Five-layer deep research with frameworks, red-team, and synthesis.";
  // copy references from parent if nested
  writeSkill(
    name,
    {
      name,
      description,
      disciplines: ["political-science", "economics", "sociology"],
      tags: [
        "deep-research",
        "red-team",
        "pestel",
        "market-research",
        "curated-external",
        "openwisdom",
      ],
      license: "MIT",
      upstream:
        "https://github.com/DishantPal/deep-research-skill/tree/main/deep-research",
      provenanceNote: "Distinct from daymade-deep-research already in catalog",
    },
    body,
    {
      author: "DishantPal",
      attribution: "DishantPal/deep-research-skill",
      license: "MIT",
      upstream:
        "https://github.com/DishantPal/deep-research-skill/tree/main/deep-research",
    },
    srcDir,
  );
}

// --- 4) psychology-agent: knock + portable retrospect ---
{
  const knockRaw = readText(
    join(UP, "psychology", ".claude", "skills", "knock", "SKILL.md"),
  );
  const { body } = splitFrontmatter(knockRaw);
  // strip Claude-only allowed-tools / harness integration noise remains in body but OK
  let knockBody = body
    .replace(/\ballowed-tools:.*$/gm, "")
    .replace(/user-invocable:.*$/gm, "")
    .replace(/argument-hint:.*$/gm, "");
  knockBody =
    "## When to use\n\n" +
    "Trace second- and higher-order effects of **one** decision, policy, product change, " +
    "or social intervention before committing. Fits orientation / macro analysis when you need " +
    "structured knock-on chains rather than multi-option comparison.\n\n" +
    knockBody;
  writeSkill(
    "knock",
    {
      name: "knock",
      description:
        "Single-option 10-order knock-on effect tracing for decisions, policies, and system changes (portable extract from psychology-agent).",
      disciplines: ["psychology", "sociology", "political-science"],
      tags: [
        "knock-on",
        "second-order-effects",
        "decision-analysis",
        "systems",
        "curated-external",
        "openwisdom",
      ],
      license: "Apache-2.0",
      upstream:
        "https://github.com/safety-quotient-lab/psychology-agent/tree/main/.claude/skills/knock",
      provenanceNote:
        "Extract-only; do not import full psychology-agent monorepo",
    },
    knockBody,
    {
      author: "safety-quotient-lab",
      attribution: "safety-quotient-lab/psychology-agent",
      license: "Apache-2.0",
      upstream:
        "https://github.com/safety-quotient-lab/psychology-agent/tree/main/.claude/skills/knock",
      extra: [
        "Openwisdom import is extract-only (knock skill), not the full product harness",
      ],
    },
  );
}

{
  // Portable retrospect: four-layer method without mesh transport / peer agents
  const retroBody = `# Session Retrospect (portable)

Reflective, cross-session meaning-making adapted for a **standalone** agent session.
Upstream psychology-agent \`/retrospect\` is tightly coupled to a multi-agent mesh
(transport files, peer routing, state.db). This Openwisdom pack keeps the **method**
and drops harness-specific automation.

## When to use

- After a multi-step analysis or research arc
- When the user asks what was learned, what patterns recur, or what to do next
- Periodic metacognitive review of agent+user work (not a substitute for
  official \`metacognition-audit\`)

## Four layers

### Layer 1 — Audit (what was dropped?)

Scan the conversation / artifacts for:

| Type | Signal |
|------|--------|
| undelivered commitment | "will / next / TODO" with no follow-through |
| unanswered question | user question never addressed |
| untracked claim | strong claim without evidence pointer |
| stale thread | open issue idle across turns |

Output only items that need attention.

### Layer 2 — Reflect (what does it mean?)

Not a summary. Recombine:

1. Cross-session or cross-turn **patterns** and structural reasons they persist
2. How core constructs or framing **evolved**
3. Dyadic learning (what only emerged from human–agent collaboration)
4. Analogies that earned insight vs decoration
5. Epistemic position: more grounded or more speculative than earlier?
6. Creative vs evaluative balance

Ground each reflection in at least one theory name, one observable datum, and one
falsifiable check.

### Layer 3 — Route (who should know?)

Propose **who** benefits (user roles, teammates, future-you) and draft short outbound
notes. **Never auto-send**; surface for human approval.

### Layer 4 — Prescribe (what should we do?)

For each material finding:

1. Specific recommendation
2. Rationale + evidence
3. Impact if act / if not
4. Owner (user / agent assist)
5. Priority: immediate / next session / backlog

No auto-execution of prescriptions.

## Output template

\`\`\`markdown
# Retrospect report
## Top 3 findings
1. …
## Layer 1 Audit
| item | type | action |
## Layer 2 Reflection
…
## Layer 3 Routing drafts
…
## Layer 4 Prescriptions
| # | recommendation | owner | priority |
## Epistemic flags
…
\`\`\`

## What this pack does NOT do

- Auto-write TODOs, auto-send messages, or modify remote peer agents
- Replace official Openwisdom orientation / metacognition scenarios
- Claim clinical or psychometric validity
`;

  writeSkill(
    "session-retrospect",
    {
      name: "session-retrospect",
      description:
        "Portable four-layer retrospect (audit, reflect, route, prescribe) adapted from psychology-agent without mesh transport dependencies.",
      disciplines: ["psychology"],
      tags: [
        "metacognition",
        "retrospect",
        "reflection",
        "session-review",
        "curated-external",
        "openwisdom",
      ],
      license: "Apache-2.0",
      upstream:
        "https://github.com/safety-quotient-lab/psychology-agent/tree/main/.claude/skills/retrospect",
      provenanceNote:
        "Method adapted for portability; mesh-specific transport/peers removed",
    },
    retroBody,
    {
      author: "safety-quotient-lab (method); Openwisdom adaptation",
      attribution: "safety-quotient-lab/psychology-agent (retrospect method)",
      license: "Apache-2.0",
      upstream:
        "https://github.com/safety-quotient-lab/psychology-agent/tree/main/.claude/skills/retrospect",
      extra: [
        "Portable adaptation — not a 1:1 copy of mesh-bound /retrospect",
      ],
    },
  );
}

// --- 5) objective-analysis ---
{
  const srcDir = join(UP, "objective");
  const raw = readText(join(srcDir, "SKILL.md"));
  const { fm, body } = splitFrontmatter(raw);
  const name = "objective-analysis";
  let description = yamlScalar("description", fm);
  if (!description) {
    description =
      "Evidence, fallacy, and cognitive-bias audit through an explicit Objectivist (Ayn Rand) philosophical lens.";
  }
  // Prepend ideology gate for Openwisdom catalog honesty
  const gate =
    "## Ideology & activation gate (Openwisdom)\n\n" +
    "This skill applies **Ayn Rand's Objectivism** as an explicit philosophical method, " +
    "not as neutral \"objectivity\" or generic critical thinking.\n\n" +
    "- **Activate only** when the user asks for Objectivism, Ayn Rand, or an Objectivist audit/lens.\n" +
    "- **Do not** treat ordinary requests for an \"objective analysis\", neutrality, or fact-check as a trigger.\n" +
    "- Label Objectivist premises when they drive the verdict; steelman non-Objectivist views before critique.\n" +
    "- Fallacy and bias catalogs may be used as method tools; philosophical conclusions remain ideology-marked.\n\n";

  writeSkill(
    name,
    {
      name,
      description,
      disciplines: ["psychology", "political-science", "philosophy"],
      tags: [
        "objectivism",
        "critical-thinking",
        "fallacies",
        "cognitive-bias",
        "ideology-labeled",
        "curated-external",
        "openwisdom",
      ],
      license: "MIT",
      upstream: "https://github.com/D4ilyHub/objective-analysis",
      provenanceNote:
        "Ideology-labeled: Objectivist lens; not generic neutrality",
    },
    gate + body,
    {
      author: "D4ilyHub",
      attribution: "D4ilyHub/objective-analysis",
      license: "MIT",
      upstream: "https://github.com/D4ilyHub/objective-analysis",
      extra: [
        "Openwisdom labels this pack as ideology-gated Objectivist method",
      ],
    },
    srcDir,
  );
  // remove agents/ openai yaml noise if copied
  const agentsDir = join(COMMUNITY_SCEN, name, "agents");
  if (existsSync(agentsDir)) {
    rmSync(agentsDir, { recursive: true, force: true });
  }
}

console.log("\nDone. Next: pnpm catalog:build");

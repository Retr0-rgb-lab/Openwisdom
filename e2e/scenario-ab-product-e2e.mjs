/**
 * Product e2e for the two required loops (Spec 31):
 * A) Web Official ↔ MCP search / get / install / ready-to-use
 * B) Scenario-oriented search → get → install → ready-to-use
 *
 * Uses LOCAL monorepo MCP (packages/mcp/dist/mcp.js), not npm.
 * Does NOT only smoke "catalog has 8 ids" — runs multi-skill + web parity +
 * multi-query scenario searches + negative cases + post-install usability.
 *
 * Run: node e2e/scenario-ab-product-e2e.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const mcpJs = path.join(repoRoot, "packages", "mcp", "dist", "mcp.js");
const skillsRoot = path.join(repoRoot, "skills");
const localRegistryPath = path.join(
  repoRoot,
  "apps",
  "web",
  "public",
  "registry",
  "catalog.json",
);

const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: !!ok, detail: String(detail) });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

function frame(message) {
  return JSON.stringify(message) + "\n";
}

function makeClient() {
  const child = spawn(process.execPath, [mcpJs], {
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
    cwd: __dirname,
    env: {
      ...process.env,
      NO_COLOR: "1",
      OPENWISDOM_SKILLS_ROOT: skillsRoot,
    },
  });

  let stdoutBuf = "";
  let nextId = 1;
  const pending = new Map();

  child.stdout.on("data", (chunk) => {
    stdoutBuf += chunk.toString("utf8");
    let nl;
    while ((nl = stdoutBuf.indexOf("\n")) !== -1) {
      const line = stdoutBuf.slice(0, nl).trim();
      stdoutBuf = stdoutBuf.slice(nl + 1);
      if (!line) continue;
      let parsed;
      try {
        parsed = JSON.parse(line);
      } catch {
        continue;
      }
      if (parsed.id !== undefined && pending.has(parsed.id)) {
        pending.get(parsed.id)(parsed);
        pending.delete(parsed.id);
      }
    }
  });

  function send(method, params, timeoutMs = 20000) {
    const id = nextId++;
    child.stdin.write(frame({ jsonrpc: "2.0", id, method, params }));
    return new Promise((resolve, reject) => {
      pending.set(id, (resp) => {
        if (resp.error) reject(new Error(`${method}: ${JSON.stringify(resp.error)}`));
        else resolve(resp.result ?? resp);
      });
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`${method} timed out`));
        }
      }, timeoutMs);
    });
  }

  function notify(method, params) {
    child.stdin.write(frame({ jsonrpc: "2.0", method, params }));
  }

  function kill() {
    try {
      child.stdin.end();
    } catch {
      /* ignore */
    }
    child.kill();
  }

  return { send, notify, kill };
}

function parseToolJson(result) {
  if (result?.structuredContent && typeof result.structuredContent === "object") {
    return result.structuredContent;
  }
  const texts = (result?.content || [])
    .filter((c) => c.type === "text")
    .map((c) => c.text);
  for (const t of texts) {
    try {
      return JSON.parse(t);
    } catch {
      /* next */
    }
  }
  const joined = texts.join("\n");
  const start = joined.indexOf("{");
  if (start >= 0) {
    try {
      return JSON.parse(joined.slice(start));
    } catch {
      /* ignore */
    }
  }
  return { _raw: texts, isError: result?.isError };
}

function isToolError(result, json) {
  if (result?.isError) return true;
  if (json?.ok === false) return true;
  const texts = (result?.content || []).map((c) => c.text || "").join(" ");
  return /not found|unknown skill|Missing skill|No catalog/i.test(texts);
}

async function callTool(client, name, args) {
  const result = await client.send("tools/call", { name, arguments: args });
  return { result, json: parseToolJson(result) };
}

async function fetchWebOfficialIds() {
  const urls = [
    "https://openwisdom.vercel.app/registry/catalog.json",
    "https://openwisdom.vercel.app/registry/catalog.json?",
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) continue;
      const data = await res.json();
      const skills = data.skills || [];
      return {
        source: "web",
        ids: skills.map((s) => s.id).sort(),
        byId: Object.fromEntries(skills.map((s) => [s.id, s])),
      };
    } catch {
      /* try next */
    }
  }
  // fallback local registry (what web deploys from)
  const data = JSON.parse(fs.readFileSync(localRegistryPath, "utf8"));
  const skills = data.skills || [];
  return {
    source: "local-registry-file",
    ids: skills.map((s) => s.id).sort(),
    byId: Object.fromEntries(skills.map((s) => [s.id, s])),
  };
}

function skillUseReady(skillId) {
  const candidates = [
    path.join(__dirname, ".claude", "skills", skillId, "SKILL.md"),
    path.join(__dirname, ".agents", "skills", skillId, "SKILL.md"),
  ];
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    const raw = fs.readFileSync(p, "utf8");
    const ok =
      raw.includes("name:") &&
      raw.length > 200 &&
      (raw.includes("##") || raw.includes("# ") || raw.includes("description"));
    if (ok) return { ok: true, path: p, chars: raw.length };
  }
  return { ok: false, path: null, chars: 0 };
}

// Scenario-oriented queries (not skill ids) — product "搜场景再装"
const SCENARIO_QUERIES = [
  {
    name: "macro structure situation",
    args: { query: "structure situation system", layer: "scenario" },
    expectAnyOf: ["macro-scan"],
  },
  {
    name: "personal historical position",
    args: { query: "personal historical social coordinates", layer: "scenario" },
    expectAnyOf: ["personal-anchor"],
  },
  {
    name: "bias blind spot evidence",
    args: { query: "bias blind evidence thinking", layer: "scenario" },
    expectAnyOf: ["metacognition-audit"],
  },
  {
    name: "psychology bias reference",
    args: { query: "confirmation evidence", layer: "reference", discipline: "psychology" },
    expectAnyOf: ["confirmation-bias"],
  },
  {
    name: "collective free-rider sociology",
    args: { query: "free-riding groups organize", discipline: "sociology" },
    expectAnyOf: ["collective-action"],
  },
  {
    name: "loss aversion economics",
    args: { query: "loss aversion reference points", discipline: "economics" },
    expectAnyOf: ["prospect-theory"],
  },
  {
    name: "path lock-in history",
    args: { query: "lock-in early choices", layer: "reference" },
    expectAnyOf: ["path-dependence"],
  },
  {
    name: "stratification education",
    args: { query: "stratification layered positions" },
    expectAnyOf: ["social-stratification"],
  },
  // filter-only browse (no keyword skill id)
  {
    name: "all scenarios filter",
    args: { query: "", layer: "scenario" },
    expectAllLayer: "scenario",
    expectMin: 3,
  },
  {
    name: "all psychology discipline",
    args: { query: "", discipline: "psychology" },
    expectDiscipline: "psychology",
    expectMin: 1,
  },
];

// Not in installable catalog (web curated / fake)
const NON_CATALOG = [
  "not-a-skill-xyz",
  "curated-fake-seed",
  "chinese-history-external-placeholder",
];

(async () => {
  console.log("=== Product E2E: Scenario A + B (Spec 31) ===");
  console.log("MCP:", mcpJs);
  console.log("e2e cwd:", __dirname);
  console.log("");

  const web = await fetchWebOfficialIds();
  check(
    "web/registry official source loaded",
    web.ids.length >= 1,
    `${web.source} n=${web.ids.length}`,
  );

  const client = makeClient();
  try {
    await client.send("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "scenario-ab-e2e", version: "0.1.1" },
    });
    client.notify("notifications/initialized", {});

    const tools = await client.send("tools/list", {});
    const toolNames = (tools.tools || []).map((t) => t.name);
    check("has openwisdom_get", toolNames.includes("openwisdom_get"));
    check("has openwisdom_search", toolNames.includes("openwisdom_search"));
    check("has openwisdom_install", toolNames.includes("openwisdom_install"));

    // —— Scenario A: Web Official parity + full lifecycle per official skill ——
    console.log("\n--- Scenario A: Web Official ↔ MCP ---");
    const { result: listRes, json: listJ } = await callTool(client, "openwisdom_list", {
      mode: "available",
      detail: "full",
    });
    const mcpSkills = listJ.skills || [];
    const mcpIds = mcpSkills.map((s) => s.id).sort();

    check(
      "A: MCP list count matches web registry",
      mcpIds.length === web.ids.length,
      `mcp=${mcpIds.length} web=${web.ids.length}`,
    );
    check(
      "A: MCP ids === web registry ids",
      JSON.stringify(mcpIds) === JSON.stringify(web.ids),
      `missing=${web.ids.filter((id) => !mcpIds.includes(id)).join(",") || "none"} extra=${mcpIds.filter((id) => !web.ids.includes(id)).join(",") || "none"}`,
    );

    // Every web official skill: search by id, get body, fields align
    for (const id of web.ids) {
      const webSkill = web.byId[id];
      const { result: sr, json: sj } = await callTool(client, "openwisdom_search", {
        query: id,
      });
      const hits = sj.skills || [];
      check(
        `A: search id "${id}" hits self`,
        hits.some((s) => s.id === id),
        hits.map((s) => s.id).join(","),
      );

      const { result: gr, json: gj } = await callTool(client, "openwisdom_get", {
        skill: id,
        includeBody: true,
      });
      const skill = gj.skill;
      const body = gj.body?.content || "";
      check(
        `A: get "${id}" installable`,
        gj.installable === true && skill?.id === id,
        skill?.id,
      );
      check(
        `A: get "${id}" body usable (frontmatter+length)`,
        body.includes("name:") && body.length > 200,
        `chars=${body.length}`,
      );
      check(
        `A: get "${id}" layer matches registry`,
        skill?.layer === webSkill.layer,
        `${skill?.layer} vs ${webSkill.layer}`,
      );
    }

    // Install two different official skills (not only macro-scan)
    const installTargets = ["personal-anchor", "confirmation-bias"];
    for (const id of installTargets) {
      const { result: ir, json: ij } = await callTool(client, "openwisdom_install", {
        skills: [id],
        providers: ["claude", "agents"],
        cwd: __dirname,
        dryRun: false,
        noTelemetry: true,
      });
      const installOk =
        !isToolError(ir, ij) &&
        (ij.ok === true ||
          ij.exitCode === 0 ||
          (ij.results || []).some((r) =>
            ["copied", "skipped", "would_write"].includes(r.action),
          ) ||
          skillUseReady(id).ok);
      check(`A: install "${id}"`, installOk, JSON.stringify(ij).slice(0, 100));
      const ready = skillUseReady(id);
      check(
        `A: after install "${id}" ready for Agent use (SKILL.md on disk)`,
        ready.ok,
        ready.path || "missing",
      );
    }

    // —— Scenario B: scenario search → get → install → use ——
    console.log("\n--- Scenario B: scenario search → get → install → use ---");
    for (const q of SCENARIO_QUERIES) {
      const { result: sr, json: sj } = await callTool(
        client,
        "openwisdom_search",
        q.args,
      );
      const hits = sj.skills || [];
      if (q.expectAllLayer) {
        check(
          `B: [${q.name}] all layer=${q.expectAllLayer}`,
          hits.length >= (q.expectMin || 1) &&
            hits.every((s) => s.layer === q.expectAllLayer),
          `n=${hits.length}`,
        );
      } else if (q.expectDiscipline) {
        check(
          `B: [${q.name}] has discipline ${q.expectDiscipline}`,
          hits.length >= (q.expectMin || 1) &&
            hits.every((s) =>
              (s.disciplines || []).includes(q.expectDiscipline),
            ),
          hits.map((s) => s.id).join(","),
        );
      } else {
        const hitIds = hits.map((s) => s.id);
        const ok = q.expectAnyOf.some((id) => hitIds.includes(id));
        check(
          `B: [${q.name}] expects one of ${q.expectAnyOf.join("|")}`,
          ok,
          `hits=${hitIds.join(",") || "(none)"}`,
        );
      }
    }

    // Full chain for metacognition-audit via search terms (not by id first)
    {
      const { json: sj } = await callTool(client, "openwisdom_search", {
        query: "metacognition audit bias blind",
        layer: "scenario",
      });
      const hits = sj.skills || [];
      const pick = hits.find((s) => s.id === "metacognition-audit") || hits[0];
      check(
        "B: chain search finds a scenario to pick",
        !!pick && pick.layer === "scenario",
        pick?.id,
      );
      if (pick) {
        const { json: gj } = await callTool(client, "openwisdom_get", {
          skill: pick.id,
        });
        check(
          "B: chain get returns workflow body",
          (gj.body?.content || "").length > 200 && gj.installable === true,
          `id=${pick.id} chars=${gj.body?.chars}`,
        );
        await callTool(client, "openwisdom_install", {
          skills: [pick.id],
          providers: ["claude"],
          cwd: __dirname,
          noTelemetry: true,
          dryRun: false,
        });
        const ready = skillUseReady(pick.id);
        check(
          "B: chain install → ready to use in Agent",
          ready.ok,
          ready.path || "missing",
        );
      }
    }

    // Multi-skill scenario batch: search reference psychology → get each → install one more
    {
      const { json: sj } = await callTool(client, "openwisdom_search", {
        query: "bias",
        discipline: "psychology",
      });
      const hits = sj.skills || [];
      check(
        "B: multi psychology bias search non-empty",
        hits.length >= 1,
        hits.map((s) => s.id).join(","),
      );
      for (const h of hits.slice(0, 3)) {
        const { json: gj } = await callTool(client, "openwisdom_get", {
          skill: h.id,
          includeBody: true,
        });
        check(
          `B: get each hit "${h.id}"`,
          gj.skill?.id === h.id && (gj.body?.content || "").includes("name:"),
          `chars=${gj.body?.chars}`,
        );
      }
    }

    // —— Negative: not only "catalog has X", also what must NOT work ——
    console.log("\n--- Negatives (outside installable catalog) ---");
    for (const bad of NON_CATALOG) {
      const { result: gr, json: gj } = await callTool(client, "openwisdom_get", {
        skill: bad,
      });
      check(
        `N: get non-catalog "${bad}" fails`,
        isToolError(gr, gj) || gj.ok === false || !gj.skill,
        "should not pretend installable",
      );
      const { result: ir, json: ij } = await callTool(client, "openwisdom_install", {
        skills: [bad],
        providers: ["claude"],
        cwd: __dirname,
        dryRun: true,
        noTelemetry: true,
      });
      // install may return ok:false or errors array
      const failed =
        isToolError(ir, ij) ||
        ij.ok === false ||
        (ij.errors && ij.errors.length > 0) ||
        (ij.results || []).every((r) => r.action === "error" || r.error);
      check(
        `N: install non-catalog "${bad}" does not succeed cleanly`,
        failed || (ij.results || []).length === 0,
        JSON.stringify(ij).slice(0, 80),
      );
    }

    // list installed after all installs
    const { json: li } = await callTool(client, "openwisdom_list", {
      mode: "installed",
      providers: ["claude", "agents"],
      scope: "project",
      cwd: __dirname,
    });
    const installed = li.installed || [];
    check(
      "post: installed placements > 0",
      installed.length > 0,
      `n=${installed.length}`,
    );

    // Disk: multiple skills ready (not only catalog listing)
    const readyIds = web.ids.filter((id) => skillUseReady(id).ok);
    check(
      "post: multiple Official skills ready on disk for Agent use",
      readyIds.length >= 3,
      readyIds.join(","),
    );
  } catch (e) {
    check("suite exception", false, e.stack || e.message);
  } finally {
    client.kill();
  }

  const failed = checks.filter((c) => !c.ok);
  console.log("");
  console.log(`Summary: ${checks.length - failed.length}/${checks.length} passed`);
  if (failed.length) {
    console.log("\nFailed cases:");
    for (const f of failed) console.log(` - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
  process.exit(0);
})();

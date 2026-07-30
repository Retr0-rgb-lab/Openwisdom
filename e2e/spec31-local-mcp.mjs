/**
 * Spec 31 local e2e from e2e/ cwd — uses monorepo MCP dist (not npm).
 * Run from repo: node e2e/spec31-local-mcp.mjs
 * Or from e2e/: node spec31-local-mcp.mjs
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const mcpJs = path.join(repoRoot, "packages", "mcp", "dist", "mcp.js");
const skillsRoot = path.join(repoRoot, "skills");

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
  const stderr = [];

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

  child.stderr.on("data", (c) => stderr.push(c.toString("utf8")));

  function send(method, params, timeoutMs = 15000) {
    const id = nextId++;
    child.stdin.write(frame({ jsonrpc: "2.0", id, method, params }));
    return new Promise((resolve, reject) => {
      pending.set(id, (resp) => {
        if (resp.error) {
          reject(new Error(`${method}: ${JSON.stringify(resp.error)}`));
        } else {
          resolve(resp.result ?? resp);
        }
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

  return { send, notify, kill, stderr };
}

function parseToolJson(result) {
  const texts = (result?.content || [])
    .filter((c) => c.type === "text")
    .map((c) => c.text);
  for (const t of texts) {
    try {
      return JSON.parse(t);
    } catch {
      /* try next */
    }
  }
  // some handlers put JSON in second text block
  const joined = texts.join("\n");
  const start = joined.indexOf("{");
  if (start >= 0) {
    try {
      return JSON.parse(joined.slice(start));
    } catch {
      /* ignore */
    }
  }
  return { _raw: texts };
}

const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: !!ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

(async () => {
  console.log("MCP binary:", mcpJs);
  console.log("cwd:", __dirname);
  console.log("");

  const client = makeClient();
  try {
    await client.send("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "spec31-e2e", version: "0.1.1" },
    });
    client.notify("notifications/initialized", {});

    const tools = await client.send("tools/list", {});
    const names = (tools.tools || []).map((t) => t.name).sort();
    check(
      "tools include openwisdom_get",
      names.includes("openwisdom_get"),
      names.join(", "),
    );
    check("tools count >= 6", names.length >= 6, String(names.length));

    // list available
    const listR = await client.send("tools/call", {
      name: "openwisdom_list",
      arguments: { mode: "available" },
    });
    const listJ = parseToolJson(listR);
    const listSkills = listJ.skills || listJ.structuredContent?.skills || [];
    check(
      "list available count === 8",
      listSkills.length === 8,
      `count=${listSkills.length}`,
    );
    const hasTags = listSkills.some(
      (s) => Array.isArray(s.tags) && s.tags.length > 0,
    );
    check("list cards include tags", hasTags);

    // search by scenario keyword
    const searchR = await client.send("tools/call", {
      name: "openwisdom_search",
      arguments: { query: "macro" },
    });
    const searchJ = parseToolJson(searchR);
    const hits = searchJ.skills || searchJ.structuredContent?.skills || [];
    check(
      "search macro hits macro-scan",
      hits.some((s) => s.id === "macro-scan"),
      hits.map((s) => s.id).join(","),
    );

    // filter-only search (empty query + layer)
    const scenR = await client.send("tools/call", {
      name: "openwisdom_search",
      arguments: { query: "", layer: "scenario" },
    });
    const scenJ = parseToolJson(scenR);
    const scenarios = scenJ.skills || scenJ.structuredContent?.skills || [];
    check(
      "search empty+layer=scenario → 3 scenarios",
      scenarios.length === 3 &&
        scenarios.every((s) => s.layer === "scenario"),
      `count=${scenarios.length}`,
    );

    // get body
    const getR = await client.send("tools/call", {
      name: "openwisdom_get",
      arguments: { skill: "macro-scan" },
    });
    const getJ = parseToolJson(getR);
    const body =
      getJ.body?.content ||
      getJ.structuredContent?.body?.content ||
      "";
    const skillId =
      getJ.skill?.id || getJ.structuredContent?.skill?.id || "";
    check("get macro-scan id", skillId === "macro-scan", skillId);
    check(
      "get body has frontmatter name",
      body.includes("name:") && body.includes("macro-scan"),
      `chars=${body.length}`,
    );
    check(
      "get installable true",
      getJ.installable === true ||
        getJ.structuredContent?.installable === true,
    );

    // unknown skill
    let unknownOk = false;
    try {
      const bad = await client.send("tools/call", {
        name: "openwisdom_get",
        arguments: { skill: "not-a-real-skill-xyz" },
      });
      // MCP may return isError in result without rejecting
      unknownOk =
        bad.isError === true ||
        (bad.content || []).some(
          (c) => c.text && /not found|unknown|Missing/i.test(c.text),
        );
    } catch {
      unknownOk = true;
    }
    check("get unknown skill errors", unknownOk);

    // install dry-run into e2e cwd
    const instR = await client.send("tools/call", {
      name: "openwisdom_install",
      arguments: {
        skills: ["macro-scan"],
        providers: ["claude", "agents"],
        dryRun: true,
        cwd: __dirname,
      },
    });
    const instJ = parseToolJson(instR);
    const ok =
      instJ.ok === true ||
      instJ.structuredContent?.ok === true ||
      instJ.exitCode === 0 ||
      instJ.structuredContent?.exitCode === 0 ||
      (instJ.results || instJ.structuredContent?.results || []).length > 0;
    check("install dryRun ok", ok, JSON.stringify(instJ).slice(0, 120));

    // real install
    const realR = await client.send("tools/call", {
      name: "openwisdom_install",
      arguments: {
        skills: ["macro-scan"],
        providers: ["claude", "agents"],
        dryRun: false,
        cwd: __dirname,
        noTelemetry: true,
      },
    });
    const realJ = parseToolJson(realR);
    const realOk =
      realJ.ok === true ||
      realJ.structuredContent?.ok === true ||
      realJ.exitCode === 0 ||
      realJ.structuredContent?.exitCode === 0 ||
      !(realJ.isError || realR.isError);
    check("install real ok", realOk);

    const listInst = await client.send("tools/call", {
      name: "openwisdom_list",
      arguments: {
        mode: "installed",
        providers: ["claude", "agents"],
        scope: "project",
        cwd: __dirname,
      },
    });
    const liJ = parseToolJson(listInst);
    const installed =
      liJ.installed || liJ.structuredContent?.installed || [];
    check(
      "list installed has macro-scan",
      installed.some((r) => r.skillId === "macro-scan" || r.id === "macro-scan"),
      `n=${installed.length}`,
    );
  } catch (e) {
    check("suite threw", false, e.message);
  } finally {
    client.kill();
  }

  const failed = checks.filter((c) => !c.ok);
  console.log("");
  console.log(
    `Summary: ${checks.length - failed.length}/${checks.length} passed`,
  );
  if (failed.length) {
    console.log("Failed:", failed.map((f) => f.name).join("; "));
    process.exit(1);
  }
  process.exit(0);
})();

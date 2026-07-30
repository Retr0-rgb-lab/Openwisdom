// Drive the openwisdom-mcp server over stdio JSON-RPC and dump everything we observe.
// We deliberately do NOT inspect the package source — only protocol behavior.

import { spawn } from "node:child_process";
import process from "node:process";

const REQUEST_ID = Symbol.for("request-id");

function frame(message) {
  return JSON.stringify(message) + "\n";
}

function makeClient() {
  const child = spawn(
    "npx",
    ["--yes", "openwisdom-mcp"],
    {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
      windowsHide: true,
      env: { ...process.env, NO_COLOR: "1" },
    }
  );

  const out = [];
  const err = [];
  let stdoutBuf = "";
  let nextId = 1;
  const pending = new Map();
  const notifications = [];

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
        out.push({ _raw: line });
        continue;
      }
      if (parsed.id !== undefined && pending.has(parsed.id)) {
        pending.get(parsed.id)(parsed);
        pending.delete(parsed.id);
      } else if (parsed.id !== undefined || parsed.method) {
        out.push(parsed);
      } else {
        notifications.push(parsed);
      }
    }
  });

  child.stderr.on("data", (chunk) => {
    err.push(chunk.toString("utf8"));
  });

  child.on("exit", (code, signal) => {
    out.push({ _exit: { code, signal } });
  });

  function send(method, params) {
    const id = nextId++;
    const msg = { jsonrpc: "2.0", id, method, params };
    child.stdin.write(frame(msg));
    return new Promise((resolve, reject) => {
      pending.set(id, (resp) => {
        if ("error" in resp) reject(new Error(`${method}: ${JSON.stringify(resp.error)}`));
        else resolve(resp.result ?? resp);
      });
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`${method} timed out`));
        }
      }, 10000);
    });
  }

  function notify(method, params) {
    const msg = { jsonrpc: "2.0", method, params };
    child.stdin.write(frame(msg));
  }

  return { child, out, err, send, notify };
}

function summarize(result, depth = 0) {
  const pad = "  ".repeat(depth);
  if (result === null || result === undefined) return `${pad}<none>`;
  if (typeof result !== "object") return pad + JSON.stringify(result);
  if (Array.isArray(result)) {
    return result.map((r) => summarize(r, depth + 1)).join("\n");
  }
  const lines = [];
  for (const [k, v] of Object.entries(result)) {
    if (typeof v === "object" && v !== null) {
      lines.push(`${pad}${k}:`);
      lines.push(summarize(v, depth + 1));
    } else {
      lines.push(`${pad}${k}: ${JSON.stringify(v)}`);
    }
  }
  return lines.join("\n");
}

(async () => {
  const client = makeClient();
  const { send, notify } = client;

  const log = (...a) => console.log(...a);

  log("=== initialize ===");
  try {
    const init = await send("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "openwisdom-e2e", version: "0.1.0" },
    });
    log(summarize(init));
  } catch (e) {
    log("initialize failed:", e.message);
    client.child.kill();
    process.exit(1);
  }

  notify("notifications/initialized", {});

  log("\n=== tools/list ===");
  try {
    const tools = await send("tools/list", {});
    log(summarize(tools));
  } catch (e) {
    log("tools/list failed:", e.message);
  }

  log("\n=== tools/call openwisdom_search ===");
  try {
    const r = await send("tools/call", {
      name: "openwisdom_search",
      arguments: { query: "macro" },
    });
    log(summarize(r));
  } catch (e) {
    log("openwisdom_search call failed:", e.message);
  }

  log("\n=== tools/call openwisdom_list (available) ===");
  try {
    const r = await send("tools/call", {
      name: "openwisdom_list",
      arguments: { mode: "available" },
    });
    log(summarize(r));
  } catch (e) {
    log("openwisdom_list call failed:", e.message);
  }

  log("\n=== tools/call openwisdom_detect_providers ===");
  try {
    const r = await send("tools/call", {
      name: "openwisdom_detect_providers",
      arguments: {},
    });
    log(summarize(r));
  } catch (e) {
    log("openwisdom_detect_providers failed:", e.message);
  }

  log("\n=== tools/call openwisdom_install dryRun ===");
  try {
    const r = await send("tools/call", {
      name: "openwisdom_install",
      arguments: {
        skills: ["macro-scan"],
        providers: ["claude"],
        dryRun: true,
      },
    });
    log(summarize(r));
  } catch (e) {
    log("openwisdom_install dryRun failed:", e.message);
  }

  log("\n=== prompts/list ===");
  try {
    const r = await send("prompts/list", {});
    log(summarize(r));
  } catch (e) {
    log("prompts/list failed:", e.message);
  }

  log("\n=== resources/list ===");
  try {
    const r = await send("resources/list", {});
    log(summarize(r));
  } catch (e) {
    log("resources/list failed:", e.message);
  }

  log("\n=== ping ===");
  try {
    const r = await send("ping", {});
    log(summarize(r));
  } catch (e) {
    log("ping failed:", e.message);
  }

  client.child.kill();
  await new Promise((r) => client.child.on("exit", r));
})();

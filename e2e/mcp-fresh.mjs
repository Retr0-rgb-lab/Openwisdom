// Fresh MCP smoke: handshake + search "macro-scan". Emits exactly one line per result.
import { spawn } from "node:child_process";

const c = spawn("npx", ["--yes", "openwisdom-mcp"], {
  stdio: ["pipe", "pipe", "pipe"],
  shell: true,
  windowsHide: true,
});
let buf = "";
let step = 0;
c.stdout.on("data", (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf("\n")) !== -1) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let m;
    try { m = JSON.parse(line); } catch { continue; }
    if (m.id === 1) {
      step++;
      console.log(`[step ${step}] initialize → server ${m.result.serverInfo.name} v${m.result.serverInfo.version}, protocol ${m.result.protocolVersion}`);
      c.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: {} }) + "\n");
      c.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }) + "\n");
      c.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "openwisdom_search", arguments: { query: "macro-scan" } } }) + "\n");
    } else if (m.id === 2) {
      step++;
      console.log(`[step ${step}] tools/list → ${m.result.tools.length} tools: ${m.result.tools.map((t) => t.name).join(", ")}`);
    } else if (m.id === 3) {
      step++;
      const text = (m.result.content || []).map((c) => c.text).join(" ");
      const ids = (m.result.structuredContent && m.result.structuredContent.skills || []).map((s) => s.id).join(",");
      console.log(`[step ${step}] openwisdom_search "macro-scan" → ok=${m.result.structuredContent.ok}, ids=[${ids}]`);
      c.kill();
      process.exit(0);
    }
  }
});
c.stderr.on("data", (d) => process.stderr.write("[mcp-err] " + d));
setTimeout(() => { c.kill(); process.exit(2); }, 30000);

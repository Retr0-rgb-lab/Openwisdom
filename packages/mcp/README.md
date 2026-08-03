# openwisdom-mcp

Openwisdom **MCP** surface — local **stdio** skill package manager for coding agents.

Same install/catalog semantics as the CLI (`openwisdom`), via `@openwisdom/core`.  
**Not** a hosted chatbot. **No** LLM / analyze tools.

## SDK

Uses **`@modelcontextprotocol/server` v2** (`McpServer` + `StdioServerTransport`) with **zod `^4.2`** for tool `inputSchema` (MCP SDK v2 requires Zod 4 Standard Schema / JSON Schema conversion; monorepo `packages/schema` may still use Zod 3).

## Tools

| Tool | Role |
|------|------|
| `openwisdom_list` | Browse full installable catalog (or installed); optional `tag` |
| `openwisdom_search` | Keywords / layer / scope / discipline / **tag** |
| `openwisdom_get` | Open one skill: catalog row + **SKILL.md body** (read before install) |
| `openwisdom_install` | Install skills (requires `providers[]`; multi `skills[]`) |
| `openwisdom_update` | Refresh installed skills |
| `openwisdom_detect_providers` | Detect harness paths (read-only) |

Installable library = website registry (official + community packs). **No** `run` / analyze / recommend tools.

### Reddit / handoff discovery (after macro-scan)

User: *“I see the pattern but not what I own vs the company vs the state, and when to stop.”*

```text
openwisdom_search({ tag: "orientation-pipeline" })
  # → responsibility-scope (order 1), responsibility-bridge (order 2), analysis-closure (order 3)
  → openwisdom_get each (optional, read body)
  → openwisdom_detect_providers
  → openwisdom_install({
      skills: ["responsibility-scope","responsibility-bridge","analysis-closure"],
      providers: ["claude"],   // or from detect
      dryRun: true             // then false
    })
  → invoke skills in the Agent session — not via MCP
```

Keyword tips (AND tokens): `responsibility`, `ownership`, `closure`, `stop`, `mandate`. Prefer **short tokens** or `tag`, not full English sentences.

Recommended agent flow (general):

```text
openwisdom_list | openwisdom_search
  → openwisdom_get(skill)              // read SKILL.md before install
  → openwisdom_detect_providers
  → openwisdom_install(dryRun: true)   // optional
  → openwisdom_install
  → (use the skill in the Agent session — not via MCP)
```

## Run locally (monorepo)

```bash
# from repo root
pnpm --filter @openwisdom/core build
pnpm --filter openwisdom-mcp build
pnpm mcp
# or:
node packages/mcp/dist/mcp.js
```

**Never** log business output to stdout — the process speaks MCP JSON-RPC only. Startup failures go to stderr.

## Client configuration

### Claude Code

```bash
claude mcp add --transport stdio openwisdom -- npx -y openwisdom-mcp
```

Or project `.mcp.json`:

```json
{
  "mcpServers": {
    "openwisdom": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "openwisdom-mcp"],
      "env": {
        "OPENWISDOM_SKILLS_ROOT": "/absolute/path/to/Openwisdom/skills"
      }
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "openwisdom": {
      "command": "npx",
      "args": ["-y", "openwisdom-mcp"]
    }
  }
}
```

### Claude Desktop

```json
{
  "mcpServers": {
    "openwisdom": {
      "command": "npx",
      "args": ["-y", "openwisdom-mcp"]
    }
  }
}
```

### Local monorepo development

```json
{
  "mcpServers": {
    "openwisdom": {
      "command": "node",
      "args": ["E:/学习软件/Openwisdom/packages/mcp/dist/mcp.js"],
      "env": {
        "OPENWISDOM_SKILLS_ROOT": "E:/学习软件/Openwisdom/skills",
        "OPENWISDOM_NO_TELEMETRY": "1"
      }
    }
  }
}
```

**Notes:** Prefer `npx -y`. On Windows if spawn fails, try `cmd /c npx -y openwisdom-mcp`.  
`cwd` resolution for project installs: tool arg → `CLAUDE_PROJECT_DIR` → `process.cwd()`.

## Environment

| Variable | Effect |
|----------|--------|
| `OPENWISDOM_NO_TELEMETRY=1` | Disable install telemetry |
| `OPENWISDOM_TELEMETRY_URL` | Telemetry endpoint (unset = no report) |
| `OPENWISDOM_SKILLS_ROOT` | Local skills tree (dev / monorepo) |
| `CLAUDE_PROJECT_DIR` | Default project cwd for installs |
| `CI` | Treated as telemetry off (same as CLI) |

Successful installs report with `source: "mcp"` (fail-open).

## License

MIT (Openwisdom monorepo).

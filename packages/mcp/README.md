# openwisdom-mcp

Openwisdom **MCP** surface — local **stdio** skill package manager for coding agents.

Same install/catalog semantics as the CLI (`openwisdom`), via `@openwisdom/core`.  
**Not** a hosted chatbot. **No** LLM / analyze tools.

## SDK

Uses **`@modelcontextprotocol/server` v2** (`McpServer` + `StdioServerTransport`) with **zod `^4.2`** for tool `inputSchema` (MCP SDK v2 requires Zod 4 Standard Schema / JSON Schema conversion; monorepo `packages/schema` may still use Zod 3).

## Tools

| Tool | Role |
|------|------|
| `openwisdom_search` | Search catalog |
| `openwisdom_list` | List available or installed |
| `openwisdom_install` | Install skills (requires `providers[]`) |
| `openwisdom_update` | Refresh installed skills |
| `openwisdom_detect_providers` | Detect harness paths (read-only) |

Recommended agent flow:

```text
openwisdom_detect_providers
  → openwisdom_search / openwisdom_list
  → openwisdom_install(dryRun: true)   // optional
  → openwisdom_install(dryRun: false)
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

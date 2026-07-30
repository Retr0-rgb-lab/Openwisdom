/**
 * Openwisdom MCP entry — stdio package manager only.
 * NEVER write business logs to stdout (protocol frames only).
 * Fatal startup failures may use console.error.
 */
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(
    `openwisdom-mcp fatal: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exitCode = 1;
});

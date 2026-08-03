/**
 * Openwisdom CLI — skill package manager (no LLM).
 * Shebang injected by tsup banner only (avoid double #! under ESM on Windows).
 */
import { defineCommand, runMain } from "citty";
import { UsageError } from "@openwisdom/core";
import { CLI_VERSION } from "./version.js";
import { searchCommand } from "./commands/search.js";
import { listCommand } from "./commands/list.js";
import { installCommand } from "./commands/install.js";
import { updateCommand } from "./commands/update.js";

// Normalize -V → --version (citty handles --version via meta.version).
// Print early so both flags exit 0 with version only.
const rawArgs = process.argv.slice(2);
if (
  rawArgs.length === 1 &&
  (rawArgs[0] === "-V" || rawArgs[0] === "--version")
) {
  console.log(CLI_VERSION);
  process.exit(0);
}
// Also rewrite -V when mixed with other args citty might not map.
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "-V") process.argv[i] = "--version";
}

const main = defineCommand({
  meta: {
    name: "openwisdom",
    version: CLI_VERSION,
    description:
      "Openwisdom skill package manager — search [--tag] / list / install [--bundle] / update (no hosted LLM)",
  },
  subCommands: {
    search: searchCommand,
    list: listCommand,
    install: installCommand,
    update: updateCommand,
  },
});

runMain(main).catch((err: unknown) => {
  // Prefer quiet usage errors (commands usually handle these without throw).
  if (err instanceof UsageError) {
    console.error(`error: ${err.message}`);
    process.exit(err.exitCode);
  }
  const message = err instanceof Error ? err.message : String(err);
  // Unknown command / usage → exit 2 when citty surfaces it as such
  const looksUsage =
    /unknown command|unrecognized|invalid command|missing required/i.test(
      message,
    ) || String(err).includes("USAGE");
  // Avoid double-print if citty already logged
  if (!message.includes("No skill ids") && !String(err).includes("USAGE")) {
    console.error(`error: ${message}`);
  }
  process.exit(looksUsage ? 2 : 1);
});

/**
 * Openwisdom CLI — skill package manager (no LLM).
 * Shebang injected by tsup banner only (avoid double #! under ESM on Windows).
 */
import { runMain } from "citty";
import { UsageError } from "@openwisdom/core";
import { CLI_VERSION } from "./version.js";
import { main } from "./main.js";

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

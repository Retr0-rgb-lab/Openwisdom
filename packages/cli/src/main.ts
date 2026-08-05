/**
 * Root citty command tree (package-manager only — no LLM / run / analyze).
 * Separated from the bin entry so surface tests can import without side effects.
 */
import { defineCommand } from "citty";
import { CLI_VERSION } from "./version.js";
import { searchCommand } from "./commands/search.js";
import { listCommand } from "./commands/list.js";
import { installCommand } from "./commands/install.js";
import { updateCommand } from "./commands/update.js";

/** Package-manager subcommands only (hard product rule: no hosted analysis). */
export const PACKAGE_MANAGER_SUBCOMMANDS = [
  "search",
  "list",
  "install",
  "update",
] as const;

export const main = defineCommand({
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

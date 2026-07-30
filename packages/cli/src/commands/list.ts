import { defineCommand } from "citty";
import { parseProvidersFlag } from "@openwisdom/providers";
import { loadCatalog, listInstalled, UsageError } from "@openwisdom/core";

export const listCommand = defineCommand({
  meta: {
    name: "list",
    description:
      "List available skills from catalog (default) or --installed on disk",
  },
  args: {
    installed: {
      type: "boolean",
      description: "Scan provider paths for installed skills",
      default: false,
    },
    available: {
      type: "boolean",
      description: "List catalog skills (default when no --installed)",
      default: false,
    },
    providers: {
      type: "string",
      description: "Comma-separated providers (with --installed)",
    },
    scope: {
      type: "string",
      description:
        "project | global | all (installed scan; default all)",
      default: "all",
    },
    cwd: {
      type: "string",
      description: "Project root for installed scan",
    },
  },
  run({ args }) {
    try {
      const wantInstalled = Boolean(args.installed);
      const wantAvailable = Boolean(args.available) || !wantInstalled;

      if (wantAvailable && !wantInstalled) {
        const { index, source } = loadCatalog();
        console.error(`# available (${source}): ${index.skills.length}`);
        console.log(
          ["id", "layer", "scope", "version", "description"].join("\t"),
        );
        for (const s of index.skills) {
          const desc =
            s.description.length > 72
              ? s.description.slice(0, 69) + "..."
              : s.description;
          console.log(
            [s.id, s.layer, s.scope, s.version, desc.replace(/\s+/g, " ")].join(
              "\t",
            ),
          );
        }
        return;
      }

      let providerIds: string[] | undefined;
      if (args.providers) {
        try {
          providerIds = parseProvidersFlag(args.providers);
        } catch (err) {
          console.error(
            `error: ${err instanceof Error ? err.message : String(err)}`,
          );
          process.exitCode = 2;
          return;
        }
      }

      const scopeArg = args.scope ?? "all";
      if (
        scopeArg !== "project" &&
        scopeArg !== "global" &&
        scopeArg !== "all"
      ) {
        console.error(`error: Invalid --scope for list: ${scopeArg}`);
        process.exitCode = 2;
        return;
      }

      // Prefer Openwisdom catalog ids + metadata.openwisdom (not every harness skill on disk)
      let catalogIds: string[] | undefined;
      try {
        catalogIds = loadCatalog().index.skills.flatMap((s) => [s.id, s.name]);
      } catch {
        catalogIds = undefined;
      }

      const rows = listInstalled({
        cwd: args.cwd,
        providers: providerIds,
        scope: scopeArg,
        catalogIds,
      });

      if (rows.length === 0) {
        console.log("No installed skills found.");
        return;
      }

      console.error(`# installed: ${rows.length}`);
      console.log(["id", "provider", "scope", "dir"].join("\t"));
      for (const r of rows) {
        console.log([r.id, r.provider, r.scope, r.dir].join("\t"));
      }
    } catch (err) {
      if (err instanceof UsageError) {
        console.error(`error: ${err.message}`);
        process.exitCode = 2;
        return;
      }
      console.error(`error: ${err instanceof Error ? err.message : String(err)}`);
      process.exitCode = 1;
    }
  },
});

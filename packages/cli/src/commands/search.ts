import { defineCommand } from "citty";
import { loadCatalog, searchCatalog } from "@openwisdom/core";

export const searchCommand = defineCommand({
  meta: {
    name: "search",
    description: "Search the skill catalog by id, name, description, or tags",
  },
  args: {
    query: {
      type: "positional",
      description: "Search query (words are AND-matched)",
      required: false,
    },
    layer: {
      type: "string",
      description: "Filter layer: scenario | reference",
    },
    scope: {
      type: "string",
      description: "Filter provenance: official | community",
    },
    discipline: {
      type: "string",
      description: "Filter by discipline id",
    },
    limit: {
      type: "string",
      description: "Max results (default 20)",
      default: "20",
    },
  },
  run({ args, rawArgs }) {
    // Collect query tokens: positional + leftover non-flag args
    const tokens: string[] = [];
    if (args.query) tokens.push(String(args.query));
    for (const a of rawArgs) {
      if (a.startsWith("-")) continue;
      if (a === "search") continue;
      if (!tokens.includes(a)) tokens.push(a);
    }
    // Drop known flag values mistakenly collected
    const skipNext = new Set([
      "scenario",
      "reference",
      "official",
      "community",
    ]);
    const query = tokens
      .filter((t) => {
        if (args.layer && t === args.layer) return false;
        if (args.scope && t === args.scope) return false;
        if (args.discipline && t === args.discipline) return false;
        if (args.limit && t === String(args.limit)) return false;
        if (skipNext.has(t) && (args.layer === t || args.scope === t))
          return false;
        return true;
      })
      .join(" ")
      .trim();

    if (!query) {
      console.error("Usage: openwisdom search <query>");
      process.exitCode = 2;
      return;
    }

    const layer =
      args.layer === "scenario" || args.layer === "reference"
        ? args.layer
        : undefined;
    const scope =
      args.scope === "official" || args.scope === "community"
        ? args.scope
        : undefined;

    const { index, source } = loadCatalog();
    const hits = searchCatalog(index, query, {
      layer,
      scope,
      discipline: args.discipline,
      limit: Math.max(1, Number(args.limit) || 20),
    });

    if (hits.length === 0) {
      console.log(`No skills matched "${query}".`);
      return;
    }

    console.error(`# catalog source: ${source} (${hits.length} hit(s))`);
    const header = ["id", "layer", "scope", "version", "description"];
    console.log(header.join("\t"));
    for (const s of hits) {
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
  },
});

/**
 * Upstash Redis REST HeatStore via native fetch (no @upstash/redis dep).
 * Spec 28 §4.3.
 */

import {
  buildSkillStats,
  dayKey,
  lastNDaysUtc,
  totalKey,
} from "./aggregate";
import { getUpstashConfig } from "./config";
import type { HeatEventName, HeatStore, SkillHeatStats } from "./types";
import { getKnownSkillIds } from "./skill-ids";

type UpstashConfig = { url: string; token: string };

async function redisPipeline(
  cfg: UpstashConfig,
  commands: (string | number)[][],
): Promise<unknown[]> {
  if (commands.length === 0) return [];
  const pipelineUrl = cfg.url.replace(/\/$/, "") + "/pipeline";
  const res = await fetch(pipelineUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upstash pipeline ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as Array<{ result?: unknown; error?: string }>;
  if (!Array.isArray(json)) {
    throw new Error("Upstash pipeline: unexpected response");
  }
  return json.map((row) => {
    if (row?.error) throw new Error(`Upstash pipeline error: ${row.error}`);
    return row?.result;
  });
}

function asInt(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.max(0, Math.floor(v));
  }
  if (typeof v === "string" && v !== "") {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  return 0;
}

function createUpstashStore(cfg: UpstashConfig): HeatStore {
  return {
    async recordEvent(input): Promise<void> {
      const { skillId, event, day } = input;
      await redisPipeline(cfg, [
        ["INCR", dayKey(day, skillId, event)],
        ["INCR", totalKey(skillId, event)],
      ]);
    },

    async getAggregates(
      skillIds?: string[],
    ): Promise<Record<string, SkillHeatStats>> {
      const known = getKnownSkillIds();
      let ids: string[];
      if (skillIds && skillIds.length > 0) {
        ids = skillIds.filter((id) => known.has(id));
      } else {
        ids = [...known];
      }
      if (ids.length === 0) return {};

      const days30 = lastNDaysUtc(30);
      const events: HeatEventName[] = [
        "cli_install_success",
        "web_download",
        "web_copy_install",
      ];

      const commands: (string | number)[][] = [];
      const meta: Array<{
        skillId: string;
        event: HeatEventName;
        kind: "total" | "day";
      }> = [];

      for (const skillId of ids) {
        for (const event of events) {
          commands.push(["GET", totalKey(skillId, event)]);
          meta.push({ skillId, event, kind: "total" });
          for (const day of days30) {
            commands.push(["GET", dayKey(day, skillId, event)]);
            meta.push({ skillId, event, kind: "day" });
          }
        }
      }

      const CHUNK = 200;
      const results: unknown[] = [];
      for (let i = 0; i < commands.length; i += CHUNK) {
        const slice = commands.slice(i, i + CHUNK);
        const part = await redisPipeline(cfg, slice);
        results.push(...part);
      }

      type Acc = {
        cliTotal: number;
        cli30d: number;
        downloadTotal: number;
        download30d: number;
        copyTotal: number;
        copy30d: number;
      };
      const acc = new Map<string, Acc>();
      const ensure = (id: string): Acc => {
        let a = acc.get(id);
        if (!a) {
          a = {
            cliTotal: 0,
            cli30d: 0,
            downloadTotal: 0,
            download30d: 0,
            copyTotal: 0,
            copy30d: 0,
          };
          acc.set(id, a);
        }
        return a;
      };

      for (let i = 0; i < meta.length; i++) {
        const m = meta[i]!;
        const n = asInt(results[i]);
        if (n === 0) continue;
        const a = ensure(m.skillId);
        if (m.kind === "total") {
          if (m.event === "cli_install_success") a.cliTotal = n;
          else if (m.event === "web_download") a.downloadTotal = n;
          else a.copyTotal = n;
        } else {
          if (m.event === "cli_install_success") a.cli30d += n;
          else if (m.event === "web_download") a.download30d += n;
          else a.copy30d += n;
        }
      }

      const out: Record<string, SkillHeatStats> = {};
      for (const [skillId, a] of acc) {
        const stats = buildSkillStats(a);
        if (
          stats.installsTotal === 0 &&
          stats.copiesTotal === 0 &&
          stats.cliInstallsTotal === 0 &&
          stats.downloadsTotal === 0
        ) {
          continue;
        }
        out[skillId] = stats;
      }
      return out;
    },
  };
}

let cached: HeatStore | null = null;

export function getUpstashStore(
  env: NodeJS.ProcessEnv = process.env,
): HeatStore {
  const cfg = getUpstashConfig(env);
  if (!cfg) {
    throw new Error("Upstash env missing");
  }
  if (!cached) {
    cached = createUpstashStore(cfg);
  }
  return cached;
}

/** Test helper to drop singleton. */
export function __resetUpstashStoreForTests(): void {
  cached = null;
}

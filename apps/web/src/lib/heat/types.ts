/**
 * Heat / telemetry types (Specs 06 · 27 · 28).
 * installs* = cli_install_success + web_download only; web_copy_install → copies* only.
 */

export type HeatEventName =
  | "cli_install_success"
  | "web_download"
  | "web_copy_install";

export type TelemetrySource = "cli" | "mcp" | "web";

export type TelemetryBody = {
  schemaVersion: 1;
  event: HeatEventName;
  skillId: string;
  ts?: string;
  source: TelemetrySource;
  cliVersion?: string;
  sessionId?: string;
  meta?: {
    providers?: string[];
    scope?: "project" | "global";
  };
};

export type SkillHeatStats = {
  installsTotal: number;
  installs30d: number;
  cliInstallsTotal: number;
  cliInstalls30d: number;
  downloadsTotal: number;
  downloads30d: number;
  copiesTotal: number;
  copies30d: number;
};

export type StatsResponse = {
  schemaVersion: 1;
  updatedAt: string;
  skills: Record<string, SkillHeatStats>;
};

export interface HeatStore {
  recordEvent(input: {
    skillId: string;
    event: HeatEventName;
    day: string; // YYYY-MM-DD UTC
  }): Promise<void>;

  getAggregates(skillIds?: string[]): Promise<Record<string, SkillHeatStats>>;
}

export const HEAT_EVENTS: readonly HeatEventName[] = [
  "cli_install_success",
  "web_download",
  "web_copy_install",
] as const;

export const TELEMETRY_SOURCES: readonly TelemetrySource[] = [
  "cli",
  "mcp",
  "web",
] as const;

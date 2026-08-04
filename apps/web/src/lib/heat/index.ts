/**
 * Heat API library (Plan 01 + SPE 37).
 * Stats shape: ./types only. Catalog heat merge: mergeHeat / attachHeat.
 */

export type {
  HeatEventName,
  HeatStore,
  SkillHeatStats,
  StatsResponse,
  TelemetryBody,
  TelemetrySource,
} from "./types";
export { HEAT_EVENTS, TELEMETRY_SOURCES } from "./types";
export { getHeatStore } from "./store";
export { getKnownSkillIds, isKnownSkillId, getSkillRepoPath } from "./skill-ids";
export { resetMemoryStore, getMemoryStore } from "./memory-store";
export {
  buildSkillStats,
  dayKey,
  totalKey,
  utcDay,
  lastNDaysUtc,
  emptySkillStats,
} from "./aggregate";
export { checkRateLimit, clientIp, resetRateLimitForTests } from "./rate-limit";
export { validateTelemetryBody } from "./validate";
export { hasUpstashEnv, getRateLimitPerMin } from "./config";
export { fetchStats } from "./fetch-stats";
export { mergeHeat, attachHeat } from "./merge-heat";

/**
 * Heat API library (Plan 01).
 * Note: client.ts / fetch-stats.ts / merge-heat.ts are Plan 02 — not here.
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

/**
 * HeatStore factory (Spec 28 §4.4).
 * Upstash when REST URL+TOKEN set; otherwise Memory (dev/test).
 */

import { hasUpstashEnv } from "./config";
import { getMemoryStore } from "./memory-store";
import { getUpstashStore } from "./upstash-store";
import type { HeatStore } from "./types";

export type { HeatStore } from "./types";

export function getHeatStore(
  env: NodeJS.ProcessEnv = process.env,
): HeatStore {
  if (hasUpstashEnv(env)) {
    return getUpstashStore(env);
  }
  return getMemoryStore();
}

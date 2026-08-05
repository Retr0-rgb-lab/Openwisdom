/**
 * In-process heat stats for RSC / server routes (architecture F3).
 * Prefer this over self-HTTP to `/api/stats` when already on the Node server.
 * Fail-open: store errors → null (UI hides heat; never fake zeros).
 */

import "@/lib/server-only";

import { isKnownSkillId } from "./skill-ids";
import { getHeatStore } from "./store";
import type { StatsResponse } from "./types";

/**
 * Read aggregates from HeatStore in-process (Memory or Upstash).
 * Returns null on failure so callers never paint invented metrics.
 */
export async function getStatsInProcess(
  skillIds?: string[],
): Promise<StatsResponse | null> {
  try {
    const store = getHeatStore();
    let filter = skillIds;
    if (filter?.length) {
      filter = filter.filter(isKnownSkillId);
    }
    const skills = await store.getAggregates(filter);
    for (const id of Object.keys(skills)) {
      if (!isKnownSkillId(id)) {
        delete skills[id];
      }
    }
    return {
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      skills,
    };
  } catch (err) {
    console.error("[heat/get-stats] in-process getAggregates failed (fail-open)", err);
    return null;
  }
}

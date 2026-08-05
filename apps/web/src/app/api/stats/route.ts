/**
 * GET /api/stats — aggregated heat (Spec 28 §3).
 * installs* = cli_install_success + web_download; copies are separate.
 * Empty skills object when no data — never fake metrics.
 *
 * Browser / external consumers use this HTTP surface.
 * RSC catalog pages prefer `getStatsInProcess()` (same store, no self-fetch).
 */

import { getStatsInProcess } from "@/lib/heat/get-stats";
import { isKnownSkillId } from "@/lib/heat/skill-ids";
import type { StatsResponse } from "@/lib/heat/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_CONTROL =
  "public, s-maxage=300, stale-while-revalidate=60";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const idsParam = url.searchParams.get("ids");
  let filter: string[] | undefined;
  if (idsParam) {
    filter = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter(isKnownSkillId);
  }

  const stats = await getStatsInProcess(filter);
  const body: StatsResponse = stats ?? {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    skills: {},
  };

  return Response.json(body, {
    status: 200,
    headers: {
      "Cache-Control": CACHE_CONTROL,
    },
  });
}

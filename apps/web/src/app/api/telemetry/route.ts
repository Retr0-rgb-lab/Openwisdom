/**
 * POST /api/telemetry — anonymous heat events (Spec 28 §2).
 * Fail-open on storage errors; never blocks install clients.
 */

import { utcDay } from "@/lib/heat/aggregate";
import { withCors } from "@/lib/heat/cors";
import { checkRateLimit, clientIp } from "@/lib/heat/rate-limit";
import { getHeatStore } from "@/lib/heat/store";
import { validateTelemetryBody } from "@/lib/heat/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(): Promise<Response> {
  return new Response(null, withCors({ status: 204 }));
}

export async function POST(request: Request): Promise<Response> {
  // Rate limit first (Upstash when configured; else process memory)
  const ip = clientIp(request);
  if (!(await checkRateLimit(ip))) {
    return Response.json(
      { error: "rate_limited" },
      withCors({ status: 429 }),
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json(
      { error: "invalid_json" },
      withCors({ status: 400 }),
    );
  }

  const parsed = validateTelemetryBody(raw);
  if (!parsed.ok) {
    return Response.json(
      { error: parsed.error },
      withCors({ status: 400 }),
    );
  }

  const { body } = parsed;
  const day = body.ts
    ? (() => {
        const d = new Date(body.ts!);
        return Number.isNaN(d.getTime()) ? utcDay() : utcDay(d);
      })()
    : utcDay();

  let persisted = true;
  try {
    const store = getHeatStore();
    await store.recordEvent({
      skillId: body.skillId,
      event: body.event,
      day,
    });
  } catch (err) {
    persisted = false;
    console.error("[heat/telemetry] recordEvent failed (fail-open)", err);
  }

  return Response.json(
    { ok: true, persisted },
    withCors({ status: 200 }),
  );
}

/**
 * POST /api/telemetry body validation (Spec 28 §2.2).
 */

import { isKnownSkillId } from "./skill-ids";
import {
  HEAT_EVENTS,
  TELEMETRY_SOURCES,
  type HeatEventName,
  type TelemetryBody,
  type TelemetrySource,
} from "./types";

export type ValidateOk = { ok: true; body: TelemetryBody };
export type ValidateErr = { ok: false; error: string; status: 400 };

export function validateTelemetryBody(raw: unknown): ValidateOk | ValidateErr {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "invalid_json_body", status: 400 };
  }
  const o = raw as Record<string, unknown>;

  if (o.schemaVersion !== 1) {
    return { ok: false, error: "invalid_schema_version", status: 400 };
  }

  const event = o.event;
  if (typeof event !== "string" || !HEAT_EVENTS.includes(event as HeatEventName)) {
    return { ok: false, error: "invalid_event", status: 400 };
  }

  const skillId = typeof o.skillId === "string" ? o.skillId.trim() : "";
  if (!skillId) {
    return { ok: false, error: "unknown_skill", status: 400 };
  }
  if (!isKnownSkillId(skillId)) {
    return { ok: false, error: "unknown_skill", status: 400 };
  }

  const source = o.source;
  if (
    typeof source !== "string" ||
    !TELEMETRY_SOURCES.includes(source as TelemetrySource)
  ) {
    return { ok: false, error: "invalid_source", status: 400 };
  }

  // Soft consistency (v1: reject only egregious mismatches)
  if (
    event === "cli_install_success" &&
    source !== "cli" &&
    source !== "mcp"
  ) {
    return { ok: false, error: "source_event_mismatch", status: 400 };
  }
  if (
    (event === "web_download" || event === "web_copy_install") &&
    source !== "web"
  ) {
    return { ok: false, error: "source_event_mismatch", status: 400 };
  }

  const body: TelemetryBody = {
    schemaVersion: 1,
    event: event as HeatEventName,
    skillId,
    source: source as TelemetrySource,
  };

  if (typeof o.ts === "string" && o.ts.trim()) {
    body.ts = o.ts.trim();
  }
  if (typeof o.cliVersion === "string" && o.cliVersion.trim()) {
    body.cliVersion = o.cliVersion.trim();
  }
  if (typeof o.sessionId === "string" && o.sessionId.trim()) {
    body.sessionId = o.sessionId.trim();
  }
  if (o.meta && typeof o.meta === "object" && !Array.isArray(o.meta)) {
    const metaIn = o.meta as Record<string, unknown>;
    const meta: NonNullable<TelemetryBody["meta"]> = {};
    if (Array.isArray(metaIn.providers)) {
      meta.providers = metaIn.providers.filter(
        (p): p is string => typeof p === "string",
      );
    }
    if (metaIn.scope === "project" || metaIn.scope === "global") {
      meta.scope = metaIn.scope;
    }
    if (meta.providers || meta.scope) {
      body.meta = meta;
    }
  }

  return { ok: true, body };
}

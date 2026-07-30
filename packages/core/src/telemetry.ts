/**
 * Fail-open telemetry client (Spec 06 / Spec 22).
 * POSTs cli_install_success after successful install; never throws to caller.
 *
 * Skip when:
 * - --no-telemetry
 * - OPENWISDOM_NO_TELEMETRY=1
 * - CI=true / CI=1
 * - OPENWISDOM_TELEMETRY_URL unset / empty
 */
import { CORE_VERSION } from "./version.js";

export type TelemetrySource = "cli" | "mcp";

export type TelemetryEvent = {
  skillId: string;
  providers: string[];
  scope: "project" | "global";
};

export type TelemetryPayload = {
  schemaVersion: 1;
  event: "cli_install_success";
  skillId: string;
  ts: string;
  source: TelemetrySource;
  cliVersion: string;
  meta: {
    providers: string[];
    scope: "project" | "global";
  };
};

export const DEFAULT_TELEMETRY_TIMEOUT_MS = 1000;

export function isTelemetryEnabled(opts: {
  noTelemetryFlag?: boolean;
  env?: NodeJS.ProcessEnv;
}): boolean {
  const env = opts.env ?? process.env;
  if (opts.noTelemetryFlag) return false;
  if (env.OPENWISDOM_NO_TELEMETRY === "1") return false;
  if (env.CI === "true" || env.CI === "1") return false;
  if (!getTelemetryUrl(env)) return false;
  return true;
}

export function getTelemetryUrl(env?: NodeJS.ProcessEnv): string | undefined {
  const url = (env ?? process.env).OPENWISDOM_TELEMETRY_URL?.trim();
  return url || undefined;
}

export function buildInstallSuccessPayload(
  event: TelemetryEvent,
  opts?: {
    source?: TelemetrySource;
    clientVersion?: string;
    /** @deprecated Prefer clientVersion */
    cliVersion?: string;
    now?: () => Date;
  },
): TelemetryPayload {
  const ts = (opts?.now ?? (() => new Date()))().toISOString();
  return {
    schemaVersion: 1,
    event: "cli_install_success",
    skillId: event.skillId,
    ts,
    source: opts?.source ?? "cli",
    cliVersion:
      opts?.clientVersion ?? opts?.cliVersion ?? CORE_VERSION,
    meta: {
      providers: [...event.providers],
      scope: event.scope,
    },
  };
}

export type ReportOpts = {
  noTelemetryFlag?: boolean;
  env?: NodeJS.ProcessEnv;
  /** Injected fetch for tests; defaults to globalThis.fetch */
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  source?: TelemetrySource;
  clientVersion?: string;
  /** @deprecated Prefer clientVersion */
  cliVersion?: string;
  now?: () => Date;
};

/**
 * Fire-and-forget POST. Resolves when finished or skipped; **never rejects**.
 * Install path may `void reportInstallSuccess(...)`; tests may await.
 */
export async function reportInstallSuccess(
  event: TelemetryEvent,
  opts?: ReportOpts,
): Promise<void> {
  try {
    const env = opts?.env ?? process.env;
    if (!isTelemetryEnabled({ noTelemetryFlag: opts?.noTelemetryFlag, env })) {
      return;
    }
    const url = getTelemetryUrl(env);
    if (!url) return;

    const payload = buildInstallSuccessPayload(event, {
      source: opts?.source,
      clientVersion: opts?.clientVersion ?? opts?.cliVersion,
      now: opts?.now,
    });

    if (env.OPENWISDOM_TELEMETRY_DEBUG === "1") {
      console.error(`[telemetry] POST ${url} ${JSON.stringify(payload)}`);
    }

    const fetchFn = opts?.fetchImpl ?? globalThis.fetch;
    if (typeof fetchFn !== "function") {
      return;
    }

    const timeoutMs = opts?.timeoutMs ?? DEFAULT_TELEMETRY_TIMEOUT_MS;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      await fetchFn(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch {
    // fail-open: network errors, abort, JSON issues — never surface
  }
}

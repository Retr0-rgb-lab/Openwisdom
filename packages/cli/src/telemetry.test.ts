/**
 * CLI package re-runs core telemetry acceptance via @openwisdom/core.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildInstallSuccessPayload,
  isTelemetryEnabled,
  reportInstallSuccess,
} from "@openwisdom/core";
import { CLI_VERSION } from "./version.js";

const baseEvent = {
  skillId: "macro-scan",
  providers: ["claude", "cursor"],
  scope: "project" as const,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isTelemetryEnabled (cli → core)", () => {
  it("skips when --no-telemetry", () => {
    expect(
      isTelemetryEnabled({
        noTelemetryFlag: true,
        env: { OPENWISDOM_TELEMETRY_URL: "https://example.com/t" },
      }),
    ).toBe(false);
  });

  it("skips when CI=true", () => {
    expect(
      isTelemetryEnabled({
        env: {
          CI: "true",
          OPENWISDOM_TELEMETRY_URL: "https://example.com/t",
        },
      }),
    ).toBe(false);
  });

  it("enabled when URL set and no opt-outs", () => {
    expect(
      isTelemetryEnabled({
        env: { OPENWISDOM_TELEMETRY_URL: "https://example.com/t" },
      }),
    ).toBe(true);
  });
});

describe("buildInstallSuccessPayload (cli → core)", () => {
  it("matches Spec 06 schema with source cli", () => {
    const payload = buildInstallSuccessPayload(baseEvent, {
      clientVersion: CLI_VERSION,
      source: "cli",
      now: () => new Date("2026-07-29T12:00:00.000Z"),
    });
    expect(payload).toEqual({
      schemaVersion: 1,
      event: "cli_install_success",
      skillId: "macro-scan",
      ts: "2026-07-29T12:00:00.000Z",
      source: "cli",
      cliVersion: "0.1.0",
      meta: {
        providers: ["claude", "cursor"],
        scope: "project",
      },
    });
    expect(payload.cliVersion).toBe(CLI_VERSION);
  });
});

describe("reportInstallSuccess (cli → core)", () => {
  it("POSTs payload when enabled with source cli", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    await reportInstallSuccess(baseEvent, {
      env: { OPENWISDOM_TELEMETRY_URL: "https://example.com/api/telemetry" },
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: () => new Date("2026-07-29T12:00:00.000Z"),
      clientVersion: CLI_VERSION,
      source: "cli",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://example.com/api/telemetry");
    expect(JSON.parse(String(init.body))).toMatchObject({
      schemaVersion: 1,
      event: "cli_install_success",
      skillId: "macro-scan",
      source: "cli",
      meta: { providers: ["claude", "cursor"], scope: "project" },
    });
  });

  it("never rejects when fetch fails", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    await expect(
      reportInstallSuccess(baseEvent, {
        env: { OPENWISDOM_TELEMETRY_URL: "https://example.com/t" },
        fetchImpl: fetchImpl as unknown as typeof fetch,
        source: "cli",
      }),
    ).resolves.toBeUndefined();
  });
});

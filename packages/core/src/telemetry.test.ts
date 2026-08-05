/**
 * Telemetry fail-open + skip gates + source channel.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildInstallSuccessPayload,
  isTelemetryEnabled,
  reportInstallSuccess,
} from "./telemetry.js";
import { CORE_VERSION } from "./version.js";

const baseEvent = {
  skillId: "macro-scan",
  providers: ["claude", "cursor"],
  scope: "project" as const,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isTelemetryEnabled", () => {
  it("skips when --no-telemetry", () => {
    expect(
      isTelemetryEnabled({
        noTelemetryFlag: true,
        env: { OPENWISDOM_TELEMETRY_URL: "https://example.com/t" },
      }),
    ).toBe(false);
  });

  it("skips when OPENWISDOM_NO_TELEMETRY=1", () => {
    expect(
      isTelemetryEnabled({
        env: {
          OPENWISDOM_NO_TELEMETRY: "1",
          OPENWISDOM_TELEMETRY_URL: "https://example.com/t",
        },
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

  it("skips when URL unset", () => {
    expect(isTelemetryEnabled({ env: {} })).toBe(false);
    expect(
      isTelemetryEnabled({ env: { OPENWISDOM_TELEMETRY_URL: "  " } }),
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

describe("buildInstallSuccessPayload", () => {
  it("matches Spec 06 schema with source cli", () => {
    const payload = buildInstallSuccessPayload(baseEvent, {
      clientVersion: "0.1.0",
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
    expect(payload.cliVersion).toBe(CORE_VERSION);
  });

  it("accepts source mcp", () => {
    const payload = buildInstallSuccessPayload(baseEvent, {
      source: "mcp",
      clientVersion: "0.2.0",
      now: () => new Date("2026-07-29T12:00:00.000Z"),
    });
    expect(payload.source).toBe("mcp");
    expect(payload.cliVersion).toBe("0.2.0");
  });

  it("defaults source to unknown when omitted (never assumes cli)", () => {
    const payload = buildInstallSuccessPayload(baseEvent, {
      clientVersion: "0.1.0",
      now: () => new Date("2026-07-29T12:00:00.000Z"),
    });
    expect(payload.source).toBe("unknown");
    expect(payload.event).toBe("cli_install_success");
  });
});

describe("reportInstallSuccess", () => {
  it("does not call fetch when no URL", async () => {
    const fetchImpl = vi.fn();
    await reportInstallSuccess(baseEvent, {
      env: {},
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("does not call fetch when no-telemetry", async () => {
    const fetchImpl = vi.fn();
    await reportInstallSuccess(baseEvent, {
      noTelemetryFlag: true,
      env: { OPENWISDOM_TELEMETRY_URL: "https://example.com/t" },
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("does not call fetch when CI=true", async () => {
    const fetchImpl = vi.fn();
    await reportInstallSuccess(baseEvent, {
      env: {
        CI: "true",
        OPENWISDOM_TELEMETRY_URL: "https://example.com/t",
      },
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("POSTs payload when enabled", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    await reportInstallSuccess(baseEvent, {
      env: { OPENWISDOM_TELEMETRY_URL: "https://example.com/api/telemetry" },
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: () => new Date("2026-07-29T12:00:00.000Z"),
      clientVersion: "0.1.0",
      source: "cli",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://example.com/api/telemetry");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toMatchObject({
      schemaVersion: 1,
      event: "cli_install_success",
      skillId: "macro-scan",
      source: "cli",
      meta: { providers: ["claude", "cursor"], scope: "project" },
    });
  });

  it("POSTs with source mcp", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    await reportInstallSuccess(baseEvent, {
      env: { OPENWISDOM_TELEMETRY_URL: "https://example.com/api/telemetry" },
      fetchImpl: fetchImpl as unknown as typeof fetch,
      source: "mcp",
      clientVersion: "0.1.0",
    });
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body)).source).toBe("mcp");
  });

  it("POSTs source unknown when source omitted", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    await reportInstallSuccess(baseEvent, {
      env: { OPENWISDOM_TELEMETRY_URL: "https://example.com/api/telemetry" },
      fetchImpl: fetchImpl as unknown as typeof fetch,
      clientVersion: "0.1.0",
    });
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body)).source).toBe("unknown");
  });

  it("never rejects when fetch fails", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    await expect(
      reportInstallSuccess(baseEvent, {
        env: { OPENWISDOM_TELEMETRY_URL: "https://example.com/t" },
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).resolves.toBeUndefined();
  });
});

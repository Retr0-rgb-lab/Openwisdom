/**
 * Browser heat telemetry client (Spec 29).
 * Fail-open: never throws; prefer sendBeacon, then fetch keepalive.
 */

export type WebHeatEvent = "web_copy_install" | "web_download";

const TELEMETRY_PATH = "/api/telemetry";

/**
 * Report a web heat event. Call only for registry-installable
 * (`source === "catalog"`) skills — curated / link-only should skip.
 * Failures are silent.
 */
export function reportWebHeat(event: WebHeatEvent, skillId: string): void {
  if (!skillId || typeof skillId !== "string") return;

  try {
    const payload = JSON.stringify({
      schemaVersion: 1,
      event,
      skillId,
      source: "web",
      ts: new Date().toISOString(),
    });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon(TELEMETRY_PATH, blob)) {
        return;
      }
    }

    if (typeof fetch === "function") {
      void fetch(TELEMETRY_PATH, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        /* fail-open */
      });
    }
  } catch {
    /* fail-open */
  }
}

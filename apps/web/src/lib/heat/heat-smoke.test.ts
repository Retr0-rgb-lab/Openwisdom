/**
 * Unit smoke: MemoryStore + product rule copy ∉ installs*.
 * Run: pnpm exec tsx --test src/lib/heat/heat-smoke.test.ts
 * (or: node --import tsx --test src/lib/heat/heat-smoke.test.ts)
 */

import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

import { buildSkillStats, lastNDaysUtc, utcDay } from "./aggregate";
import {
  getMemoryStore,
  resetMemoryStore,
  __memorySeed,
} from "./memory-store";
import { isKnownSkillId } from "./skill-ids";
import { validateTelemetryBody } from "./validate";
import { checkRateLimit, resetRateLimitForTests } from "./rate-limit";

describe("HeatStore memory + product rules", () => {
  beforeEach(() => {
    resetMemoryStore();
    resetRateLimitForTests();
  });

  it("whitelist knows macro-scan and rejects garbage", () => {
    assert.equal(isKnownSkillId("macro-scan"), true);
    assert.equal(isKnownSkillId("definitely-not-a-skill-xyz"), false);
  });

  it("web_copy_install does not enter installs*", async () => {
    const store = getMemoryStore();
    const day = utcDay();
    const skillId = "macro-scan";

    await store.recordEvent({ skillId, event: "cli_install_success", day });
    await store.recordEvent({ skillId, event: "cli_install_success", day });
    await store.recordEvent({ skillId, event: "web_download", day });
    await store.recordEvent({ skillId, event: "web_copy_install", day });
    await store.recordEvent({ skillId, event: "web_copy_install", day });
    await store.recordEvent({ skillId, event: "web_copy_install", day });

    const agg = await store.getAggregates([skillId]);
    const s = agg[skillId];
    assert.ok(s);
    assert.equal(s.cliInstallsTotal, 2);
    assert.equal(s.downloadsTotal, 1);
    assert.equal(s.copiesTotal, 3);
    assert.equal(s.installsTotal, 3, "installs = cli + download only");
    assert.equal(s.installs30d, 3);
    assert.equal(
      s.installsTotal,
      s.cliInstallsTotal + s.downloadsTotal,
    );
    assert.notEqual(
      s.installsTotal,
      s.cliInstallsTotal + s.downloadsTotal + s.copiesTotal,
    );
  });

  it("pure copies never raise installs", () => {
    const onlyCopy = buildSkillStats({
      cliTotal: 0,
      cli30d: 0,
      downloadTotal: 0,
      download30d: 0,
      copyTotal: 99,
      copy30d: 50,
    });
    assert.equal(onlyCopy.installsTotal, 0);
    assert.equal(onlyCopy.installs30d, 0);
    assert.equal(onlyCopy.copiesTotal, 99);
  });

  it("events older than 30d count in total but not 30d", async () => {
    const store = getMemoryStore();
    const skillId = "macro-scan";
    const today = utcDay();
    const old = new Date();
    old.setUTCDate(old.getUTCDate() - 31);
    const oldDay = utcDay(old);

    await store.recordEvent({
      skillId,
      event: "cli_install_success",
      day: today,
    });
    await store.recordEvent({
      skillId,
      event: "cli_install_success",
      day: oldDay,
    });

    const s = (await store.getAggregates([skillId]))[skillId]!;
    assert.equal(s.cliInstallsTotal, 2);
    assert.equal(s.cliInstalls30d, 1);
    assert.equal(s.installs30d, 1);
    assert.equal(s.installsTotal, 2);

    // Sanity: lastNDaysUtc(30) does not include day-31
    const window = lastNDaysUtc(30);
    assert.equal(window.includes(oldDay), false);
    assert.equal(window.includes(today), true);
  });

  it("validate rejects unknown skill", () => {
    const bad = validateTelemetryBody({
      schemaVersion: 1,
      event: "cli_install_success",
      skillId: "not-in-catalog",
      source: "cli",
    });
    assert.equal(bad.ok, false);
    if (!bad.ok) assert.equal(bad.error, "unknown_skill");
  });

  it("validate accepts cli_install_success for known skill", () => {
    const ok = validateTelemetryBody({
      schemaVersion: 1,
      event: "cli_install_success",
      skillId: "macro-scan",
      source: "cli",
    });
    assert.equal(ok.ok, true);
  });

  it("rate limit trips after N", () => {
    resetRateLimitForTests();
    const ip = "203.0.113.9";
    for (let i = 0; i < 5; i++) {
      assert.equal(checkRateLimit(ip, { limit: 5 }), true);
    }
    assert.equal(checkRateLimit(ip, { limit: 5 }), false);
  });

  it("memory seed helper for old day buckets", async () => {
    __memorySeed("personal-anchor", "web_download", utcDay(), 4);
    const s = (await getMemoryStore().getAggregates(["personal-anchor"]))[
      "personal-anchor"
    ]!;
    assert.equal(s.downloadsTotal, 4);
    assert.equal(s.installsTotal, 4);
    assert.equal(s.copiesTotal, 0);
  });
});

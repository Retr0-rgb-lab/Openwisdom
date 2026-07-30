/**
 * Heat store smoke test (no Next server required).
 * Proves: web_copy_install does NOT enter installs*; cli + web_download do.
 *
 * Run from apps/web:
 *   node scripts/heat-smoke.mjs
 * or:
 *   pnpm exec tsx scripts/heat-smoke.mjs
 */

import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");

// Use tsx-compatible dynamic import of compiled logic via inline reimplementation
// so we don't depend on Next bundling. Mirror MemoryStore + buildSkillStats rules.

const KEY_PREFIX = "ow:v1";

function dayKey(day, skillId, event) {
  return `${KEY_PREFIX}:day:${day}:${skillId}:${event}`;
}
function totalKey(skillId, event) {
  return `${KEY_PREFIX}:total:${skillId}:${event}`;
}
function utcDay(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
function lastNDaysUtc(n, now = new Date()) {
  const days = [];
  const base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  for (let i = 0; i < n; i++) {
    days.push(new Date(base - i * 86_400_000).toISOString().slice(0, 10));
  }
  return days;
}
function buildSkillStats(c) {
  return {
    installsTotal: c.cliTotal + c.downloadTotal,
    installs30d: c.cli30d + c.download30d,
    cliInstallsTotal: c.cliTotal,
    cliInstalls30d: c.cli30d,
    downloadsTotal: c.downloadTotal,
    downloads30d: c.download30d,
    copiesTotal: c.copyTotal,
    copies30d: c.copy30d,
  };
}

function createMemoryStore() {
  const m = new Map();
  const incr = (k) => m.set(k, (m.get(k) ?? 0) + 1);
  const get = (k) => m.get(k) ?? 0;
  return {
    async recordEvent({ skillId, event, day }) {
      incr(dayKey(day, skillId, event));
      incr(totalKey(skillId, event));
    },
    async getAggregates(skillIds) {
      const filter = skillIds?.length ? new Set(skillIds) : null;
      const skillSet = new Set();
      for (const key of m.keys()) {
        if (!key.startsWith(`${KEY_PREFIX}:total:`)) continue;
        const rest = key.slice(`${KEY_PREFIX}:total:`.length);
        const last = rest.lastIndexOf(":");
        const skillId = rest.slice(0, last);
        if (filter && !filter.has(skillId)) continue;
        skillSet.add(skillId);
      }
      const days30 = lastNDaysUtc(30);
      const out = {};
      for (const skillId of skillSet) {
        let cli30d = 0,
          download30d = 0,
          copy30d = 0;
        for (const day of days30) {
          cli30d += get(dayKey(day, skillId, "cli_install_success"));
          download30d += get(dayKey(day, skillId, "web_download"));
          copy30d += get(dayKey(day, skillId, "web_copy_install"));
        }
        out[skillId] = buildSkillStats({
          cliTotal: get(totalKey(skillId, "cli_install_success")),
          cli30d,
          downloadTotal: get(totalKey(skillId, "web_download")),
          download30d,
          copyTotal: get(totalKey(skillId, "web_copy_install")),
          copy30d,
        });
      }
      return out;
    },
  };
}

// --- whitelist from catalog.json ---
const require = createRequire(import.meta.url);
const catalog = require(path.join(webRoot, "public/registry/catalog.json"));
const known = new Set((catalog.skills ?? []).map((s) => s.id));

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
    throw new Error(msg);
  }
  console.log("ok:", msg);
}

async function main() {
  console.log("heat-smoke: MemoryStore + product rules\n");

  assert(known.has("macro-scan"), "whitelist contains macro-scan");
  assert(!known.has("definitely-not-a-skill"), "unknown id not in whitelist");

  const store = createMemoryStore();
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
  assert(s, "aggregates include macro-scan");

  // Product iron rule: installs = cli + download only
  assert(s.cliInstallsTotal === 2, `cliInstallsTotal=2 got ${s.cliInstallsTotal}`);
  assert(s.downloadsTotal === 1, `downloadsTotal=1 got ${s.downloadsTotal}`);
  assert(s.copiesTotal === 3, `copiesTotal=3 got ${s.copiesTotal}`);
  assert(
    s.installsTotal === 3,
    `installsTotal = cli+download = 3 (NOT +copies); got ${s.installsTotal}`,
  );
  assert(
    s.installs30d === 3,
    `installs30d = 3 (copy excluded); got ${s.installs30d}`,
  );
  assert(
    s.installsTotal === s.cliInstallsTotal + s.downloadsTotal,
    "installsTotal === cli + downloads",
  );
  assert(
    s.installsTotal !== s.cliInstallsTotal + s.downloadsTotal + s.copiesTotal,
    "installsTotal is NOT cli+downloads+copies",
  );

  // 31 days ago should not count in 30d
  const old = new Date();
  old.setUTCDate(old.getUTCDate() - 31);
  const oldDay = utcDay(old);
  await store.recordEvent({
    skillId,
    event: "cli_install_success",
    day: oldDay,
  });
  const agg2 = await store.getAggregates([skillId]);
  const s2 = agg2[skillId];
  assert(s2.cliInstallsTotal === 3, `total cli now 3; got ${s2.cliInstallsTotal}`);
  assert(
    s2.cliInstalls30d === 2,
    `cliInstalls30d still 2 (31d excluded); got ${s2.cliInstalls30d}`,
  );
  assert(
    s2.installs30d === 3,
    `installs30d still 3; got ${s2.installs30d}`,
  );

  // buildSkillStats unit: pure copy must not raise installs
  const onlyCopy = buildSkillStats({
    cliTotal: 0,
    cli30d: 0,
    downloadTotal: 0,
    download30d: 0,
    copyTotal: 99,
    copy30d: 50,
  });
  assert(onlyCopy.installsTotal === 0, "pure copy → installsTotal 0");
  assert(onlyCopy.installs30d === 0, "pure copy → installs30d 0");
  assert(onlyCopy.copiesTotal === 99, "pure copy → copiesTotal 99");

  // Validation rules (mirror validate.ts)
  function isKnown(id) {
    return known.has(id);
  }
  assert(!isKnown("not-real"), "unknown skill rejected by whitelist");
  assert(isKnown("macro-scan"), "macro-scan accepted");

  console.log("\nAll heat-smoke checks passed.");
  console.log("Rule verified: web_copy_install ∉ installs*");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

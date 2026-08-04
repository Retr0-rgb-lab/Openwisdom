/**
 * PayloadResolve policy matrix (SPE 35).
 * Covers: NO_REMOTE · monorepo prefer · remote-only skill install · body root.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CatalogIndex } from "@openwisdom/schema";
import {
  ensureCatalogForUse,
  loadCatalog,
  resolveSkillPayloadDir,
  resolveSkillsTreeRoot,
  scanSkillsToCatalog,
} from "./payload-resolve.js";
import { ensureRemoteCatalog, registryCachePaths } from "./registry.js";

const tmpDirs: string[] = [];

function makeTmp(prefix = "ow-pr-"): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), prefix));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tmpDirs.length) {
    const d = tmpDirs.pop()!;
    try {
      rmSync(d, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
});

const miniCatalog: CatalogIndex = {
  schemaVersion: 1,
  skills: [
    {
      id: "remote-only-skill",
      name: "remote-only-skill",
      description: "Only available from remote registry fixture",
      layer: "scenario",
      scope: "community",
      disciplines: ["psychology"],
      language: "en",
      tags: ["test"],
      version: "0.1.0",
      updated: "2026-08-03",
      repoPath: "skills/community/scenarios/remote-only-skill",
      install: { cli: "npx openwisdom install remote-only-skill" },
    },
  ],
};

const miniManifest = {
  schemaVersion: 1,
  generatedAt: "2026-08-03T00:00:00.000Z",
  gitSha: "test",
  contentHash: "sha256-test-payload-resolve",
  skillCount: 1,
  cliMinVersion: "0.1.0",
};

const miniPayload = {
  schemaVersion: 1,
  skills: {
    "remote-only-skill": {
      repoPath: "skills/community/scenarios/remote-only-skill",
      files: ["SKILL.md"],
    },
  },
};

const skillBody = `---
name: remote-only-skill
description: fixture
---
# Remote Only
`;

function mockFetch(base: string): typeof fetch {
  return async (input: RequestInfo | URL) => {
    const url = String(input);
    const map: Record<string, string> = {
      [`${base}/manifest.json`]: JSON.stringify(miniManifest),
      [`${base}/catalog.json`]: JSON.stringify(miniCatalog),
      [`${base}/payload-index.json`]: JSON.stringify(miniPayload),
      [`${base}/skills/community/scenarios/remote-only-skill/SKILL.md`]:
        skillBody,
    };
    const body = map[url];
    if (!body) {
      return new Response("not found", { status: 404 });
    }
    return new Response(body, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
}

describe("body policy: resolveSkillsTreeRoot", () => {
  it("prefers OPENWISDOM_SKILLS_ROOT", () => {
    const root = makeTmp();
    const skills = path.join(root, "skills");
    mkdirSync(path.join(skills, "official"), { recursive: true });
    writeFileSync(path.join(skills, "official", ".keep"), "", "utf8");
    // looksLikeSkillsTree needs official/ or SKILL.md child
    const resolved = resolveSkillsTreeRoot({
      env: { OPENWISDOM_SKILLS_ROOT: skills },
      cwd: root,
      packageRoot: root,
    });
    expect(path.normalize(resolved)).toBe(path.normalize(skills));
  });

  it("falls back to package skills-snapshot outside monorepo", () => {
    const outside = makeTmp();
    const skillDir = path.join(
      outside,
      "skills-snapshot",
      "official",
      "scenarios",
      "macro-scan",
    );
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(
      path.join(skillDir, "SKILL.md"),
      "---\nname: macro-scan\ndescription: t\n---\n# t\n",
      "utf8",
    );
    const resolved = resolveSkillsTreeRoot({
      env: {},
      cwd: outside,
      packageRoot: outside,
    });
    expect(path.normalize(resolved)).toBe(
      path.normalize(path.join(outside, "skills-snapshot")),
    );
  });
});

describe("catalog policy: loadCatalog", () => {
  it("NO_REMOTE skips remote-cache and uses package snapshot", () => {
    const pkg = makeTmp();
    const snapDir = path.join(pkg, "catalog-snapshot");
    mkdirSync(snapDir, { recursive: true });
    writeFileSync(
      path.join(snapDir, "catalog.json"),
      JSON.stringify(miniCatalog),
      "utf8",
    );

    const loaded = loadCatalog({
      packageRoot: pkg,
      cwd: pkg,
      preferRegistryCache: true,
      env: { OPENWISDOM_NO_REMOTE: "1" },
      registryCacheDir: path.join(pkg, "empty-cache"),
    });
    expect(loaded.source).toBe("snapshot");
    expect(loaded.index.skills[0]?.id).toBe("remote-only-skill");
  });

  it("preferRegistryCache reads remote disk cache when present", async () => {
    const cacheDir = makeTmp("ow-cache-");
    const base = "http://127.0.0.1:9/registry";
    await ensureRemoteCatalog({
      registry: base,
      cacheDir,
      fetchImpl: mockFetch(base),
      forceRefresh: true,
    });
    expect(existsSync(registryCachePaths(cacheDir).catalog)).toBe(true);

    const pkg = makeTmp();
    // no package snapshot, no monorepo skills from cwd=pkg
    const loaded = loadCatalog({
      packageRoot: pkg,
      cwd: pkg,
      preferRegistryCache: true,
      registryCacheDir: cacheDir,
      env: { OPENWISDOM_NO_REMOTE: "0" },
    });
    expect(loaded.source).toBe("remote-cache");
    expect(loaded.index.skills.some((s) => s.id === "remote-only-skill")).toBe(
      true,
    );
  });

  it("ensureCatalogForUse refreshes remote then loads", async () => {
    const cacheDir = makeTmp("ow-ens-");
    const pkg = makeTmp();
    const base = "http://127.0.0.1:9/registry";
    const loaded = await ensureCatalogForUse({
      packageRoot: pkg,
      cwd: pkg,
      preferRegistryCache: true,
      registryCacheDir: cacheDir,
      registry: base,
      fetchImpl: mockFetch(base),
      forceRegistryRefresh: true,
      env: {},
    });
    expect(loaded.source).toBe("remote-cache");
    expect(loaded.index.skills[0]?.id).toBe("remote-only-skill");
  });
});

describe("install policy: resolveSkillPayloadDir", () => {
  it("uses remote when local missing (not package snapshot first)", async () => {
    const cacheDir = makeTmp("ow-inst-");
    const base = "http://127.0.0.1:9/registry";
    await ensureRemoteCatalog({
      registry: base,
      cacheDir,
      fetchImpl: mockFetch(base),
      forceRefresh: true,
    });

    const emptyRoot = path.join(cacheDir, "empty-skills");
    mkdirSync(emptyRoot, { recursive: true });
    const pkg = path.join(cacheDir, "pkg");
    mkdirSync(pkg, { recursive: true });

    const dir = await resolveSkillPayloadDir({
      skillId: "remote-only-skill",
      catalog: miniCatalog,
      skillsRoot: emptyRoot,
      cwd: cacheDir,
      packageRoot: pkg,
      env: { OPENWISDOM_SKILLS_ROOT: emptyRoot },
      registry: {
        registry: base,
        cacheDir,
        fetchImpl: mockFetch(base),
      },
    });
    expect(existsSync(path.join(dir, "SKILL.md"))).toBe(true);
    expect(readFileSync(path.join(dir, "SKILL.md"), "utf8")).toContain(
      "Remote Only",
    );
  });

  it("falls back to package skills-snapshot offline", async () => {
    const pkg = makeTmp();
    const skillDir = path.join(
      pkg,
      "skills-snapshot",
      "community",
      "scenarios",
      "offline-skill",
    );
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(
      path.join(skillDir, "SKILL.md"),
      "---\nname: offline-skill\ndescription: offline\n---\n# offline\n",
      "utf8",
    );

    const catalog: CatalogIndex = {
      schemaVersion: 1,
      skills: [
        {
          id: "offline-skill",
          name: "offline-skill",
          description: "offline",
          layer: "scenario",
          scope: "community",
          disciplines: [],
          language: "en",
          tags: [],
          version: "0.1.0",
          updated: "2026-08-04",
          repoPath: "skills/community/scenarios/offline-skill",
          install: { cli: "npx openwisdom install offline-skill" },
        },
      ],
    };

    const empty = path.join(pkg, "empty");
    mkdirSync(empty, { recursive: true });

    const dir = await resolveSkillPayloadDir({
      skillId: "offline-skill",
      catalog,
      skillsRoot: empty,
      cwd: empty,
      packageRoot: pkg,
      env: { OPENWISDOM_SKILLS_ROOT: empty, OPENWISDOM_NO_REMOTE: "1" },
      // no registry → skip remote
    });
    expect(path.normalize(dir)).toBe(path.normalize(skillDir));
  });
});

describe("scanSkillsToCatalog (SPE 38)", () => {
  it("uses mtime for updated and shared scope/layer inference", () => {
    const root = makeTmp();
    const skillDir = path.join(
      root,
      "official",
      "scenarios",
      "scan-fixture",
    );
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(
      path.join(skillDir, "SKILL.md"),
      `---
name: scan-fixture
description: Scan fixture for mtime + scope
---
# Scan
`,
      "utf8",
    );

    const skills = scanSkillsToCatalog(root);
    expect(skills).toHaveLength(1);
    expect(skills[0]!.id).toBe("scan-fixture");
    expect(skills[0]!.scope).toBe("official");
    expect(skills[0]!.layer).toBe("scenario");
    expect(skills[0]!.updated).not.toBe("1970-01-01");
    expect(skills[0]!.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

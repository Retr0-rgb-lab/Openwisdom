/**
 * Full catalog honesty audit:
 * - inventory all catalog entries
 * - verify external GitHub URLs (repo exists, path exists, not empty)
 * - check official repoPath files on disk
 * - flag fake heat, placeholder copy, broken provenance
 *
 * Usage: node scripts/audit-catalog-truth.mjs
 * Optional: GITHUB_TOKEN=... for higher rate limits
 * Exit 1 if critical issues.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(webRoot, "..", "..");

async function loadCatalog() {
  const loaderPath = path.join(webRoot, "scripts/_tmp-load-catalog.mts");
  fs.writeFileSync(
    loaderPath,
    `import { getCatalog } from "../src/data/catalog/index.ts";\nconsole.log(JSON.stringify(getCatalog()));\n`,
  );
  try {
    const out = execSync(`pnpm exec tsx "${loaderPath}"`, {
      cwd: webRoot,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    });
    return JSON.parse(out.trim().split("\n").filter(Boolean).pop());
  } finally {
    try {
      fs.unlinkSync(loaderPath);
    } catch {
      /* ignore */
    }
  }
}

function parseGithubUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("github.com")) {
      return { kind: "non-github", url };
    }
    const parts = u.pathname.replace(/^\/+|\/+$/g, "").split("/");
    const owner = parts[0];
    const repo = parts[1]?.replace(/\.git$/, "");
    if (!owner || !repo) return { kind: "invalid", url };
    let subpath = "";
    let branch = "main";
    const treeIdx = parts.indexOf("tree");
    const blobIdx = parts.indexOf("blob");
    if (treeIdx >= 0 && parts[treeIdx + 2]) {
      branch = parts[treeIdx + 1];
      subpath = parts.slice(treeIdx + 2).join("/");
    } else if (blobIdx >= 0 && parts[blobIdx + 2]) {
      branch = parts[blobIdx + 1];
      subpath = parts.slice(blobIdx + 2).join("/");
    }
    return { kind: "github", owner, repo, subpath, url, branch };
  } catch {
    return { kind: "invalid", url };
  }
}

async function ghFetch(apiPath, token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "openwisdom-catalog-audit",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com${apiPath}`, { headers });
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return {
    status: res.status,
    body,
    remaining: res.headers.get("x-ratelimit-remaining"),
  };
}

async function checkGithub(gh, token) {
  const result = {
    url: gh.url,
    owner: gh.owner,
    repo: gh.repo,
    subpath: gh.subpath,
    repoOk: false,
    pathOk: null,
    empty: null,
    stars: null,
    description: null,
    defaultBranch: null,
    pushedAt: null,
    size: null,
    pathBranch: null,
    issues: [],
  };

  const repoRes = await ghFetch(`/repos/${gh.owner}/${gh.repo}`, token);
  if (repoRes.status === 404) {
    result.issues.push("REPO_NOT_FOUND");
    return result;
  }
  if (repoRes.status === 403) {
    result.issues.push("RATE_LIMIT_OR_FORBIDDEN");
    return result;
  }
  if (repoRes.status !== 200) {
    result.issues.push(`REPO_HTTP_${repoRes.status}`);
    return result;
  }

  const r = repoRes.body;
  result.repoOk = true;
  result.stars = r.stargazers_count;
  result.description = r.description;
  result.defaultBranch = r.default_branch;
  result.pushedAt = r.pushed_at;
  result.size = r.size;
  if (r.size === 0) {
    result.empty = true;
    result.issues.push("REPO_SIZE_ZERO");
  } else {
    result.empty = false;
  }
  if (r.archived) result.issues.push("REPO_ARCHIVED");
  if (r.disabled) result.issues.push("REPO_DISABLED");

  if (!gh.subpath) {
    const root = await ghFetch(
      `/repos/${gh.owner}/${gh.repo}/contents?ref=${encodeURIComponent(r.default_branch || "main")}`,
      token,
    );
    if (
      root.status === 200 &&
      Array.isArray(root.body) &&
      root.body.length === 0
    ) {
      result.empty = true;
      result.issues.push("REPO_CONTENTS_EMPTY");
    }
  } else {
    const branches = [gh.branch, r.default_branch, "main", "master"].filter(
      (b, i, a) => b && a.indexOf(b) === i,
    );
    let found = false;
    for (const br of branches) {
      const pathRes = await ghFetch(
        `/repos/${gh.owner}/${gh.repo}/contents/${gh.subpath}?ref=${encodeURIComponent(br)}`,
        token,
      );
      if (pathRes.status === 200) {
        found = true;
        result.pathOk = true;
        result.pathBranch = br;
        if (Array.isArray(pathRes.body)) {
          if (pathRes.body.length === 0) result.issues.push("PATH_EMPTY_DIR");
          const names = pathRes.body.map((f) => f.name?.toLowerCase() || "");
          const hasSkill = names.includes("skill.md");
          const hasMd = names.some((n) => n.endsWith(".md"));
          if (!hasSkill && !hasMd) result.issues.push("PATH_NO_MARKDOWN");
          // shallow skill dir without SKILL.md is still a signal
          if (!hasSkill && hasMd) result.issues.push("PATH_NO_SKILL_MD");
        } else if (pathRes.body?.type === "file") {
          if ((pathRes.body.size ?? 0) < 40) {
            result.issues.push("FILE_EMPTY_OR_TINY");
          }
        }
        break;
      }
      if (pathRes.status === 403) {
        result.issues.push("RATE_LIMIT_OR_FORBIDDEN");
        break;
      }
    }
    if (!found && !result.issues.includes("RATE_LIMIT_OR_FORBIDDEN")) {
      result.pathOk = false;
      result.issues.push("PATH_NOT_FOUND");
    }
  }

  return result;
}

function checkLocalSkill(entry) {
  const issues = [];
  if (!entry.repoPath) {
    if (entry.scope === "official" && entry.provenance === "official") {
      // references in bootstrap may not exist yet
      if (entry.layer === "scenario") issues.push("OFFICIAL_SCENARIO_NO_PATH");
    }
    return { exists: false, issues };
  }
  const full = path.join(repoRoot, entry.repoPath);
  const skillMd = path.join(full, "SKILL.md");
  if (!fs.existsSync(full)) {
    issues.push("LOCAL_PATH_MISSING");
    return { exists: false, issues, full };
  }
  if (!fs.existsSync(skillMd)) {
    issues.push("LOCAL_SKILL_MD_MISSING");
    return { exists: true, issues, full };
  }
  const body = fs.readFileSync(skillMd, "utf8");
  if (body.trim().length < 80) issues.push("LOCAL_SKILL_MD_TOO_SHORT");
  if (/lorem ipsum|TODO:\s*fill|placeholder skill|假数据|虚构内容/i.test(body)) {
    issues.push("LOCAL_PLACEHOLDER_COPY");
  }
  return { exists: true, issues, full, bytes: body.length };
}

function scanCopyHonesty(entry) {
  const issues = [];
  const text = [
    entry.title?.zh,
    entry.title?.en,
    entry.summary?.zh,
    entry.summary?.en,
    entry.attribution,
  ]
    .filter(Boolean)
    .join("\n");

  if (/lorem ipsum|coming soon|tbd\b|placeholder|xxx{2,}|假数据/i.test(text)) {
    issues.push("PLACEHOLDER_COPY");
  }
  if (
    typeof entry.installs30d === "number" ||
    typeof entry.installsTotal === "number"
  ) {
    issues.push("HAS_INSTALL_HEAT");
  }
  if (entry.scope === "official" && entry.provenance === "curated-external") {
    // allowed if intentional dual label — flag for review
    issues.push("OFFICIAL_SCOPE_BUT_CURATED_EXTERNAL");
  }
  if (
    entry.contentAvailability === "full-body" &&
    !entry.repoPath &&
    entry.installMode === "link-only"
  ) {
    issues.push("CLAIMS_FULL_BODY_WITHOUT_LOCAL");
  }
  if (
    entry.install?.cli?.includes("npx openwisdom install") &&
    entry.installMode === "link-only" &&
    entry.contentAvailability === "external-only"
  ) {
    issues.push("CLI_INSTALL_FOR_EXTERNAL_ONLY");
  }
  if (entry.scope === "community" && !entry.externalUrl && !entry.repoPath) {
    issues.push("COMMUNITY_ORPHAN_NO_SOURCE");
  }
  return issues;
}

const CRITICAL = new Set([
  "REPO_NOT_FOUND",
  "PATH_NOT_FOUND",
  "REPO_SIZE_ZERO",
  "REPO_CONTENTS_EMPTY",
  "LOCAL_PATH_MISSING",
  "LOCAL_SKILL_MD_MISSING",
  "PLACEHOLDER_COPY",
  "HAS_INSTALL_HEAT",
  "CLAIMS_FULL_BODY_WITHOUT_LOCAL",
  "EXTERNAL_ONLY_WITHOUT_URL",
  "FILE_EMPTY_OR_TINY",
  "PATH_EMPTY_DIR",
  "COMMUNITY_ORPHAN_NO_SOURCE",
  "INVALID_EXTERNAL_URL",
]);

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
  console.error("Loading catalog…");
  const catalog = await loadCatalog();
  console.error(`Entries: ${catalog.length}; repoRoot=${repoRoot}`);

  const summary = {
    total: catalog.length,
    bySource: {},
    byProvenance: {},
    byAvailability: {},
    byScope: {},
    externalChecked: 0,
    critical: [],
    warn: [],
    ok: [],
    rateLimited: false,
  };

  for (const e of catalog) {
    summary.bySource[e.source] = (summary.bySource[e.source] || 0) + 1;
    summary.byScope[e.scope] = (summary.byScope[e.scope] || 0) + 1;
    const prov = e.provenance || e.scope;
    summary.byProvenance[prov] = (summary.byProvenance[prov] || 0) + 1;
    const av = e.contentAvailability || (e.repoPath ? "implied-local" : "unknown");
    summary.byAvailability[av] = (summary.byAvailability[av] || 0) + 1;
  }

  const findings = [];

  for (const e of catalog) {
    const copyIssues = scanCopyHonesty(e);
    const local = checkLocalSkill(e);
    const row = {
      slug: e.slug,
      titleEn: e.title?.en,
      scope: e.scope,
      provenance: e.provenance,
      source: e.source,
      layer: e.layer,
      contentAvailability: e.contentAvailability ?? null,
      installMode: e.installMode ?? null,
      externalUrl: e.externalUrl || null,
      repoPath: e.repoPath,
      installCli: e.install?.cli ?? null,
      issues: [...copyIssues, ...local.issues],
      github: null,
      local,
    };

    if (e.externalUrl) {
      const gh = parseGithubUrl(e.externalUrl);
      if (!gh || gh.kind === "invalid") {
        row.issues.push("INVALID_EXTERNAL_URL");
      } else if (gh.kind === "non-github") {
        row.issues.push("NON_GITHUB_EXTERNAL");
        try {
          const res = await fetch(e.externalUrl, {
            method: "HEAD",
            redirect: "follow",
          });
          if (!res.ok) row.issues.push(`EXTERNAL_HTTP_${res.status}`);
        } catch {
          row.issues.push("EXTERNAL_FETCH_FAIL");
        }
      } else {
        summary.externalChecked++;
        console.error(`  GH ${summary.externalChecked}: ${gh.owner}/${gh.repo}${gh.subpath ? "/" + gh.subpath : ""}`);
        row.github = await checkGithub(gh, token);
        row.issues.push(...row.github.issues);
        if (row.github.issues.includes("RATE_LIMIT_OR_FORBIDDEN")) {
          summary.rateLimited = true;
        }
        await new Promise((r) => setTimeout(r, token ? 80 : 550));
      }
    } else if (
      e.contentAvailability === "external-only" ||
      e.installMode === "link-only"
    ) {
      if (!e.repoPath) row.issues.push("EXTERNAL_ONLY_WITHOUT_URL");
    }

    if (e.references?.length) {
      for (const ref of e.references) {
        const hit = catalog.find((c) => c.slug === ref || c.id === ref);
        if (!hit) row.issues.push(`DANGLING_REFERENCE:${ref}`);
      }
    }

    findings.push(row);
    const hasCrit = row.issues.some((i) => {
      if (CRITICAL.has(i)) return true;
      if (i.startsWith("DANGLING_REFERENCE:")) return true;
      return false;
    });
    if (hasCrit) summary.critical.push(row.slug);
    else if (row.issues.length) summary.warn.push(row.slug);
    else summary.ok.push(row.slug);
  }

  // Official scenarios on disk
  for (const slug of [
    "macro-scan",
    "personal-anchor",
    "metacognition-audit",
  ]) {
    const skillPath = path.join(
      repoRoot,
      "skills/official/scenarios",
      slug,
      "SKILL.md",
    );
    if (!fs.existsSync(skillPath)) {
      summary.critical.push(`MISSING_OFFICIAL_FILE:${slug}`);
    }
  }

  let officialRefs = [];
  const refRoot = path.join(repoRoot, "skills/official/references");
  if (fs.existsSync(refRoot)) {
    officialRefs = fs
      .readdirSync(refRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  }

  // Community dir
  let communityDirs = [];
  const communityRoot = path.join(repoRoot, "skills/community");
  if (fs.existsSync(communityRoot)) {
    communityDirs = fs
      .readdirSync(communityRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  }

  const report = {
    FAIL: summary.critical.length > 0,
    generatedAt: new Date().toISOString(),
    repoRoot,
    hasGithubToken: Boolean(token),
    summary: {
      total: summary.total,
      bySource: summary.bySource,
      byScope: summary.byScope,
      byProvenance: summary.byProvenance,
      byAvailability: summary.byAvailability,
      externalChecked: summary.externalChecked,
      criticalCount: summary.critical.length,
      warnCount: summary.warn.length,
      okCount: summary.ok.length,
      critical: summary.critical,
      warn: summary.warn,
      ok: summary.ok,
      rateLimited: summary.rateLimited,
      officialRefsOnDisk: officialRefs,
      communityDirsOnDisk: communityDirs,
    },
    findings: findings.sort((a, b) => b.issues.length - a.issues.length),
  };

  const outPath = path.join(webRoot, "scripts/_catalog-truth-audit.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  // Human summary to stdout
  console.log(
    JSON.stringify(
      {
        FAIL: report.FAIL,
        summary: report.summary,
        criticalFindings: findings.filter((f) =>
          f.issues.some((i) => CRITICAL.has(i) || i.startsWith("DANGLING_REFERENCE")),
        ),
        warnFindings: findings.filter(
          (f) =>
            f.issues.length > 0 &&
            !f.issues.some(
              (i) => CRITICAL.has(i) || i.startsWith("DANGLING_REFERENCE"),
            ),
        ),
      },
      null,
      2,
    ),
  );
  console.error(`\nFull JSON: ${outPath}`);
  process.exit(report.FAIL ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});

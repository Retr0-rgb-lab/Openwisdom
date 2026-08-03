/**
 * Remote registry client + disk cache (SPE 33).
 * Fail-open: network errors never throw to callers of ensure*; they return ok:false.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  catalogIndexSchema,
  type CatalogIndex,
  type CatalogSkill,
} from "@openwisdom/schema";

export const DEFAULT_REGISTRY_BASE =
  "https://openwisdom.vercel.app/registry";

export type RegistryManifest = {
  schemaVersion: number;
  generatedAt?: string;
  gitSha?: string;
  contentHash: string;
  skillCount?: number;
  cliMinVersion?: string;
  mcpMinVersion?: string;
};

export type PayloadIndex = {
  schemaVersion: number;
  skills: Record<
    string,
    {
      repoPath: string;
      files: string[];
    }
  >;
};

export type RegistryResolveOpts = {
  env?: NodeJS.ProcessEnv;
  /** Override base URL (no trailing slash) */
  registry?: string;
  /** Force re-download even if contentHash matches */
  forceRefresh?: boolean;
  /** Inject fetch (tests) */
  fetchImpl?: typeof fetch;
  /** Override cache root (tests) */
  cacheDir?: string;
  /** Timeout ms for each GET (default 8000) */
  timeoutMs?: number;
  onLog?: (level: "info" | "warn" | "error", message: string) => void;
};

export type EnsureCatalogResult = {
  ok: boolean;
  source: "remote" | "cache" | "skipped" | "error";
  base?: string;
  contentHash?: string;
  message?: string;
  catalogPath?: string;
  payloadIndexPath?: string;
};

function log(
  opts: RegistryResolveOpts | undefined,
  level: "info" | "warn" | "error",
  message: string,
): void {
  if (opts?.onLog) opts.onLog(level, message);
  else if (level !== "info") {
    console.error(message);
  }
}

export function isRemoteDisabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const v = env.OPENWISDOM_NO_REMOTE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function resolveRegistryBase(
  opts?: Pick<RegistryResolveOpts, "env" | "registry">,
): string {
  const fromOpt = opts?.registry?.trim();
  if (fromOpt) return stripTrailingSlash(fromOpt);
  const env = opts?.env ?? process.env;
  const fromEnv = env.OPENWISDOM_REGISTRY?.trim();
  if (fromEnv) return stripTrailingSlash(fromEnv);
  return DEFAULT_REGISTRY_BASE;
}

function stripTrailingSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

export function defaultRegistryCacheDir(home = os.homedir()): string {
  return path.join(home, ".openwisdom", "cache", "registry");
}

export function registryCachePaths(cacheDir: string) {
  return {
    root: cacheDir,
    manifest: path.join(cacheDir, "manifest.json"),
    catalog: path.join(cacheDir, "catalog.json"),
    payloadIndex: path.join(cacheDir, "payload-index.json"),
    skills: path.join(cacheDir, "skills"),
  };
}

function assertHttpsOrLocalhost(base: string): void {
  let u: URL;
  try {
    u = new URL(base);
  } catch {
    throw new Error(`Invalid registry URL: ${base}`);
  }
  if (u.protocol === "https:") return;
  if (
    u.protocol === "http:" &&
    (u.hostname === "localhost" || u.hostname === "127.0.0.1")
  ) {
    return;
  }
  throw new Error(
    `Registry must be https (or http://localhost): ${base}`,
  );
}

async function fetchText(
  url: string,
  opts: RegistryResolveOpts,
): Promise<string> {
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  if (!fetchImpl) {
    throw new Error("fetch is not available in this runtime");
  }
  const timeoutMs = opts.timeoutMs ?? 8_000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      signal: ctrl.signal,
      headers: { accept: "application/json, text/plain, */*" },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function readJsonFile<T>(filePath: string): T | null {
  try {
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

/**
 * Best-effort remote refresh into disk cache.
 * Never throws for network failures (returns ok:false).
 */
export async function ensureRemoteCatalog(
  opts: RegistryResolveOpts = {},
): Promise<EnsureCatalogResult> {
  const env = opts.env ?? process.env;
  if (isRemoteDisabled(env)) {
    return { ok: false, source: "skipped", message: "OPENWISDOM_NO_REMOTE" };
  }

  let base: string;
  try {
    base = resolveRegistryBase(opts);
    assertHttpsOrLocalhost(base);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log(opts, "warn", `registry: ${message}`);
    return { ok: false, source: "error", message };
  }

  const cacheDir = opts.cacheDir ?? defaultRegistryCacheDir();
  const paths = registryCachePaths(cacheDir);
  mkdirSync(paths.root, { recursive: true });

  try {
    const manifestRaw = await fetchText(`${base}/manifest.json`, opts);
    const manifest = JSON.parse(manifestRaw) as RegistryManifest;
    if (!manifest.contentHash || typeof manifest.contentHash !== "string") {
      throw new Error("manifest missing contentHash");
    }

    const cached = readJsonFile<RegistryManifest>(paths.manifest);
    if (
      !opts.forceRefresh &&
      cached?.contentHash === manifest.contentHash &&
      existsSync(paths.catalog)
    ) {
      // Still refresh payload-index if missing
      if (!existsSync(paths.payloadIndex)) {
        try {
          const pi = await fetchText(`${base}/payload-index.json`, opts);
          writeFileSync(paths.payloadIndex, pi, "utf8");
        } catch {
          /* optional */
        }
      }
      return {
        ok: true,
        source: "cache",
        base,
        contentHash: manifest.contentHash,
        catalogPath: paths.catalog,
        payloadIndexPath: existsSync(paths.payloadIndex)
          ? paths.payloadIndex
          : undefined,
      };
    }

    const catalogRaw = await fetchText(`${base}/catalog.json`, opts);
    const parsed = catalogIndexSchema.parse(JSON.parse(catalogRaw));
    writeFileSync(paths.catalog, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
    writeFileSync(
      paths.manifest,
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    );

    try {
      const pi = await fetchText(`${base}/payload-index.json`, opts);
      JSON.parse(pi); // validate JSON
      writeFileSync(paths.payloadIndex, pi, "utf8");
    } catch (err) {
      log(
        opts,
        "warn",
        `registry: payload-index unavailable (${err instanceof Error ? err.message : err})`,
      );
    }

    log(
      opts,
      "info",
      `registry: refreshed catalog (${manifest.skillCount ?? parsed.skills.length} skills, ${manifest.contentHash.slice(0, 18)}…)`,
    );

    return {
      ok: true,
      source: "remote",
      base,
      contentHash: manifest.contentHash,
      catalogPath: paths.catalog,
      payloadIndexPath: existsSync(paths.payloadIndex)
        ? paths.payloadIndex
        : undefined,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log(opts, "warn", `registry: remote catalog failed — ${message}`);
    if (existsSync(paths.catalog)) {
      return {
        ok: true,
        source: "cache",
        base,
        message: `stale cache after error: ${message}`,
        catalogPath: paths.catalog,
        payloadIndexPath: existsSync(paths.payloadIndex)
          ? paths.payloadIndex
          : undefined,
      };
    }
    return { ok: false, source: "error", base, message };
  }
}

export function loadCachedCatalog(
  cacheDir?: string,
): { index: CatalogIndex; path: string } | null {
  const dir = cacheDir ?? defaultRegistryCacheDir();
  const catalogPath = registryCachePaths(dir).catalog;
  try {
    if (!existsSync(catalogPath)) return null;
    const raw = JSON.parse(readFileSync(catalogPath, "utf8"));
    const index = catalogIndexSchema.parse(raw);
    return { index, path: catalogPath };
  } catch {
    return null;
  }
}

export function loadPayloadIndex(cacheDir?: string): PayloadIndex | null {
  const dir = cacheDir ?? defaultRegistryCacheDir();
  const p = registryCachePaths(dir).payloadIndex;
  const raw = readJsonFile<PayloadIndex>(p);
  if (!raw || !raw.skills) return null;
  return raw;
}

function safeRelFile(rel: string): string | null {
  const n = rel.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!n || n.includes("..") || path.isAbsolute(n)) return null;
  if (n.startsWith("/") || /^[a-zA-Z]:/.test(n)) return null;
  return n;
}

/**
 * Download one skill tree into cache. Returns absolute skill dir or null.
 */
export async function ensureRemoteSkillDir(
  skill: CatalogSkill,
  opts: RegistryResolveOpts & { payloadIndex?: PayloadIndex | null } = {},
): Promise<string | null> {
  const env = opts.env ?? process.env;
  if (isRemoteDisabled(env)) return null;

  let base: string;
  try {
    base = resolveRegistryBase(opts);
    assertHttpsOrLocalhost(base);
  } catch {
    return null;
  }

  const cacheDir = opts.cacheDir ?? defaultRegistryCacheDir();
  const paths = registryCachePaths(cacheDir);
  const destRoot = path.join(paths.skills, skill.id);
  const skillMd = path.join(destRoot, "SKILL.md");

  // Reuse cache if present (caller may set forceRefresh after catalog contentHash change)
  if (existsSync(skillMd) && !opts.forceRefresh) {
    return destRoot;
  }

  const repoPath = skill.repoPath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!repoPath.startsWith("skills/") || repoPath.includes("..")) {
    log(opts, "warn", `registry: reject unsafe repoPath for ${skill.id}`);
    return null;
  }

  const pi = opts.payloadIndex ?? loadPayloadIndex(cacheDir);
  let files =
    pi?.skills[skill.id]?.files?.map(safeRelFile).filter(Boolean) as
      | string[]
      | undefined;
  if (!files || files.length === 0) {
    files = ["SKILL.md"];
  }
  // Always ensure SKILL.md first
  if (!files.includes("SKILL.md")) files = ["SKILL.md", ...files];

  if (existsSync(destRoot)) {
    rmSync(destRoot, { recursive: true, force: true });
  }
  mkdirSync(destRoot, { recursive: true });

  try {
    for (const rel of files) {
      const safe = safeRelFile(rel);
      if (!safe) continue;
      const url = `${base}/${repoPath}/${safe}`.replace(/([^:]\/)\/+/g, "$1");
      const text = await fetchText(url, opts);
      const outPath = path.join(destRoot, ...safe.split("/"));
      mkdirSync(path.dirname(outPath), { recursive: true });
      writeFileSync(outPath, text, "utf8");
    }
    if (!existsSync(skillMd)) {
      rmSync(destRoot, { recursive: true, force: true });
      return null;
    }
    return destRoot;
  } catch (err) {
    log(
      opts,
      "warn",
      `registry: fetch skill ${skill.id} failed — ${err instanceof Error ? err.message : err}`,
    );
    try {
      rmSync(destRoot, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    return null;
  }
}

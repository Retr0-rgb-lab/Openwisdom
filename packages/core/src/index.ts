/**
 * @openwisdom/core — shared non-interactive business APIs.
 * No citty, clack, or process.exit.
 */

export { CORE_VERSION } from "./version.js";

export {
  getPackageRoot,
  findMonorepoRoot,
  catalogSnapshotPath,
  skillsSnapshotPath,
  looksLikeSkillsTree,
} from "./paths.js";

export {
  extractFrontmatterBlock,
  parseSimpleYaml,
  parseSkillMarkdown,
} from "./frontmatter.js";

export { resolveSkillsRoot, locateSkillDir } from "./skills-root.js";

export {
  hashSkillMd,
  copyDirRecursive,
  writeSkillDir,
  type WriteOutcome,
} from "./copy-skill.js";

export {
  loadCatalog,
  scanSkillsToCatalog,
  searchCatalog,
  resolveBundle,
  type LoadedCatalog,
  type CatalogSource,
} from "./catalog.js";

/** PayloadResolve seam (SPE 35) — preferred names; old names remain above. */
export {
  resolveSkillsTreeRoot,
  resolveSkillPayloadDir,
  ensureCatalogForUse,
  type LoadCatalogOpts,
  type ResolveSkillsTreeRootOpts,
  type ResolveSkillPayloadDirOpts,
  type EnsureCatalogForUseOpts,
  type PayloadResolveBaseOpts,
} from "./payload-resolve.js";

export {
  DEFAULT_REGISTRY_BASE,
  ensureRemoteCatalog,
  ensureRemoteSkillDir,
  resolveRegistryBase,
  isRemoteDisabled,
  loadCachedCatalog,
  loadPayloadIndex,
  defaultRegistryCacheDir,
  registryCachePaths,
  type RegistryManifest,
  type PayloadIndex,
  type RegistryResolveOpts,
  type EnsureCatalogResult,
} from "./registry.js";

export {
  isTelemetryEnabled,
  getTelemetryUrl,
  buildInstallSuccessPayload,
  reportInstallSuccess,
  DEFAULT_TELEMETRY_TIMEOUT_MS,
  type TelemetryEvent,
  type TelemetryPayload,
  type TelemetrySource,
  type ReportOpts,
} from "./telemetry.js";

export {
  runInstall,
  resolveInstallSourceDir,
  listInstalled,
  resolveProviderIds,
  defaultProviderIds,
  getCatalogSkill,
  UsageError,
  RuntimeError,
  type Scope,
  type LogLevel,
  type InstallOptions,
  type InstallSkillResult,
  type InstallResult,
} from "./install.js";

export {
  getSkillDetail,
  type GetSkillDetailOpts,
  type SkillDetail,
} from "./get-skill.js";

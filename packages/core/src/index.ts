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
  type LoadedCatalog,
} from "./catalog.js";

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

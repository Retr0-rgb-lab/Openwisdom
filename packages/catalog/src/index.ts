/** @openwisdom/catalog — catalog build package (Plan 05 / Spec 20) */

export const CATALOG_PACKAGE_VERSION = 1 as const;
export const CLI_MIN_VERSION = "0.1.0" as const;

export {
  assertContentHashParity,
  assertReferencesExist,
  contentHash,
  resolveBundles,
  skillPayloadDigest,
} from "./build.js";

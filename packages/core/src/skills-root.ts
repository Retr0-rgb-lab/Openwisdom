/**
 * Skills root resolution (body policy) — thin wrapper over PayloadResolve (SPE 35).
 * Order: OPENWISDOM_SKILLS_ROOT → monorepo skills/ → package skills-snapshot.
 * Implementation: packages/core/src/payload-resolve.ts
 */
export {
  resolveSkillsTreeRoot as resolveSkillsRoot,
  locateSkillDir,
} from "./payload-resolve.js";

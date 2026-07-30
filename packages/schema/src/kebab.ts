/** Kebab-case skill name: a-z0-9 + single hyphens, 1–64 chars. */
const KEBAB_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * True when `name` is a valid Openwisdom skill name:
 * lowercase a-z0-9, single hyphens between segments, no leading/trailing/consecutive hyphens, length 1–64.
 */
export function isKebabName(name: string): boolean {
  if (typeof name !== "string") return false;
  if (name.length < 1 || name.length > 64) return false;
  return KEBAB_NAME_RE.test(name);
}

/**
 * Assert agentskills rule: frontmatter `name` equals the skill directory basename.
 * @throws Error when names differ
 */
export function assertNameMatchesDir(name: string, dirName: string): void {
  if (name !== dirName) {
    throw new Error(
      `Skill name "${name}" must match directory name "${dirName}"`,
    );
  }
}

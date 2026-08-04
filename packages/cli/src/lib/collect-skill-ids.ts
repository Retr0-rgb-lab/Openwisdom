/**
 * Collect positional skill ids from citty rawArgs (install + update shared).
 * Skips known flag names / values so multi-id forms work:
 *   openwisdom install id1 id2 -y --providers=claude
 *   openwisdom update id1 id2 --force
 */

/** Flags that take a following value (not skill ids). */
const FLAG_VALUE_KEYS = new Set([
  "--providers",
  "--scope",
  "--cwd",
  "--lang",
  "--registry",
  "--bundle",
]);

/** Subcommand names that may appear in rawArgs and are not skill ids. */
const COMMAND_NAMES = new Set(["install", "update"]);

export function collectSkillIds(
  rawArgs: string[],
  positional?: string,
): string[] {
  const ids: string[] = [];
  if (positional) ids.push(positional);
  let skipNext = false;
  for (let i = 0; i < rawArgs.length; i++) {
    const a = rawArgs[i]!;
    if (skipNext) {
      skipNext = false;
      continue;
    }
    if (COMMAND_NAMES.has(a)) continue;
    if (FLAG_VALUE_KEYS.has(a)) {
      skipNext = true;
      continue;
    }
    if (
      a.startsWith("--providers=") ||
      a.startsWith("--scope=") ||
      a.startsWith("--cwd=") ||
      a.startsWith("--lang=") ||
      a.startsWith("--registry=") ||
      a.startsWith("--bundle=")
    ) {
      continue;
    }
    if (a.startsWith("-")) continue;
    if (!ids.includes(a)) ids.push(a);
  }
  return ids;
}

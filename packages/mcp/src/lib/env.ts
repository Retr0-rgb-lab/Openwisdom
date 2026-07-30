import path from "node:path";

/**
 * Resolve project cwd for scope:project (Spec 23 §4):
 * 1. tool arg `cwd` (absolute or resolve)
 * 2. process.env.CLAUDE_PROJECT_DIR
 * 3. process.cwd()
 */
export function resolveCwd(
  cwdArg?: string | null,
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (cwdArg?.trim()) {
    return path.resolve(cwdArg.trim());
  }
  const fromClaude = env.CLAUDE_PROJECT_DIR?.trim();
  if (fromClaude) {
    return path.resolve(fromClaude);
  }
  return process.cwd();
}

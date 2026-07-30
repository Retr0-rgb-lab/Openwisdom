/**
 * Env helpers for HeatStore (Spec 28 §4.3 / §7).
 */

export function hasUpstashEnv(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const url = env.UPSTASH_REDIS_REST_URL?.trim();
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim();
  return Boolean(url && token);
}

export function getUpstashConfig(
  env: NodeJS.ProcessEnv = process.env,
): { url: string; token: string } | null {
  const url = env.UPSTASH_REDIS_REST_URL?.trim();
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url, token };
}

/** Default 60 req / IP / minute; override via HEAT_RATE_LIMIT_PER_MIN. */
export function getRateLimitPerMin(
  env: NodeJS.ProcessEnv = process.env,
): number {
  const raw = env.HEAT_RATE_LIMIT_PER_MIN?.trim();
  if (!raw) return 60;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 60;
  return n;
}

/** Optional monorepo skills root for download handler. */
export function getSkillsRoot(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const root = env.OPENWISDOM_SKILLS_ROOT?.trim();
  return root || undefined;
}

export const GITHUB_REPO_BASE =
  "https://github.com/Retr0-rgb-lab/Openwisdom";

export const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/Retr0-rgb-lab/Openwisdom/main";

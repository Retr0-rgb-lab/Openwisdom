/** CORS headers for CLI cross-origin POST (Spec 28 §2.6). */

export const TELEMETRY_CORS_HEADERS: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

export function withCors(init?: ResponseInit): ResponseInit {
  const headers = new Headers(init?.headers);
  for (const [k, v] of Object.entries(TELEMETRY_CORS_HEADERS)) {
    headers.set(k, v);
  }
  return { ...init, headers };
}

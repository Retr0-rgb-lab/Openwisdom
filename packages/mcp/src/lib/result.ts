/**
 * MCP tool result helpers. Never write to stdout from handlers —
 * return content only; protocol transport owns the wire.
 */

export type ToolContent = { type: "text"; text: string };

export type ToolResult = {
  content: ToolContent[];
  isError?: boolean;
  /** Optional structured payload for clients that support it */
  structuredContent?: Record<string, unknown>;
};

/** JSON text block (pretty) + optional short human summary line. */
export function toTextResult(
  data: unknown,
  opts?: { summary?: string; isError?: boolean },
): ToolResult {
  const json = JSON.stringify(data, null, 2);
  const content: ToolContent[] = [];
  if (opts?.summary) {
    content.push({ type: "text", text: opts.summary });
  }
  content.push({ type: "text", text: json });
  const structuredContent =
    data !== null && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : { value: data };
  return {
    content,
    isError: opts?.isError ? true : undefined,
    structuredContent,
  };
}

export function toErrorResult(message: string, extra?: unknown): ToolResult {
  const payload =
    extra !== undefined
      ? { ok: false, error: message, detail: extra }
      : { ok: false, error: message };
  return toTextResult(payload, {
    summary: `error: ${message}`,
    isError: true,
  });
}

export function isErrorResult(r: ToolResult): boolean {
  return Boolean(r.isError);
}

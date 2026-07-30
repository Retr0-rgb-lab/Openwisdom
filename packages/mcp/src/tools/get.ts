/**
 * openwisdom_get — catalog row + SKILL.md body (Spec 31 / Spec 23 §3.6).
 * Delegates to @openwisdom/core getSkillDetail.
 */
import {
  getSkillDetail,
  RuntimeError,
  UsageError,
} from "@openwisdom/core";
import { getMcpPackageRoot } from "../lib/package-root.js";
import { toErrorResult, toTextResult, type ToolResult } from "../lib/result.js";

export type GetInput = {
  skill: string;
  includeBody?: boolean;
  maxBodyChars?: number;
};

/** Pure handler — unit-testable without MCP transport. */
export async function handleGet(input: GetInput): Promise<ToolResult> {
  try {
    const skillKey = input.skill?.trim() ?? "";
    if (!skillKey) {
      return toErrorResult(
        'Missing skill. Example: openwisdom_get({ skill: "macro-scan" })',
      );
    }

    const detail = getSkillDetail({
      skill: skillKey,
      includeBody: input.includeBody,
      maxBodyChars: input.maxBodyChars,
      packageRoot: getMcpPackageRoot(),
      cwd: process.cwd(),
      env: process.env,
    });

    const summary = detail.body
      ? `Skill ${detail.skill.id}: catalog + SKILL.md body (${detail.catalogSource}).`
      : `Skill ${detail.skill.id}: catalog metadata only (${detail.catalogSource}).`;

    return toTextResult(detail, { summary });
  } catch (err) {
    if (err instanceof UsageError || err instanceof RuntimeError) {
      return toErrorResult(err.message);
    }
    return toErrorResult(err instanceof Error ? err.message : String(err));
  }
}

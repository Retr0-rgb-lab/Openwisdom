/**
 * GET /api/skills/[skillId]/download
 * Serves SKILL.md when available; else 302 GitHub. Counts web_download (Spec 28 §6).
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import { utcDay } from "@/lib/heat/aggregate";
import {
  GITHUB_RAW_BASE,
  GITHUB_REPO_BASE,
  getSkillsRoot,
} from "@/lib/heat/config";
import { getSkillRepoPath, isKnownSkillId } from "@/lib/heat/skill-ids";
import { getHeatStore } from "@/lib/heat/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function recordDownload(skillId: string): Promise<void> {
  try {
    const store = getHeatStore();
    await store.recordEvent({
      skillId,
      event: "web_download",
      day: utcDay(),
    });
  } catch (err) {
    console.error("[heat/download] recordEvent failed (fail-open)", err);
  }
}

async function tryReadSkillMd(
  skillId: string,
): Promise<{ content: string; filename: string } | null> {
  const repoPath = getSkillRepoPath(skillId);
  if (!repoPath) return null;

  const candidates: string[] = [];
  const envRoot = getSkillsRoot();
  if (envRoot) {
    // OPENWISDOM_SKILLS_ROOT may point at skills/ or monorepo root
    candidates.push(path.join(envRoot, repoPath, "SKILL.md"));
    candidates.push(path.join(envRoot, "SKILL.md"));
  }

  const cwd = process.cwd();
  // apps/web → ../../skills/...
  candidates.push(path.join(cwd, "..", "..", repoPath, "SKILL.md"));
  // monorepo root as cwd
  candidates.push(path.join(cwd, repoPath, "SKILL.md"));
  // apps/web → ../cli/skills-snapshot (packaged snapshot)
  candidates.push(
    path.join(cwd, "..", "..", "packages", "cli", "skills-snapshot", ...repoPath.replace(/^skills\//, "").split("/"), "SKILL.md"),
  );
  candidates.push(
    path.join(cwd, "..", "..", "packages", "core", "skills-snapshot", ...repoPath.replace(/^skills\//, "").split("/"), "SKILL.md"),
  );

  for (const file of candidates) {
    try {
      const content = await fs.readFile(file, "utf8");
      if (content.trim()) {
        return { content, filename: `${skillId}-SKILL.md` };
      }
    } catch {
      // try next
    }
  }
  return null;
}

type RouteContext = { params: Promise<{ skillId: string }> };

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { skillId: rawId } = await context.params;
  const skillId = decodeURIComponent(rawId ?? "").trim();

  if (!skillId || !isKnownSkillId(skillId)) {
    return Response.json({ error: "unknown_skill" }, { status: 404 });
  }

  const file = await tryReadSkillMd(skillId);
  // Count download action (file serve or redirect) — fail-open
  await recordDownload(skillId);

  if (file) {
    return new Response(file.content, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  // Fallback: 302 to GitHub raw or tree
  const repoPath = getSkillRepoPath(skillId);
  if (repoPath) {
    const rawUrl = `${GITHUB_RAW_BASE}/${repoPath}/SKILL.md`;
    return Response.redirect(rawUrl, 302);
  }

  // Last resort: repo root tree
  return Response.redirect(`${GITHUB_REPO_BASE}/tree/main/skills`, 302);
}

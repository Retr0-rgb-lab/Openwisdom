/**
 * Infer scope + layer from a skills path (posix).
 * Accepts monorepo-relative (`skills/official/scenarios/...`) or
 * skills-root-relative (`official/scenarios/...`) paths — single implementation
 * for catalog build and runtime scan (SPE 38).
 */
export function inferScopeAndLayer(pathPosix: string): {
  scope?: "official" | "community";
  layer?: "scenario" | "reference";
} {
  const parts = pathPosix.split("/").filter(Boolean);
  // Normalize: strip leading "skills" so both path shapes share the same ladder.
  const rest = parts[0] === "skills" ? parts.slice(1) : parts;
  const scopePart = rest[0];
  const kindPart = rest[1];
  const scope =
    scopePart === "official" || scopePart === "community"
      ? scopePart
      : undefined;
  const layer =
    kindPart === "scenarios"
      ? "scenario"
      : kindPart === "references"
        ? "reference"
        : undefined;
  return { scope, layer };
}

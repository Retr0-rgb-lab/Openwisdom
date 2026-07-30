# Plan 04 — packages/providers（Wave D Providers）

## Goal

Pure path table + detect + resolveSkillDir for P0 (and data for P1).

## Spec

Spec 19 in full.

## Files (only)

```text
packages/providers/**
```

## API (must export)

```ts
export type ProviderId = string;
export type ProviderDefinition = { ... }; // Spec 19
export const PROVIDERS: ProviderDefinition[];
export function getProvider(idOrAlias: string): ProviderDefinition | undefined;
export function parseProvidersFlag(csv: string): string[]; // throw unknown
export function detectProviders(cwd: string, home: string): {
  project: string[];
  global: string[];
};
export function resolveSkillDir(opts: {
  provider: string;
  scope: "project" | "global";
  cwd: string;
  home: string;
  skillName: string;
}): string;
/** Deduplicate write targets when agents+codex share project path */
export function uniqueWriteTargets(
  providers: string[],
  scope: "project" | "global",
  cwd: string,
  home: string,
  skillName: string,
): { provider: string; dir: string }[];
```

## P0 table (verbatim roots)

| id | projectSkillsDir | globalSkillsDir (rel home) |
|----|------------------|----------------------------|
| claude | `.claude/skills` | `.claude/skills` |
| cursor | `.cursor/skills` | `.cursor/skills` |
| codex | `.agents/skills` | `.codex/skills` |
| gemini | `.gemini/skills` | `.gemini/skills` |
| github | `.github/skills` | `.copilot/skills` |
| agents | `.agents/skills` | `.agents/skills` |

Include P1 definitions (grok, opencode, pi, …) with `tier: "p1"` so parseProvidersFlag can accept them.

## Tests

- resolveSkillDir project claude → `join(cwd, '.claude/skills', name)`  
- uniqueWriteTargets(['codex','agents'], project) → **one** path  
- opencode global → `join(home, '.config/opencode/skills', name)`  
- unknown provider throws  

## Done when

- build + tests pass  
- zero network imports  

## Do not

- Implement file copy (CLI lane)  
- Touch skills/ or schema  

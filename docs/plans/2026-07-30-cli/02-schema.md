# Plan 02 — packages/schema（Wave A Schema）

## Goal

Zod schemas for SKILL.md frontmatter + catalog index entry. Shared by catalog builder and CLI.

## Spec

- Spec 20 §3–4  
- agentskills: `name` + `description` required  

## Files (only)

```text
packages/schema/**
```

## Implement

### Frontmatter

```ts
// parse YAML frontmatter object
SkillFrontmatter:
  name: string (kebab, 1-64, match dir later)
  description: string (1-1024)
  id?: string // default name
  layer?: "scenario" | "reference"
  scope?: "official" | "community"
  disciplines?: string[]
  language?: string
  tags?: string[]
  version?: string
  references?: string[] // skill ids
  license?: string
  metadata?: record (openwisdom?: boolean | string)
```

Export:

- `skillFrontmatterSchema`
- `parseSkillFrontmatter(data: unknown)`
- `catalogIndexSchema` / `CatalogIndex` type
- `catalogSkillSchema` fields per Spec 20 §4.3:
  - id, name, description, layer, scope, disciplines, language, tags, version, updated, repoPath, references?, install.cli

### Utils

- `isKebabName(name: string): boolean`
- `assertNameMatchesDir(name: string, dirName: string)`

### Tests

`packages/schema/src/*.test.ts` with vitest if package has vitest; else minimal assert script. Prefer vitest as devDep of schema.

## Done when

- `pnpm --filter @openwisdom/schema build` OK  
- Valid macro-scan-like FM parses  
- Invalid name (with spaces / `..`) fails  

## Do not

- Touch apps/web  
- Touch other packages’ src beyond adding dependency from them (others add dep on you)

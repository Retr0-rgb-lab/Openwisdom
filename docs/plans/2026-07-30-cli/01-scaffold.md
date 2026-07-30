# Plan 01 — Monorepo scaffold（Wave A Lead）

## Goal

把 workspace 从「仅 apps/web」扩到 `packages/*`，建四个包的**可 build 空壳**与 root scripts。

## Files

| 路径 | 动作 |
|------|------|
| `pnpm-workspace.yaml` | 加 `packages/*` |
| `package.json` | scripts: `catalog:build`, `test`, filter cli |
| `packages/schema/package.json` | name `@openwisdom/schema`, private, type module |
| `packages/schema/tsconfig.json` | 出 dist |
| `packages/schema/src/index.ts` | 先 export 占位 `SCHEMA_VERSION = 1` |
| `packages/catalog/package.json` | `@openwisdom/catalog` private |
| `packages/catalog/src/index.ts` | 占位 |
| `packages/providers/package.json` | `@openwisdom/providers` private |
| `packages/providers/src/index.ts` | 占位 |
| `packages/cli/package.json` | name **`openwisdom`**, bin, private false 可先 private true 到发布前 |
| `packages/cli/src/cli.ts` | 最小 help 打印 |
| `packages/cli/tsup.config.ts` | entry cli.ts → dist/cli.js + shebang |

## Steps

1. 更新 workspace  
2. 四包 package.json + tsconfig  
3. cli 用 tsup；schema/providers/catalog 用 tsc  
4. root: `"catalog:build": "pnpm --filter @openwisdom/catalog build"`  
5. `pnpm install` 从根执行  

## Done when

- `pnpm --filter @openwisdom/schema build` 成功  
- `pnpm --filter openwisdom build` 产出 `packages/cli/dist/cli.js`  
- `node packages/cli/dist/cli.js --help` 非崩溃  

## Out of scope

- 真 schema / 真 install / skills 内容（02–06）

# Architecture deepening SPE index

> **日期：** 2026-08-04  
> **来源：** `/improve-codebase-architecture` review  
> **报告：** `%TEMP%/architecture-review-*.html`  

| SPE | 标题 | 强度 | 主要路径 | 并行组 | 状态 |
|-----|------|------|----------|--------|------|
| [35](./35-payload-resolve-SPE.md) | PayloadResolve 统一解析 | Strong | `packages/core` | **A**（与 38 串行） | **已落地** |
| [36](./36-catalog-artifact-fanout-SPE.md) | Catalog snapshot 扇出收窄 | Strong | `packages/catalog` + core snapshots | **B** | **已落地 P0** |
| [37](./37-web-catalog-deepen-SPE.md) | WebCatalog · 学科 · 热度 | Worth | `apps/web` | **C** | **已落地** |
| [38](./38-skill-scan-frontmatter-SPE.md) | SkillScan / scope-layer 单一实现 | Worth | `schema` + `catalog` + `core` | **A**（在 35 后） | **已落地 P0** |
| [39](./39-cli-mcp-ops-parity-SPE.md) | CLI/MCP ops parity | Worth | `packages/cli` + `mcp` | **D** | **已落地** |

## 并行调度

```text
        ┌── Group A: SPE 35 → SPE 38  (core/schema/catalog scan)
        ├── Group B: SPE 36           (catalog build targets; 勿改 resolve 语义)
Build ──├── Group C: SPE 37           (apps/web only)
        └── Group D: SPE 39           (cli/mcp adapters; 用现有 runInstall 选项)
```

**冲突约定：**

- Group A 拥有 `packages/core/src/{catalog,install,skills-root,payload-resolve,frontmatter}*`  
- Group B 拥有 `packages/catalog/src/build.ts` 与 `packages/core/*-snapshot` **删除**；不改 core src 逻辑  
- Group C 不碰 packages/*  
- Group D 不改 core 业务，只改 adapter  

## 验收总闸

```bash
pnpm --filter @openwisdom/schema test
pnpm --filter @openwisdom/core test
pnpm --filter @openwisdom/catalog test   # 若新增
pnpm --filter openwisdom test
pnpm --filter openwisdom-mcp test
pnpm catalog:build
pnpm --filter web build   # SPE 37
```

# Plan 02 — 官方学科 Reference 种子

**Lane:** Content · **Specs:** 01 · v1 知识库 03 · 审计 P0#3  
**独占：** `skills/official/references/**` · `skills/official/scenarios/*/SKILL.md`（仅 frontmatter `references` + 文内引用，**不改**步骤正文大结构）  
**禁止改：** apps/web/** · packages/cli|mcp 业务（可 `pnpm catalog:build`）

## Goal

五大学科各至少 **1** 张 official reference；场景 skill 通过 frontmatter `references` 指向真实 id；`pnpm catalog:build` skillCount ≥ 8（3 scenarios + ≥5 refs）。

## 最小集合（必须创建）

| id (kebab) | discipline | 中文名 |
|------------|------------|--------|
| `path-dependence` | history / economics（主 **economics** 或 history，选一主学科 + tags） | 路径依赖 |
| `collective-action` | sociology / political-science | 集体行动 |
| `social-stratification` | sociology | 社会分层 |
| `confirmation-bias` | psychology | 确认偏误 |
| `prospect-theory` | psychology / economics | 前景理论 |

目录约定：

```text
skills/official/references/<id>/SKILL.md
```

## SKILL.md 模板（每张必须）

```yaml
---
name: <id>
description: >-
  One-line English description for agents (when to load this reference).
id: <id>
layer: reference
scope: official
disciplines:
  - <discipline-id>
language: zh
tags: []
version: 0.1.0
metadata:
  openwisdom: true
---
```

正文结构（中英可混，与场景一致）：

1. `# 标题 / Title`  
2. `## Definition` — 2–4 句定义  
3. `## When to use` — 何时被场景引用  
4. `## Core claims` — 3–5 条可检验要点  
5. `## Limits` — 误用边界  
6. `## Notes` — 分析在用户 Agent 运行；不编造数据  

**质量：** 真实社科概念，非 Lorem；克制语气；无假引用 DOI 造假（可写「经典文献：Author (year) 方向」而不伪造页码）。

## 场景 frontmatter 接线

更新：

- `macro-scan` → `references: [path-dependence, collective-action]`  
- `personal-anchor` → `references: [social-stratification]`  
- `metacognition-audit` → `references: [confirmation-bias, prospect-theory]`  

确保 schema 支持 `references` 数组（若 schema 已有则直接写；若校验失败则扩展 `packages/schema` **仅 frontmatter**——若必须改 schema，可破例改 `packages/schema/src/frontmatter.ts` + 测试，并在 report 注明）。

## Tasks

- [ ] 创建 5 个 `SKILL.md`  
- [ ] 更新 3 场景 frontmatter `references`  
- [ ] `pnpm --filter @openwisdom/schema test`  
- [ ] `pnpm catalog:build` → skillCount ≥ 8；四端 snapshot 一致  
- [ ] `pnpm --filter openwisdom exec node ./dist/cli.js list`（或 root `pnpm cli list`）应列出 references  
- [ ] 写 `reports/02-report.md`

## 验收

- [ ] `skills/official/references` 下 5 目录  
- [ ] catalog manifest `skillCount >= 8`  
- [ ] 无 frontmatter 校验失败  

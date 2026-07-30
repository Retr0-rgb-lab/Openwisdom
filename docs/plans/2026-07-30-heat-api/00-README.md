# Plan — 热度 API 实现（2026-07-30）

> **权威：** Specs [27](../../specs/27-热度API总控-SPE.md) · [28](../../specs/28-热度API-端点与存储.md) · [29](../../specs/29-热度API-Web合并与采集.md) · 产品 [06](../../specs/06-热度与遥测.md)

## 并行图

| # | Plan | 独占路径 | 依赖 |
|---|------|----------|------|
| 01 | [01-api-store.md](./01-api-store.md) | `apps/web/src/lib/heat/**` · `apps/web/src/app/api/**` | — |
| 02 | [02-web-collect-merge.md](./02-web-collect-merge.md) | skills 组件 · catalog merge 调用 · `messages/*/skills.json` heat 键 | 01 的 API shape（可先 mock 路径） |
| 03 | [03-docs-privacy.md](./03-docs-privacy.md) | docs/contribute/install 文案 · `messages/*/pages.json` | — |

```text
01 ──┬── 可与 03 并行
     └── 02（约定 /api/* 后并行；若冲突以 01 先合 API）
03 ──┘
```

**规则：** 不 commit；不写 SKILL.md 热度；无假数字；fail-open。

## 成功标准

见 Spec 27 §5 + 各 plan 验收。

## 状态（2026-07-30）

| Plan | 状态 | Report |
|------|------|--------|
| 01 API store | **Done** | [reports/01-report.md](./reports/01-report.md) |
| 02 Web merge | **Done** | [reports/02-report.md](./reports/02-report.md) |
| 03 Docs privacy | **Done** | [reports/03-report.md](./reports/03-report.md) |
| VERIFY | **Done** | heat-smoke 8/8 · web build 0 · routes `/api/telemetry|stats|skills/.../download` |
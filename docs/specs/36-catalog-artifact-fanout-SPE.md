# SPE 36 — Catalog artifact fan-out（收窄 snapshot 扇出）

> **状态：** IMPLEMENTED P0（主仓合并 · 2026-08-04）  
> **日期：** 2026-08-04  
> **来源：** architecture review · candidate #1（Strong）  
> **依赖：** SPE 33 远程 registry 已存在（远程减负 npm；offline 仍需 published bins 的 snapshot）  
> **文档治理：** 执行清单；蒸馏时改知识库 **05** / **07** 的 dual-write 表

---

## 0. 一句话

`catalog:build` 从「把同一树 **复制 N 份**」加深为 **明确的 artifact 合同**：每个 **published install surface** 一份 offline 载荷 + **Web registry 一份** 远程面；去掉 **无消费者** 的副本。

---

## 1. 问题

`packages/catalog/src/build.ts` 当前 dual-write：

| 目标 | 用途 |
|------|------|
| `packages/catalog/dist` | build 中间产物 |
| `packages/cli/{catalog,skills}-snapshot` | npm `openwisdom` offline |
| `packages/mcp/{catalog,skills}-snapshot` | npm `openwisdom-mcp` offline |
| `packages/core/{catalog,skills}-snapshot` | **private** package；CLI/MCP **bundle core**，runtime 用 **宿主** packageRoot |
| `apps/web/public/registry` + `skills/**` | SPE 33 CDN |

Core 的 skills-snapshot 对 npm 用户 **无 leverage**，却占满 git 与 build 时间（deletion test：删 core 副本，复杂度应集中到 cli/mcp/web，而不是散回调用方）。

---

## 2. 目标 / 非目标

### 2.1 目标（P0）

| # | 目标 |
|---|------|
| G1 | `catalog:build` **停止** 向 `packages/core/skills-snapshot` 同步全树 |
| G2 | `catalog:build` **停止** 向 `packages/core/catalog-snapshot` 写入（或改为可选 dev-only 开关，默认关） |
| G3 | 保留：`packages/cli` + `packages/mcp` 的 catalog-snapshot + skills-snapshot |
| G4 | 保留：`apps/web/public/registry`（catalog/manifest/payload-index + skills/**） |
| G5 | 保留：`packages/catalog/dist` 写出 JSON（便于本包检查） |
| G6 | core 单测：**不依赖** core 包内 skills-snapshot；用 monorepo `skills/`、tmp fixture、或 `OPENWISDOM_SKILLS_ROOT` / 注入 `packageRoot` 指向 cli snapshot |
| G7 | `packages/core/package.json` `files` 去掉 snapshot 字段（若目录删除） |
| G8 | build 日志打印实际 targets；`contentHash` 仍写入各保留 manifest |

### 2.2 目标（P1，本 SPE 可做可不做；优先 P0）

| # | 目标 |
|---|------|
| P1-a | 抽取 `emitCatalogArtifacts(root, targets)` 纯函数，便于测「写哪些路径」 |
| P1-b | 根目录或 catalog 包增加 `assert-snapshot-parity` 脚本：cli vs mcp vs web registry 的 `contentHash` 一致 |
| P1-c | 从 git **删除** 已无用的 `packages/core/*-snapshot` 目录内容（大 diff，可单独 commit） |

### 2.3 非目标

| # | 非目标 |
|---|--------|
| N1 | 新建 `@openwisdom/payload` npm 包（可记 follow-up） |
| N2 | 让 CLI/MCP 共享 **同一物理目录**（pnpm pack 仍需各包 files 含 payload） |
| N3 | 去掉 web registry skills 树（SPE 33 依赖） |
| N4 | 改 PayloadResolve 语义（SPE 35） |
| N5 | 自动 npm publish |

---

## 3. 目标矩阵（权威）

| Artifact | cli | mcp | core | catalog/dist | web/registry |
|----------|-----|-----|------|--------------|--------------|
| catalog.json | ✅ | ✅ | ❌ P0 停 | ✅ | ✅ |
| manifest.json | ✅ | ✅ | ❌ | ✅ | ✅ |
| payload-index.json | ✅ | ✅ | ❌ | ✅ | ✅ |
| skills-snapshot / skills tree | ✅ | ✅ | ❌ | — | ✅ `registry/skills` |

---

## 4. 文件范围

| 动作 | 路径 |
|------|------|
| 改 | `packages/catalog/src/build.ts`（`catalogTargets` + `syncSkillsSnapshot` 列表） |
| 改 | `packages/core/package.json` |
| 改 | core tests 若引用 `catalog-snapshot` / `skills-snapshot` 路径 |
| 可选删 | `packages/core/catalog-snapshot/**`、`packages/core/skills-snapshot/**` |
| 文档 | 本 SPE；可选一行知识库 05（非阻塞） |

---

## 5. 验收

- [ ] `pnpm catalog:build` 成功；**不** 刷新/创建 core skills-snapshot  
- [ ] cli 与 mcp 的 manifest `contentHash` 与 web registry **相同**  
- [ ] `pnpm --filter @openwisdom/core test` 绿  
- [ ] `pnpm --filter openwisdom test` 与 `openwisdom-mcp test` 绿（若环境可跑）  
- [ ] 注释更新：build.ts 文件头不再写「core skills-snapshot 三份」  

---

## 6. 风险

| 风险 | 缓解 |
|------|------|
| core 测试曾默认 packageRoot=core 带 snapshot | 指向 monorepo skills 或 fixture |
| 文档仍写 dual-write ×3 | SPE + 后续蒸馏知识库 |
| 与 SPE 35 并行 | SPE 35 已规定 offline 以 host packageRoot 为准 |

---

## 7. 完成定义

Published offline 载荷 = **2**（cli+mcp）；远程面 = **1**（web）；core 不再复制全树。build 扇出可解释、可测。

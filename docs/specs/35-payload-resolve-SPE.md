# SPE 35 — PayloadResolve（统一 skill / catalog 解析）

> **状态：** IMPLEMENTED（主仓合并 · 2026-08-04）  
> **日期：** 2026-08-04  
> **来源：** architecture review · candidate #2（Strong）  
> **冲突优先级：** 用户指令 > 本 SPE > SPE 33 实现细节（顺序语义保留，结构加深）  
> **文档治理：** `docs/specs/` 为执行清单；落地后可蒸馏到知识库 **07** / **11**

---

## 0. 一句话

把 core 里 **三套互不相同的「找 catalog / 找 skill 目录」优先级梯子** 收成一个 **深模块** `PayloadResolve`：调用方只选 **policy 模式**，实现与测试都只碰这一处 seam。

---

## 1. 问题（现状）

| 函数 | 文件 | 用途 | 顺序差异 |
|------|------|------|----------|
| `loadCatalog` | `packages/core/src/catalog.ts` | 索引 | monorepo 偏本地 → remote-cache → package snapshot → scan |
| `resolveSkillsRoot` | `packages/core/src/skills-root.ts` | 读 body / 粗定位 | env → monorepo → **package skills-snapshot 较早** |
| `resolveInstallSourceDir` | `packages/core/src/install.ts` | install 载荷 | env/monorepo → **remote 优先于** package snapshot |

SPE 33 语义正确（install 要让部署内容打败 stale npm），但 **三处接口让 AI/人改错梯子**。`deletion test`：三套都删会散落 N 处；应收成一处。

---

## 2. 目标 / 非目标

### 2.1 目标

| # | 目标 |
|---|------|
| G1 | 单一模块（建议 `packages/core/src/payload-resolve.ts`）导出 **有限 policy** 的解析 API |
| G2 | **保留 SPE 33 行为**：install 载荷 monorepo/env → remote → offline snapshot；catalog 仍 fail-open |
| G3 | `loadCatalog` / `resolveSkillsRoot` / `resolveInstallSourceDir` 变为 **薄适配** 或 re-export 到新模块（对外 `index.ts` 不破坏现有导出名，或同步更新 CLI/MCP 唯一调用点） |
| G4 | 单元测试 **只通过 PayloadResolve 接口** 覆盖三种 policy + `OPENWISDOM_NO_REMOTE` + monorepo prefer |
| G5 | 文档字符串与 SPE 33 §4/§5 对齐，并注明「实现在 payload-resolve」 |

### 2.2 非目标

| # | 非目标 |
|---|--------|
| N1 | 改 heat / Web catalog 合并 |
| N2 | 改 snapshot dual-write 目标列表（见 SPE 36） |
| N3 | 合并 frontmatter 双解析器（见 SPE 38） |
| N4 | 改变默认 registry URL 或 telemetry |
| N5 | 引入新 npm 包 |

---

## 3. Policy 模式（领域语义）

| Policy | 用途 | 输出 |
|--------|------|------|
| `catalog` | search / list / bundle 展开 | `LoadedCatalog`（index + source 标签） |
| `body` | get-skill / 读 SKILL.md（MCP get） | skills root 或单 skill dir |
| `install` | `runInstall` 写盘源 | 单 skill 绝对目录 |

**安装顺序（install policy，铁律，与 SPE 33 一致）：**

1. `OPENWISDOM_SKILLS_ROOT` / monorepo `skills/` 上 `locateSkillDir`  
2. 远程：`ensureRemoteSkillDir`（可 fail）  
3. 包内 `skills-snapshot/`  

**Catalog 顺序（catalog policy，与 SPE 33 一致，可整理命名）：**

1. 显式 `catalogPath`  
2. monorepo / skills root 本地（未 preferRegistryCache）→ package catalog-snapshot 或 scan  
3. registry disk cache（若未 NO_REMOTE）  
4. package catalog-snapshot  
5. scan  

**Body 顺序：** 与现 `resolveSkillsRoot` 对齐（env → monorepo → package skills-snapshot），**不** 为 body 强制远程下载（远程 body 可后续；本 SPE 不扩展）。

---

## 4. 接口形状（实现约束，非最终 TS 签名仪式）

实现必须满足：

- **Accept dependencies**：`env` / `cwd` / `packageRoot` / `fetchImpl` / `cacheDir` / `registry` 可注入  
- **Return results**：远程失败不 throw（ensure* 风格）；install 找不到 skill 时 throw 明确错误（与现一致）  
- **Small surface**：对外 2–4 个命名函数即可，禁止再增第三套梯子  

建议导出（名称可微调，但语义固定）：

```text
ensureCatalogForUse(opts)     // refresh remote best-effort + loadCatalog policy
resolveSkillPayloadDir(opts)  // install policy for one id
resolveSkillsTreeRoot(opts)   // body policy
loadCatalog(opts)             // may re-export after internal rewrite
```

`runInstall` 只调用 install policy，不再内联第二套路径逻辑。

---

## 5. 文件范围

| 动作 | 路径 |
|------|------|
| 新增 | `packages/core/src/payload-resolve.ts` |
| 新增 | `packages/core/src/payload-resolve.test.ts`（可合并/迁移现有 registry/install 相关用例） |
| 改写 | `packages/core/src/catalog.ts`、`skills-root.ts`、`install.ts` |
| 导出 | `packages/core/src/index.ts`（导出新符号；旧符号保留） |
| 不改 | `packages/catalog/**`、`apps/web/**`（本 SPE） |

---

## 6. 验收

- [ ] core 内 **不存在** 第三套手写 remote/local 顺序（grep 无重复 `skills-snapshot` 决策块，或仅 wrapper）  
- [ ] 现有 `registry.test.ts` / `install.test.ts` / `get-skill.test.ts` **全绿**（可小改 import）  
- [ ] 新增 policy 矩阵测试：`NO_REMOTE` · monorepo prefer · remote-only skill install（mock fetch）  
- [ ] `pnpm --filter @openwisdom/core test` 通过  
- [ ] 公开行为：`runInstall` + `loadCatalog` + `resolveSkillsRoot` 与 SPE 33 一致  

---

## 7. 实现备注

- monorepo 开发者默认仍见本地 catalog（preferLocal）；测试用 `preferRegistryCache` / `noRemote` 不变  
- `getPackageRoot` 宿主探测逻辑 **不** 搬出 paths.ts，仅被 PayloadResolve 调用  
- 若与 SPE 36 并行：不要假设 core 一定仍有 `skills-snapshot`；install offline 路径以 **host packageRoot**（cli/mcp）为准，core 私有 snapshot 可缺省  

---

## 8. 完成定义

Payload 顺序只有一个实现文件承担复杂度；CLI/MCP/get/install 经同一 seam；测试不再分别 mock 三套隐式规则。

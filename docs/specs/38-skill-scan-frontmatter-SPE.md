# SPE 38 — SkillScan / frontmatter 单一实现

> **状态：** IMPLEMENTED P0（主仓合并 · 2026-08-04）  
> **日期：** 2026-08-04  
> **来源：** architecture review · candidate #4  
> **协调：** 与 SPE 35 同属 `packages/core` + `packages/catalog`；**可同一 agent 串行**，避免双写 scan  

---

## 0. 一句话

构建期（catalog build）与运行期（`scanSkillsToCatalog`）对 skills 树的 **扫描 + scope/layer 推断 + frontmatter 解析** 收敛到 **一个实现**（或 build-only scan + runtime 禁止生产路径再扫），消灭 `updated: 1970-01-01` 类漂移。

---

## 1. 问题

| 路径 | 解析 | 扫描 |
|------|------|------|
| `packages/catalog/src/build.ts` | gray-matter + `parseSkillFrontmatter`（schema） | `findSkillMdFiles` + `inferScopeAndLayer` |
| `packages/core/src/catalog.ts` | `parseSkillMarkdown` / `parseSimpleYaml` | `walkSkillDirs` + `inferScopeLayer`（算法略不同） |

两套 shallow 双胞胎；修改校验规则要改两处。

---

## 2. 目标 / 非目标

### 2.1 目标（P0）

| # | 目标 |
|---|------|
| G1 | **单一** `inferScopeAndLayer(repoRelativePosix)` 实现（放 `schema` 或 `core` 可被 catalog 依赖的位置） |
| G2 | Runtime `scanSkillsToCatalog` 与 build 的 scope/layer 规则 **字节级一致**（单测夹具同一路径） |
| G3 | Runtime scan 产出的 `CatalogSkill` 必填字段策略与 build 对齐：`updated` 不用假 `1970-01-01` 当「有文件却无 mtime」时的静默谎言——用 mtime ISO date 或 omit 后由 schema 默认（优先 **mtime**，与 build `updatedFromMtime` 一致） |
| G4 | `packages/catalog` 增加 **至少一个** vitest：空树拒绝 / 单 skill fixture 产出 id+scope+layer |

### 2.2 目标（P1）

| # | 目标 |
|---|------|
| P1-a | core 安装/校验路径尽量走 `@openwisdom/schema` `parseSkillFrontmatter`；`parseSimpleYaml` 仅作无 dep 环境的 fallback 并测等价子集 |
| P1-b | 若 catalog 包可依赖 core：build 调用 `scanSkillsToCatalog`；**或** 抽 `@openwisdom/schema` 旁 `skill-scan` 小模块避免 catalog↔core 环依赖 |

**环依赖禁令：** `schema` ← `catalog`；`schema` ← `core`。不可 `core` → `catalog`。共享代码放 **schema** 或新建无环包；P0 允许 **复制消除为 catalog 导出 helper 被 core 复制一次** 的反向——优先 schema。

### 2.3 非目标

| # | 非目标 |
|---|--------|
| N1 | 去掉 offline snapshot，强制永远 scan |
| N2 | 改 Web seeds |
| N3 | 引入 gray-matter 到 core 运行时（体积）；除非证明必要 |

---

## 3. 建议落地（P0 最小）

1. 在 `packages/schema/src/` 增加 `scope-layer.ts`：`inferScopeAndLayer(pathPosix: string)`  
2. catalog `build.ts` 与 core `catalog.ts` 都 import 它  
3. core `scanSkillsToCatalog` 使用 `statSync` mtime → `updated`  
4. catalog 包：`src/build.test.ts` 用 tmp skills 树  

---

## 4. 验收

- [ ] `inferScopeAndLayer` 仅一处实现（grep）  
- [ ] schema + catalog + core tests 绿  
- [ ] 同 fixture 路径：build entry 与 scan entry 的 `scope`/`layer`/`id` 一致  

---

## 5. 完成定义

Scope/layer 与 scan 字段策略有 **locality**；catalog 包不再是「无测试的脚本」。

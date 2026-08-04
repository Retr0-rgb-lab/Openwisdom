# SPE 37 — WebCatalog 加深（合并 · 学科 · 热度）

> **状态：** IMPLEMENTED P0+P1 部分（主仓合并 · 2026-08-04）  
> **日期：** 2026-08-04  
> **来源：** architecture review · candidates #3 Strong-adjacent + #6 + #7  
> **范围：** 仅 `apps/web`（可选轻依赖 `@openwisdom/schema`）  
> **文档治理：** 执行清单；UI 契约以知识库 **10** 为准，本 SPE 写实现加深

---

## 0. 一句话

把 Web 侧「registry 手解析 + 多种子 + getCatalog 隐式真理 + 三套学科 allowlist + 仅 list 合并 heat」收成 **一个深模块** 的接口：`getCatalog` / `getSkillBySlug` 对调用方足够，实现藏在 `data/catalog`。

---

## 1. 问题

- 机器 catalog：`public/registry/catalog.json`  
- Web 模型：`CatalogEntry` + bootstrap/seeds 叠加  
- 学科 id：`types` / `load-registry` / `parseDisciplineParam` / home short keys / `disciplineStyles` 多处硬编码  
- 热度：`mergeHeat` 仅 skills **列表** 页；详情 / 搜索可缺  

---

## 2. 目标 / 非目标

### 2.1 目标（P0）

| # | 目标 |
|---|------|
| G1 | **单一** `DISCIPLINE_IDS`（及 home alias map）为 web 唯一 allowlist；`load-registry` / URL parse / home / styles **只引用**它 |
| G2 | 删除或标记 dead：`parseSourceParam` 若 filter 已忽略 `source`；清理无用导出 |
| G3 | Registry 加载 **一处**：`load-registry` 为唯一 JSON 入口；`lib/heat/skill-ids` **从该入口 re-export ids**（禁止第二套静态 import 解析逻辑） |
| G4 | `mergeHeat` 进入 catalog 读取路径：**list / detail / GlobalSearch** 使用同一「可含 heat 的 entry」语义（fail-open：无 stats 则为 undefined/0，不抛） |
| G5 | 去掉 `mapRegistryToEntry` 对空 disciplines 静默填 `psychology`；改为 `[]` 或显式 `unknown` 策略并在 UI 不谎称心理学（优先 `[]` + chip 隐藏） |
| G6 | `fetch-stats` 与 heat types **不重复**定义同一 Stats 形状（一处定义，另一处 import） |

### 2.2 目标（P1）

| # | 目标 |
|---|------|
| P1-a | `load-registry` 使用 `@openwisdom/schema` 的 `catalogIndexSchema`（web 增加 workspace 依赖）或抽 shared 校验；失败时 dev warn + 空列表 fail-open |
| P1-b | 抽出 `copyText` 到 `lib/clipboard.ts`（或 `components/install`），替换 5 处复制 |
| P1-c | 文档注释：`getCatalog` merge 顺序写成模块顶注释（registry → bootstrap overlay → seeds） |

### 2.3 非目标

| # | 非目标 |
|---|--------|
| N1 | 删除全部 seed 文件（仍需 bilingual/featured overlay） |
| N2 | 改 CLI/MCP/core install |
| N3 | 把 heat 写入 SKILL.md 或 catalog.json |
| N4 | 重写 SkillsCatalog 720 行 UI（除非为接 heat 的最小改动） |
| N5 | 新学科产品决策（education 已 SPE 34） |

---

## 3. Merge 顺序（冻结）

1. `loadRegistryCatalog()` → `CatalogEntry[]`（`source: "catalog"`）  
2. Overlay `BOOTSTRAP` / `REFERENCE_BOOTSTRAP`：同 id 保留 install 真相，补 bilingual UI  
3. Seeds（principle / history / philosophy / external / discipline）：registry 已有 → 保留 install + seed UI 字段；否则 discovery-only  
4. `attachHeat(entries, stats | null)` — fail-open  

调用方 **禁止** 再手写第 5 套 merge。

---

## 4. 文件范围

| 区域 | 路径 |
|------|------|
| catalog | `apps/web/src/data/catalog/*` |
| heat | `apps/web/src/lib/heat/*` |
| pages | `apps/web/src/app/[locale]/skills/**`（detail 接 heat） |
| search | GlobalSearch 相关组件 |
| disciplines | `components/home/disciplines.ts`、`components/skills/disciplineStyles.ts` |
| optional | `apps/web/package.json` 增加 `@openwisdom/schema` |

---

## 5. 验收

- [ ] grep：`DISCIPLINE_SET` / 重复硬编码七学科数组 **≤1 权威源**  
- [ ] detail 页与 list 在有 stats 时 heat 展示一致（或同字段）  
- [ ] 空 disciplines 不再显示为心理学 chip  
- [ ] `pnpm --filter web build` 或至少 `tsc`/lint 无新错误  
- [ ] 不破坏 zh/en skills 文案键  

---

## 6. 完成定义

「网站上 skill X 是什么」→ 读 `getCatalog` / `getSkillBySlug` 一处即可；学科与 heat 不再泄漏到页面层拼装。

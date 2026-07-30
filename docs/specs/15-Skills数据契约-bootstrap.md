# Spec 15 — Skills 数据契约与 Bootstrap Catalog

> **状态：** Ready for execute  
> **父控：** [12-Skills页面-SPE](./12-Skills页面-SPE.md)  
> **原则：** 为 UI 提供可筛选的真实结构；**标注** bootstrap，待 `skills/` + `packages/catalog` 替换

---

## 1. 长期目标形态（架构对齐 Spec 01）

```text
skills/**/SKILL.md  →  packages/catalog build  →  catalog.json
                                              ↘ web SSG + /registry/catalog.json
stats API (optional) ──merge──→ heat fields（永不写回 SKILL.md）
```

**本批不做：** monorepo packages、真实 SKILL.md 树、stats API。

---

## 2. CatalogEntry 类型（web）

```ts
type SkillLayer = "scenario" | "reference";
type SkillScope = "official" | "community";
type ContentLang = "zh" | "en";
/** UI / filter key — full names for URL */
type DisciplineId =
  | "psychology"
  | "sociology"
  | "history"
  | "political-science"
  | "economics";

type LocalizedString = { zh: string; en: string };

type CatalogEntry = {
  id: string;
  slug: string;
  layer: SkillLayer;
  scope: SkillScope;
  disciplines: DisciplineId[];
  /** body language of skill content */
  language: ContentLang;
  title: LocalizedString;
  summary: LocalizedString;
  tags: string[];
  version: string;
  updated: string; // ISO date
  repoPath: string | null; // e.g. skills/official/scenarios/macro-scan
  install: { cli: string };
  /** provenance of this row */
  source: "bootstrap" | "catalog";
  featuredRank?: number; // lower = earlier in featured
  // scenario extras
  when?: LocalizedString;
  steps?: LocalizedString[]; // each step bilingual object OR parallel arrays — prefer LocalizedString[]
  shape?: "circle" | "square" | "triangle";
  axis?: LocalizedString;
  references?: string[]; // ids of reference skills (may be unresolved)
  // heat — always optional; omit in bootstrap
  installs30d?: number;
  installsTotal?: number;
};
```

**Discipline map（Home 短键 ↔ 规范 id）：**

| Home key | DisciplineId |
|----------|----------------|
| psych | psychology |
| socio | sociology |
| history | history |
| poli | political-science |
| econ | economics |

筛选 URL 使用 **DisciplineId**（`discipline=psychology`）。

---

## 3. Bootstrap 内容（v1 必须）

仅 **3** 条 official scenarios（与 PRODUCT / Home 一致）：

| slug | shape | disciplines | featuredRank |
|------|-------|-------------|--------------|
| `macro-scan` | circle | political-science, economics, sociology | 1 |
| `personal-anchor` | triangle | history, sociology | 2 |
| `metacognition-audit` | square | psychology | 3 |

- `scope: official` · `layer: scenario` · `source: bootstrap`  
- `language`: 可用 `zh` 作为规划正文语言（UI 仍双语标题）  
- `install.cli`: `npx openwisdom install {slug}`  
- `repoPath`: 规划路径 `skills/official/scenarios/{slug}`（文件可不存在；UI 链到 GitHub 根或 path 404 友好）  
- **禁止** `installs30d` / `installsTotal`  
- 文案与 Home `scenarios.*` 对齐（可复制语义，允许 skills.json / catalog 自持以免耦合过紧）

**Community：** 数组无条目；筛选 community → 空态。

**References：** 不编造完整 reference 条目；详情页可展示「计划引用」标签字符串（非可点假 slug），或省略。

---

## 4. 加载 API（web 内部）

```ts
// apps/web/src/data/catalog/index.ts
getCatalog(): CatalogEntry[]
getSkillBySlug(slug: string): CatalogEntry | undefined
filterCatalog(entries, query: CatalogQuery): CatalogEntry[]
sortCatalog(entries, sort: SortKey): CatalogEntry[]
```

- 纯函数；无网络  
- 未来：替换 `BOOTSTRAP_CATALOG` 为读 `public/registry/catalog.json`

---

## 5. 诚实声明（强制）

目录页与详情页（bootstrap 条目）必须展示简短 banner，语义：

> 当前列表为产品叙事对齐的 **bootstrap 目录**（官方三场景）。完整 `skills/` 与生成索引尚未入库；热度未接入。源码与进展见 GitHub。

英文对等。样式：`border-line bg-surface-muted` 信息条，**非** error 红。

---

## 6. 迁移路径（非本批）

1. 写入真实 `skills/official/scenarios/*/SKILL.md`  
2. catalog build → 替换 bootstrap  
3. `source: "catalog"` 后 **移除** bootstrap banner  
4. 接入 stats 后再显示 heat / popular  

---

## 7. 验收

- [ ] 类型与 3 条 bootstrap 存在  
- [ ] filter/sort 单测或手工验收：q / layer / discipline  
- [ ] 无假 heat 字段  
- [ ] UI banner 绑定 `source === "bootstrap"`  

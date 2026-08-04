# Skills Web 与数据契约

> 蒸馏自原 Spec 12–16；路径 `apps/web`。

---

## 1. 目标

把 Skills 做成可操作的 **图书馆**（Operate + Read）：

1. 发现 / 筛选 / 搜索  
2. 打开详情评估「何时用 · 流程 · 安装」  
3. **诚实** 数据层：可安装真相 = registry；热度 fail-open  

成功直觉：从 Home 进 Skills，30 秒内能筛到目标 skill 并复制安装命令。

---

## 2. 铁律

| # | 规则 |
|---|------|
| 1 | 无网页分析聊天 |
| 2 | One content truth — 可安装元数据来自 catalog/registry |
| 3 | Heat fail-open — 无数则不展示，不阻塞安装 |
| 4 | UI zh/en · 正文语言徽章可见 |
| 5 | Overlay Atlas only |
| 6 | 不写热度进 `SKILL.md` |

---

## 3. 交付路径

| 交付 | 路径 |
|------|------|
| 目录 | `apps/web/src/app/[locale]/skills/page.tsx` |
| 详情 | `…/skills/[slug]/page.tsx` |
| 组件 | `apps/web/src/components/skills/*` |
| 数据 | `apps/web/src/data/catalog/*` |
| i18n | `apps/web/src/messages/{zh,en}/skills.json`（或等价） |

---

## 4. Catalog 类型（Web）

```ts
type SkillLayer = "scenario" | "reference";
type SkillScope = "official" | "community";
/** Web allowlist — seven peer disciplines (决策 #22 / SPE 34) */
type DisciplineId =
  | "psychology"
  | "sociology"
  | "history"
  | "political-science"
  | "economics"
  | "philosophy"
  | "education";

type CatalogEntry = {
  id: string;
  slug: string;
  layer: SkillLayer;
  scope: SkillScope;
  disciplines: DisciplineId[];
  language: "zh" | "en" | string;
  title: { zh: string; en: string } | string;
  summary: { zh: string; en: string } | string;
  tags: string[];
  version: string;
  updated: string;
  repoPath: string | null;
  install: { cli: string };
  source?: "bootstrap" | "catalog";
  featuredRank?: number;
  when?: …; steps?: …; references?: string[];
  shape?: "circle" | "square" | "triangle";
  installs30d?: number;
  installsTotal?: number;
  // 可选：installMode, provenance, pipeline …
};
```

| Home 短键 | DisciplineId |
|-----------|--------------|
| psych | psychology |
| socio | sociology |
| history | history |
| poli | political-science |
| econ | economics |
| philo | philosophy |
| **edu** | **education** |

筛选 URL 使用 **DisciplineId**（`discipline=psychology` · `discipline=education` 等）。

**Catalog 真相 vs Web allowlist：** `packages/schema` 中 `disciplines` 为 free `string[]`；core/CLI/MCP 按字符串精确匹配过滤。Web `DisciplineId` / `DISCIPLINE_SET` / `parseDisciplineParam` 为 **七元组 allowlist**——未知 id 不得静默丢弃已登记七科（漏 `education` 会导致 dual-write 后筛空）。

### 内部 API

```ts
getCatalog(): CatalogEntry[]
getSkillBySlug(slug: string): CatalogEntry | undefined
filterCatalog(entries, query): CatalogEntry[]
sortCatalog(entries, sort): CatalogEntry[]
mergeHeat(entries, stats | null): CatalogEntry[]
```

---

## 5. 合并与诚实

长期管道：

```text
skills/** → catalog build → public/registry/catalog.json
stats API ──merge──→ heat 字段（永不写回 SKILL.md）
```

**当前（89 skill）：** registry 为可安装真相；UI overlay 可补 when/steps；与 CLI/MCP snapshot 应对齐。

历史 bootstrap（仅三场景、`source: "bootstrap"`）已由真实 catalog 取代；若再出现 bootstrap，须 banner 声明。

---

## 6. 目录页（Operate）

### 结构

```text
H1 · lede · result count
[诚实 banner 若需要]
Toolbar: Search · Layer · Source · Discipline · Lang · Sort · active chips
[Featured strip 无硬过滤时]
Results grid · EmptyState
```

### URL

```text
/{locale}/skills?q=&layer=&source=&discipline=&lang=&sort=
```

| sort | 规则 |
|------|------|
| `featured` | official scenario → official reference → community |
| `name` | 标题字典序 |
| `updated` | ISO 降序 |
| `popular` | `installs30d` 降序；无 heat 时隐藏选项 |

**搜索：** title / summary / tags / slug（大小写不敏感）。

### SkillCard

title · mono slug · layer/scope badge · discipline chips · lang · summary 2 行 · tags≤3 · heat 有则显示 · 复制 install · 整卡进详情  

视觉：`rounded-xl border border-line bg-surface`；禁紫光、嵌套卡、假 CountUp。

### 空状态

筛选 0 → 清筛选 + triad 推荐；community 空 → PR 说明；catalog 灾难空 → 诚实建设中 + GitHub。

---

## 7. 详情页

```text
Breadcrumb · meta · H1 · summary · chips
Sticky install: CLI copy · GitHub · Download
Body by layer
Related ≤3
```

| Scenario 块 | Reference 块 |
|-------------|--------------|
| When · Steps · Output · Bias · Cited refs | Definition · Bounds · Misuse · Questions · Used-by |

```bash
npx openwisdom install {slug}
```

未知 slug → 本地化 `notFound()`。SEO：`{Name} · Scenario|Reference · Openwisdom`。

---

## 8. Source 分面

| 值 | 含义 |
|----|------|
| official | `skills/official/**` |
| community | `skills/community/**`（含 materialize 种子） |

历史 curated-external / link-only：**产品决策**已要求网站可见 = 可安装；materialize 后 registry 命中则为 cli 可装。

---

## 9. 动效预算（Skills）

内容默认静；无 BlurText；可选 Reveal 一次；RM 关入场。SpotlightCard 弱 hover 可。

---

## 10. 验收

- [ ] `/zh/skills` 与 `/en/skills` 可操作  
- [ ] 详情 200；未知 slug 404  
- [ ] 筛选反映 URL  
- [ ] 默认 featured；无假热度  
- [ ] zh/en 文案对称  
- [ ] Overlay Atlas  

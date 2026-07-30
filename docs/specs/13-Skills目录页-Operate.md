# Spec 13 — Skills 目录页（Operate）

> **状态：** Ready for execute  
> **路由：** `/{locale}/skills`  
> **模式：** Operate + Read  
> **父控：** [12-Skills页面-SPE](./12-Skills页面-SPE.md)

---

## 1. 目的与任务

| 项 | 内容 |
|----|------|
| **目的** | 发现 / 筛选 / 搜索 skill |
| **主任务** | 在结果网格中定位目标 skill → 打开详情或复制安装 |
| **非目的** | 再讲一遍产品故事（那是 Home） |

---

## 2. 页面结构（自上而下）

```text
[SiteHeader — Skills active]
┌─────────────────────────────────────────────┐
│ Page intro                                  │
│  H1 · lede · result count                   │
│  Bootstrap honesty banner（数据为 bootstrap）│
├─────────────────────────────────────────────┤
│ Toolbar（Operate）                          │
│  Search input                               │
│  Layer tabs: All | Scenario | Reference     │
│  Source chips: Official | Community         │
│  Discipline multi-chips（五科）             │
│  Language chips: zh | en                    │
│  Sort: featured | name | updated            │
│    （popular 仅当有 stats 时启用，否则隐藏）  │
│  Active filter chips + Clear all            │
│  Mobile: Filters → Sheet + badge count      │
├─────────────────────────────────────────────┤
│ Featured strip（仅无 q / 无硬分面时）         │
│  三官方场景快速入口（可与网格重复，允许）    │
├─────────────────────────────────────────────┤
│ Results grid（默认 1→2→3 列）                │
│  SkillCard × N                              │
│  EmptyState if 0                            │
└─────────────────────────────────────────────┘
[SiteFooter]
```

**宽度：** `max-w-6xl px-6`（与 `Section` 一致）。  
**首屏 intro 垂直：** `py-10 md:py-14`（Operate 密度，低于 Home 叙事段）。

---

## 3. URL 状态（权威）

```text
/{locale}/skills?q=&layer=&source=&discipline=&lang=&sort=
```

| Param | 值 | 默认 |
|-------|-----|------|
| `q` | 自由文本 | 空 |
| `layer` | `scenario` \| `reference` | 无（全部） |
| `source` | `official` \| `community` | 无 |
| `discipline` | 可重复或逗号：`psychology` 等 **规范 slug**（见 Spec 15） | 无 |
| `lang` | `zh` \| `en` | 无 |
| `sort` | `featured` \| `name` \| `updated` \| `popular` | `featured` |

**行为：**

- 分享 URL 可还原筛选  
- 清空全部 → 裸 `/skills`  
- SEO：canonical 指向裸目录；分面组合 `noindex` 可选（v1 可用 `robots` meta 仅对有 query 的请求）

**搜索匹配：** `title` / `summary` / `tags` / `slug`（大小写不敏感）。

**排序规则：**

| sort | 规则 |
|------|------|
| `featured` | official scenario → official reference → community；同组内按 featuredRank / slug |
| `name` | locale 标题字典序 |
| `updated` | `updated` ISO 降序 |
| `popular` | 仅 stats 存在时；否则 UI 不展示该选项，若 URL 带入则 fallback `featured` |

---

## 4. SkillCard 字段

| 字段 | 展示 |
|------|------|
| title | serif 标题 |
| slug | mono 小字 |
| layer | Badge |
| scope | Badge official=structure tint · community=slate |
| disciplines | chips（10% fill / border） |
| language | content language badge |
| summary | 2 行 clamp |
| tags | 最多 3 +「+N」 |
| heat | **仅** stats 存在时显示 30d；v1 bootstrap **永不**显示假数字 |
| actions | 链接详情 · 复制 `install.cli`（Sonner） |

**视觉：** `rounded-xl border border-line bg-surface` + 轻阴影；顶 1px accent 可用 layer/shape 色；**禁止**卡中套卡、紫光、CountUp。

**交互：** 整卡可点进详情；复制按钮 `stopPropagation`。

---

## 5. 空状态

| 条件 | UX |
|------|-----|
| 筛选/搜索 0 结果 | 说明 + Clear filters + 三场景推荐链 + Contribute/GitHub |
| `source=community` 且无社区项 | 解释 PR → `community/` + GitHub |
| catalog 数组空（灾难） | 诚实建设中 + GitHub（保留 Placeholder 语义） |

---

## 6. 动效与组件预算

| 允许 | 禁止 |
|------|------|
| 轻 Stagger 网格一次 | BlurText / DotField 页面级 |
| SpotlightCard 弱 hover | Hyperspeed / Aurora / fake CountUp |
| Copy + toast 150–250ms | 筛选时整页 choreography |
| Sheet 滑入 filters | LogoLoop 目录页 |

`prefers-reduced-motion`：无 stagger。

**shadcn：** Button, Badge, Tabs, Sheet, DropdownMenu, Skeleton, Tooltip, Separator；**新增** Input（若缺失）。

**Bits：** SpotlightCard, Stagger, ClickSpark（复制成功可选）。

---

## 7. i18n

Namespace：`skills`（`messages/{zh,en}/skills.json`）。

最少键组：`meta` · `intro` · `bootstrap` · `filters` · `sort` · `card` · `empty` · `actions` · `layer` · `scope` · `disciplines`。

Skill **标题/摘要** 优先 catalog 条目的 `title.zh`/`title.en`（bootstrap）；**不**把未来 SKILL.md 正文塞进 messages。

---

## 8. 验收

- [ ] 替换 `PlaceholderSection` 为 Operate 布局  
- [ ] Query 同步筛选  
- [ ] 三场景默认可见  
- [ ] Community 筛选空态诚实  
- [ ] 无热度数字（bootstrap）  
- [ ] 移动 Sheet 筛选  
- [ ] zh/en 完整  

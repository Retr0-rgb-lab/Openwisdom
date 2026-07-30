# Spec 14 — Skills 详情页

> **状态：** Ready for execute  
> **路由：** `/{locale}/skills/{slug}`  
> **模式：** Operate + Read  
> **父控：** [12-Skills页面-SPE](./12-Skills页面-SPE.md)

---

## 1. 目的

**评估 + 安装握手**：读懂何时用、流程、边界 → 复制 CLI / 打开 GitHub。

Scenario 与 Reference **统一路由**，用 `layer` 切换模块；v1 bootstrap 仅 scenario 三枚。

---

## 2. 页面结构

```text
[SiteHeader — Skills active]
┌────────────────────────────────────────────┐
│ Breadcrumb: Skills / {title}               │
│ Meta row: layer · scope · language · ver   │
│ H1 (serif) + summary                       │
│ Discipline chips · tags                    │
├────────────────────────────────────────────┤
│ Sticky install bar（md+）                  │
│  mono CLI · Copy · GitHub link             │
│  honest CLI-not-on-npm note（复用 Home 语义）│
├────────────────────────────────────────────┤
│ Body (layer-specific)                      │
│  Scenario: When · Steps · Output · Bias    │
│            · Cited references（若有）      │
│  Reference: Definition · Bounds · Misuse   │
│             · Questions · Used-by          │
├────────────────────────────────────────────┤
│ Related skills（同学科或同 layer，≤3）       │
│ Bootstrap note（若条目 source=bootstrap）  │
└────────────────────────────────────────────┘
[SiteFooter]
```

---

## 3. Scenario 模块（v1 必做）

| 块 | 数据源 |
|----|--------|
| When | `when` locale string |
| Steps | `steps[]` 有序列表 |
| Output skeleton | `output` 可选；无则省略块 |
| Bias checkpoints | `bias[]` 可选；无则省略 |
| Cited references | `references[]` ids；无实体则展示 **planned labels** 并说明尚未入库 |

**不**渲染假装完整的 SKILL.md 长文；bootstrap 阶段用结构化字段 + 「完整 SKILL.md 将随 `skills/` 入库」诚实句。

---

## 4. Reference 模块（模板预留）

当 catalog 出现 `layer: reference` 时启用。v1 可只实现组件分支，无数据则不渲染路由条目。

---

## 5. 安装 CTA

```bash
npx openwisdom install {slug}
```

- 复制 → Sonner（`skills.actions.copied` / fail）  
- 附注：CLI 尚未发布 npm 时与 Home 一致诚实（可引用 `home.install.cliNote` 或 skills 自有键）  
- 次按钮：GitHub（`repoPath` 或仓库根）  
- **无** zip 下载 API 时不假装可下载；可链到 GitHub tree

Heat：无 stats 不展示 Installs。

---

## 6. SEO / Metadata

| 项 | 规则 |
|----|------|
| title | `{Name} · Scenario|Reference · Openwisdom` |
| description | summary |
| 404 | 未知 slug → `notFound()` |

`generateStaticParams`：bootstrap 三 slug × locales。

---

## 7. 动效

仍内容默认；无 BlurText。可选 Reveal 一次。RM 关闭入场动画。

---

## 8. 验收

- [ ] 三场景详情可访问  
- [ ] 未知 slug 404  
- [ ] 粘性安装条 + 复制  
- [ ] 诚实 bootstrap / CLI 状态  
- [ ] Related 不链死链  
- [ ] zh/en metadata + UI  

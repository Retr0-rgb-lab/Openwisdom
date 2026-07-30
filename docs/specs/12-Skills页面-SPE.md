# Spec 12 — Skills 页面 Spec-Plan-Execute 总控

> **状态：** Executed（2026-07-30 · bootstrap catalog + catalog/detail UI）  
> **日期：** 2026-07-30  
> **范围：** **仅** `/{locale}/skills` 目录 + `/{locale}/skills/{slug}` 详情  
> **模式：** Operate + Read（`DESIGN.md`）  
> **视觉世界：** Overlay Atlas（Specs 07–11 / `DESIGN.md`）— **不**开新世界  
> **非范围：** Install/Docs/Contribute 全文、CLI 包、`packages/*` monorepo、热度写入管道、学科枢纽页、网页聊天

---

## 1. 目标

把当前 `PlaceholderSection` 占位替换为可操作的 **Skills 图书馆**：

1. 发现 / 筛选 / 搜索官方场景 skill  
2. 打开详情评估「何时用 · 流程 · 安装路径」  
3. 诚实对待数据缺口：`skills/` 树与 catalog 管道尚未落地时，使用 **标注的 bootstrap 目录**（与 Home 三场景叙事对齐），**不**伪造安装热度与社区条目

成功标准：从 Home「浏览 Skills」进入后，用户在 30 秒内能筛到 `macro-scan` 并复制安装命令或跳转 GitHub。

---

## 2. 铁律（继承 AGENTS / PRODUCT）

| # | 规则 |
|---|------|
| 1 | **Agent-native** — 无网页分析聊天 |
| 2 | **One content truth** — 元数据不得假装来自已发布 `skills/**`；bootstrap 必须 `source: "bootstrap"` 并 UI 声明 |
| 3 | **Heat fail-open** — 无 stats 时 **不展示** 数字，不阻塞安装 |
| 4 | **UI zh/en · 正文语言 = contributor** — 卡片语言徽章可见 |
| 5 | **Overlay Atlas only** — primary/structure/signal；禁紫光、假指标、嵌套卡 |
| 6 | **范围裁剪** — 本 SPE 不重做 Home、不实现 `/install` 全文 |

---

## 3. 交付物

| 交付 | 路径 |
|------|------|
| 目录页 | `apps/web/src/app/[locale]/skills/page.tsx` |
| 详情页 | `apps/web/src/app/[locale]/skills/[slug]/page.tsx` |
| 组件 | `apps/web/src/components/skills/*` |
| 数据 | `apps/web/src/data/catalog/*`（bootstrap index） |
| i18n | `apps/web/src/messages/{zh,en}/skills.json` + `request.ts` |
| Specs | 本文件 + `13` 目录 UI + `14` 详情 + `15` 数据契约 |
| 联动（最小） | Home `ScenarioCards` / 可选 Discipline 链到 `/skills/{slug}` 或 `?discipline=` |

---

## 4. 执行波次（可并行）

| Wave | Plan | 内容 | 依赖 |
|------|------|------|------|
| **A** | Data | 类型 + bootstrap 三场景 + query helpers | 无 |
| **B** | i18n | `skills` namespace + metadata 文案 | 无 |
| **C** | Catalog UI | 搜索/分面/排序/网格/空态 | A, B |
| **D** | Detail UI | 元数据 + 场景模块 + 安装 CTA | A, B |
| **E** | Wire + verify | 深链、active nav、build | C, D |

**并行策略：** A∥B → C∥D → E。

---

## 5. 验收清单（总）

- [ ] `/zh/skills`、`/en/skills` 可操作目录（非 PlaceholderSection）
- [ ] `/zh/skills/macro-scan` 等三场景详情 200
- [ ] 未知 slug → 本地化 not-found
- [ ] 筛选/搜索/排序反映到 URL query
- [ ] 默认 `sort=featured`；无硬默认 layer/source
- [ ] 无 stats → 无热度数字
- [ ] bootstrap 横幅诚实可见
- [ ] zh/en 文案完整
- [ ] `pnpm build`（`apps/web`）通过
- [ ] Overlay Atlas；无假 metrics / purple glow

细节见 Spec **13 / 14 / 15**。

---

## 6. 方向契约（Impeccable surface contract）

```
THESIS: Skills is a library console — find, filter, open, install handshake —
        not a second marketing landing.
OWN-WORLD: Overlay Atlas field/surface/line; serif titles; mono ids;
           discipline chips ~10% fill; solid primary CTA.
STORY: Visitor scans official scenarios, opens one, copies install or GitHub.
FIRST VIEWPORT: H1 + honest bootstrap note + search/facets + result count + cards.
FORM: Operate catalog (IA §4.2) inside established Overlay Atlas; no new brand world.
```

---

## 7. 关联

| 文档 | 角色 |
|------|------|
| [13-Skills目录页-Operate](./13-Skills目录页-Operate.md) | 目录模块与交互 |
| [14-Skills详情页](./14-Skills详情页.md) | 详情模板 |
| [15-Skills数据契约-bootstrap](./15-Skills数据契约-bootstrap.md) | 字段与 bootstrap |
| [03-页面信息架构](./03-页面信息架构.md) | 全站 IA（§4.2–§5 权威意图） |
| [08-动效与ReactBits锁定](./08-动效与ReactBits锁定.md) | 动效预算 |
| [06-热度与遥测](./06-热度与遥测.md) | 热度 fail-open |

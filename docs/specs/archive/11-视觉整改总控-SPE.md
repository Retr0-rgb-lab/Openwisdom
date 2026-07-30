# Spec 11 — 视觉整改总控（Spec-Plan-Execute）

> **版本:** v1.0  
> **日期:** 2026-07-30  
> **路径:** Spec → Plan → Execute  
> **子规格:** 07 品牌 · 08 动效 · 09 检查 · 10 Home IA  

---

## 摘要

统一执行 **Logo 对齐视觉（07）**、**动效锁定（08）**、**Impeccable 整改（09）**、**Home 裁剪（10）**。本文件为总控：依赖、波次、验收、明确不做。

---

## 0. 前置依赖

| 已有 | 说明 |
|------|------|
| `apps/web` Next 16 + shadcn + motion | 可运行 |
| PRODUCT.md / DESIGN.md | 产品与旧铜体系文档 |
| logo.svg | 品牌权威 |
| Impeccable critique 快照 | `.impeccable/critique/…` |
| 动效/库调研 | 2026-07-30 agents → 写入 08 |

---

## 1. 现状（压缩）

1. 主色铜 **≠** logo 蓝/青石/琥珀。  
2. Home 九模块 + 空路由 → 漏斗失信。  
3. Bits 已接但曾过弱/后过杂；缺单一动效宪法。  
4. `detect.mjs` 对 TSX 空结果，不能代表干净。

---

## 2. 工作包（编号）

| # | 工作 | 主规格 | 产出 |
|---|------|--------|------|
| W1 | Token + shadcn 主题 + 清铜 | 07 | globals、button/badge 语义 |
| W2 | Header logo + chrome 触控 | 07 · 09 | SiteHeader/Footer |
| W3 | Bits 重色 + 08 宪法实现 | 08 | bits/*、Hero 配方 |
| W4 | Home IA 裁剪 + Model 合并组件 | 10 | page.tsx、删/并组件 |
| W5 | 漏斗诚实（CTA/占位/CLI 文案） | 09 P0 | InstallCommand、placeholders |
| W6 | DESIGN.md 更新 + AGENTS 指针 | 07–11 | 文档 |

---

## 3. 文件变更清单（预期）

| 文件 | 变更 | 节 |
|------|------|-----|
| `apps/web/src/app/globals.css` | logo token | W1 |
| `apps/web/src/components/ui/*` | primary 语义 | W1 |
| `apps/web/src/components/site/*` | logo、触控 | W2 |
| `apps/web/src/components/bits/*` | 色+宪法 | W3 |
| `apps/web/src/components/home/*` | 模块与色 | W3–W5 |
| `apps/web/src/app/[locale]/page.tsx` | 6 拍顺序 | W4 |
| `apps/web/src/messages/**` | 诚实文案 | W5 |
| `DESIGN.md` | Overlay Atlas | W6 |
| `AGENTS.md` | 指向 07–11 | W6 |
| `public/logo.svg` 或引用根 logo | 静态资源 | W2 |

---

## 4. 架构关系

```text
logo.svg ──► Spec 07 tokens ──► globals / shadcn
                │
Spec 08 motion ──► bits + Hero
                │
Spec 09 P0/P1 ──► 漏斗 + 触控 + 教义
                │
Spec 10 IA ──► page composition
                │
           Home 可发视觉
```

---

## 5. 实施顺序（Wave）

```text
Wave 1（可并行，文件冲突低）:
  Plan-A: W1 tokens
  Plan-B: W5 文案/占位策略（messages + placeholder）

Wave 2（依赖 Wave 1 色）:
  Plan-C: W2 header logo + W3 bits/Hero
  Plan-D: W4 Home 裁剪 + 组件合并

Wave 3:
  Plan-E: W6 DESIGN/AGENTS + 全站扫铜 + pnpm build + 目视验收
```

计划文件目录：`docs/plans/2026-07-30-visual-rebrand/`（见同批 plan 文件）。

---

## 6. 验收标准（总）

- [ ] 07–10 各自验收勾选  
- [ ] `pnpm build` 通过  
- [ ] `/zh` `/en` Hero 与 logo 并排同系  
- [ ] 无 P0 空转化（或有明确「建设中」+ GitHub）  
- [ ] 动效符合 08 宪法  
- [ ] Impeccable 再检查分数入库（可选）  

---

## 7. 不在范围

- CLI npm 发包完成  
- 完整 Skills 内容库与热度 API  
- Fumadocs 全文  
- 商业暗色全量  
- 重绘 logo  

---

## 8. 风险

| 风险 | 缓解 |
|------|------|
| 大面积换 primary 漏网铜 | grep `#B87333` / `datum` |
| 裁模块丢文案 | 下沉页保留 messages 键 |
| Bits 性能 | RM + 静态场 + IO 暂停 RAF（可选增强） |

---

## 9. 版本

| 版本 | 说明 |
|------|------|
| v1.0 | SPE 总控初版 |

# Spec 10 — Home 模块整改与 IA 裁剪

> **版本:** v1.0  
> **日期:** 2026-07-30  
> **状态:** Spec-locked  
> **依据:** specs/03 · PRODUCT 60s 理解 · Spec 09 P1-1 · Spec 07/08  

---

## 摘要

将 Home 从 **9 模块白纸书** 裁为 **6 拍 Persuade 叙事**，保留安装握手与三场景，合并重复信任/安装段；被裁内容下沉到子页（真页或诚实占位）。

---

## 1. 目标 IA（Home）

| 拍 | 模块 | 目的 |
|----|------|------|
| 1 | **Hero** | 60s 理解 + Install 主物件 + 方位/logo 语法 |
| 2 | **Harness** | 多 Agent 信任（静态或慢 loop） |
| 3 | **Scenarios** | 三官方场景（非对称） |
| 4 | **Model**（合并） | 原 Layer + Provenance 精华：场景→参考 + official/community **一屏** |
| 5 | **Disciplines**（可选短） | 五科入口 **或** 链到 `/skills` 筛选项；若仍空则改为 3 形+文案不链假库 |
| 6 | **FinalCta** | 再一次 Install + 次链 GitHub |

### 移出 Home（下沉）

| 原模块 | 去向 |
|--------|------|
| InstallPaths 整段 | `/install` 真页主内容 |
| ContributeTeaser 整段 | `/contribute` |
| 过长 Provenance 双卡 | 并入 Model 单卡或 `/about` |

---

## 2. 漏斗规则（绑定 09 P0）

| CTA | 允许目标 |
|-----|----------|
| 主 Install 命令 | 若 CLI 未发：旁注状态 + GitHub 主按钮 |
| Browse Skills | `/skills` **仅当**有列表或诚实空状态（非「假目录感」） |
| 场景卡 | `/skills/[slug]` 或 GitHub tree 路径 |
| 贡献 | `/contribute` 以 GitHub PR 说明为主 |

---

## 3. page.tsx 目标顺序

```text
Hero
Harness
Scenarios
Model (Layer+Provenance compact)
Disciplines? (short)
FinalCta
```

Header / Footer 常驻（07 logo）。

---

## 4. 与 03 的关系

- 03 §4.1 九模块为 **内容能力清单**，非强制「一页全塞」。  
- 本文件为 **Persuade 交付裁剪**；03 子页规格仍指导 `/install` 等。  

---

## 5. 验收

- [ ] Home 主列模块 ≤6（不含 header/footer）  
- [ ] Install 主物件只突出 **1 次**（Hero）；Final 可重复命令但无第三段路径教学  
- [ ] 无链到「铜徽章空洞页」而无说明  
- [ ] zh/en 文案同步  

## 6. 版本

| 版本 | 说明 |
|------|------|
| v1.0 | 6 拍 IA + 下沉表 + 漏斗规则 |

# Spec 09 — Impeccable 检查结论与整改优先级

> **版本:** v1.0  
> **日期:** 2026-07-30  
> **方法:** dual-agent critique + detect.mjs + 人工复核  
> **Target:** Home `apps/web`（Persuade）  
> **快照:** `.impeccable/critique/2026-07-30T03-56-50Z__apps-web-src-app-locale-page-tsx.md`

---

## 摘要

Home 在 **Direction 铜体系**下有一定完成度，但 **漏斗空路径（P0）**、**安装命令诚实性（P0）**、**九模块过载（P1）**、**动效教义冲突（P1）** 阻断「可发」成熟度。静态 detector 对 TSX **空结果不可信**；视觉 slop 模式需人工规则入库。

---

## 1. 分数

### 1.1 Design Health（Nielsen，7/10 适用）

| 适用合计 | 17/32（~53%） | Needs work |
|----------|---------------|------------|
| n/a | H7 灵活性、H10 帮助 | Persuade 落地页 |

弱项：H5 防错 **1**、H9 错误恢复 **1**、H1/H3 状态与控制 **2**。

### 1.2 Audit 技术维（合成）

| 维 | 分 | 要点 |
|----|----|------|
| A11y | 2 | 顶栏触控 <44px |
| Performance | 2 | DotField RAF、BlurText filter |
| Responsive | 3 | 小屏藏 Orientation |
| Theming | 2–3 | 铜≠logo（见 07） |
| Integrity | 2 | 空路由 + 漏检 slop |
| **合计** | **~12/20** | Acceptable–weak |

### 1.3 设计特异性

- **强：** 诚实文案、Install 主物件、方位隐喻（若改色前）。  
- **弱：** 中段目录站模板；CTA 进 Placeholder。

---

## 2. 问题登记（按模块）

### P0

| ID | 问题 | 模块 | 整改 |
|----|------|------|------|
| **I-P0-1** | Skills/Install/Docs/Contribute 为占位，Home CTA 仍强转化 | 全局漏斗 | 最小真页 **或** CTA 改 GitHub + 标明建设中 |
| **I-P0-2** | `npx openwisdom install` 可能不可用却作主 CTA | Hero / FinalCta / InstallCommand | 状态条或 GitHub 主路径 |

### P1

| ID | 问题 | 模块 | 整改 |
|----|------|------|------|
| **I-P1-1** | 九模块超 60s 预算 | page.tsx 全序列 | 收至 5–6 拍（见 10） |
| **I-P1-2** | DESIGN 静内容 vs 04/实现动效 | bits + Section | 执行 08 动效宪法 |
| **I-P1-3** | 品牌铜 ≠ logo | 全局 | 执行 07 |
| **I-P1-4** | 顶栏触控偏小 | SiteHeader | 控件 ≥40–44px |

### P2

| ID | 问题 | 模块 | 整改 |
|----|------|------|------|
| **I-P2-1** | Scenario 嵌套盒 + 厚顶条 | ScenarioCards | 压平；1px 线 |
| **I-P2-2** | DisciplineGrid 无链接 | DisciplineGrid | 链 slug 或下沉 |
| **I-P2-3** | Reveal 依赖 JS 初态 opacity 0 | Reveal | 默认可见 + 增强 |
| **I-P2-4** | max-w 5xl vs 6xl | Header/Home | 统一 measure |

### P3

| ID | 问题 | 模块 |
|----|------|------|
| **I-P3-1** | 小屏无 Orientation | Hero |
| **I-P3-2** | CJK Blur 过慢 | BlurText |
| **I-P3-3** | 静态 detect 漏检 | 工程 | 浏览器抽检清单 |

---

## 3. 按模块的整改规格

### Header / Footer

- [ ] Logo 文件接入  
- [ ] Primary 按钮色 = 07  
- [ ] 触控目标  
- [ ] 占位路由：导航可保留但目标页诚实  

### Hero

- [ ] 07 色 + 08 Hero 配方  
- [ ] Install 诚实性 I-P0-2  
- [ ] Browse Skills 目标策略 I-P0-1  

### Harness

- [ ] 静态默认或慢 loop（08 C5）  
- [ ] 后期真实 harness 单色标  

### Scenarios

- [ ] 非对称保留  
- [ ] 去厚铜顶条；三形微标  
- [ ] CTA 指向真路径或 GitHub  

### Layer / Disciplines / Install / Provenance / Contribute / FinalCta

- [ ] 随 10 信息架构裁剪是否保留在 Home  
- [ ] 重复 Install 合并  

---

## 4. Detector 备注

| 项 | 结果 |
|----|------|
| `detect.mjs --json apps/web/src` | `[]` |
| 原因 | TSX 非 HTML 分析器主路径；DESIGN 无 YAML frontmatter |
| 人工确认的「真问题」 | 顶色条圆角卡、LogoLoop 无限位移、重复 kicker、DotField 环境 RAF、嵌套卡 |

**工程建议：** 发布前对 `/zh` 做浏览器侧 impeccable 或人工 checklist，勿只信静态 `[]`。

---

## 5. 建议命令顺序（Impeccable）

执行层以 **07+08+10 规格** 为准，命令仅作操作别名：

1. **clarify** — I-P0-2 文案与主路径诚实  
2. **onboard** — I-P0-1 空状态 / 最小真页  
3. token remap — **07**（非 impeccable 命令）  
4. **distill** / **layout** — I-P1-1  
5. **quieter** — I-P1-2 按 08  
6. **adapt** — I-P3-1 / 触控  
7. **polish** — 收尾  

---

## 6. 验收

- [ ] P0 两项关闭或书面风险接受  
- [ ] Home 模块数符合 10  
- [ ] 07+08 验收勾选  
- [ ] 再跑 critique 分数记录进 `.impeccable/critique/`  

## 7. 版本

| 版本 | 说明 |
|------|------|
| v1.0 | 检查结果入库为可执行整改登记 |

# Spec 07 — 品牌与 Logo 对齐视觉系统

> **版本:** v1.0  
> **日期:** 2026-07-30  
> **状态:** Spec-locked（执行前权威）  
> **依据:** `logo.svg` · PRODUCT.md · Impeccable 检查 · 现状审计  
> **废止/覆盖:** 旧 Direction B「铜 datum `#B87333` 为主色」在**产品主色与品牌 chrome**上被本文件覆盖；02 中可保留的「禁紫 AI SaaS / 禁假指标」仍有效。

---

## 摘要

以仓库根目录 **`logo.svg`** 为视觉权威，将站点从「铜图集」改为 **Overlay Atlas（多视角叠加面板）**：冷纸场 + 蓝主 CTA + 青石结构 + 琥珀信号，网格/三形语义与 logo 同构。

---

## 1. Logo 权威读解

| 元素 | 色值 | 语义（源注释） | UI 映射 |
|------|------|----------------|---------|
| 画布 | `#F8F9FA` | 干净场 | `--ow-field` |
| 底框 mist | `#88ADC0` @35% | 网格基底 | `--ow-mist` |
| 圆 | `#1C4BD1` | 社会学 / 整体 | **primary** / 宏观 |
| 方 | `#2E6975` | 经济学 / 结构 | **structure** / 官方 / 洞见 |
| 三角 | `#E69622` | 心理学 / 个体 | **signal** / 锚点 / feature |
| 5×5 网格 | 黑白 alpha 线 | 测量面板 | Orientation / 装饰仅限面板内 |
| multiply | 叠色交叉 | 多学科交汇 | 仅 logo 与说明插画，不作按钮底 |

**气质：** 冷静、可测量、多视角——**不是**铜仪器、**不是**紫 AI SaaS。

---

## 2. Token 表（锁定）

```text
--ow-field:           #F8F9FA
--ow-surface:         #FFFFFF
--ow-surface-muted:   #F3F5F7
--ow-ink:             #0F1724
--ow-ink-muted:       #5A6570
--ow-line:            #D5DCE2
--ow-primary:         #1C4BD1    /* 主 CTA、链接、焦点环 */
--ow-primary-pressed: #153A9E
--ow-structure:       #2E6975    /* 官方、结构、次强调 */
--ow-signal:          #E69622    /* 锚点、关键一步、feature */
--ow-mist:            #88ADC0    /* 浅洗、chip、次级面 */
--ow-danger:          #B42318
--ow-community:       #5C6B75    /* 中性石板，非棕铜 */
```

**shadcn 映射:**

| shadcn | 映射 |
|--------|------|
| `--primary` | `--ow-primary` |
| `--background` | `--ow-field` |
| `--foreground` | `--ow-ink` |
| `--accent` | `--ow-structure` |
| `--ring` | `--ow-primary` |
| `--destructive` | `--ow-danger` |

**使用比例（UI，非 logo 面积）：** 蓝 **60%** · 青石 **25%** · 琥珀 **15%**。

### 学科 chip（logo 同源，非整卡彩虹）

| 学科 | 色 |
|------|-----|
| psychology | `#E69622` |
| sociology | `#1C4BD1` |
| economics | `#2E6975` |
| history | `#5C7A8A`（mist 加深） |
| political-science | `#3D4F8C`（低饱和，**禁亮紫**） |

---

## 3. 废止的铜体系

| 旧 token / 用法 | 处理 |
|-----------------|------|
| `--ow-datum: #B87333` | **删除或别名到 `--ow-signal` 仅过渡一期** |
| `text-datum` / `bg-datum` / `border-datum` | 全局改为 primary / signal / structure |
| `DatumMark` 铜十字作品牌 | **Header 使用 `logo.svg`**；文内可保留小 mark 但改色为 primary 或 signal |
| DotField 铜点 fallback | 改为 primary / structure |

---

## 4. 字体（不变原则，调纸色）

| 角色 | 字体 |
|------|------|
| 思辨标题 | Source Serif 4 + Noto Serif SC |
| UI | IBM Plex Sans + Noto Sans SC |
| 代码 | IBM Plex Mono |

禁止 Inter/Geist 作品牌主脸。字阶步长 ≥1.25。

---

## 5. 形态语法（来自 logo）

1. **三形语义：** 圆=宏观 · 方=结构 · 三角=个体/锚点；可用于场景微图标。  
2. **网格：** 仅面板内 5×5；**禁止**满屏 wallpaper grid。  
3. **悬浮面板：** 轻阴影 + 发丝线（logo soft-shadow 级）。  
4. **圆角：** 6–10px（对齐 logo rx）。  
5. **禁止：** 厚彩顶条 `border-t-2` 作默认卡装饰；卡中卡；紫渐变；玻璃拟态按钮。

---

## 6. 组件级整改清单

| 区域 | 要求 |
|------|------|
| Header | `logo.svg` + 词标；Install = solid primary 蓝 |
| Hero | 场 `#F8F9FA`；H1 强调用 primary 或 signal 之一；Install 主物件 |
| Orientation | 网格 + 三形语言，非铜十字 HUD |
| Scenario | 顶线 1px 或三角/圆/方微标；Spotlight 用 mist/primary 低 alpha |
| 学科 chip | §2 表 |
| Provenance | official=structure；community=mist/ink-muted |
| Placeholder | 非铜徽章；诚实文案 |

---

## 7. 验收

- [ ] 截图中主 CTA 为蓝 `#1C4BD1`，无铜主按钮  
- [ ] Header 可见 logo.svg  
- [ ] `globals.css` 无 `#B87333` 作 primary  
- [ ] 学科色符合 §2  
- [ ] 与 logo 并排：同属一套产品  

## 8. 不在范围

- 重绘 logo 矢量  
- 暗色完整商业交付（可定义 token 草案，非本阶段必做）  
- Skills 目录内容数据  

## 9. 版本

| 版本 | 说明 |
|------|------|
| v1.0 | 初版：logo 权威 + L1 Overlay Atlas 锁定 |

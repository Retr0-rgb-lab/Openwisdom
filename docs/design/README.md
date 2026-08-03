# Design demos

本地高保真 HTML（**非**生产路由）。双击打开即可。

## `home-centered-demo.html` — Orientation Plate（二次 redo）

### 打开

```text
E:\学习软件\Openwisdom\docs\design\home-centered-demo.html
```

### 本轮调查（3 subagents）

| Agent | 范围 |
|-------|------|
| Visual / motion | `DESIGN.md`、`docs/知识库/09-视觉与动效.md`、Bits 实现 |
| AI 味审计 | 现站 Home + **旧 demo**（含左侧色条） |
| 方向 | **Orientation Plate** 可落地线框 |

### Spec 动效硬约束（摘录）

| 规则 | 含义 |
|------|------|
| C1 | 内容默认静止 |
| C2 | 入场一次 |
| C3 | 工具反馈 150–250ms |
| C4 | 环境层安静；Demo 用**静态**场，不做 RAF 粒子 |
| C5 | LogoLoop ≥36s（Demo **不用** loop，改兼容清单） |
| C7 | 无 JS / 失败 → 内容 opacity 必须为 1 |
| Heavy ≤3 | Demo：H1 line settle + section reveal；无第三 heavy loop |

### 用户点名 + 审计：左侧色条

| 来源 | 问题 |
|------|------|
| 旧 demo | `border-left: 3px` primary/signal/structure = **AI feature-card 轨** |
| 现站 Scenario companions | `inset 3px` 同族 |
| Spec 07/09 | 禁厚色顶栏默认 chrome；要 1px / 形状微标 |

**Redo 替换：** masthead 底部分割线 + 右上 **folio**（`01 / 03`）+ 形状 glyph 承载语义色；**零**左右彩色 bar。

### 相对上一版 demo 的删除清单

- [x] 场景 / 侧卡 **左侧色条**
- [x] 引用卡 **顶部品牌色条**
- [x] Spine hover **左边线变色**
- [x] Harness **胶囊 pills**
- [x] Hero **DotField 无限动画**
- [x] Header **毛玻璃**
- [x] 每区 eyebrow 工厂（仅 Scenarios 保留 kicker）
- [x] 学科彩虹 pill / 多色 underline 汤
- [x] 逐字 Blur circus → **整行** settle

### 保留

- Hero **居中**、无右侧图  
- 非对称 dossier（feature + 2 index）  
- 一点即引用的 Model  
- 五列 spine  
- Overlay Atlas 色 + 真实 zh 文案  
- 可见 one-shot 入场（opacity 0.22→1 + y）+ C7  

### 成功标准（5 秒）

应像 **冷纸测量板 / 方法库索引**，不像 AI SaaS 功能卡墙。  
若仍看到「左边彩条 = 重要」，则 redo 失败。

### 下一步（未写回 `apps/web`）

1. 评审本 HTML  
2. 回写 `ScenarioCards` / `Model` / `DisciplineGrid` / `HarnessRow` / `Hero`  
3. 统一 Reveal/Stagger 为可见 one-shot，修 Spec 08 与代码漂移  

### 文件

| 文件 | 说明 |
|------|------|
| `home-centered-demo.html` | Orientation Plate 完整首页 demo |
| `README.md` | 调查与约束备忘 |

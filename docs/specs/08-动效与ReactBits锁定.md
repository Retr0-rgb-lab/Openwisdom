# Spec 08 — 动效与 React Bits 锁定

> **版本:** v1.0  
> **日期:** 2026-07-30  
> **状态:** Spec-locked  
> **依据:** reactbits.dev 调研 · 竞品库对比 · specs/04 · logo 气质 · Impeccable 检查  
> **关系:** 取代/细化 04 中「铜方向 + Silk/Threads 可选」的冲突条款；04 的 shadcn 映射仍有效。

---

## 摘要

Openwisdom 站点动效采用 **三层栈**：**shadcn + tw-animate-css**（chrome）· **motion**（产品交互）· **React Bits 仅 Tier MUST/MAY**（品牌点缀）。Hero ≤3 重特效；默认可读；`prefers-reduced-motion` 全关装饰。

---

## 1. 技术栈锁定

| 层 | 选型 | 禁止再引入 |
|----|------|------------|
| Chrome 进出场 | `tw-animate-css` + shadcn | 第二套 animate 插件 |
| 声明式 UI 动效 | **`motion`**（已装） | GSAP、anime.js、react-spring（v1） |
| 品牌点缀 | **React Bits 拷贝改编** → `components/bits/` | 整包 Magic UI / Aceternity 皮肤 |
| 区块 reveal | **CSS view-timeline 优先**；`Reveal` 作增强 | 每节叠 GSAP+motion+Bits Fade |
| 列表重排（目录页） | 可选 `@formkit/auto-animate` 后期 | 不用于 Home Hero |

**安装 React Bits：** 优先 **手动拷贝 TS-TW 改编**；可选 `npx shadcn add @react-bits/<Name>-TS-TW` 后再改色/减动。

---

## 2. MUST / MAY / NEVER

### MUST（v1 站点）

| 组件 | 表面 | 配置要点 |
|------|------|----------|
| **DotField**（改编） | Home Hero 场 | 低 alpha；点色 = primary/structure/mist；**无**光标凸起；RM=静态一帧 |
| **Noise**（静态 SVG） | Hero 或极轻全局 | 3–7% opacity；**禁止**上游每帧 canvas 噪点 |
| **BlurText** | Home H1 **一次** | `animateBy=words` 或 CJK 字；locale 切换不重播 |
| **Reveal 或 CSS fade-up** | 区块入场 | 二选一统一全站；默认内容可见 |
| **SpotlightCard**（弱） | 场景/技能卡 hover | radial 用 primary/mist ≤14% alpha；RM 关 |
| **LogoLoop** 或 **静态 harness 行** | 信任条 | 若 loop：≥36s、hover 暂停、RM/移动=静态 |

### MAY

| 组件 | 条件 |
|------|------|
| **ShapeGrid** | Hero 备选（与 DotField **二选一**）；speed≈0；大格 |
| **GlassSurface** / 自研 5×5 玻璃 | Install 外壳；multiply 仅装饰层 |
| **Magnet** | 仅主 CTA，桌面，弱磁力 |
| **ClickSpark** | 仅复制成功，色 primary/signal；RM 关 |
| **TextType** | 安装 demo，`loop=false` 一次 |
| **AnimatedList** | Install 步骤 / changelog |
| **Stepper** | 贡献/安装向导；重色去紫 |
| **CountUp** | **仅真实**统计 |
| **TrueFocus** | 一句 thesis，可选 |

### NEVER

Hyperspeed · Galaxy · Prism* · Aurora* · Beams · Lightning · Plasma* · LightRays · Orb · PixelBlast · Splash/Blob/PixelTrail Cursor · Glitch/Decrypted/Scrambled Text · GooeyNav/Dock/BubbleMenu · Electric/Star Border · Ballpit · Lanyard · DomeGallery · **GridScan** · 每页 >3 重特效 · 循环品牌打字机 · 假指标 CountUp

**Logo 语境下降级：** Silk / Threads / Particles **不进 v1**（织物/粒子 ≠ 网格面板）。

---

## 3. Hero 配方（锁定）

```text
[bg #F8F9FA]
  [DotField 或 ShapeGrid 其一 | HEAVY #1]
  [Noise 静态 3–7% | 纹理]
  [可选: 自研 5×5 玻璃 + 三形 multiply 小面板 | 品牌]
  [eyebrow 静态]
  [H1 BlurText 一次 | HEAVY #2]
  [副文 Fade ≤400ms]
  [InstallCommand 静态为主；复制 ClickSpark 可选]
  [Harness: LogoLoop 慢 或 静态行 | 若 loop 计 HEAVY #3]
```

**Reduced-motion:** 静态场 + 全文立刻可见 + 静态 harness + 无 Blur/Spark。

---

## 4. 动效宪法（解决 DESIGN vs 04 冲突）

| 规则 | 说明 |
|------|------|
| **C1 静内容默认** | 正文、主张、导航结构不循环扭动 |
| **C2 一次入场** | BlurText、方位 settle、区块 reveal：once |
| **C3 工具反馈** | 复制、Tab、Sheet：150–250ms |
| **C4 环境层克制** | DotField 可慢漂；默认应「看得见但安静」；可配置 `static` |
| **C5 LogoLoop** | 视为 **有条件例外**：慢、可关、移动静态；写入 DESIGN 例外表 |
| **C6 禁跑马灯喧宾** | 禁止高速 magic marquee / 多条并行 |
| **C7 失败安全** | JS 失败时内容 opacity 必须为 1 |

---

## 5. 与现状代码的关系

| 路径 | 动作 |
|------|------|
| `components/bits/*` | **保留改编模式**；重色到 logo token；校准可见度 |
| `Reveal.tsx` | 全站唯一区块 reveal **或** 改为 CSS view-timeline |
| 新依赖 | v1 **不**加 gsap/three；可选后期 auto-animate |

---

## 6. 验收

- [ ] MUST 清单均有实现或明确「用 CSS 等价」注释  
- [ ] NEVER 列表无出现  
- [ ] Hero 重特效 ≤3  
- [ ] `prefers-reduced-motion: reduce` 下无装饰循环  
- [ ] 主色与 07 logo token 一致  

## 7. 调研来源摘要

- reactbits.dev Tier 矩阵（2026-07 调研）  
- motion + tw-animate 保留；GSAP/Aceternity 默认不采用  
- 详见 `05` 与本轮 agent 调研输出  

## 8. 版本

| 版本 | 说明 |
|------|------|
| v1.0 | 锁定 MUST/MAY/NEVER + Hero + 动效宪法 |

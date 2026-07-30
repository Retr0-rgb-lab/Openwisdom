# Plan — Home Motion A+B 加强

> **日期:** 2026-07-30  
> **目标:** 套餐 A（轻量反馈/叙事）+ 套餐 B（仪器感环境/CLI 表现力）合并落地  
> **代价:** 用户明确 **不在乎 Heavy 预算**；仍须 RM、C7 可读、Overlay Atlas 禁令  
> **完成后:** Impeccable 去 AI 味 pass  

## 范围

| 包 | 内容 |
|----|------|
| **A** | 复制反馈加强 · 场景步骤 stagger · Model 引用线 draw · Install 光扫 · 学科标题 Reveal · 链接 hover |
| **B** | ShapeGrid **全局背景（替换 DotField）** · Hero 三形 settle · TextType CLI · Magnet · LogoLoop |

## 并行 Plan 文件

| Plan | Owner 文件 | 禁止碰 |
|------|------------|--------|
| [plan-A-bits.md](./plan-A-bits.md) | `bits/ShapeGrid`, `Magnet`, `TextType`, ClickSpark 增强 | home/* |
| [plan-B-install-hero.md](./plan-B-install-hero.md) | `InstallCommand`, `Hero` | ScenarioCards, Model |
| [plan-C-scenarios.md](./plan-C-scenarios.md) | `ScenarioCards` | Hero, Install |
| [plan-D-model-disc.md](./plan-D-model-disc.md) | `Model`, `DisciplineGrid`, `Section` if needed | Hero |
| [plan-E-backdrop-harness.md](./plan-E-backdrop-harness.md) | `SiteBackdrop`, `DotField`, `HarnessRow` | Install body |
| [plan-F-anti-ai.md](./plan-F-anti-ai.md) | 全局去 AI 味 + detector + 文档补丁 | 功能回归后 |

## 执行顺序

```text
并行: A · B · C · D · E
串行: F (impeccable 去 AI 味) 在 A–E 合并后
```

## 验收

- [x] A1–A6 可见且 RM 安全  
- [x] B 项：ShapeGrid 面板 settle、TextType once、Magnet desktop  
- [x] 无紫光 / 无左边色条 / 无假指标（detect 0 findings）  
- [x] `pnpm lint` 通过  
- [x] Home 动效清单更新到 `docs/specs/Home/01`  

**执行：** Plan A–E 并行 subagent · Plan B 主线程 · Plan F detector + 清单同步（2026-07-30）

## 产品真相

- CLI only install；不发明指标  
- 分析在用户 Agent；三场景 id 不变  

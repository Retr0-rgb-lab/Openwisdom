---
name: personal-anchor
description: >-
  Place a personal situation on historical and social coordinates: which curve
  you are on, which stratum you stand on. Use for long-horizon choices—career,
  city, direction—when orientation matters more than pep talk.
id: personal-anchor
layer: scenario
scope: official
disciplines:
  - history
  - sociology
language: zh
tags: [anchor, history, orientation]
version: 0.1.0
references:
  - social-stratification
metadata:
  openwisdom: true
---

# 个人锚点 / Personal Anchor

把个人处境放进历史与社会的坐标：你在哪条曲线上，脚下是哪一层。  
Place your situation on historical and social coordinates: which curve you are on, which stratum you stand on.

## When / 何时使用

- 做长期选择——职业、城市、方向——想知道自己身处何处时。  
  For long-horizon choices — career, city, direction — when you need to know where you stand.
- 感觉「努力」与「结构」缠在一起，需要把个人叙事从鸡汤里拆出来。  
  When effort and structure are tangled and personal story needs coordinates, not slogans.
- 比较两条路径时，想先标出路径依赖与可动空间。  
  When comparing paths and you need room-to-move and path dependence marked first.

**不要用于：** 替用户做人生裁决、做心理健康诊断、或给出伪装成必然的命运叙事。

## Steps / 步骤

1. **写下当下的选择与约束**  
   Name the choice and its constraints.  
   - 用一两句写清决策问题（留下 / 离开 / 转向 / 等待）。  
   - 列出硬约束：签证、债务、照护责任、健康、资格门槛、时间窗口。  
   - 列出软约束：身份期待、家庭脚本、声誉、风险偏好。  
   - 标出「必须在何时前有一个可执行答案」。

2. **定位历史层与社会坐标**  
   Locate yourself in history and society.  
   - 历史层：你处在哪一代人的机会结构里（产业周期、教育扩张/收缩、区域兴衰）。  
   - 社会坐标：教育、职业、城乡/区域、阶层与网络位置——用可观察描述，避免标签羞辱。可加载 reference：`social-stratification`。  
   - 问：同位置上的人通常面临哪些默认剧本？你与默认剧本的偏离点是什么？  
   - 区分「个人特质解释」与「结构位置解释」；两者都要写，不要只留其一。

3. **标出可动空间与路径依赖**  
   Mark room to move and path dependence.  
   - 路径依赖：过去选择锁住了什么（专业、城市网络、沉没成本、身份投资）。  
   - 可动杠杆：技能、地理、组织类型、时间分配、可调动的关系资源。  
   - 给出 2–3 个「下一小步」选项，各附成本、可逆性与观察期。  
   - 写清什么条件下应重新锚定（外部结构变了，而不是心情变了）。

## Output / 输出结构

建议交付：

```text
1. Decision frame — 选择问题、时间窗、成功标准（可观察）
2. Constraints — 硬约束 / 软约束
3. Coordinates — 历史层 + 社会位置（证据与不确定处）
4. Path dependence — 已锁定项与沉没承诺
5. Room to move — 杠杆、选项、可逆性
6. Next steps — 小步实验（可观察信号）+ 观察期 + 复盘日期
7. Open questions — 需要再收集的信息
```

语气冷静、可修订；坐标是工具，不是判决书。

### Next steps 可观察性 / Observable next steps

每个小步至少写清四项（缺一则宁可少写一步）：

| 字段 | 要求 |
|------|------|
| **Action** | 可在观察期内完成的具体动作（非口号） |
| **Observable signal** | 如何判断「有进展 / 无效」——可检验信号，非心情 |
| **Horizon** | 观察期与复盘日（日历或触发事件） |
| **Reversibility** | 可逆 / 半可逆 / 高沉没；失败成本上限 |

- 成功标准写在 Decision frame 时，须能对照上述 signal 验收。  
- **勿层级塌缩：** 若「我该 / 组织该 / 制度该」仍混在一起，或认领与拒绝边界不清 → 转 handoff：`responsibility-scope`、`responsibility-bridge`。本 skill 只标个人可动空间，不写 mandate 矩阵或道德负荷分区。

## Bias / metacognition checkpoints

- **英雄叙事**：是否把结构优势写成纯个人能力？  
- **受害者叙事**：是否把一切归因结构而抹掉能动空间？  
- **幸存者偏差**：是否只对标公开成功者的故事？  
- **时间近视**：是否用短期情绪覆盖长期坐标？  
- **阶层失语或阶层傲慢**：描述位置时是否羞辱或美化？  
- **虚假独特性**：是否忽略同位置上常见的约束与剧本？  
- **不可观察小步**：是否只写「多思考 / 保持开放」而无信号与复盘日？

高影响选择落地前，可用 `metacognition-audit` 检查推理与证据缺口。

## Notes

- 分析在用户自己的 coding agent 中运行，不在 Openwisdom 服务器上。  
  Analysis runs in the user's coding agent, not on Openwisdom servers.
- 本 skill 为 workflow；理论细节见 frontmatter `references`：`social-stratification`。  
- 不编造统计、身份标签或安装热度；涉及敏感身份时优先用户自述与可撤销措辞。  
- **多级责任仍模糊时：** 用 `responsibility-scope` 拆层级、`responsibility-bridge` 写认领/拒绝；会话收尾冻结见 `analysis-closure`。

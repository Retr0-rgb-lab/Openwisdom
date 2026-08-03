---
name: macro-scan
description: >-
  Break a situation, industry, or system into structure: actors, incentives,
  constraints, and trajectories. Use when a complex picture needs a macro/system
  read before judging or deciding.
id: macro-scan
layer: scenario
scope: official
disciplines:
  - political-science
  - economics
  - sociology
language: zh
tags: [macro, structure, systems]
version: 0.1.0
references:
  - path-dependence
  - collective-action
metadata:
  openwisdom: true
---

# 宏观扫描 / Macro Scan

把一个局势、行业或系统拆成结构：行动者、激励、约束与趋势。  
Break a situation, an industry, or a system into structure: actors, incentives, constraints, and trajectories.

## When / 何时使用

- 面对复杂局面，需要先看清全貌再做判断时。  
  When a complex situation demands seeing the whole board before judging.
- 行业、政策、组织或地缘议题信息碎片多，缺少可检验的结构图。  
  When fragments pile up and you lack a checkable map of the system.
- 在给出预测或立场之前，想先固定边界、角色与激励。  
  Before forecasting or taking a side, when you need bounds, roles, and incentives fixed.

**不要用于：** 替用户做最终决策、给出不可检验的「必胜」叙事、或假装已掌握全部机密信息。

## Steps / 步骤

1. **界定局势边界与时间尺度**  
   Bound the situation and time horizon.  
   - 写清分析对象、地理/组织范围、起止时间。  
   - 标明哪些外部因素先当作背景、哪些必须入模。  
   - 明确分析目标（解释现状 / 比较路径 / 识别脆弱点），避免多目标混写。

2. **识别行动者、激励与约束**  
   Map actors, incentives, and constraints.  
   - 列出主要行动者（国家/机构/群体/企业等）及其资源与权限。  
   - 对每个行动者：想要什么、怕失去什么、规则上不能做什么。  
   - 标出关键制度、路径依赖与集体行动问题（谁受益、谁搭便车、谁否决）。可加载 reference：`path-dependence`、`collective-action`。  
   - 区分「公开表态」与「可观察行为」；证据不足处显式标注缺口。

3. **输出可检验的结构与趋势图**  
   Ship a checkable structure and trajectory.  
   - 用简短结构图或列表呈现关系（不必精美，求可读与可改）。  
   - 给出 2–3 条可观察趋势或情景，各附触发条件与否证信号。  
   - 写清「若 X 发生，判断需修正」的检查点。

## Output / 输出结构

建议用户可保存的交付形态（可按场景裁剪）：

```text
1. Scope — 对象、边界、时间尺度、分析目标
2. Actors — 行动者表：角色 / 激励 / 约束 / 证据
3. Structure — 关系、制度节点、否决点、资源流
4. Agency / scope (optional) — 谁能行动 / 谁声称能行动 / 谁受约束（描述性）
5. Trajectories — 情景或趋势 + 触发条件 + 否证信号
6. Gaps — 证据缺口与下一步可收集信息
7. Checkpoints — 复盘时要回看的假设
```

语气保持克制：优先结构与条件，不抢着给单一结论。

### Agency / scope（可选）/ Agency & scope (optional)

结构图完成后，可加一列**描述性**能力边界——不写所有权合同、不做道德归责：

| 行动者 | Can act / 能行动 | Claims to act / 声称 | Constrained / 受约束 | 证据 |
|--------|------------------|----------------------|----------------------|------|
| … | 权限、资源、否决点 | 公开表态与叙事 | 制度、路径依赖、集体行动 | … |

- 只记录可观察的「能 / 声称 / 受制」，不把个人、组织、机构揉成同一责任主体。  
- 若下一步要做层级拆分或认领/拒绝/移交，转 handoff：`responsibility-scope`、`responsibility-bridge`。

## Bias / metacognition checkpoints

在定稿前自检：

- **叙事闭合**：是否为了故事圆顺而忽略反对证据？  
- **行动者拟人化**：是否把组织当成单一理性人，抹掉内部冲突？  
- **激励单维**：是否只用「利益」解释一切，忽略身份、制度与声誉？  
- **时间尺度偷换**：短期波动是否被写成长期趋势？  
- **可得性偏见**：是否过度依赖最近新闻与热搜？  
- **路径依赖盲区**：是否把「现在」当成可任意重写的空白画布？  
- **层级塌缩**：是否把制度失败写成个人道德、或把个人搭便车写成「系统必然」？

若结论高影响，建议再跑一次 `metacognition-audit` 做推理体检。

## Notes

- 分析在用户自己的 coding agent 中运行，不在 Openwisdom 服务器上。  
  Analysis runs in the user's coding agent, not on Openwisdom servers.
- 本 skill 为 workflow（场景技能）；理论细节见 frontmatter `references`：`path-dependence`、`collective-action`。  
- 不编造数据、客户或安装热度；证据不足时写「未知」比写满更有用。  
- **高影响交接：** 结构已清且涉及谁该/谁能行动时，考虑 handoff skills `responsibility-scope`、`responsibility-bridge`；需推理体检用 `metacognition-audit`；会话级停机与冻结包用 `analysis-closure`。本 skill **不**写所有权合同或 ship/pause/abandon 包。

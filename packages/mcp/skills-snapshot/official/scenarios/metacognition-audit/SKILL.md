---
name: metacognition-audit
description: >-
  Audit a line of thinking: expose biases, blind spots, and evidence gaps
  instead of polishing conclusions. Use after a conclusion forms and before it
  ships, when thought quality matters.
id: metacognition-audit
layer: scenario
scope: official
disciplines:
  - psychology
language: zh
tags: [metacognition, bias, audit]
version: 0.1.0
references:
  - confirmation-bias
  - prospect-theory
metadata:
  openwisdom: true
---

# 元认知体检 / Metacognition Audit

给一次思考做体检：暴露偏见、盲点与证据缺口，而不是给结论抛光。  
A checkup for your thinking: expose biases, blind spots, and evidence gaps instead of polishing conclusions.

## When / 何时使用

- 重要结论形成之后、落地之前，想检验思考质量时。  
  After a conclusion forms and before it ships, when thought quality matters.
- 辩论、投资、政策立场或产品判断已经「说得通」，但尚未压力测试。  
  When an argument already feels coherent but has not been pressure-tested.
- 刚跑完其他场景 skill（如 macro-scan、personal-anchor），想对输出做二次体检。  
  After another scenario skill, when you want a second pass on the write-up.

**不要用于：** 替用户做最终决策、人身攻击式「揭穿」、或把偏见清单当道德审判。

## Steps / 步骤

1. **复盘推理链条与证据**  
   Replay the reasoning chain and evidence.  
   - 还原：主张 → 关键前提 → 证据 → 推断步骤 → 结论。  
   - 标出每步是事实、解释、价值判断还是猜测。  
   - 记录证据来源类型（直接观察 / 二手报道 / 类比 / 权威断言 / 内省）。  
   - 找出最弱的一环（通常是隐含前提或单一来源）。

2. **点名偏见与盲点**  
   Name biases and blind spots.  
   - 确认偏误：是否只收集支持结论的材料？反证在哪里？可加载 reference：`confirmation-bias`。  
   - 可得性与近因：是否被最新、最刺眼的例子绑架？  
   - 锚定与沉没成本：早期数字或已投入是否绑架更新？风险框架与损失厌恶见 `prospect-theory`。  
   - 动机性推理：结论是否服务身份、团队或既有公开立场？  
   - 过度自信与叙事谬误：故事是否过圆、置信区间是否过窄？  
   - 只点名**与本次推理相关**的条目，避免无意义的偏见名册。

3. **补齐缺口后再定结论**  
   Close gaps before you commit.  
   - 列出必须补的证据或可做的廉价检验。  
   - 改写结论：保留可辩护部分，降级或删除无支撑部分。  
   - 给出「仍可行动但须标注不确定」与「暂缓行动」的分界。  
   - 设定复盘触发条件（新数据、反例、截止日）。

## Output / 输出结构

```text
1. Claim under audit — 被检主张（原文摘录）
2. Chain map — 前提 / 证据 / 推断 / 结论
3. Strengths — 仍站得住的部分
4. Biases & blind spots — 点名 + 在本文中的具体表现
5. Evidence gaps — 缺口、为何重要、如何廉价检验
6. Revised claim — 修订后主张 + 置信表述
7. Commit / wait — 可落地条件 vs 暂缓条件
```

目标是提高可辩护性，不是把结论磨成无法证伪的口号。

## Bias / metacognition checkpoints

- **元偏见**：是否用「我已经很谨慎」跳过具体检查？  
- **清单表演**：是否堆偏见名称却不改结论？  
- **对称性表演**：是否假平衡（两边各打五十大板）掩盖证据不对称？  
- **事后合理化**：是否在结论已定后才编理由？  
- **范围蠕变**：体检是否偷换成重新做一整盘战略？

若问题主要是系统结构而非推理质量，转用 `macro-scan`；若是人生坐标问题，转用 `personal-anchor`。

## Notes

- 分析在用户自己的 coding agent 中运行，不在 Openwisdom 服务器上。  
  Analysis runs in the user's coding agent, not on Openwisdom servers.
- 本 skill 为 workflow；理论细节见 frontmatter `references`：`confirmation-bias`、`prospect-theory`。  
- 不编造实验结果或安装热度；对用户情绪保持克制，不替代专业心理咨询。

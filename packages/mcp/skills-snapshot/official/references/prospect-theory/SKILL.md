---
name: prospect-theory
description: >-
  Reference card for prospect theory: reference points, loss aversion, and
  probability weighting that shape choices under risk. Load when auditing
  framing, asymmetric risk attitudes, or over-weighted small probabilities.
id: prospect-theory
layer: reference
scope: official
disciplines:
  - psychology
  - economics
language: zh
tags: [risk, loss-aversion, framing, behavioral, kahneman-tversky]
version: 0.1.0
metadata:
  openwisdom: true
---

# 前景理论 / Prospect Theory

## Definition

前景理论描述人们在风险与不确定下如何评估「得失」：结果相对**参照点**编码为收益或损失；损失侧往往比等量收益更痛（损失厌恶）；概率常被非线性加权（小概率被高估、中高概率被低估等模式）。  
Prospect theory describes evaluation under risk: outcomes are coded as gains or losses relative to a **reference point**; losses often hurt more than equal gains (loss aversion); probabilities are weighted nonlinearly (e.g. overweighting small probabilities).

它挑战「期望效用在一切描述框架下都稳定」的简化假设，尤其对框架效应与保险/彩票并存现象有解释力。  
It challenges the idea that expected-utility rankings are frame-invariant, and helps explain framing effects and coexisting insurance and lottery demand.

经典文献方向：Kahneman & Tversky (1979) Prospect Theory；Tversky & Kahneman (1992) Cumulative Prospect Theory。

## When to use

- 场景 `metacognition-audit` 检查锚定、沉没成本、过度自信与风险表述是否被框架绑架时。  
  In `metacognition-audit`, when checking framing, anchors, sunk costs, and risk language.
- 比较「怎么表述选项」是否改变偏好（确定性效应、反射效应）时。  
  When option wording may reverse preferences (certainty / reflection effects).
- 评估小概率灾难、保险、投机与止损规则是否被情绪化概率加权扭曲时。  
  When small-probability disasters, insurance, speculation, or stop-loss rules may be distorted by probability weighting.

**不要用于：** 声称「人人永远损失厌恶到同一系数」；或把一切非理性都塞进前景理论。

## Core claims

1. **参照点中心** — 同一客观结果，相对期望/现状/目标的编码不同，决策权重就不同。  
   The same objective outcome can reverse evaluation when the reference point shifts.
2. **损失厌恶** — 损失区间的价值函数通常比收益区间更陡；「不输」动机可压过「多赢」。  
   The value function is typically steeper for losses; avoiding loss can dominate seeking equal gain.
3. **框架敏感** — 收益框架 vs 损失框架可系统性改变选择（与经典期望效用的描述不变性张力）。  
   Gain vs loss frames can systematically change choice (tension with description invariance).
4. **概率加权** — 决策权重 ≠ 客观概率；尾部事件常被高估，影响保险、恐慌与赌博叙事。  
   Decision weights ≠ objective probabilities; tails are often overweighted.
5. **可检验提问** — 写清参照点、框架、概率来源与止损规则，比贴「非理性」标签更有用。  
   State reference point, frame, probability source, and stop rules—more useful than a pure irrationality label.

## Limits

- **参数不可随便编**：实验室估计的损失厌恶系数不能无数据直接套到用户个人决策。  
  Do not invent personal λ parameters without evidence.
- **领域差异**：金钱博弈、健康、道德与政治风险的态度不可无中介互换。  
  Risk attitudes do not transfer across domains without argument.
- **理性化滥用**：任何事后结果都能「用前景理论解释」——要绑定具体框架与概率陈述。  
  Avoid post-hoc fit; bind claims to explicit frames and probability statements.
- **与规范理论分工**：前景理论主要是描述性模型；是否「应如何决策」是另一层问题。  
  Descriptive model ≠ normative prescription.
- **证据边界**：无实验或市场数据时，只做机制假设与检查清单，不伪造效应量。  
  Without data, use mechanism checklists—do not fake effect sizes.

## Notes

- 分析在用户自己的 coding agent 中运行，不在 Openwisdom 服务器上。  
  Analysis runs in the user's coding agent, not on Openwisdom servers.
- 本文件是 **reference**（理论卡片），由场景 skill 引用；不单独冒充完整工作流。  
  This is a reference card cited by scenario skills—not a full workflow.
- 不编造实验结果、客户或安装热度；引用经典方向时不伪造页码或 DOI。  
  Do not invent experimental results, customers, or install heat; cite classic directions without fake page numbers or DOIs.

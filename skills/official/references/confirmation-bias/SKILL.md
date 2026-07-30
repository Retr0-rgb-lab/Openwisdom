---
name: confirmation-bias
description: >-
  Reference card for confirmation bias: seeking, interpreting, and remembering
  evidence in ways that favor an already preferred conclusion. Load when
  auditing search strategy, counter-evidence, and motivated updating.
id: confirmation-bias
layer: reference
scope: official
disciplines:
  - psychology
language: zh
tags: [bias, evidence, motivated-reasoning, audit]
version: 0.1.0
metadata:
  openwisdom: true
---

# 确认偏误 / Confirmation Bias

## Definition

确认偏误指人们倾向于**寻找、解读并记忆**支持既有信念或假设的信息，同时低估、忽视或重新解释反对证据。  
Confirmation bias is the tendency to seek, interpret, and remember information that supports an existing belief or hypothesis while discounting, ignoring, or re-explaining contrary evidence.

它常与动机性推理交织：当结论绑定身份、利益或公开承诺时，搜索与评价会进一步偏向自我保护。  
It often intertwines with motivated reasoning: when conclusions bind identity, stakes, or public commitments, search and evaluation skew further toward self-protection.

经典文献方向：Wason 规则发现与 2-4-6 任务；Nickerson (1998) 综述；Kahneman 体系中与信念更新、可得性相关的讨论。

## When to use

- 场景 `metacognition-audit` 检查「是否只收集支持结论的材料、反证在哪里」时。  
  In `metacognition-audit`, when checking one-sided evidence search and missing disconfirmers.
- 结论已经「说得通」，但尚未做廉价反证或替代假设比较时。  
  When a story coheres but has not faced cheap disconfirmation or alternative hypotheses.
- 信息源高度同质（同一圈层、同一时间线）却声称「证据充分」时。  
  When sources are homogeneous yet claimed as sufficient evidence.

**不要用于：** 人身攻击式「揭穿」；或把每一次意见不合都贴确认偏误标签。

## Core claims

1. **偏误发生在多阶段** — 搜索策略、证据权重、记忆提取与事后合理化都可能偏向旧结论。  
   Bias can hit search, weighting, memory, and post-hoc rationalization.
2. **肯定性检验很诱人** — 人们偏好能证实假设的问题与案例，而不是最大信息量的否定性检验。  
   Affirmative tests feel natural; falsifying tests often carry more information.
3. **反对证据常被「解释掉」** — 反例被当成噪声、特例或来源不可信，而不是更新先验。  
   Counterexamples get explained away as noise, exceptions, or bad sources.
4. **动机放大偏误** — 立场与声誉押注越高，更新越慢；审计要写清利害关系。  
   Stakes and reputation slow updating; name the interests.
5. **可操作纠正** — 预写否证条件、强制找 N 条反证、红队/魔鬼代言人、盲法比较来源质量。  
   Practical fixes: pre-commit disconfirmers, force N counter-evidence items, red-team, blind source quality.

## Limits

- **不是全面非理性标签**：专家在熟悉领域也可能高效使用肯定性搜索；要点是是否系统性拒绝更新。  
  Not a blanket irrationality label—focus on systematic refusal to update.
- **对称性表演**：假平衡（两边各打五十大板）不等于克服确认偏误。  
  False balance is not a cure.
- **贝叶斯误解**：合理坚持强先验 ≠ 确认偏误；要看证据处理是否不对称。  
  Strong priors can be rational; look for asymmetric evidence handling.
- **清单表演**：堆偏见名称却不改搜索与结论，是元失败。  
  Naming the bias without changing search or claims fails the audit.
- **伦理边界**：审计推理，不羞辱用户；不替代专业心理咨询。  
  Audit reasoning without shaming; not a clinical substitute.

## Notes

- 分析在用户自己的 coding agent 中运行，不在 Openwisdom 服务器上。  
  Analysis runs in the user's coding agent, not on Openwisdom servers.
- 本文件是 **reference**（理论卡片），由场景 skill 引用；不单独冒充完整工作流。  
  This is a reference card cited by scenario skills—not a full workflow.
- 不编造实验数据、客户或安装热度；引用经典方向时不伪造页码或 DOI。  
  Do not invent experimental results, customers, or install heat; cite classic directions without fake page numbers or DOIs.

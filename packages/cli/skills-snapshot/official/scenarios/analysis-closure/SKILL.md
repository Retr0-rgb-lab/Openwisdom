---
name: analysis-closure
description: >-
  End an analysis run with ship / pause / abandon; freeze open questions and
  revisit triggers. Use when more thinking feels productive but outputs stopped
  changing.
id: analysis-closure
layer: scenario
scope: official
disciplines:
  - psychology
language: zh
tags:
  - closure
  - stop
  - orientation-pipeline
  - decision
  - roi
version: 0.1.0
references:
  - confirmation-bias
  - prospect-theory
pipeline:
  id: orientation-handoff
  order: 3
metadata:
  openwisdom: true
---

# 分析闭合 / Analysis Closure

用 ship / pause / abandon 结束本轮分析：冻结未决问题与重开触发，避免「还能再想一点」的无限循环。  
End a run with ship / pause / abandon: freeze open questions and revisit triggers when more thinking feels useful but outputs stopped changing.

## When / 何时使用

- 边际洞察接近零：继续讨论主要在换措辞，结构或合同不再变。  
  When marginal insight ≈ 0—wording changes, substance does not.
- 多 skill 管线收尾（triad 与/或 handoff 之后），需要会话级停机包。  
  After a multi-skill run, when a session-level freeze pack is needed.
- 有截止期，或怀疑自己在用分析回避行动 / 回避止损。  
  When a deadline looms, or analysis is dodging action or loss-cutting.
- 已有 `metacognition-audit` 的 commit/wait，但缺 **整轮产物** 的冻结与非重开规则。  
  When claim-level commit/wait exists but the whole run is not frozen.

**不要用于：** 高影响主张尚未体检 → 先 `metacognition-audit`；无新触发的无限重开；把「闭合」写成「已发现真理」；借闭合生产新的偏见百科或新的 macro 理论。

## Steps / 步骤

1. **盘点本轮产物与变化曲线**  
   Inventory artifacts and the change curve.  
   - 列出本轮产生的地图、矩阵、合同、主张（各一行）。  
   - 标出最近两轮迭代：**实质变更** vs **措辞/情绪变更**。  
   - 若实质已停、措辞仍忙，默认倾向 **闭合** 而非再开一张分析桌。  
   - 确认：闭合对象是 **本轮分析运行**，不是人生永久封印。

2. **选择停机模式：Ship / Pause / Abandon**  
   Choose a stop mode.  
   - **Ship** — 产物可对外或可执行：写清交付物、已知限制、监控指标。  
   - **Pause** — 等特定信息或窗口：写清等待什么、最长等待、谁负责取回。  
   - **Abandon** — 停止该线：写清放弃理由类型（ROI / 权限 / 证据天花板 / 价值冲突），避免羞耻叙事。  
   - 允许混合：主线 Ship、支线 Pause；禁止「口头 ship、行为继续空转」。  
   - 注意损失厌恶与沉没成本（`prospect-theory`）：已投入时间不是必须再开一轮的理由。

3. **冻结包 + 非重开规则**  
   Freeze pack and non-reopen rules.  
   - **Freeze pack** 至少包含：  
     - 最终主张或合同摘要（原话级）  
     - 明确未决问题清单（最多数条，标为何未决）  
     - 证据天花板（再搜也难立刻改善的部分）  
     - 重开触发（可观察事件 / 数据 / 日期），**非**「感觉还能再想」  
   - **非重开规则**：何种讨论只算复读、应拒绝再开；确认偏误检查见 `confirmation-bias`。  
   - 写清：触发出现后，优先加载哪个 skill（而非无目标闲聊）。  
   - 闭合 ≠ 真理盖章；仅表示 **本轮 ROI 已尽**。

## Output / 输出结构

```text
1. Run inventory — 本轮 skill/产物列表
2. Change curve — 实质变更 vs 措辞变更（近两轮）
3. Stop mode — Ship | Pause | Abandon（可混合）+ 理由类型
4. Freeze pack
   - Final artifacts (verbatim-ish)
   - Open questions (capped)
   - Evidence ceiling
   - Revisit triggers (observable)
5. Non-reopen rules — 何种讨论不再启动
6. If reopen — 首选 skill 与入口问题
7. Immediate next — 行动 / 等待 / 归档（非新理论）
```

目标是可执行的停机，不是用闭合修辞给结论镀金。

## Bias / metacognition checkpoints

- **分析成瘾**：是否用「再严谨一点」回避 ship 或 abandon？  
- **沉没成本**：是否因已投入而拒绝 Pause/Abandon（见 `prospect-theory`）？  
- **确认偏误重开**：是否只在找到支持旧结论的材料时才愿意重开（见 `confirmation-bias`）？  
- **闭合=真理**：是否把停机写成认识论终点？  
- **范围蠕变**：是否借闭合步骤又开 macro/偏见百科？  
- **假暂停**：Pause 是否缺少触发与最长等待，实为无限拖延？

若主问题是主张质量，回 `metacognition-audit`；若是认领/拒绝，回 `responsibility-bridge`；若是层级混乱，回 `responsibility-scope`。

## Notes

- 分析在用户自己的 coding agent 中运行，不在 Openwisdom 服务器上。  
  Analysis runs in the user's coding agent, not on Openwisdom servers.
- 本 skill 为 workflow；理论细节见 frontmatter `references`：`confirmation-bias`、`prospect-theory`。  
- **拥有：** 会话/运行级 ship·pause·abandon、冻结包、非重开规则。  
- **禁止侵占：** 新的偏见百科；新的 macro 理论或完整情景树；替代所有权合同或层级矩阵。  
- Orientation handoff 管线终点：`responsibility-scope` → `responsibility-bridge` → `analysis-closure`（可仅跑本 skill 做停机）。  
- 与 `metacognition-audit` 的 commit/wait 互补：后者检**单主张**，本 skill 冻**整轮运行**。  
- 不编造数据或安装热度；不替代专业决策或咨询。

---
name: responsibility-scope
description: >-
  Sort duty and control across individual, organizational, and institutional
  levels—who can decide, who must act, who only witnesses. Use when blame or
  reform talk collapses levels.
id: responsibility-scope
layer: scenario
scope: official
disciplines:
  - political-science
  - sociology
  - economics
language: zh
tags:
  - responsibility
  - scope
  - mandate
  - institution
  - organization
  - orientation-pipeline
version: 0.1.0
references:
  - collective-action
  - path-dependence
pipeline:
  id: orientation-handoff
  order: 1
  next: responsibility-bridge
metadata:
  openwisdom: true
---

# 责任域 / Scope of Agency

把「谁该负责」拆成可检验的层级：个人、组织、制度各自能决定什么、必须行动什么、只能见证什么。  
Sort duty and control across levels: who can decide, who must act, who only witnesses.

## When / 何时使用

- 「我该 / 组织该 / 国家该」混写在同一句里，需要分层再说动作时。  
  When “I should / the org should / the state should” collapse into one line and need levels first.
- 把制度失败个人化，或把个人搭便车写成「体制问题」的唯一解释。  
  When institutional failure is personified, or free-riding is fully “systematized.”
- 改革、问责、协作讨论卡在互相甩锅，缺一张 **mandate / 控制** 矩阵。  
  When reform or blame talk lacks a mandate/control matrix.

**不要用于：** 结构图尚未建立 → 先 `macro-scan`；纯个人长期坐标 → 先 `personal-anchor`；法律归责、纪律处分或道德训诫；从零画完整系统情景树。

## Steps / 步骤

1. **固定分析对象与层级清单**  
   Fix the object and the level list.  
   - 写清争议或决策议题（一句话）；标明时间窗与组织边界。  
   - 默认层级：**个人 / 团队或组织 / 行业或网络 / 公共制度或国家**（可按场景合并或增删）。  
   - 说明本次要回答的问题：谁 *能* 动、谁 *须* 动、谁只是旁观者。  
   - 若尚无结构地图，停下来补 `macro-scan`；本 skill **不**重建完整行动者激励图。

2. **填层级义务与控制矩阵**  
   Fill the level–mandate matrix.  
   - 对每个相关层级，按列记录（证据不足写「未知」）：  
     - **decide** — 谁有权做决定  
     - **act** — 谁必须执行  
     - **resource** — 谁掌握预算、编制、通道  
     - **veto** — 谁能否决或拖延  
     - **free-ride** — 谁可受益而不付成本（见 `collective-action`）  
     - **lock-in** — 路径依赖锁住了什么（见 `path-dependence`）  
     - **evidence** — 上述判断的可观察依据  
   - 用**描述性**措辞（权限、激励、约束），避免「应当高尚 / 必须赎罪」式道德语言。  
   - 区分「公开表态的责任」与「制度上可强制的责任」。

3. **诊断错层（mis-level）并标主干预层级**  
   Diagnose mis-leveling; name the primary intervention level.  
   - 常见错层：用个人意志解释制度否决点；用「全民责任」掩盖组织搭便车；用组织口号覆盖个人可控动作。  
   - 写出 **主干预层级**（本回合优先动哪一层）及 **次要层级**（配合或观察）。  
   - 对每个层级标：可改杠杆 / 不可改约束 / 需移交或上告的边界。  
   - 输出 1–3 条「层级对齐」的可观察动作（仍是描述谁能做，不是替用户做价值裁决）。

## Output / 输出结构

```text
1. Issue frame — 议题、边界、时间窗、分析目标
2. Levels — 本次采用的层级定义
3. Mandate matrix — decide / act / resource / veto / free-ride / lock-in / evidence（按层）
4. Mis-level diagnosis — 错层模式 + 证据
5. Primary intervention level — 主层级 + 为何
6. Secondary levels — 配合 / 观察 / 勿侵占
7. Open unknowns — 缺证据处与廉价检验
8. Handoff — 若需个人认领/拒绝 → responsibility-bridge；若需停机 → analysis-closure
```

语气保持描述与可修订：矩阵是地图，不是判决书。

## Bias / metacognition checkpoints

- **层级塌缩**：是否把多层揉成「全是你的问题」或「全是体制的问题」？  
- **道德替代分析**：是否用应然训诫替换权限与激励描述？  
- **组织拟人**：是否把组织写成单一良心主体？  
- **制度万能 / 制度虚无**：是否忽略个人可控小杠杆，或夸大个人可改制度？  
- **否决点失明**：是否只写「谁该做」却不写「谁能拦」？  
- **侵占 triad**：是否偷偷重画 macro 情景树或人生曲线（应退回 `macro-scan` / `personal-anchor`）？

若主问题是「我个人认领什么、拒绝什么」，转 `responsibility-bridge`；若分析该停，转 `analysis-closure`。

## Notes

- 分析在用户自己的 coding agent 中运行，不在 Openwisdom 服务器上。  
  Analysis runs in the user's coding agent, not on Openwisdom servers.
- 本 skill 为 workflow（场景技能）；理论细节见 frontmatter `references`：`collective-action`、`path-dependence`。  
- **拥有：** 层级义务/控制矩阵、错层诊断、主干预层级。  
- **禁止侵占：** 人生曲线定位；完整系统轨迹/情景树；个人所有权合同（属 `responsibility-bridge`）。  
- Orientation handoff 管线顺序：`responsibility-scope` → `responsibility-bridge` → `analysis-closure`（可捷径，非强制串跑）。  
- 不编造数据、客户或安装热度；证据不足时写「未知」。

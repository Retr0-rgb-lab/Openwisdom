---
name: responsibility-bridge
description: >-
  Turn structured recognition into explicit ownership: what you will hold,
  refuse, share, or escalate. Use after macro-scan / personal-anchor / any clear
  map when insight must become accountable action without total guilt or total
  deflection.
id: responsibility-bridge
layer: scenario
scope: official
disciplines:
  - psychology
  - sociology
  - political-science
language: zh
tags:
  - responsibility
  - ownership
  - agency
  - handoff
  - orientation-pipeline
version: 0.1.0
references:
  - social-stratification
  - collective-action
pipeline:
  id: orientation-handoff
  order: 2
  next: analysis-closure
metadata:
  openwisdom: true
---

# 责任桥 / Responsibility Bridge

把「看清了」变成可检验的所有权：认领、拒绝、分担或上交——既不吞下全部内疚，也不把一切推给结构。  
Turn recognition into explicit ownership: what you will hold, refuse, share, or escalate—without total guilt or total deflection.

## When / 何时使用

- 已有识别产物（macro 图、锚点坐标、责任域矩阵或等价地图），卡在「看清了然后呢」。  
  When a recognition artifact exists and insight has not become accountable action.
- 在「全责自责」与「结构宿命 / 与我无关」之间摇摆。  
  When swinging between total self-blame and total structural deflection.
- 需要把负荷分区为 Own / Share / Delegate / Refuse / Unknown，并写下可观察承诺。  
  When load must be partitioned and commitments made observable.

**不要用于：** 尚无结构或坐标 → 先 triad（`macro-scan` / `personal-anchor` 等）；治疗性宣泄、法律归责或表演性道德宣誓；从零重画行动者激励图（属 `macro-scan`）；替代层级矩阵（属 `responsibility-scope`）。

## Steps / 步骤

1. **导入 recognition，标注命题类型**  
   Import recognition; label proposition types.  
   - 粘贴或摘要上游产物：结构、坐标、责任域矩阵或用户自述地图。  
   - 对关键句标注：**fact / interpretation / value / guess**；证据不足显式标缺口。  
   - 写清「谁的识别」与「为谁行动」（个人 / 角色 / 团队代表）。  
   - 若层级仍混写，先短跑或引用 `responsibility-scope`；本 skill **不**从零重建 macro 图。

2. **负荷分区（Load partition）**  
   Partition the load.  
   - 对每条相关义务或动作，归入一类（可并列，但须主类）：  
     - **Own** — 在权限与能力内由你持有  
     - **Share** — 与他人共担；写清对方与接口  
     - **Delegate / Escalate** — 移交或上告；写清接收方与时限  
     - **Refuse** — 明确不认领，并写清理由类型（无权限 / 无能力 / 价值冲突 / 机会成本）  
     - **Unknown** — 暂不定；写清需要什么信息才可分区  
   - 对照位置与集体行动：阶层与网络位置见 `social-stratification`；搭便车与分担见 `collective-action`。  
   - 禁止用单一道德口号覆盖整张分区表。

3. **所有权合同 + 失败模式**  
   Ownership contract and failure modes.  
   - 写出 **Ownership contract**（可观察）：  
     - 本回合认领的 1–3 项动作（含完成定义与观察期）  
     - 明确拒绝或移交的项  
     - 需要他人确认的 Share / Escalate 路径  
   - **Failure modes**：全责自责复发、结构甩锅、表演性认领无行动、无限「再研究」回避。  
   - 设定复盘信号：什么证据出现则改合同（而非改情绪叙事）。  
   - 若分析该停机，接 `analysis-closure`；若主张高影响未审，先 `metacognition-audit`。

## Output / 输出结构

```text
1. Recognition import — 来源 skill/产物摘要 + 命题类型标注
2. Load partition — Own / Share / Delegate|Escalate / Refuse / Unknown（条目表）
3. Ownership contract — 可观察承诺 + 完成定义 + 时限
4. Share / escalate paths — 接收方、接口、确认方式
5. Failure modes — 复发模式 + 早期信号
6. Next — 小步动作 | 回 scope | 元认知体检 | analysis-closure
7. Gaps — 仍 Unknown 的项与廉价检验
```

语气具体、可改约：合同是工作协议，不是人格判决。

## Bias / metacognition checkpoints

- **全责吞噬**：是否把不可控制度失败写成个人原罪？  
- **结构脱责**：是否用「系统如此」回避权限内可观察动作？  
- **表演性认领**：是否口号响、完成定义空？  
- **错层认领**：是否 Own 了只能在组织/制度层才能动的项（应回 `responsibility-scope`）？  
- **重建分析瘾**：是否借 bridge 重开一整盘 macro（应回 `macro-scan`）？  
- **身份绑架**：认领/拒绝是否只服务既有人设而非证据与权限？

## Notes

- 分析在用户自己的 coding agent 中运行，不在 Openwisdom 服务器上。  
  Analysis runs in the user's coding agent, not on Openwisdom servers.
- 本 skill 为 workflow；理论细节见 frontmatter `references`：`social-stratification`、`collective-action`。  
- **拥有：** 对给定 recognition 的认领/拒绝/分担/上交与可观察承诺。  
- **禁止侵占：** 从零重建行动者激励图；完整 mandate 矩阵（属 `responsibility-scope`）；会话级 ship/pause/abandon 冻结包（属 `analysis-closure`）。  
- Orientation handoff 管线：`responsibility-scope` → `responsibility-bridge` → `analysis-closure`（可捷径）。  
- 不编造数据或安装热度；不替代法律、医疗或专业咨询。

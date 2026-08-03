# fetch-skill 准入标准

用于 Scoop / Normalize / DeepDive agent 提示词与人工 Gate。与 Openwisdom 产品边界对齐。

## 必须满足（硬过滤）

1. **Skill 形态**  
   - 仓库或包中存在 `SKILL.md`，或可无损改写为 agentskills 最小 frontmatter（`name` + `description`）。  
   - 拒绝：纯截图 prompt、无源码小红书帖（可进 watchlist 作线索，不进 shortlist）。

2. **许可证**  
   - 可再分发：MIT、Apache-2.0、BSD、CC-BY（注明署名）等。  
   - 拒绝：专有、无许可且无法确认、禁止再分发。  
   - 许可不明 → `deferred` / watchlist，不得 `approved`。

3. **领域拟合（Openwisdom）**  
   - 心理学 / 社会学 / 历史学 / 政治学 / 经济学，或  
   - 可执行的研究/批判思维/决策/元认知/取向类工作流。  
   - 拒绝：纯 frontend、devops、营销文案、通用 coding 脚手架（除非明确社科方法工具）。

4. **层级可映射**  
   - `scenario`：有「何时用 + 分步流程 + 输出结构」  
   - `reference`：理论/方法卡片，可被 scenario 引用  

5. **去重**  
   - 与 `skills/official/**`、`skills/community/**` 及当前 catalog 的 id/slug/源 URL 不重复。  
   - 已在 `blocklist.json` 的指纹直接丢弃。

6. **非目标**  
   - 不是托管分析 chatbot、不是要求 Openwisdom 服务器跑模型的产品。

## 质量分（DeepDive，建议 0–5）

| 维度 | 含义 |
|------|------|
| `fit` | 与五学科 / 取向三场景 / Handoff 的互补度 |
| `quality` | 步骤完整性、可执行性、非空壳 |
| `license_clear` | 许可是否清晰可再分发 |
| `maintainability` | 结构清晰、可改编进 community 树 |

**建议 shortlist→ready 阈值（可调）：**  
`fit >= 3` 且 `quality >= 3` 且 `license_clear >= 3`。

## 默认处置

| 情况 | scope / 动作 |
|------|----------------|
| 自动发现且过线 | 仅建议 `community` |
| 升 `official` | **仅人工**另开内容流程，本 workflow 不写 official |
| 热度数字 | **禁止**写入 `SKILL.md` |
| 上站 | 必须经 `skills/` + `catalog:build`，禁止站点自造元数据 |

## 源优先级

1. GitHub（主源：许可 + 文件可核）  
2. X / Reddit（链回仓库）  
3. 小红书 / 其他（线索；无仓库则不 shortlist）  

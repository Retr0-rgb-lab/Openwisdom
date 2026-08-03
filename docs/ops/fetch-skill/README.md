# fetch-skill — 周期技能发现工作流

Openwisdom 社区技能包的**可跑骨架**：从公网发现候选 → 硬过滤 → 打分 → **人工门禁** →（可选）写 community 草稿路径说明。  
**不**自动改 `official/`，**不**在无人审的情况下 merge / 上站。

| 项 | 值 |
|----|-----|
| Workflow 名 | `fetch-skill` |
| 可执行脚本（仓库内） | [`fetch-skill.rhai`](./fetch-skill.rhai) — 复制到 `.grok/workflows/fetch-skill.rhai` 后可 `/workflow fetch-skill` |
| 本目录 | 准入标准、状态机、黑白名单、run 产物 |

## 快速运行（Grok Build）

在仓库根目录的 Grok 会话中：

```text
/workflow fetch-skill
```

或带参数（JSON）：

```text
/workflow fetch-skill {"root":"E:/学习软件/Openwisdom","since":"2026-07-01","max_per_source":6,"max_deep":8,"write_drafts":false}
```

| 参数 | 默认 | 说明 |
|------|------|------|
| `root` | 仓库绝对路径 | monorepo 根，用于读 catalog / 写 `docs/ops` |
| `since` | `2026-01-01` | 搜索时间下界（传字符串；workflow 无系统时钟） |
| `max_per_source` | `6` | 每源最多保留条数（编排截断） |
| `max_deep` | `8` | 深挖最多条数 |
| `write_drafts` | `false` | Gate 恢复后是否生成 draft 说明（仍不自动 merge） |

进度在 `/workflows` 面板查看。Gate 暂停后：

```text
/workflow resume fetch-skill
```

（若显示名为 `fetch-skill-2` 等，用面板上的 display name。）

## 阶段与状态

详见 [STATE-MACHINE.md](./STATE-MACHINE.md)。摘要：

```text
Scoop → Normalize → DeepDive → Report → Gate(await_user) → Draft(optional) → complete
```

| Run 状态（逻辑） | 对应 phase |
|------------------|------------|
| scooping | Scoop |
| normalizing / filtering | Normalize |
| deep_diving | DeepDive |
| reporting | Report |
| awaiting_review | Gate |
| drafting | Draft（仅 resume 且允许） |
| completed | complete |

## 产物位置

| 路径 | 内容 |
|------|------|
| workflow scratch `report.md` | 当轮报告（UI 可读） |
| `docs/ops/fetch-skill/runs/<run_label>/report.md` | 落盘报告（Report agent 写入） |
| `docs/ops/fetch-skill/runs/<run_label>/candidates.json` | 候选快照（若 agent 写出） |
| `docs/ops/fetch-skill/blocklist.json` | 永久/阶段性拒绝指纹 |
| `docs/ops/fetch-skill/watchlist.json` | 下轮再看 |

合入真实技能仍走产品管道：

```text
skills/community/** → pnpm catalog:build → registry → Web/CLI/MCP
```

骨架 **Draft 阶段只写 ops 下的草案说明**，不直接改 `skills/`，避免未审内容进 catalog。

## 准入

见 [CRITERIA.md](./CRITERIA.md)。与 `PRODUCT.md` / 知识库 `07`·`10` 一致：一层内容真相、community 默认、MIT 优先可再分发。

## 周期建议

- 双周或每月一次全源 Scoop  
- 小红书源 fail-open（常无源码，仅作线索）  
- 每次跑完更新 blocklist / watchlist，降低重复劳动  

## 相关文件

- [CRITERIA.md](./CRITERIA.md) — 入选 / 拒绝规则  
- [STATE-MACHINE.md](./STATE-MACHINE.md) — Run + Candidate 状态  
- [schema/candidate.md](./schema/candidate.md) — 字段约定  
- [templates/run-report.md](./templates/run-report.md) — 报告模板  

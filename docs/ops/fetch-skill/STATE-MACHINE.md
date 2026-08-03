# fetch-skill 状态机

## Run（批次）

| 状态 | phase | 说明 |
|------|-------|------|
| `scheduled` | — | 已触发未开始 |
| `scooping` | Scoop | 多源并行搜索 |
| `normalizing` | Normalize | 合并、去重、硬过滤 |
| `deep_diving` | DeepDive | 对 shortlist 打分 |
| `reporting` | Report | 写 ops 报告 |
| `awaiting_review` | Gate | `await_user` 暂停 |
| `drafting` | Draft | 可选：写 draft 说明到 runs/ |
| `completed` | — | 成功结束（可 0 合入） |
| `failed` | — | 不可恢复失败 |
| `cancelled` | — | 用户取消 |

```text
scooping → normalizing → deep_diving → reporting
  → awaiting_review → drafting? → completed
```

## Candidate（单条）

| 状态 | 含义 |
|------|------|
| `discovered` | 源上抓到 |
| `normalized` | 有 canonical 字段 |
| `filtered_out` | 硬过滤淘汰 |
| `shortlisted` | 过硬过滤 |
| `fetch_failed` | 源码不可达 |
| `scored` | 已打分 |
| `rejected` | 深挖不合格 |
| `ready_for_review` | 进人审 |
| `deferred` | 下轮再看（watchlist） |
| `approved` | 人接受（骨架后人工合入 skills） |
| `declined` | 人拒绝 → 宜写 blocklist |
| `landed` / `shipped` | 合入 skills + catalog / 站点可见（骨架外手动） |

主路径：

```text
discovered → normalized → shortlisted → scored
  → ready_for_review → (人工) approved → landed → shipped
```

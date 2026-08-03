# Product Scenario A + B E2E Result

- **Date:** 2026-07-30  
- **Script:** `node e2e/scenario-ab-product-e2e.mjs`  
- **MCP:** local `packages/mcp/dist/mcp.js` (0.1.1)  
- **Result:** **66/66 PASS**

## Scenario A — Web Official ↔ MCP 搜/读/装/可用

| 验证 | 结果 |
|------|------|
| 线上 `openwisdom.vercel.app/registry/catalog.json` 与 MCP list id 集合一致（8） | PASS |
| 每个 Official id：search 自命中 + get 正文 + layer 对齐 | PASS（8×4） |
| install `personal-anchor` / `confirmation-bias`（非仅 macro-scan）+ 磁盘 SKILL.md 可用 | PASS |

## Scenario B — 按场景搜 → get → 装 → 可用

| 验证 | 结果 |
|------|------|
| 8 组非 id 自然语言查询（结构/历史锚点/偏见/集体行动/…）命中正确 skill | PASS |
| `layer=scenario` / `discipline=psychology` 过滤 | PASS |
| 链式：搜 metacognition → get body → install → Agent 可读文件 | PASS |
| psychology+bias 多命中并逐个 get | PASS |

## 负向（catalog 外）

| 验证 | 结果 |
|------|------|
| 假 id / curated 占位 get 失败 | PASS |
| 同上 install 不成功 | PASS |

## 复跑

```powershell
cd E:\学习软件\Openwisdom
pnpm --filter openwisdom-mcp build
cd e2e
node scenario-ab-product-e2e.mjs
```

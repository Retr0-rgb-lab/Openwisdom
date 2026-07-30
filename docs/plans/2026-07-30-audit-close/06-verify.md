# Plan 06 — 主会话 VERIFY（串行收口）

在 01–05 全部 report 后由 **主会话** 执行，不派并行 agent。

## Checklist

```bash
cd "E:\学习软件\Openwisdom"
pnpm catalog:build
pnpm test
pnpm --filter web lint
pnpm --filter web build
pnpm cli -- list
# 可选：temp install smoke
```

| # | 检查 | 期望 |
|---|------|------|
| 1 | catalog skillCount | ≥ 8 |
| 2 | pnpm test | all pass |
| 3 | web lint | 0 errors |
| 4 | web build | pass |
| 5 | /install /docs /contribute | 非 redirect-only / 非空壳 |
| 6 | Skills 诚实横幅 | 有 |
| 7 | community filter | 不把 75 curated 算 community |
| 8 | CLI/MCP snapshot install | 无 monorepo skills 时仍可装或 document residual |

更新 `00-README.md` 状态表；必要时补一句到 Spec 26「闭合进度」。

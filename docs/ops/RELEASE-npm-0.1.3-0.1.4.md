# npm release checklist — openwisdom@0.1.3 · openwisdom-mcp@0.1.4

> 版本号与构建已在 monorepo 内完成；**`npm publish` 由维护者本地执行**。

## 版本

| 包 | 版本 | 说明 |
|----|------|------|
| `openwisdom` | **0.1.3** | CLI：远程 registry、refresh-only、catalog/skills 快照 |
| `openwisdom-mcp` | **0.1.4** | MCP：远程 catalog 刷新、install 走 core 远程载荷 |

对齐文件：

- `packages/cli/package.json` + `packages/cli/src/version.ts` → `0.1.3`
- `packages/mcp/package.json` + `packages/mcp/src/version.ts` → `0.1.4`

## 发布前（已做 / 请确认）

- [x] 版本号 bump  
- [x] `pnpm catalog:build`  
- [x] schema / providers / core / cli / mcp build  
- [ ] 你本机：`npm whoami` 有发布权限  
- [ ] 你本机：publish  

## 你要跑的命令

```powershell
cd "E:\学习软件\Openwisdom"

# 若刚 pull，再构建一次更稳妥
pnpm catalog:build
pnpm --filter @openwisdom/core build
pnpm --filter openwisdom build
pnpm --filter openwisdom-mcp build

npm whoami

cd packages\cli
npm publish --access public

cd ..\mcp
npm publish --access public
```

## 发布后验证

```powershell
npm view openwisdom version
npm view openwisdom-mcp version

npx openwisdom@0.1.3 --version
npx openwisdom@0.1.3 update --refresh-only
npx openwisdom@0.1.3 search knock
```

## 本版用户向变更摘要

- **远程 registry**（SPE 33）：默认 `https://openwisdom.vercel.app/registry`
- 联网时 search/list/install 可拉最新 catalog / skill 树，**不必每次内容更新都发 npm**（仍建议本版发出以带上客户端逻辑）
- 失败 fail-open → 包内 snapshot
- `OPENWISDOM_NO_REMOTE=1` / `--no-remote` 关远程
- `openwisdom update --refresh-only` 强制刷新缓存
- MCP `openwisdom_search({ refresh: true })` 强制刷新

## 不发的包

- `@openwisdom/core` / `schema` / `providers`：workspace private，打进 CLI/MCP `dist`

# Plan 03 — CLI/MCP 载荷 + MCP snapshot

**Lane:** Core/CLI/MCP · **Specs:** 17–20 · 22–24 · 审计 P0#2 · P1 MCP snapshot  
**独占：** `packages/core/**` · `packages/cli/**` · `packages/mcp/**` · `packages/catalog/src/build.ts`（仅增加 write 目标）  
**禁止改：** apps/web/** · skills/**

## Goal

1. 无 monorepo `skills/` 时仍能安装 **catalog 内 skill**（优先：打包进包的 **skills payload snapshot** 或 **GitHub raw/archive**）。  
2. MCP bundled 入口能解析到 **catalog-snapshot**（offline search）。  
3. 小修：CLI `-V` / unknown command exit code（能改则改，不破坏 citty 过多）。

## 推荐实现（务实、可测）

### A. Payload：内嵌 skills 快照（优先于复杂 GitHub）

审计阻塞是「仓外无 skills」。最快闭合：

1. Catalog build **额外** 将 monorepo `skills/` 同步/复制到：  
   - `packages/core/skills-snapshot/`（或 `payload/skills`）  
   - 可选 `packages/cli/skills-snapshot/` 若 cli 不依赖 core 文件  
2. `resolveSkillsRoot` 优先级：  
   1. `OPENWISDOM_SKILLS_ROOT`  
   2. monorepo `skills/`  
   3. **package skills-snapshot**（相对 `getPackageRoot()` / `import.meta.url`）  
   4. （可选）GitHub：若设 `OPENWISDOM_GITHUB_REPO` + 网络，fetch sparse；**可二期**  
3. 错误信息更新：删除「GitHub fetch is not enabled in this CLI wave」作为唯一出路；改为列出 1–3。

**若 skills 树太大：** 至少 snapshot **official/** 全树。

### B. MCP catalog-snapshot

1. `packages/catalog/src/build.ts` dual-write 增加：  
   `packages/mcp/catalog-snapshot/{catalog,manifest}.json`  
2. 修 `getPackageRoot` / catalog 加载：bundled `openwisdom-mcp` 包名要能找到 snapshot  
   - 方案：MCP 在启动时 `process.env` 或显式 `path.join(fileURLToPath(import.meta.url), '..', 'catalog-snapshot')` 传入 core  
   - 或 core `loadCatalog` 接受 `packageRoots: string[]`  
3. `packages/mcp/package.json` `files` 含 `catalog-snapshot`；若 tsup bundle 丢路径，改为 **不 bundle 掉 JSON**（runtime 读旁边文件）或把 JSON copy 到 `dist/catalog-snapshot`。

### C. CLI 小修

- [ ] `-V` 与 `--version` 同行为（exit 0 打版本）  
- [ ] unknown command：尽量 exit **2**（若 citty 限制难改，report 标明 residual）  
- [ ] 安装成功路径：仓外仅靠 skills-snapshot 的 temp 测试

## Tests

- [ ] core：`resolveSkillsRoot` 在无 monorepo、有 snapshot 目录时返回 snapshot  
- [ ] core install dry-run 用 snapshot  
- [ ] mcp：search 在无 monorepo skills 时仍 `source: "snapshot"`（或等价）  
- [ ] 现有 install/conflict 测试不回归  

## Commands

```bash
pnpm --filter @openwisdom/catalog build
pnpm --filter @openwisdom/core test
pnpm --filter openwisdom test
pnpm --filter openwisdom-mcp test
pnpm --filter @openwisdom/core build && pnpm --filter openwisdom build && pnpm --filter openwisdom-mcp build
```

## 验收

- [ ] 模拟：设置 cwd 到 temp、不设 OPENWISDOM_SKILLS_ROOT、无 monorepo skills → install macro-scan **成功**（从 snapshot）  
- [ ] MCP 包内存在 catalog-snapshot 且 search 可用  
- [ ] 写 `reports/03-report.md`  

## 非目标

- 完整 npm publish  
- 用户级 `%LOCALAPPDATA%` 远程 cache 刷新协议全套  

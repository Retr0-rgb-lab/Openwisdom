# SPE 33 — Remote Registry（CLI / MCP 远程目录）

> 状态：**已实现（P0+P1）** — 2026-08-03  
> 目标：内容更新与 npm 工具发版解耦；远程失败 fail-open 回落包内 snapshot。

---

## 1. 目标

| 项 | 说明 |
|----|------|
| 效果 | 新增/更新 `skills/**` 后：`catalog:build` + 部署 Web 即可被 npm 用户 search/install，**不必**为内容 alone 发 CLI/MCP |
| 非目标 | 私有鉴权 registry、托管分析、改 heat 真相源 |
| 铁律 | 可安装集合 = git skills 生成物；网站不得发明 catalog 外 skill |

## 2. URL 布局

默认 base（可被 `OPENWISDOM_REGISTRY` / `--registry` 覆盖）：

```text
https://openwisdom.vercel.app/registry
```

| 路径 | 内容 |
|------|------|
| `{base}/manifest.json` | contentHash、skillCount、cliMinVersion、gitSha |
| `{base}/catalog.json` | 与现 catalog 同构 |
| `{base}/payload-index.json` | skill id → repoPath + 文件相对路径列表 |
| `{base}/skills/**` | monorepo `skills/**` 静态镜像（路径 = repoPath 去掉前缀后挂在 base 下） |

`repoPath` 形如 `skills/community/scenarios/knock`。  
文件 URL：`{base}/{repoPath}/SKILL.md` → `…/registry/skills/community/scenarios/knock/SKILL.md`。

## 3. 环境变量 / 标志

| 名 | 作用 |
|----|------|
| `OPENWISDOM_REGISTRY` | Registry base URL（无尾斜杠） |
| `OPENWISDOM_NO_REMOTE=1` | 禁用远程 |
| CLI `--registry <url>` | 覆盖 base |
| CLI `update --refresh-only` | 强制拉 manifest+catalog+payload-index 写缓存 |
| MCP `refresh: true` | 同强制刷新（search/list/update） |

## 4. Catalog 解析顺序（core）

1. `catalogPath` 显式路径  
2. 若存在 monorepo `skills/` 且未 `forceRemote` → 包内/本地 snapshot 或 scan（开发态本地真相）  
3. 若远程启用 → GET manifest；`contentHash` 与缓存相同则用缓存 catalog；否则拉 catalog + payload-index  
4. 包内 `catalog-snapshot/catalog.json`  
5. scan skills root  

远程任一步失败 → 记 warn，进入下一步（fail-open）。

## 5. Install 载荷顺序

1. `OPENWISDOM_SKILLS_ROOT` / monorepo `skills/` 上 `locateSkillDir`  
2. 远程：用 catalog 条目 `repoPath` + payload-index 文件列表，下载到 `~/.openwisdom/cache/registry/skills/<id>/`  
3. 包内 `skills-snapshot/`  

## 6. 缓存

```text
~/.openwisdom/cache/registry/
  manifest.json
  catalog.json
  payload-index.json
  skills/<id>/**    # 按需
```

非常驻进程；磁盘缓存可删。

## 7. Build 管线

`pnpm catalog:build` 额外：

1. 将 `skills/` 同步到 `apps/web/public/registry/skills/`  
2. 写 `payload-index.json`  
3. 现有 catalog/manifest dual-write 不变  

## 8. 验收

- [x] `OPENWISDOM_NO_REMOTE=1` / `noRemote` 走本地 skills/snapshot  
- [x] mock HTTP 下 ensureRemoteCatalog 写缓存；hash 命中走 cache  
- [x] resolveInstallSourceDir 可从远程拉 remote-only skill（mock）  
- [x] 远程失败 fail-open（不抛）  
- [x] monorepo 内 prefer 本地 catalog/skills  
- [x] core / cli / mcp unit tests green  
- [x] `catalog:build` 写出 `payload-index.json` + `registry/skills/**`  

## 10. 实现入口

| 区域 | 路径 |
|------|------|
| core registry | `packages/core/src/registry.ts` |
| loadCatalog | `packages/core/src/catalog.ts` |
| install | `packages/core/src/install.ts` (`runInstall` async) |
| catalog stage | `packages/catalog/src/build.ts` |
| CLI | `search` / `list` / `install` / `update --refresh-only` |
| MCP | `openwisdom_search` refresh、list/install/update |

部署后用户：`openwisdom update --refresh-only` 或直接 search/install（会 best-effort 拉 registry）。  
**仅改 skills 时：push + 部署 Web（含 registry）即可；不必发 npm。**  
npm 仍建议偶发发版以更新离线 snapshot 兜底。

## 9. 非目标（本 SPE）

- per-skill tgz  
- GitHub raw fallback  
- 改变 heat API  
- 自动 npm publish  

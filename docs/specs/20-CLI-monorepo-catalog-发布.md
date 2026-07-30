# Spec 20 — CLI Monorepo、Catalog 管道与 npm 发布

> **状态：** Ready  
> **日期：** 2026-07-30  
> **上级：** [17-CLI总控-SPE](./17-CLI总控-SPE.md)  
> **对齐：** [01-架构方案](./01-架构方案.md) §3–5 · [15-Skills数据契约](./15-Skills数据契约-bootstrap.md)

---

## 1. 目标

1. 把 monorepo 从「仅 `apps/web`」扩展为 **可构建 CLI + 共享 catalog**  
2. 定义 **机器可读索引**（`catalog.json` + `manifest.json`）  
3. 定义 **npm 发布** 与 **CI** 最小要求  
4. 标明与 Web bootstrap `CatalogEntry` 的 **映射与迁移**

---

## 2. 目标目录

```text
Openwisdom/
├── apps/
│   └── web/                      # 现有 Next 站
├── packages/
│   ├── schema/                   # private — zod
│   ├── catalog/                  # private — build CLI
│   ├── providers/                # private — path table
│   └── cli/                      # publish: "openwisdom"
├── skills/                       # 内容真相源
│   ├── official/
│   │   ├── scenarios/
│   │   │   ├── macro-scan/
│   │   │   ├── personal-anchor/
│   │   │   └── metacognition-audit/
│   │   └── references/
│   │       └── …/
│   └── community/
│       ├── scenarios/
│       └── references/
├── pnpm-workspace.yaml           # apps/* + packages/*
├── package.json
├── turbo.json                    # 可选
└── .github/workflows/
```

### 2.1 Workspace

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 2.2 包职责

| 包 | name 建议 | private | 职责 |
|----|-----------|----------|------|
| schema | `@openwisdom/schema` | yes | frontmatter + index zod；共享类型 |
| catalog | `@openwisdom/catalog` | yes | 扫描 `skills/**` → 写出 JSON |
| providers | `@openwisdom/providers` | yes | Spec 19 路径表 |
| cli | **`openwisdom`** | **no** | bin、命令、snapshot、遥测客户端 |

**v1 发布策略：** 仅 `openwisdom` 上 npm；workspace 依赖 **bundle 进** `dist/cli.js`（tsup），避免用户装一串 `@openwisdom/*`。

---

## 3. Skill 源格式（磁盘）

```text
skills/official/scenarios/macro-scan/
├── SKILL.md
└── assets/          # 可选
```

### 3.1 SKILL.md frontmatter（Openwisdom 扩展）

**兼容 agentskills.io 最小集：**

| 字段 | 必需 | 说明 |
|------|------|------|
| `name` | 是 | = 目录名；kebab-case |
| `description` | 是 | 1–1024 字符；Agent 路由用 |

**Openwisdom 推荐字段（schema 校验）：**

| 字段 | 说明 |
|------|------|
| `id` | 稳定 id；默认同 `name` |
| `layer` | `scenario` \| `reference` |
| `scope` | `official` \| `community`（也可由路径推断） |
| `disciplines` | string[] |
| `language` | 正文语言 `zh` \| `en` \| … |
| `tags` | string[] |
| `version` | semver |
| `references` | scenario 引用的 reference `id[]` |
| `license` | 可选 |
| `metadata.openwisdom` | `true`（安装识别辅助） |

路径可推断 `scope` / `layer`：

- `skills/official/scenarios/*` → official + scenario  
- `skills/official/references/<discipline>/*` → official + reference  
- `skills/community/...` → community  

**铁律：** 站点与 CLI **不得**长期维护第二套与磁盘不一致的「发明字段」；Web bootstrap 仅过渡。

---

## 4. Catalog 构建产物

### 4.1 命令

```text
pnpm catalog:build
# → packages/catalog 扫描 skills/
# → 写出：
#    packages/catalog/dist/catalog.json
#    packages/catalog/dist/manifest.json
#    apps/web/public/registry/catalog.json   (copy)
#    apps/web/public/registry/manifest.json  (copy)
#    packages/cli/catalog-snapshot/*.json    (copy)
```

无 `skills/` 或空树时：build **失败**（非静默空索引），避免发布空 CLI。  
过渡期可用 `skills/` 最小 3 scenario。

### 4.2 `manifest.json`

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-07-30T00:00:00.000Z",
  "gitSha": "abc1234",
  "contentHash": "sha256-…",
  "skillCount": 3,
  "cliMinVersion": "0.1.0"
}
```

### 4.3 `catalog.json`（机器索引）

数组或 `{ "skills": [ … ] }`（实现锁定一种；推荐对象根便于扩展）：

```json
{
  "schemaVersion": 1,
  "skills": [
    {
      "id": "macro-scan",
      "name": "macro-scan",
      "description": "…",
      "layer": "scenario",
      "scope": "official",
      "disciplines": ["political-science", "economics", "sociology"],
      "language": "zh",
      "tags": ["macro", "structure"],
      "version": "0.1.0",
      "updated": "2026-07-30",
      "repoPath": "skills/official/scenarios/macro-scan",
      "references": ["path-dependence", "collective-action"],
      "install": {
        "cli": "npx openwisdom install macro-scan"
      }
    }
  ]
}
```

**不包含：** `installs30d` / 热度（Spec 06 旁路合并）。  
**不包含：** 完整 SKILL 正文（避免索引膨胀；详情读文件或 GitHub）。

### 4.4 与 Web `CatalogEntry` 映射

| CatalogIndex（机器） | Web CatalogEntry | 注 |
|----------------------|------------------|-----|
| `id` | `id` / `slug` | 保持相等 |
| `name` | — | Agent 名；展示可用 title |
| `description` | 可作 en/zh 单语回退 | Web 现用 `LocalizedString` title/summary |
| `layer` / `scope` / `disciplines` / … | 同名 | |
| `repoPath` | `repoPath` | |
| `install.cli` | `install.cli` | 字符串契约 |
| — | `title` / `summary` zh+en | 可由 SKILL 正文或并列 `*.i18n.json` 生成；**v1 可** frontmatter 单语 + Web 层补双语 seed |
| `source` | `catalog` | bootstrap 退役后 |

**迁移策略：**

1. CLI 首发：skills 真树 + catalog.json  
2. Web：`getCatalog()` 优先读 `public/registry/catalog.json` 或 build import；缺字段时与 bootstrap **合并**（真树优先）  
3. 下线 bootstrap 中与真树重复的 slug  

---

## 5. CLI 包细节（`packages/cli`）

### 5.1 package.json（要点）

```json
{
  "name": "openwisdom",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "openwisdom": "./dist/cli.js"
  },
  "files": [
    "dist",
    "catalog-snapshot",
    "LICENSE",
    "README.md"
  ],
  "engines": {
    "node": ">=20"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

- 入口 shebang：`#!/usr/bin/env node`  
- `prepublishOnly`: build + 确认 snapshot 存在  
- **不要**把整个 monorepo 打进 tarball  

### 5.2 运行时索引解析顺序

```text
1. OPENWISDOM_REGISTRY 强制远程（失败 → error 或回退，见 flag）
2. 用户缓存（上次 update 下载的 catalog，contentHash 更新才替换）
3. 包内 catalog-snapshot/
```

### 5.3 安装载荷获取

| 模式 | 来源 |
|------|------|
| 开发 | `OPENWISDOM_SKILLS_ROOT` 或 monorepo 检测 |
| 用户默认 | GitHub：`Retr0-rgb-lab/Openwisdom` + `repoPath` @ `manifest.gitSha` 或默认分支 |
| 实现建议 | `codeload.github.com/.../tar.gz` / sparse 均可；须校验路径 + 体积上限 |

**不要**把全部 skill 正文默认打进 npm（体积与双源风险）。

### 5.4 用户缓存目录（建议）

| 平台 | 路径 |
|------|------|
| Linux | `~/.cache/openwisdom/` 或 XDG |
| macOS | `~/Library/Caches/openwisdom/` |
| Windows | `%LOCALAPPDATA%\openwisdom\Cache\` |

可用 `env-paths` / `xdg-basedir` 类库；实现锁定一处并单测。

内容：`catalog.json` · `manifest.json` · 可选 downloaded skill tarball cache。

---

## 6. 根 scripts（建议）

```json
{
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm catalog:build && pnpm -r --filter \"./packages/*\" build && pnpm --filter web build",
    "catalog:build": "pnpm --filter @openwisdom/catalog build",
    "cli": "pnpm --filter openwisdom exec node ./dist/cli.js",
    "lint": "pnpm --filter web lint",
    "test": "pnpm -r --filter \"./packages/*\" test"
  }
}
```

（具体 filter 名以实现 `package.json` name 为准。）

---

## 7. CI

### 7.1 PR / main

```text
pnpm install
pnpm catalog:build          # skills 校验 + 索引
pnpm -r test
pnpm --filter openwisdom build
pnpm --filter web build     # 可选同 PR；至少 CLI 绿
```

校验项：

- 唯一 `id` / `name`  
- `references[]` 悬挂引用 → **error**（官方）/ community 可 warn  
- frontmatter zod  

### 7.2 Tag `v*`

```text
同上 + npm publish（packages/cli）
可选：GitHub Release 附 official skills zip
```

权限：`NPM_TOKEN`；provenance 可选。

### 7.3 包名冲突

发布前脚本：`npm view openwisdom version`  

- 404 → 使用 `openwisdom`  
- 已被占用且非本组织 → 改 `@openwisdom/cli`，**同步** Web `install.cli` 常量与文档  

---

## 8. 遥测客户端（CLI 侧）

| 项 | 值 |
|----|-----|
| URL | 生产 `https://<site>/api/telemetry`（常量 + env 覆盖） |
| 超时 | 800–1500ms |
| 失败 | 吞掉；install 仍 0 |
| Payload | Spec 06 `cli_install_success` |
| 关闭 | `--no-telemetry` · env · `CI=true` |

**服务端**可后于 CLI 客户端；客户端应对 404/网络 fail-open。

---

## 9. 与 Spec 01 的关系

| 01 条款 | 本 Spec |
|---------|---------|
| 方案 A monorepo | **执行确认** |
| §7 CLI 栈 | citty + clack + tsup 细化 |
| §5 管道 | 产物路径与 snapshot 策略细化 |
| 开放 npm 名 | 流程见 §7.3 |

若 01 与 17–20 冲突：**以 17–20 为执行权威**，并在实现后回写 01「拍板项」。

---

## 10. Wave 落地清单（工程）

| Step | 动作 |
|------|------|
| 1 | 改 `pnpm-workspace.yaml`；建 `packages/schema` |
| 2 | 建最小 `skills/official/scenarios/{3}` + SKILL.md |
| 3 | `packages/catalog` build 命令 |
| 4 | `packages/providers` + 单测 |
| 5 | `packages/cli` citty 命令骨架 + snapshot |
| 6 | install 写入 + e2e tmp |
| 7 | search/list/update |
| 8 | 遥测 + README |
| 9 | npm publish dry-run（`npm pack`） |
| 10 | Web 文案与 registry 接入（可并行 PR） |

---

## 11. 反模式

1. 只在 Web TS seed 增 skill，不写 `skills/`  
2. CLI 内硬编码 skill 正文  
3. 发布 `bin: src/cli.ts` + tsx  
4. 把 turbo/cache/node_modules 打进 npm  
5. catalog 与 bootstrap 长期双源且无 `source` 区分  
6. install 依赖 stats API  

---

*Catalog 是 CLI 与 Web 的共同契约；改字段先改 schema 与本 Spec，再改生成器与消费者。*

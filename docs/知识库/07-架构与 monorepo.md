# 架构与 monorepo

> 蒸馏自原 Spec 01 / 20 / 24；现状以 [05](./05-系统现状与实现地图.md) 为准。

---

## 1. 架构目标与选型

| 目标 | 约束 |
|------|------|
| Skills 可被网页发现与下载 | GitHub 为内容真相源 |
| CLI/MCP 安装到多 Agent | 与 Web 共用同一索引，禁止元数据漂移 |
| 双语 UI | 站点 UI 中/英；skill 正文随贡献语言 |
| 开源贡献 | `official/` + `community/`；PR 合入 |
| v1 可运维 | Vercel Web；npm CLI + MCP |

**采用：方案 A — 索引中心 monorepo**（否决纯文档站为主、否决 v1 多仓拆分）。

---

## 2. 仓库布局

```text
Openwisdom/
├── apps/web/                 # Next.js 官网 + 目录 + docs
├── packages/
│   ├── schema/               # @openwisdom/schema — zod
│   ├── catalog/              # @openwisdom/catalog — build
│   ├── providers/            # harness 路径表
│   ├── core/                 # @openwisdom/core — 无 TTY 业务
│   ├── cli/                  # openwisdom（npm 公开）
│   └── mcp/                  # openwisdom-mcp（npm 公开）
├── skills/                   # ★ 内容真相源
│   ├── official/{scenarios,references}/
│   └── community/{scenarios,references}/
├── docs/知识库/              # 决策与契约权威
├── docs/plans/               # 过程
├── scripts/
├── pnpm-workspace.yaml       # apps/* + packages/*
└── package.json
```

**原则：** 不在 monorepo 根预置整棵 `.claude/.cursor` 技能树；安装时写入**用户环境**。仓库只保留源格式 skills。

---

## 3. Skill 单元与 frontmatter

```text
skills/official/scenarios/macro-scan/
├── SKILL.md
└── assets/          # 可选
```

| 字段 | 说明 |
|------|------|
| `name` / `description` | agentskills.io 最小集（必需） |
| `id` | 稳定 slug；默认同 name |
| `layer` | `scenario` \| `reference` |
| `scope` | `official` \| `community`（可路径推断） |
| `disciplines` | string[] |
| `language` | 正文语言 |
| `tags` | string[] |
| `version` | semver |
| `references` | 场景引用的 reference id[]（**仅理论依赖**） |
| `pipeline?` | 可选：`{ id, order, next? }`（Handoff；见 **13**） |

路径推断：`skills/official/scenarios/*` → official+scenario；`references/<discipline>/*` → reference 等。

---

## 4. Catalog 管道（防漂移）

```text
skills/**/SKILL.md
    → packages/catalog build
    → catalog.json + manifest.json
    → dual-write:
         apps/web/public/registry/
         packages/{cli,core,mcp}/catalog-snapshot/
         packages/*/skills-snapshot/   # 安装载荷
```

| 消费者 | 行为 |
|--------|------|
| Web | 构建/运行读 registry；UI 可 merge heat（**12**） |
| CLI/MCP | 优先包内 snapshot；可选 `OPENWISDOM_REGISTRY` 刷新 |
| Install 载荷 | `OPENWISDOM_SKILLS_ROOT` → monorepo `skills/` → `skills-snapshot/` |

**铁律：** 站点不得发明不在 `skills/**` 或其生成物中的「可安装」元数据。

```bash
pnpm catalog:build
pnpm catalog:materialize   # Web seeds → community SKILL.md
pnpm catalog:sync-web      # materialize + build
```

空 `skills/` 树时 build **应失败**，避免发布空包。

### manifest.json（示意）

```json
{
  "schemaVersion": 1,
  "generatedAt": "…",
  "gitSha": "…",
  "contentHash": "sha256-…",
  "skillCount": 89,
  "cliMinVersion": "0.1.0"
}
```

### Catalog 根可选扩展（Handoff）

```ts
bundles?: Array<{
  id: string;           // e.g. orientation-handoff
  title: string;
  description: string;
  skillIds: string[];   // 有序；必须存在于 skills[]
}>
```

热度 **不** 写入 catalog/git；旁路 API 见 **12**。

---

## 5. `@openwisdom/core`（双表面共享）

| 模块 | 职责 |
|------|------|
| catalog | `loadCatalog` · `searchCatalog` · 可选 tag 过滤 |
| install | `runInstall` · deps 展开 · dryRun / force |
| skills-root | 三级 resolve |
| providers 协作 | 路径解析、去重写目标 |
| telemetry | fail-open POST；`source: "cli" \| "mcp"` |

**禁止 core：** citty/clack、`process.exit`、无条件 `console.log` 污染 MCP stdout。  
日志经 `onLog`；TTY 由调用方注入（库默认非交互）。

---

## 6. Web 技术栈

| 层 | 选型 |
|----|------|
| 框架 | Next.js App Router · React 19 |
| 样式 | Tailwind 4 + CSS variables · shadcn/ui |
| i18n | next-intl · `/zh` `/en` · 默认 `zh` |
| 动效 | motion + tw-animate · Bits 见 **09** |
| 部署 | Vercel · monorepo filter `web` |

---

## 7. CLI / MCP 技术栈

| 项 | CLI | MCP |
|----|-----|-----|
| 包名 | `openwisdom` | `openwisdom-mcp` |
| 入口 | citty + clack | MCP SDK stdio |
| 构建 | tsup 单文件 bundle | tsup 单文件 bundle |
| Node | ≥ 20 | ≥ 20 |
| 业务 | → core | → core |

**不做：** LLM / `run` / Streamable HTTP 多租户（v1）。

---

## 8. i18n

| 层 | 策略 |
|----|------|
| UI | `apps/web/src/messages/{zh,en}/*` |
| Skill 正文 | 单文件单语言 + `language` 字段 |
| CLI 提示 | `--lang` / env |

---

## 9. 部署与 CI（原则）

```text
PR / main:
  validate skills (schema, unique id, refs)
  → build packages + web
  → Vercel preview

publish:
  catalog:build 保证 snapshot 一致
  → npm publish openwisdom + openwisdom-mcp
```

建议：四路 `catalog.json` contentHash 一致再允许 publish（CLI/core/MCP/web registry）。

---

## 10. 热度在架构中的位置

旁路服务：`POST /api/telemetry` · `GET /api/stats`；catalog **不**内嵌热度。  
无统计服务时：不显示数字 / popular 回退；内容浏览与安装不受损。详见 **12**。

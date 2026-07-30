# Spec 17 — Openwisdom CLI 总控（Spec-Plan-Execute）

> **状态：** Ready（调研完成 · 待实现）  
> **日期：** 2026-07-30  
> **模式：** 技能包管理器 only（产品决策 #3）  
> **上游：** `PRODUCT.md` · `docs/知识库/02` §3–4 · `01-架构方案` §3–7 · `06-热度与遥测`  
> **子规格：** [18 命令与 UX](./18-CLI命令与UX.md) · [19 providers 与写入](./19-CLI-providers与安装写入.md) · [20 monorepo/catalog/发布](./20-CLI-monorepo-catalog-发布.md) · [21 调研纪要](./21-CLI调研纪要.md)

---

## 1. 一句话

Openwisdom CLI 是 **跨 coding agent 的 skill 包管理器**：`search` / `install` / `update` / `list`。  
从共享 catalog 解析 skill，把 `SKILL.md` 目录写入用户所选 harness 路径；**不**调用模型，**不**跑分析。

---

## 2. 目标与成功标准

| # | 目标 | 验收 |
|---|------|------|
| 1 | 用户可 `npx openwisdom install macro-scan` 装到所选 Agent | 目标目录出现 `<name>/SKILL.md` |
| 2 | 交互式多选 providers + project/global scope | 与 Impeccable 同类 UX；`-y` 非交互 |
| 3 | `search` / `list` 可发现官方技能 | 离线可用（包内 snapshot） |
| 4 | `update` 刷新索引与已装内容 | 冲突可检测；`--force` 覆盖 |
| 5 | 安装成功可匿名上报热度 | Spec 06；fail-open；可关遥测 |
| 6 | 与 Web 命令字符串一致 | 站上 `npx openwisdom install <slug>` 真能跑 |

**非目标（v1 硬否决）：**

- `openwisdom run` / 任意 LLM API 调用  
- 用户账号、云同步收藏  
- 把热度写进 `SKILL.md` 或 git skills 树  
- 强制联网才能 `search`（可刷新，但必须有 snapshot）  
- 在 monorepo 根预置整棵 `.claude/.cursor` 技能树（只装用户环境）

---

## 3. 铁律（继承 AGENTS / PRODUCT）

| # | 规则 |
|---|------|
| 1 | **Agent-native analysis** — CLI 只做包装与安装 |
| 2 | **One content truth** — 索引来自 `skills/**` → `packages/catalog`；禁止 CLI 私造元数据 |
| 3 | **Heat is side channel** — 遥测失败不改变 install 退出码 |
| 4 | **Layered content** — scenario 可引用 reference；`install` 默认策略见 Spec 18 |
| 5 | **UI/CLI 语言** — 提示中英可选；skill 正文语言 = 贡献者 |
| 6 | **诚实** — 未发布到 npm 前，Web 继续声明「CLI 尚未发布」；发布后改文案 |

---

## 4. 现状（实现前基线 · 2026-07-30）

| 项 | 状态 |
|----|------|
| `packages/cli` / `schema` / `catalog` / `providers` | **不存在** |
| `pnpm-workspace` | 仅 `apps/*` |
| `skills/` 真相树 | **不存在**（Web 用 bootstrap TS seeds） |
| `/registry/catalog.json` | **不存在** |
| Web 广告命令 | `npx openwisdom install` / `… install <slug>` |
| Web 诚实文案 | CLI 尚未发布到 npm |
| 热度 API | Spec only |

**含义：** CLI 开发不是「接已有包」，而是 **脚手架 monorepo packages + 最小 skills 内容 + 发布管线** 一并落地。

---

## 5. 产品边界对照

| 能力 | 决策来源 | 本 SPE |
|------|----------|--------|
| 包管理器 only | 知识库 02 #3 | 命令集锁定 18 |
| 多 Agent 交互安装 | 02 #4 | providers 表 19 |
| 热度第三档 | 02 #11 · Spec 06 | install 成功后上报 |
| 分层 scenario + reference | 02 #5 | install 依赖策略 18 |
| npm 包名 `openwisdom` | 01 开放项 | 优先 unscoped；备选 `@openwisdom/cli` 且 bin 仍为 `openwisdom` |

---

## 6. 包与依赖图（目标）

```text
skills/**/SKILL.md
       │
       ▼
 packages/schema     ← zod：frontmatter + catalog index
       │
 packages/catalog    ← scan → catalog.json + manifest
       │
 packages/providers  ← harness id → project/global 路径
       │
 packages/cli        ← 唯一 npm 公开发布：openwisdom
       │
       ├── 运行时：snapshot（装在 tarball 内）
       ├── 可选：GET 站点 /registry/catalog.json
       └── install 载荷：GitHub（按 repoPath / gitSha）
```

`apps/web` 消费同一 catalog 构建产物（中长期替换 bootstrap）；Web 改造 **不阻塞** CLI 首发，但 **slug / install.cli 字符串** 必须对齐。

细则：Spec **20**。

---

## 7. 技术选型（v1 默认）

| 层 | 选型 | 理由 |
|----|------|------|
| 语言 | TypeScript ESM · Node ≥ 20 | Spec 01；生态可抬到 22 |
| 解析 | **citty** | 轻量子命令；Plan B: commander |
| 交互 | **@clack/prompts** | 多选 providers；CI 禁用 |
| CLI 构建 | **tsup** → `dist/cli.js`（shebang） | 小 tarball、快 `npx` |
| 内部包 | private workspace · **打进 CLI bundle** | 不强制发布 schema |
| 校验 | zod（schema 包） | 与 catalog 共用 |
| 测试 | vitest + 临时目录 + execa e2e | Windows + Unix |
| 遥测 | 短超时 fire-and-forget POST | Spec 06 |

**明确不采用（v1）：** oclif、yargs 默认栈、tsx 作为生产 bin、Ink 全屏 UI、把 skill 正文整库塞进 npm。

---

## 8. 命令面（摘要 · 详见 18）

```text
npx openwisdom --help
npx openwisdom search <query>
npx openwisdom list [--installed] [--available]
npx openwisdom install [skill…] [flags]
npx openwisdom update [skill…] [flags]
```

**全局 flags（摘要）：** `--providers` · `--scope project|global` · `-y` · `--force` · `--dry-run` · `--no-telemetry` · `--lang zh|en` · `--registry <url>`

**Web 已承诺的最小路径：**

- `npx openwisdom install` → 交互选 skill（或提示可用官方集）  
- `npx openwisdom install macro-scan` → 单 skill + 交互选 providers  

---

## 9. 与相邻系统的契约

| 系统 | 契约 |
|------|------|
| **Web InstallCommand** | 命令前缀 `npx openwisdom`；slug = `CatalogEntry.slug` |
| **CatalogEntry** | Web `types.ts` 为 UI 形态；机器索引见 Spec 20 的 `CatalogIndexEntry`（可映射） |
| **SKILL.md** | 兼容 agentskills.io：`name` + `description` 必填；Openwisdom 扩展放 frontmatter 约定字段 / `metadata` |
| **遥测** | `cli_install_success`；同一 skill 多 provider **计 1 次**（可带 `providerCount`） |
| **次要安装路径** | 文档可提 `npx skills add …`；**主路径**仍是本 CLI |

---

## 10. 实现波次（SPE Waves）

| Wave | 内容 | 产出 | 依赖 |
|------|------|------|------|
| **A** | monorepo 脚手架：`packages/*`、workspace、schema 最小 zod | 可 `pnpm -r build` | 无 |
| **B** | `skills/` 最小 3 官方 scenario + schema 校验 | 真 `SKILL.md` 可装 | A |
| **C** | `packages/catalog` → catalog.json + manifest；CLI snapshot | 离线 search | A+B |
| **D** | `packages/providers` + `install` 写入（先 4–6 个 P0 harness） | 本机装进 Claude/Cursor/… | A |
| **E** | 交互 UX（detect → multi-select → scope）+ 全命令 | 对齐 18 | C+D |
| **F** | 遥测客户端 + 文档/Web 文案「已发布」开关 | Spec 06 接入 | E；API 可 mock |
| **G** | npm 发布管线 + CI + 版本标签 | `npx openwisdom` 真可用 | E |

**并行建议：** A∥调研已完成；B 与 D 可部分并行；E 依赖 C+D；G 在 E 冒烟后。

**建议实现顺序（与 01 §11 对齐并细化）：**

1. schema + 示例 skills  
2. catalog build  
3. providers + install（copy）  
4. search/list/update + 交互  
5. telemetry + publish  

---

## 11. 拍板项（本 SPE 锁定）

| 议题 | 结论 |
|------|------|
| CLI 定位 | 包管理器 only |
| 命令 | search / install / update / list |
| 交互范式 | 检测 harness → 多选 providers → project\|global → 写入 |
| 默认写策略 | **recursive copy**（非默认 symlink） |
| 索引 | 包内 snapshot + 可选远程 registry 刷新 |
| 载荷来源 | GitHub（catalog 的 `repoPath` / git 引用） |
| 内部包 | private；仅 CLI 公开发布 |
| npm 名 | 优先 `openwisdom`；冲突则 `@openwisdom/cli` + bin `openwisdom` |
| Node | `engines.node: ">=20"` |
| P0 providers | `claude` · `cursor` · `codex` · `gemini` · `github` · `agents`（portable） |
| P1 providers | `grok` · `opencode` · `pi` · `kiro` · `qoder` · `trae` · `windsurf` · `cline` 等（路径表见 19） |
| 冲突 | 默认拒绝覆盖不同内容；`--force` 或交互确认 |
| Windows | 一等公民；默认 copy 规避 symlink 权限 |

### 仍开放（实现时选一，勿静默发明产品范围）

| 议题 | 选项 |
|------|------|
| scenario 安装是否默认拉 `references[]` | **推荐默认：是（可 `--no-deps`）** — 实现前在 18 确认 |
| Cursor 项目路径 | 写 `.cursor/skills` **和/或** `.agents/skills` — 见 19 推荐「双写可选」 |
| 用户缓存目录 | XDG / `env-paths` / `%APPDATA%\openwisdom` |
| stats 存储 | Spec 06 已列 Upstash 等；CLI 只消费 URL |
| Turbo | 可选；非阻塞 |

---

## 12. 验收清单（Wave G 完成前）

- [ ] `pnpm --filter openwisdom build` 产出可执行 `dist/cli.js`  
- [ ] 本地：`node packages/cli/dist/cli.js install macro-scan -y --providers=claude --scope=project` 在 fixture 根写出 skill  
- [ ] `search macro` 命中 `macro-scan`（无网）  
- [ ] `list --installed` 反映写入结果  
- [ ] 冲突文件无 `--force` 时非 0 退出且未破坏原文  
- [ ] `--no-telemetry` / `CI=true` 不发起遥测（或可断言 mock 未调用）  
- [ ] 无 `run` 子命令  
- [ ] Windows 路径测试通过（至少 CI 或本地一次）  
- [ ] Web：发布后更新「CLI 尚未发布」文案；`install.cli` 与真命令一致  
- [ ] README / docs 安装段与本 SPE 一致  

---

## 13. 文档地图

| 文档 | 内容 |
|------|------|
| **17（本文件）** | 总控、波次、铁律、拍板 |
| **18** | 命令、flags、交互流、退出码、依赖安装策略 |
| **19** | providers 路径表、写入/冲突/Windows |
| **20** | monorepo、catalog JSON、npm 发布、CI |
| **21** | Impeccable / skills.sh / agentskills 调研纪要 |
| **01** | 全局架构（本 SPE 细化其 §7，冲突时以 **17–20 执行决策** 为准并回写 01） |
| **06** | 遥测 payload 与 opt-out |
| **15** | Web CatalogEntry（映射关系见 20） |

---

## 14. 风险

| 风险 | 缓解 |
|------|------|
| 无 `skills/` 内容则 install 空转 | Wave B 最小 3 scenario 与 CLI 同批 |
| harness 路径漂移 | providers 表版本化 + 调研源链接（21） |
| npm 名被抢 | 备选 scoped；站上命令可改一处常量 |
| bootstrap 与真 catalog 双源 | catalog 落地后 Web 切 `source: "catalog"`；bootstrap 仅 fixture |
| 把 Impeccable 代码整段拷贝 | **禁止**；只复用 UX 合同；Apache 代码若引用须合规 |

---

*本 SPE 授权后续 Plan 目录：`docs/plans/YYYY-MM-DD-cli/`（实现阶段再开）。*

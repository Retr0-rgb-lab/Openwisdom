# Spec 18 — CLI 命令与 UX

> **状态：** Ready  
> **日期：** 2026-07-30  
> **上级：** [17-CLI总控-SPE](./17-CLI总控-SPE.md)  
> **相关：** [19 providers](./19-CLI-providers与安装写入.md) · [06 遥测](./06-热度与遥测.md)

---

## 1. 设计原则

1. **包管理器语义** — 用户心智对齐 `npm` / `npx skills` / Impeccable install，而非聊天 CLI。  
2. **TTY 友好 · CI 安全** — 有 TTY 且无 `-y` 可交互；`CI=true` / 非 TTY 必须用 flags 完成。  
3. **stdout / stderr** — 人类可读进度与提示走 stderr；可管道的列表默认可解析（v1 表格即可；P1 加 `--json`）。  
4. **零 LLM** — 无「分析中…」、无 API key 提示。  
5. **与 Web 字符串一致** — 成功路径必须支持：

```bash
npx openwisdom install
npx openwisdom install macro-scan
npx openwisdom install personal-anchor
npx openwisdom install metacognition-audit
```

---

## 2. 全局行为

### 2.1 程序信息

| 项 | 行为 |
|----|------|
| 无参数 / `--help` / `-h` | 打印帮助，exit 0 |
| `--version` / `-V` | 打印 CLI 版本（npm package version） |
| 未知命令 | 错误 + 建议，exit 2 |

### 2.2 全局 flags

| Flag | 说明 |
|------|------|
| `--lang <zh\|en>` | 提示语言；默认：`LANG`/`LC_ALL` 含 `zh` 则 zh，否则 en；可配置覆盖 |
| `--registry <url>` | catalog 远程基址（默认生产站 `/registry` 根，实现时写入常量） |
| `--no-telemetry` | 关闭本进程遥测 |
| `--yes` / `-y` | 跳过确认；安装时若缺 providers/scope 用默认（见下） |
| `--dry-run` | 只打印计划写入路径，不写盘 |
| `-v` / `--verbose` | 调试日志 stderr |

**环境变量：**

| 变量 | 作用 |
|------|------|
| `OPENWISDOM_NO_TELEMETRY=1` | 同 `--no-telemetry` |
| `OPENWISDOM_REGISTRY` | 同 `--registry` |
| `OPENWISDOM_LANG` | 同 `--lang` |
| `CI=true` | 默认关闭遥测；禁止阻塞式 prompt（缺参则失败） |

配置文件（P1）：`~/.config/openwisdom/config.json` 或 Windows 等价路径；v1 可用「仅 env + flags」。

### 2.3 `-y` 默认值

| 缺省项 | `-y` 行为 |
|--------|-----------|
| skills | **必须**在 argv 给出 skill id/slug；否则 exit 2（避免静默装全集） |
| providers | 使用 **检测结果**；若无检测结果 → `claude` + `agents`（与 Impeccable 保守默认对齐） |
| scope | **`project`**（团队可提交；与 Impeccable `-y` 一致） |

无 `-y` 且 TTY：逐步 prompt。

---

## 3. 命令规格

### 3.1 `search <query…>`

**意图：** 在 catalog 索引中搜索可安装项（不读用户磁盘已装列表，除非 flag）。

```text
openwisdom search <query>
openwisdom search --layer scenario psychology
```

| Flag | 说明 |
|------|------|
| `--layer <scenario\|reference>` | 过滤层 |
| `--scope <official\|community>` | 出处（catalog 字段，非 install scope） |
| `--discipline <id>` | 学科 |
| `--lang <code>` | skill 正文语言 |
| `--limit <n>` | 默认 20 |

**数据源：** 用户缓存 registry（若存在且较新）→ 否则包内 snapshot。  
**可选：** `--refresh` 先拉远程索引再搜（网络失败则警告 + 用本地）。

**输出（v1）：** 表列：`id` · `layer` · `scope` · `title`（按 CLI lang）· `version`  
**exit：** 0 有或无结果；网络失败仅 refresh 时非 0（若要求必须 refresh）。

---

### 3.2 `list`

**意图：** 列出 **catalog 可用** 或 **本机已安装**。

```text
openwisdom list
openwisdom list --installed
openwisdom list --available
```

| Flag | 默认 | 说明 |
|------|------|------|
| `--available` | list 无 flag 时默认 | 显示索引中的技能 |
| `--installed` | | 扫描已知 provider 路径下的 Openwisdom / 匹配 catalog 的 skill |
| `--providers <list>` | 检测 | 限制扫描 |
| `--scope <project\|global\|all>` | all（installed 时） | 扫描范围 |

**歧义消解：** 帮助文案必须写清 `list` 默认 = available；`list --installed` 才是本机。

**已安装识别（v1 启发式）：**

1. 路径位于 providers 表管理的 skills 根下  
2. 目录名 / frontmatter `name` 命中 catalog `id` **或**  
3. 存在 marker：`SKILL.md` frontmatter `metadata.openwisdom: true` 或 `metadata.source: openwisdom`（Wave B 写入规范）

---

### 3.3 `install [skills…]`

**意图：** 将一个或多个 skill 目录写入所选 harness。

```text
openwisdom install
openwisdom install macro-scan
openwisdom install macro-scan personal-anchor -y --providers=claude,cursor --scope=project
```

| Flag | 说明 |
|------|------|
| `--providers <ids>` | 逗号分隔；见 Spec 19 |
| `--scope project\|global` | 写入项目 cwd 或用户全局 |
| `--force` | 覆盖冲突内容 |
| `--link` | 尝试 symlink/junction（失败则报错或回退 copy — 实现选「失败明确」） |
| `--no-deps` | 不自动安装 scenario 的 `references[]` |
| `--with-deps` | 强制装依赖（若默认已是 with-deps 则冗余但显式） |
| `--from <path\|url>` | 高级：本地目录或 git URL（P1；v1 可只支持 catalog id） |
| `--cwd <path>` | project scope 的根（默认 `process.cwd()`） |

#### 交互流（TTY · 无完整 flags）

```text
1. 解析 skills
   - argv 有 id → 使用
   - 无 → multiselect / autocomplete 从 catalog（featured 官方优先）
2. 检测 harness（project + home 提示）
3. confirm：使用检测结果 vs 自定义 multiselect providers
4. select：project vs global
5. 展示计划（skill × provider × 绝对路径）→ confirm（-y 跳过）
6. 对每个 skill：
   a. 解析依赖（见 §4）
   b. 获取载荷（本地 monorepo dev / GitHub archive）
   c. 校验 SKILL.md frontmatter
   d. 写入每个 provider（Spec 19）
7. 汇总成功/失败
8. 全部成功的 skill → 遥测（若开启）
9. 打印「下一步：在 Agent 中调用 skill；分析不在 Openwisdom 服务器」
```

#### 依赖策略（scenario → reference）

| 模式 | 行为 |
|------|------|
| **默认（推荐）** | 安装 scenario 时，一并安装 frontmatter / catalog `references[]` 中仍存在的 reference id |
| `--no-deps` | 仅装显式列出的 id |
| reference 缺失 | 警告，不失败整次 install（除非 `--strict-deps` P1） |

社区 / external `installMode: link-only`：**拒绝** 当成本地 cli 安装并提示 URL（与 Web 一致）。

#### 遥测时机

- 每个 **skill** 在其 **全部选中 provider 写入成功** 后计 1 次 `cli_install_success`  
- 部分 provider 失败：该 skill **不上报**（或上报失败态 — **v1 选择：不上报**，避免虚高）  
- 详见 Spec 06  

---

### 3.4 `update [skills…]`

**意图：**

1. 刷新本地 catalog 缓存（远程 manifest 更新时）  
2. 将已安装 skill 更新到索引指向的版本 / gitSha  

```text
openwisdom update
openwisdom update macro-scan
openwisdom update --refresh-only
```

| Flag | 说明 |
|------|------|
| `--refresh-only` | 只更新索引缓存，不写 skills |
| `--providers` / `--scope` | 限制更新目标 |
| `--force` | 覆盖本地修改 |
| `-y` | 无确认 |

**无 skills 参数：** 更新所有 **已识别为 Openwisdom 安装** 的 skill（`--installed` 集合）。  
**冲突：** 本地 hash ≠ 期望且无 `--force` → 跳过并计数 warning；全部 skip 时 exit 1。

---

## 4. 退出码

| Code | 含义 |
|------|------|
| 0 | 成功（含 search 无命中） |
| 1 | 运行期失败（写入失败、全部 update skip、校验失败） |
| 2 | 用法错误（未知命令、CI 缺参、非法 flag） |
| 3 | 网络必需步骤失败且无可用 fallback（可选；v1 可并入 1） |

---

## 5. 文案语气

- 冷静、短句；禁「supercharge / unlock」  
- 失败说明 **可执行下一步**（权限、路径、改用 `--scope project`）  
- 首次 install 可 **一行** 遥测说明（不阻塞）：  

  > Anonymous install counts help rank skills. Disable: `--no-telemetry` or `OPENWISDOM_NO_TELEMETRY=1`.

- 中英字符串表放 `packages/cli/src/i18n/{zh,en}.ts`（或 JSON）

---

## 6. Dev / monorepo 特殊路径

开发者在 monorepo 根调试时：

| 模式 | 行为 |
|------|------|
| `OPENWISDOM_SKILLS_ROOT=<repo>/skills` | install 载荷直接 copy 本地树（跳过 GitHub） |
| `pnpm --filter openwisdom exec openwisdom …` | 跑 workspace 构建产物 |

文档化于 packages/cli README；不改变终端用户默认。

---

## 7. 与 Web 的命令契约

| Web 位置 | 期望 CLI |
|----------|----------|
| `InstallCommand` | `npx openwisdom install` |
| `CatalogEntry.install.cli` | `npx openwisdom install <slug>` |
| slug | = catalog `id`（官方三场景已对齐） |

发布前：Web 保持「尚未发布」。  
发布后：去掉不可用提示；可选增加「需 Node ≥ 20」。

---

## 8. 明确不做的命令（v1）

| 命令 | 原因 |
|------|------|
| `run` / `analyze` / `chat` | 产品硬规则 |
| `login` / `whoami` | 无账号 |
| `publish` skill 到 registry | 贡献走 GitHub PR |
| `init` 生成站点 | 非本产品 |

P2 可考虑：`doctor`（检测路径）、`remove`（卸载）— 不在 v1 必达。

---

## 9. 验收用例（命令级）

1. `openwisdom search macro` → 含 `macro-scan`  
2. `openwisdom install macro-scan -y --providers=claude --scope=project --cwd=<tmp>` → `<tmp>/.claude/skills/macro-scan/SKILL.md`  
3. 再次 install 同内容 → exit 0，提示 up-to-date  
4. 篡改 SKILL.md 后无 `--force` install → 非 0 或 skip with error  
5. `CI=true openwisdom install` 无 args → exit 2  
6. `openwisdom list --installed --cwd=<tmp>` → 列出 macro-scan  

---

*实现以本文件 + Spec 19 写入语义为准。*

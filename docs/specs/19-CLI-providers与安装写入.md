# Spec 19 — CLI Providers 路径表与安装写入

> **状态：** Ready  
> **日期：** 2026-07-30  
> **上级：** [17-CLI总控-SPE](./17-CLI总控-SPE.md)  
> **调研：** [21-CLI调研纪要](./21-CLI调研纪要.md)  
> **包：** `packages/providers`

---

## 1. 目标

提供稳定、可测的 **harness → 目录路径** 映射，以及 **安全写入 skill 目录** 的策略，供 `packages/cli` 的 `install` / `update` / `list --installed` 使用。

---

## 2. Provider 记录形状

```ts
type ProviderId = string; // e.g. "claude" | "cursor" | "codex"

type ProviderDefinition = {
  id: ProviderId;
  /** CLI / UX 展示名 */
  label: string;
  /** 用户输入别名 */
  aliases: string[];
  /** 相对 project root 的 skills 根（posix 语义，运行时 path.join） */
  projectSkillsDir: string;
  /** 相对 homedir 的 skills 根；null = 不支持 global */
  globalSkillsDir: string | null;
  /** 检测：project 下存在的提示目录（相对 cwd） */
  detectProjectMarkers: string[];
  /** 检测：home 下存在则认为用户使用该 harness */
  detectHomeMarkers: string[];
  /** P0 | P1 | experimental */
  tier: "p0" | "p1" | "experimental";
  notes?: string;
};
```

**解析规则：**

- `resolveProject(cwd, provider)` → `path.join(cwd, projectSkillsDir, skillName)`  
- `resolveGlobal(homedir, provider)` → `globalSkillsDir` 为 null 则报错「不支持 global」  
- Windows：一律 `path.join` + `os.homedir()`；禁止手写 `/` 拼接绝对路径  

**skill 目录名：** 与 agentskills **`name`** / catalog **`id`** 一致（kebab-case）。

---

## 3. P0 Providers（v1 必装可测）

| id | aliases | project skills 根 | global skills 根 | 检测 markers |
|----|---------|-------------------|------------------|--------------|
| `claude` | `claude-code` | `.claude/skills` | `.claude/skills`（相对 home） | project: `.claude`；home: `.claude` |
| `cursor` | — | `.cursor/skills` | `.cursor/skills` | `.cursor` / home `.cursor` |
| `codex` | — | `.agents/skills` | `.codex/skills` | project `.agents` / `.codex`；home `.codex` |
| `gemini` | `gemini-cli` | `.gemini/skills` | `.gemini/skills` | `.gemini` |
| `github` | `copilot` | `.github/skills` | `.copilot/skills` | `.github`；home `.copilot` |
| `agents` | `portable` | `.agents/skills` | `.agents/skills` | `.agents` |

### 3.1 P0 说明

| 议题 | 决策 |
|------|------|
| **portable `agents`** | 单独 id：一次写入可被 Cursor / Gemini / Copilot / OpenCode 等交叉读取；与 `codex` 项目路径相同目录时 **去重写入** |
| **Cursor** | 主路径 `.cursor/skills`；若用户同时选了 `agents`，不强制双写两次相同内容到同一 `.agents` 路径 |
| **Codex global** | `~/.codex/skills`（非 `~/.agents` 优先；list 时可额外扫 `~/.agents/skills`） |
| **Grok** | **P1**（Impeccable 使用 `.grok/skills`；公开文档完整度低于 P0，见 §4） |

**检测默认集合：**  
若 project/home 均未命中任何 P0 marker → 交互默认勾选 **`claude` + `agents`**；`-y` 同此默认。

---

## 4. P1 / experimental Providers

| id | project | global | tier | notes |
|----|---------|--------|------|-------|
| `grok` | `.grok/skills` | `.grok/skills` | p1 | Impeccable / 生态常用；以实现时复核为准 |
| `opencode` | `.opencode/skills` | `.config/opencode/skills`（相对 home） | p1 | **禁止** 误写 `~/.opencode` 作为官方全局 |
| `pi` | `.pi/skills` | `.pi/agent/skills` | p1 | 全局路径易错，单测锁死 |
| `kiro` | `.kiro/skills` | `.kiro/skills` | p1 | |
| `qoder` | `.qoder/skills` | `.qoder/skills` | p1 | |
| `trae` | `.trae/skills` | 实现时查表 | p1 | 与 `trae-cn` 分 id |
| `trae-cn` | `.trae-cn/skills` | 实现时查表 | p1 | |
| `windsurf` | `.windsurf/skills` | `.codeium/windsurf/skills` | p1 | |
| `cline` | `.cline/skills` | `.cline/skills` | p1 | |
| `rovodev` | `.rovodev/skills` | `.rovodev/skills` | experimental | |
| `vibe` | `.vibe/skills` | `.vibe/skills` | experimental | |

**v1 CLI：**  

- 帮助与交互 **默认展示 P0**  
- `--providers` 接受 P1 id（若表内存在）  
- experimental 需 `--providers` 显式，不进入默认 detect 推荐  

**不做（v1）：** Continue rules、Aider conventions 等非 `SKILL.md` 体系的强行映射。

---

## 5. 单元写入形状

源（从 GitHub / 本地 skills 树取得）：

```text
macro-scan/
  SKILL.md
  assets/…    # optional
  references/… # optional skill-local files，非 catalog reference 层
```

目标：

```text
{skillsRoot}/macro-scan/SKILL.md
{skillsRoot}/macro-scan/…
```

- **整目录** 为原子安装单元  
- 不把 skill 拆成单文件丢进根目录  
- 不写入 hooks / settings（Impeccable 的 hooks **不在** Openwisdom v1 范围）

---

## 6. 写策略

### 6.1 默认：copy

1. 创建 staging 目录：`{parent}/.openwisdom-staging-{skill}-{rand}`  
2. 递归复制源 → staging（跟进 symlinks 策略：默认 **不** 跟随外部 symlink 内容越界）  
3. 校验 staging 内存在 `SKILL.md` 且 frontmatter 通过 schema  
4. 若目标不存在 → `rename` staging → 目标名  
5. 若目标存在 → 走冲突策略（§7）  

失败：删除 staging；已有目标保持不变。

### 6.2 可选：`--link`

| 平台 | 行为 |
|------|------|
| POSIX | `fs.symlink` 目录链接到缓存中的 canonical 副本（或 monorepo 源） |
| Windows | 优先 **junction**；失败则明确错误，**不**静默改 copy（避免用户以为 link 成功） |

v1 推荐文档强调：Windows 用户优先 copy。

### 6.3 安全

| 规则 | 说明 |
|------|------|
| 路径穿越 | 拒绝 `name` 含 `..`、绝对路径、盘符 |
| Zip-slip | 若从 archive 解压，校验每个 entry 落在目标根内 |
| 权限 | `EACCES` → exit 1 + 提示换 scope / 权限 |
| 不写 Program Files | global 仅 home 下路径 |

---

## 7. 冲突检测

对已存在目标目录：

| 条件 | 默认行为 |
|------|----------|
| 不存在 | 写入 |
| 存在且 **content hash** 与将安装版本一致 | no-op，记 up-to-date |
| 存在且 hash 不同 | **拒绝**；提示 `--force` 或交互 confirm |
| `--force` | 删除目标（仅限 skill 目录内）后写入 |
| `--dry-run` | 只打印 will write / conflict / skip |

**hash 输入（v1）：** 规范化后的 `SKILL.md` 全文 + 资产文件相对路径列表与内容 hash（sha256）。  
实现可简化为：先比 `SKILL.md` + 文件树 mtime/size，但验收应用内容 hash。

**禁止：** 无提示 `rm -rf` 用户目录；禁止修改 skill 正文插入遥测 id。

---

## 8. 检测算法（detect）

```text
detected = ∅
for provider in P0(+P1 if flag):
  if any marker exists under cwd → add provider (project-available)
  if any home marker exists → mark global-available
return unique by id
```

交互文案示例：

- “Detected: claude (project), cursor (project+global)”  
- 未检测：展示完整 P0 列表供多选  

---

## 9. Windows 一等公民

| 点 | 要求 |
|----|------|
| Home | `os.homedir()` → 通常 `C:\Users\…` |
| 路径 API | 只用 `node:path` |
| 仓库路径含中文 | 本机开发路径可能含 Unicode；测试覆盖 |
| 默认 copy | 避免 Developer Mode / Admin symlink |
| 换行 | 写入保持源 LF；不强制改 CRLF |
| 长路径 | skill `name` 限 kebab ASCII（schema） |

---

## 10. `packages/providers` API（建议）

```ts
export const PROVIDERS: ProviderDefinition[];
export function getProvider(idOrAlias: string): ProviderDefinition | undefined;
export function parseProvidersFlag(csv: string): ProviderId[]; // throw on unknown
export function detectProviders(cwd: string, home: string): DetectResult;
export function resolveSkillDir(opts: {
  provider: ProviderId;
  scope: "project" | "global";
  cwd: string;
  home: string;
  skillName: string;
}): string;
```

纯函数、零网络、易单测。

---

## 11. 验收

- [ ] 每个 P0 provider 的 project 路径在 tmp cwd 下可写并被 `list --installed` 发现  
- [ ] `agents` + `codex` 同时选择时 project 路径不重复写两次损坏  
- [ ] `opencode` global 指向 `.config/opencode/skills`  
- [ ] `evil/../x` 作为 skill name 被 schema/写入层拒绝  
- [ ] 冲突无 `--force` 保留用户修改的 `SKILL.md`  
- [ ] Windows 与 macOS/Linux 各至少一条 install 集成测试（或 CI matrix）

---

## 12. 维护

- 路径变更时：**改本表 + `packages/providers` + 21 调研链接日期**  
- 新增 harness：默认 **experimental**，有官方文档链接再升 P1/P0  
- 不从 Impeccable 仓库复制源码；可对照其 `skills.mjs` 路径意图（Apache-2.0）

---

*路径以 agentskills 生态与官方 agent 文档为准；冲突时优先官方文档，其次 Impeccable/skills CLI 共识。*

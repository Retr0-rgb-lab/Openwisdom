# Plan — Openwisdom CLI（2026-07-30）

权威 Specs：

- [17-CLI总控-SPE](../../specs/17-CLI总控-SPE.md)
- [18-CLI命令与UX](../../specs/18-CLI命令与UX.md)
- [19-CLI-providers与安装写入](../../specs/19-CLI-providers与安装写入.md)
- [20-CLI-monorepo-catalog-发布](../../specs/20-CLI-monorepo-catalog-发布.md)
- [06-热度与遥测](../../specs/06-热度与遥测.md)（F 波次）

## Waves

| Plan | Wave | Owner lane | 文件焦点 | 依赖 |
|------|------|------------|----------|------|
| [01-scaffold](./01-scaffold.md) | A | Lead | workspace · 四包骨架 · root scripts | — |
| [02-schema](./02-schema.md) | A | Schema | `packages/schema` | 01 |
| [03-skills-seed](./03-skills-seed.md) | B | Content | `skills/official/scenarios/*` | 01 |
| [04-providers](./04-providers.md) | D | Providers | `packages/providers` | 01 |
| [05-catalog](./05-catalog.md) | C | Catalog | `packages/catalog` · snapshot 路径 | 01+02+03 |
| [06-cli-core](./06-cli-core.md) | D/E | CLI | `packages/cli` 命令 + install 写入 | 01+02+04；catalog 可 snapshot 后接 |
| [07-telemetry-web](./07-telemetry-web.md) | F | CLI+Web | 遥测客户端 · 诚实文案开关 | 06 |
| [08-verify](./08-verify.md) | G- | Lead | build · e2e smoke · pack | 05+06 |

## 并行图

```text
        ┌──► 02-schema ────────┐
01 ─────┼──► 03-skills-seed ───┼──► 05-catalog ──┐
        └──► 04-providers ─────┴──► 06-cli-core ─┼──► 07 ──► 08
```

**规则：**

1. **01 必须先完成**（workspace 与空壳），否则并行会抢 `pnpm-workspace.yaml`。
2. **02 / 03 / 04 可并行**（目录互不重叠）。
3. **05 与 06 可部分并行**：06 可先写 install/providers 逻辑并用 fixture catalog；05 产出后 CLI 接真 snapshot。
4. **07 / 08 串行收尾**。
5. 子 agent **只改本 lane 路径**；禁止改其他 package 的源文件（可改本包 `package.json` dependencies）。
6. **不 commit**，除非用户另嘱；不 `npm publish`。
7. **无 `run` 命令、无 LLM 调用**。

## 全局约束（所有 lane）

| # | 约束 |
|---|------|
| 1 | Node ≥ 20 · TypeScript ESM |
| 2 | 公开包名 `openwisdom`；内部 `@openwisdom/schema` 等 private |
| 3 | 默认 install = recursive **copy**；冲突默认拒绝；`--force` 覆盖 |
| 4 | P0 providers: `claude` `cursor` `codex` `gemini` `github` `agents` |
| 5 | 命令：`search` `install` `update` `list` only |
| 6 | Web 广告：`npx openwisdom install [slug]`；slug = `macro-scan` 等 |
| 7 | Windows 路径用 `node:path` + `os.homedir()` |
| 8 | 热度不写 `SKILL.md`；遥测 fail-open |
| 9 | 中文路径仓库：`E:\学习软件\Openwisdom` — 测试勿假设 ASCII-only cwd |

## 验收（整批）

见 Spec 17 §12 与 [08-verify](./08-verify.md)。

## 状态

| Wave | Plan | 状态 |
|------|------|------|
| A | 01 scaffold | **Executed** |
| A | 02 schema | **Executed** |
| B | 03 skills-seed | **Executed** |
| D | 04 providers | **Executed** |
| C | 05 catalog | **Executed** |
| D/E | 06 cli-core | **Executed** |
| F | 07 telemetry-web | **Executed** (CLI client; web copy left honest / unchanged) |
| G- | 08 verify | **Executed** — see [VERIFY.md](./VERIFY.md) · [reports/07-08-report.md](./reports/07-08-report.md) |

*Last updated: 2026-07-30 — Plans 07+08 closed without commit / npm publish.*

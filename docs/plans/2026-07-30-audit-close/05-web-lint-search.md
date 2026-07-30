# Plan 05 — GlobalSearch lint 修复

**Lane:** Web lint · **审计：** web lint FAIL  
**独占：** **仅** `apps/web/src/components/site/GlobalSearch.tsx`  
**禁止改：** 任何其他文件（含 messages、SkillsCatalog）

## Goal

`pnpm --filter web lint` 对 GlobalSearch 的 error 清零（全 web lint 通过，若仅本文件 error 则全绿）。

## 问题

React Compiler / eslint：`setState` in `useEffect`（同步 setState 触发级联渲染警告）。常见两处：打开 palette 时 prefilling `q`、或同步 URL。

## Tasks

- [ ] 读 `GlobalSearch.tsx`，定位 eslint 报错行。  
- [ ] 修复策略（选最简正确）：  
  - 将「open 时预填」改为在 **事件处理**（打开 shortcut / 点击 trigger）里 setState；或  
  - 用 `key={qFromUrl}` 重置受控 input；或  
  - `queueMicrotask` / 合法模式满足规则且不破坏 ⌘K 预填 Spec 16  
- [ ] 保持：Ctrl/⌘K、空态 featured 3、搜索进 catalog、`/skills` 上合并 `q`。  
- [ ] Run: `pnpm --filter web lint`  
- [ ] 写 `reports/05-report.md`（含修复前后规则名）

## 验收

- [ ] lint exit 0（或仅剩无关 warning，无 error）  
- [ ] 不改动其他文件  

# SPE 34 — Education 学科并列（七科社科）

> **状态：** **APPROVED + DISTILLED（已蒸馏）** — 2026-08-04  
> **审批：** 2026-08-04（独立 code-backed 审批；nits 已并入本文）  
> **蒸馏：** 2026-08-04 — 契约已迁入 `docs/知识库/02` #22、`01`/`03`/`08`/`09`/`10`、`PRODUCT.md`、`DESIGN.md`、`AGENTS.md`、`docs/ops/fetch-skill/CRITERIA.md`；**之后以知识库 + PRODUCT/DESIGN 为准**，本文仅作执行清单/历史。  
> **来源：** 用户决策会话（grill）共享理解 v1  
> **冲突处理：** 用户当轮指令 > 知识库/PRODUCT（蒸馏后）> 本 SPE 历史正文 > 旧「仅五大社科」文案  
> **文档治理注：** 知识库 **06** 称 `docs/specs/` 已退役；蒸馏完成判定见 §14。

---

## 0. 一句话

将 **education（教育学）** 提升为与 psychology / sociology / history / political-science / economics / **philosophy** **同级** 的学科入口；产品叙事从「五大社科」/「六大学科」改为 **统称社科、固定七科**；第一版交付 **可浏览**（tab + Home + 存量 skill 双写），official education reference **分期**，不挡本版。

---

## 1. 目标 / 非目标

### 1.1 目标

| # | 目标 |
|---|------|
| G1 | Web Skills 筛选与 Home 学科区均为 **七科**，含 `education` |
| G2 | 对外文案 **统称社科**；七科 id 固定并列（见 §2） |
| G3 | 存量跨域 pedagogy / 学习科学 skill **双写** `disciplines` 含 `education`（见 §5） |
| G4 | education 芯片色登记 Overlay Atlas（见 §6） |
| G5 | `pnpm catalog:build` 后 CLI/MCP/core **catalog-snapshot** 与 Web registry 一致；`discipline=education` 可滤 |
| G6 | PRODUCT / 知识库相关文案与 UI 同构（至少 02 决策追加 + Home/Skills i18n；不得与七科 UI 矛盾） |

### 1.2 非目标（本 SPE / 第一版）

| # | 非目标 |
|---|--------|
| N1 | 本版交付 ≥3 张 **official** education **reference**（路线图，见 §3） |
| N2 | 本版交付 official education **scenario** 或原样迁入本机 `/teach` skill |
| N3 | 批量导入 Gareth `education-agent-skills` 剩余 ~150 skill |
| N4 | 应试/题库/教材同步、US/AU 课标教案工厂、LMS 全栈 |
| N5 | 修改 CLI/MCP **过滤实现**（本无学科枚举；见 §8）——**不**为本版强制改 CLI「query 必填」行为 |
| N6 | 将 history 与 education 合并为一个 tab |
| N7 | `social-stratification` 的 `disciplines` 增加 `education` |

---

## 2. 学科集合与命名

### 2.1 固定七科（id 稳定，排序建议）

| id | 中文显示名 | 英文显示名 | Home 短键（建议） |
|----|------------|------------|-------------------|
| `psychology` | 心理学 | Psychology | `psych` |
| `sociology` | 社会学 | Sociology | `socio` |
| `history` | 历史学 | History | `history` |
| `political-science` | 政治学 | Political Science | `poli` |
| `economics` | 经济学 | Economics | `econ` |
| `philosophy` | 哲学 | Philosophy | `philo` |
| `education` | **教育学** | **Education** | **`edu`** |

- **产品统称：** 社科（Social sciences — 广义并列七科，不在 UI 再拆「核心五 / 扩展二」）。  
- **同级：** 七科在筛选芯片、Home 学科区、文案列表中 **同级**；不得给 education 单独「扩展/New 次等」角标（除非未来全局活动标签策略）。  
- **排序：** 建议沿用上表顺序（五社科 → philosophy → education），与 `DISCIPLINE_IDS` / Home `DISCIPLINE_ORDER` 同构。

### 2.2 education 一行描述（Home / 学科卡）

| 语言 | desc |
|------|------|
| zh | 学习如何发生、如何被教、如何被结构塑造 |
| en | How learning happens, how it is taught, and how structures shape it |

### 2.3 边界（收录原则）

**纳入（教育学科默认内容）：**

- 学习科学（retrieval / spacing / interleaving / SRL / metacognition-in-learning 等）  
- 教育/学习 **分析**（非托管家教 SaaS）  
- **`/teach` 型** agent 教学会话范式：使命锚定、工作区状态、短课、ZPD、storage vs fluency、高信任资源（作为 **scenario 形态参考**；本版不强制迁入该 skill 全文）  
- 史科思维教法、苏格拉底引导等 **方法型** 教学 skill（可与其他学科双写）

**排除：**

- 高考/中考/题库/教材版本同步主导的 exam-prep  
- 区域课标硬依赖教案工厂  
- LMS 全栈运营工具  
- 仅因正文出现「教育」一词（如分层轴）就升 `disciplines: education`

---

## 3. 分层与 official 分期

| 概念 | 含义 |
|------|------|
| `layer: reference` | 理论卡：定义、边界、误用；供 scenario 引用 |
| `layer: scenario` | 工作流：步骤与输出结构 |
| `scope: official` | 项目品牌背书 |
| `scope: community` | 社区/外源 curation |

**官方 reference 策略（grilling 选项 B）：**

- **第一版不阻塞：** 无 official education reference 亦可上七科 UI。  
- **路线图：** education **≥3** 张 official reference；philosophy 若仍无 official reference，列入同一补齐清单（避免「名义同级、官方深度长期为零」）。  
- 候选主题（非本版验收）：学习科学核心构念、形成性评价/评价素养、ZPD·教学会话或教育与社会结构（分析卡，非教案生成器）。

**文案诚实（必做，与 N1 配套）：**

- 不得宣称「七科均有 official reference 深度」除非属实。  
- 当前实态（审批时）：official reference 仍为五张学科卡量级；philosophy / education **均无** official reference。  
- Home `disciplines.subtitle` 等「每个学科都有 reference… / no empty taxonomy」类措辞须在本版 **改写** 为诚实表述（见 §9、§11）。

---

## 4. UI / IA 变更

### 4.1 Web（必须）

| 区域 | 变更 |
|------|------|
| `DisciplineId` / `DISCIPLINE_IDS` | 增加 `education` |
| `DISCIPLINE_SET`（`load-registry.ts`） | 增加 `education`；**未知 id 不得静默丢弃** education（否则 dual-write 后 Web 滤空） |
| `parseDisciplineParam`（`catalog/index.ts`） | allowlist 增加 `education`（URL `?discipline=education`） |
| `DISCIPLINE_HOME_TO_ID` + Home `DISCIPLINE_ORDER` / `DISCIPLINE_COLORS` | 增加 `edu` → `education` 与色 token |
| Skills 筛选 tab | **第 7 芯片** `education`（`SkillsCatalog` 走 `DISCIPLINE_IDS`） |
| Home 学科区 | **七科全上**，与筛选同构；文案「六大学科」/「Six disciplines」→「七大学科」/「Seven disciplines」类 |
| i18n | `messages/{zh,en}/skills.json` + `home.json`；顺带扫 `pages.json` 贡献/authoring 中仍列五科的 disciplines 示例 |
| 样式 | `disciplineStyles.ts` + `globals.css` token（见 §6） |
| Registry loader | 与 `DISCIPLINE_SET` 一致，允许 catalog 中 `education` |

### 4.2 非 Web

| 表面 | 变更 |
|------|------|
| CLI | **无**学科枚举代码改动；catalog 更新后可用 discipline 过滤 |
| MCP | 同；tool 描述可举例 `education`（文档级） |
| schema | 已是 `z.array(z.string())`，**无需**为 education 加 enum |

### 4.3 审批时 code 事实（基线，供实现 diff）

| 项 | 事实 |
|----|------|
| Web `DisciplineId` | 现为 **六科**：psychology … philosophy（**无** education） |
| `DISCIPLINE_SET` / `parseDisciplineParam` | 与上同构六科 allowlist |
| Home | `DISCIPLINE_ORDER` 六键；`home.json` title =「六大学科」/「Six disciplines」 |
| DESIGN.md 学科 chip 表 | 仍列 **五** 色（缺 philosophy 与 education；philosophy 色已在 CSS：`#5E6A4E`） |
| schema `disciplines` | free `string[]`（`packages/schema`） |
| core search | `discipline` 任意字符串，大小写不敏感精确匹配 disciplines 字段 |
| CLI `search` | 需要 **query 或 tag**；仅 `--discipline education` 会 usage exit（**非**枚举拒绝） |
| MCP `openwisdom_search` / list | query 可空，仅 `discipline` 可滤 |
| catalog 中 `education` | 审批时多出现在 **tags**（history pedagogy / SRL），**disciplines 尚未** 双写 |
| AGENTS.md | 仍写五学科列表（滞后于已上线的 philosophy UI） |

---

## 5. 存量 skill 双写（第一版内容）

### 5.1 规则

- Tab **独立**；跨域 skill 的 `disciplines` **多值双写**（项目既有模式，如 `prospect-theory`）。  
- 双写 = 在现有 disciplines **追加** `education`，不删除原学科。  
- 真相路径：`skills/community/scenarios/<id>/SKILL.md`（§5.2 全部 17 条已存在于仓库，审批时已核对）。

### 5.2 必须双写（17）

**Historical thinking（10）** — 现 `history` → `history` + `education`（多数已有 tag `education`，**disciplines 仍仅 history**）：

1. `central-historical-question-evaluator`  
2. `close-reading-skill-builder`  
3. `contextualisation-skill-builder`  
4. `corroboration-skill-builder`  
5. `document-based-lesson-designer`  
6. `historical-document-set-curator`  
7. `historical-source-adapter`  
8. `historical-thinking-assessment-designer`  
9. `historical-thinking-strategy-modelling-guide`  
10. `sourcing-skill-builder`  

**SRL / learning science（5）** — 现 `psychology` → `psychology` + `education`（多数已有 tag `education`）：

11. `error-analysis-protocol`  
12. `goal-setting-protocol-designer`  
13. `metacognitive-prompt-library`  
14. `self-regulation-scaffold-generator`  
15. `study-strategy-selector` — 另 **补 tag** `education`（审批时 tags 为 metacognition / learning-science / self-regulated-learning 等，**无** `education`）

**Socratic 教学（2）** — 原 disciplines 保留并 + `education`：

16. `socrates` — 现 `psychology` + `philosophy`  
17. `socratic-method-skill` — 现 `philosophy` + `psychology`  

### 5.3 明确不双写

| Skill | 原因 |
|-------|------|
| `social-stratification` | 审批时 `disciplines: [sociology]`；tag `education` 表示分层 **轴**，非教育学方法入口；**保持 sociology only** |
| `metacognition-audit` 等 orientation | 成人推理审计，非教育学科默认内容 |
| `learning-from-outcomes` | 决策科学，名字撞车 |
| `socratic-clarify` | 需求门，非教学 |

### 5.4 实施位置

- 真相：`skills/**/SKILL.md` frontmatter（§5.2 均在 `skills/community/scenarios/`）  
- 同步：`pnpm catalog:build` → packages catalog/cli/core/mcp snapshots + `apps/web/public/registry`  
- 镜像树（skills-snapshot 等）随 build 管线更新（**不得**手改与 `skills/` 长期分叉）

---

## 6. 视觉

| Token | 值 | 用途 |
|-------|-----|------|
| education 芯片色 | `#3D7A6A`（生长绿系） | border 或 ~10% fill，规则同其他学科芯片 |
| CSS 建议名 | `--ow-education` / `var(--ow-education)` | `globals.css` + Tailwind/shadcn 桥接若需要 |
| 登记 | `DESIGN.md` Discipline chips 表 + `globals.css` / `disciplineStyles.ts` / Home `DISCIPLINE_COLORS` | 禁止亮紫、铜主色 |

Philosophy 若 DESIGN 表仍缺独立色：实现时可 **顺带** 把已在 CSS 的 philosophy `#5E6A4E` 登记进 DESIGN（本 SPE **不强制**改 philosophy 色值）；**仅新增 education 为硬性**。

---

## 7. 文档与决策落库（与实现同波或紧随）

| 文件 | 动作 |
|------|------|
| `PRODUCT.md` | 「五学科 official reference」类表述改为：统称社科 **七科入口**；official reference 深度诚实（仍五卡量级 + 分期）；非目标不改 agent-native |
| `docs/知识库/02` | **追加**决策 #（education 并列、统称社科、第一版 B、双写规则、分期 official、色 `#3D7A6A`） |
| `docs/知识库/01` / `03` | 学科列表与「五大学科 reference」验收句对齐（区分 **UI 七科** vs **official reference 深度**） |
| `docs/知识库/08` / `09` / `10` | IA、色板、`DisciplineId`（含 philosophy + education）、catalog 筛选契约；**10 现仍写五科类型，已滞后** |
| `DESIGN.md` | education 芯片色；建议补 philosophy 色行 |
| `AGENTS.md` | Disciplines 列表含 philosophy + education（现仍五科） |
| `docs/ops/fetch-skill/CRITERIA.md` | fit 域含 education / philosophy（学习科学/教法分析；仍拒 exam-prep） |

审批通过后：**知识库为长期权威**；本 SPE 可标「已蒸馏」或保留作执行清单。

---

## 8. CLI / MCP / core

| 项 | 要求 |
|----|------|
| 搜索过滤 | 已支持任意 discipline 字符串；**无代码枚举变更义务** |
| Catalog | 重建后 snapshot 含双写 `disciplines` 字段 |
| CLI 验收 | 因 CLI 现要求 query **或** tag，推荐：`openwisdom search education --discipline education` 或 `openwisdom search --tag education --discipline education`；期望命中 ≥1（双写后 ≈17 中大量可命中；limit 默认 20） |
| MCP 验收 | `openwisdom_search({ discipline: "education" })` 或 list `discipline=education`（query 可空）命中 ≥1 |
| 远程 registry | 若生产依赖 Web `/registry`，部署含新 catalog 后远程用户可见（与 registry 发布流程一致） |

**不**要求本版修改 CLI「无 query 时仅 discipline 也可用」；那是可选 UX，超出 grilling 锁定范围。

---

## 9. 验收清单（第一版 B）

- [ ] `DisciplineId`、`DISCIPLINE_IDS`、`DISCIPLINE_SET`、`parseDisciplineParam`、`DISCIPLINE_HOME_TO_ID` 均含 `education`（Home 短键 `edu`）  
- [ ] Skills 筛选 tab 含 `education`（zh「教育学」/ en「Education」）  
- [ ] Home 学科区七科；无「六大学科」/「Six disciplines」过期文案  
- [ ] Home/Skills 相关 subtitle **不**虚假宣称 education（及 philosophy）已有 official reference 深度  
- [ ] 芯片色 `#3D7A6A` 已接线（CSS + `disciplineStyles` + Home colors）  
- [ ] §5.2 共 17 skill frontmatter `disciplines` 含 `education`；`study-strategy-selector` 另含 tag `education`  
- [ ] `social-stratification` 的 disciplines **不含** `education`（tag `education` 可保留）  
- [ ] `pnpm catalog:build` 后 core/cli/mcp catalog-snapshot 与 web registry 一致  
- [ ] MCP `discipline=education` 有命中；CLI 用 §8 推荐命令有命中  
- [ ] PRODUCT + 知识库 **02** 至少已追加决策（全文 01/03/08/09/10/AGENTS/DESIGN/CRITERIA 可同 PR 或紧随 follow-up，但不得与 UI 矛盾）  
- [ ] 本版 **不**要求 official education reference 文件存在  

---

## 10. 实现入口（建议路径）

| 区域 | 路径 |
|------|------|
| 学科类型 / allowlist | `apps/web/src/data/catalog/types.ts`、`load-registry.ts`、`index.ts`（`parseDisciplineParam`） |
| Skills 筛选 | `apps/web/src/components/skills/SkillsCatalog.tsx` |
| 学科样式 | `apps/web/src/components/skills/disciplineStyles.ts`、`apps/web/src/app/globals.css`、`DESIGN.md` |
| Home 网格 | `apps/web/src/components/home/disciplines.ts`、`DisciplineGrid.tsx` |
| i18n | `apps/web/src/messages/{zh,en}/home.json`、`skills.json`；检查 `pages.json` 五科示例 |
| Skills 真相 | `skills/community/scenarios/<id>/SKILL.md`（§5.2） |
| Catalog | `packages/catalog` → `pnpm catalog:build` |
| schema | `packages/schema`（**无** enum 变更） |
| CLI / core / MCP | 仅 snapshot + 可选文档举例；无过滤 enum |
| 产品文案 | `PRODUCT.md`、`docs/知识库/02` 等（§7） |

---

## 11. 风险与许可

| 风险 | 缓解 |
|------|------|
| 空壳 taxonomy（无 official ref） | 文案不宣称「每科均有 official reference 深度」；路线图 §3；Home subtitle 改写为「收录 skill / 可筛选入口」而非虚假 official 深度 |
| philosophy 与 education 双不对称 | 路线图同清单补 official reference；UI 同级不表示 official 深度同级 |
| Web allowlist 漏改 | 若只双写 frontmatter 不改 `DISCIPLINE_SET`，registry loader 会 **静默丢弃** education → tab 空；§4.1 / §9 强制同 PR |
| snapshot 漂移 | 只经 `catalog:build`；不手改 snapshot 与 skills 分叉 |
| CC-BY-SA 存量 | 双写仅改 frontmatter disciplines/tags；不改变 license/provenance |
| 与 Gareth/Hermes 心智撞车 | 边界 §2.3 + 非目标 N3–N4 |
| specs vs 知识库双源 | §0 + §14 蒸馏；知识库 06 仍以知识库为权威 |
| 「六大学科」残留 | Home title 必改；全库 grep 五/六大学科、five/six disciplines |

---

## 12. 修订日志

| 日期 | 说明 |
|------|------|
| 2026-08-04 | DRAFT：grill 共享理解落盘 SPE 34，待独立 agent 审批 |
| 2026-08-04 | **APPROVED**：code-backed 独立审批；修正 CLI 验收命令、allowlist 路径、Home 诚实文案、基线事实与蒸馏清单 |
| 2026-08-04 | **DISTILLED（已蒸馏）**：§7/§14 契约写入知识库 01/02#22/03/08/09/10 + PRODUCT + DESIGN（已有色）+ AGENTS + CRITERIA；权威迁出 specs |

---

## 13. Review notes

### Verdict

**APPROVED**（2026-08-04）— grilling 锁定决策可实施；无阻断性产品回退。Nits 已并入正文，无需再开 CHANGES_REQUIRED 轮次。

### Code-backed checks（摘要）

| 检查项 | 结果 |
|--------|------|
| Web `DisciplineId` 集合 | 六科，无 education → SPE 变更必要且完整 |
| schema disciplines | free `string[]` → N5/schema 无 enum 正确 |
| CLI/MCP discipline 过滤 | free string；CLI 需 query/tag，MCP 可仅 discipline → 原验收句已修正 |
| §5.2 十七路径 | 均在 `skills/community/scenarios/<id>/SKILL.md` |
| 双写前 frontmatter | history×10 仅 history；SRL×5 仅 psychology；socrates / socratic-method-skill 为 psych+philo；`study-strategy-selector` 缺 tag education |
| `social-stratification` | `disciplines: [sociology]`，tag 含 education → N7 正确 |
| PRODUCT / 知识库 / AGENTS | 仍「五学科」叙事为主；Home 已是「六大学科」（含 philosophy）→ 本版需统一到七科 + 诚实 official 深度 |
| DESIGN 学科色表 | 五色；philosophy 仅在 CSS/Home；education 待加 `#3D7A6A` |
| docs/specs 退役 | SPE §0 已声明执行规格 + 蒸馏义务；残余双源风险靠 §14 |

### Nits applied in this approval edit

1. CLI 验收命令与真实 usage 对齐（query/tag 要求）。  
2. 补全 Web allowlist 路径：`parseDisciplineParam`、`DISCIPLINE_HOME_TO_ID`、`edu` 短键。  
3. 验收增加 Home subtitle **诚实**要求（空壳 taxonomy）。  
4. 记录审批时基线（tags 已有 education、disciplines 未双写等）。  
5. 实现入口与文档落库列表对齐滞后文件（知识库 10、AGENTS、CRITERIA）。  
6. 新增 §13 / §14。

### Residual risks（不阻断批准）

1. **Official 深度不对称**：education + philosophy 长期无 official reference 会削弱「图书馆骨架」叙事；依赖路线图与文案诚实。  
2. **蒸馏延迟**：若 UI 先于知识库/PRODUCT 更新，agent 仍读「五学科」会误导后续 PR。  
3. **远程 registry**：本地 snapshot 与生产 `/registry` 部署不同步时，CLI 远程用户暂时滤不到 education。  
4. **`pages.json` / 贡献文案** 五科示例易漏扫。  
5. **specs 路径**：本 SPE 住在已退役树；未蒸馏前存在第二权威风险。

---

## 14. Distillation checklist

实现（或同波 follow-up）完成后，将契约迁出本 SPE，避免 specs/知识库双源：

| 目标 | 写入内容 |
|------|----------|
| `docs/知识库/02-产品决策记录.md` | 新决策行：education 与六科同级；统称社科七科；phase B（可浏览 + 双写，无强制 official ref）；双写 17 排除 stratification；色 `#3D7A6A`；命名 教育学/Education |
| `docs/知识库/08-页面IA与路由.md` | Home 学科区七科；Skills 筛选七芯片；短键 `edu`；去掉「五学科枢纽」过时句（若仍引用） |
| `docs/知识库/09-视觉与动效.md` | 学科 chip 表 + education `#3D7A6A`；建议补 philosophy `#5E6A4E` |
| `docs/知识库/10-Skills-Web与数据契约.md` | `DisciplineId` 七元组；Home 映射含 `edu`；说明 free-string catalog vs Web allowlist |
| `PRODUCT.md` | 七科入口 + official reference 诚实表述（勿写「七科均有 official depth」） |
| `DESIGN.md` | education（+ 建议 philosophy）芯片色 |
| `docs/知识库/01` / `03` | 学科覆盖列表；v1「五学科 official reference」改为「五张 official 学科卡 + 七科 UI 入口」或等价诚实句 |
| `AGENTS.md` | Disciplines 列表 |
| `docs/ops/fetch-skill/CRITERIA.md` | fit 域含 education（及 philosophy） |
| 本 SPE | 标「已蒸馏」+ 日期；之后以知识库为准 |

**蒸馏完成判定：** 知识库 02 有决策条目；10 的 `DisciplineId` 含 education；PRODUCT/DESIGN 不与七科 UI 矛盾；全库无「仅五科且含 philosophy UI」的自相矛盾权威句。

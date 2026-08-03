# Orientation 交接层（Handoff）

> 蒸馏自原 Spec 33；产品决策 **D1** 见 [02](./02-产品决策记录.md) §18。  
> **给实现者：** 内容 + schema/core/CLI/MCP 发现面；**永不**包管理器内 run 分析。

---

## 1. 问题定义

| 缺口 | 含义 | 现有 Official 覆盖 |
|------|------|-------------------|
| **Recognition → Responsibility** | 认出模式 ≠ 该做什么；需认领/拒绝/移交 | 部分 next steps；**缺**显式所有权合同 |
| **Scope of responsibility** | 个人/组织/公共机构不可揉成一团 | macro 有 actors；**缺** mandate/level 矩阵 |
| **Closure** | 分析何时够停；防半截循环 | meta 有 commit/wait；**缺** session 级 ship/pause/abandon |

**产品边界：**

- CLI / MCP **只做包管理**，禁止 `run` / analyze / 托管会话  
- 分析与责任判断只在用户 Agent + `SKILL.md`  
- 声音 = orientation / 可检验方法；禁止人生教练、政策代决、道德审判产品化  

**诊断：** 主战场是 **skill 内容 + 发现/安装**，不是新分析引擎。

---

## 2. 目标与非目标

### 目标

1. 「看清了」→「谁认领什么 / 何时停」有可安装、可组合的官方方法  
2. 不重写、不吞并现有三场景（orientation core）  
3. CLI/MCP 能发现标签、按组合安装、读到 pipeline 元数据；**不**强制执行顺序  
4. 网站 / Docs 同一叙事：核心三场景 + 交接层  

### 非目标

| 禁止 | 原因 |
|------|------|
| `openwisdom_run` / analyze / 教练工具 | 硬规则 |
| CLI doctor / suggest / MCP recommend（本范围） | 工具膨胀 |
| `references[]` 当场景流水线边 | 与理论依赖冲突 |
| 强制 Agent 按 pipeline 执行 | 装包 ≠ 调用 |
| 「Responsibility」道德意识形态品牌 | 须可辩护为 agency/mandate **分析** |

---

## 3. 决策 D1（已拍板）

| 层 | Skills | 品牌 |
|----|--------|------|
| **Orientation core** | `macro-scan` · `personal-anchor` · `metacognition-audit` | Home 主叙事 |
| **Handoff** | `responsibility-scope` · `responsibility-bridge` · `analysis-closure` | 第二行 / tag `orientation-pipeline`；非「六大英雄」 |

备选未选：D2 零新官方；D3 六场景品牌重写。  
资源紧 MVP 序：`analysis-closure` + `responsibility-scope` 优先，bridge 次之。

---

## 4. 内容层

### 4.1 Phase A — 加深现有 triad（必做）

| Skill | 增补（短小、非重写） |
|-------|----------------------|
| `macro-scan` | 可选 Agency/scope 表（谁 *能* 行动 / 谁 *声称* / 谁受约束 — **描述性**）；高影响建议接 handoff 或 meta |
| `personal-anchor` | 强化 Next steps 可观察性；多级责任模糊 → handoff/scope |
| `metacognition-audit` | 强化 Commit/wait + 重开条件；会话冻结 → `analysis-closure` |

**验收：** 只装三场景时正文已有「停 / 小步行动 / 勿层级塌缩」提示；无新 schema。

### 4.2 Phase B — 三 Handoff 官方 scenario

#### `responsibility-bridge`

| 项 | 值 |
|----|-----|
| layer / scope | scenario · official |
| description | Turn structured recognition into explicit ownership: hold / refuse / share / escalate |
| disciplines | psychology, sociology, political-science |
| tags | responsibility, ownership, agency, handoff, orientation-pipeline |
| references | `social-stratification`, `collective-action` |
| When | 已有识别产物；卡在「看清了」；全责自责 ↔ 结构宿命 |
| When-not | 尚无结构 → 先 triad；治疗/法律归责；表演性道德宣誓 |
| Owns | Own / Share / Delegate / Refuse / Unknown + 可观察承诺 |
| Must not | 从零重画 macro 图 |
| Steps | (1) 导入 recognition，标 fact/interpretation/value/guess (2) 负荷分区 (3) 所有权合同 + 失败模式 |
| Output | Recognition import · Load partition · Ownership contract · Share/escalate · Failure modes · Next |

#### `responsibility-scope`

| 项 | 值 |
|----|-----|
| layer / scope | scenario · official |
| description | Sort duty/control across individual, organizational, institutional levels |
| disciplines | political-science, sociology, economics |
| tags | responsibility, scope, mandate, institution, organization, orientation-pipeline |
| references | `collective-action`, `path-dependence` |
| When | 「我该/组织该/国家该」混写；制度失败个人化或个人搭便车制度化 |
| When-not | 结构未明 → macro-scan；纯个人坐标 → personal-anchor |
| Owns | Level matrix + mis-level 诊断 + 主干预层级 |
| Must not | 完整系统轨迹图；人生曲线定位 |
| 矩阵列 | decide / act / resource / veto / free-ride / lock-in / evidence |

正文可用「责任域 / Scope of agency」；**禁止**道德训诫口吻。

#### `analysis-closure`

| 项 | 值 |
|----|-----|
| layer / scope | scenario · official |
| description | End a run with ship / pause / abandon; freeze open questions & revisit triggers |
| disciplines | psychology |
| tags | closure, stop, orientation-pipeline, decision, roi |
| references | `confirmation-bias`, `prospect-theory` |
| When | 边际洞察≈0；多 skill 收尾；截止期；用分析回避行动 |
| When-not | 高影响未审 → 先 metacognition-audit；无触发无限重开 |
| Owns | Ship/Pause/Abandon + 冻结包 + 非重开规则 |
| Must not | 新偏见百科；新 macro 理论；「闭合=真理」 |

### 4.3 组合图

```text
macro-scan ──► personal-anchor? ──► metacognition-audit?
        │                │                    │
        └──────── recognition artifact ───────┘
                         │
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
 responsibility-scope  responsibility-bridge
           │             │
           └──────┬──────┘
                  ▼
           analysis-closure
```

- 允许捷径：已有地图可直接 scope/bridge；仅需停机可只跑 closure  
- **不要**第七个 orchestrator 自动串跑全部  

### 4.4 非重叠矩阵

| Skill | 拥有 | 禁止侵占 |
|-------|------|----------|
| macro-scan | 结构图 | 所有权合同；会话停机包 |
| personal-anchor | 坐标与可动空间 | mandate 矩阵；道德负荷分区 |
| metacognition-audit | 主张/偏见质量 | 社会义务分层；pipeline 冻结包 |
| responsibility-bridge | 认领/拒绝给定 recognition | 从零重建行动者激励图 |
| responsibility-scope | 层级义务/控制矩阵 | 人生曲线；完整情景树 |
| analysis-closure | 停机模式与冻结 | 新理论生产 |

### 4.5 可选 Phase-2 references（非阻塞）

`principal-agent` · `subsidiarity` · `moral-luck` — 仅当矩阵语言过薄时。

---

## 5. Catalog / Schema / Core 表面

### 原则

- 字段与 bundle 进 schema + catalog build + core；CLI/MCP 只适配  
- **可选加法：** 旧 catalog 无新字段仍可 parse  
- **禁止** CLI 硬编码 bundle 列表  

### Skill 行

```ts
pipeline?: {
  id: string;      // kebab，如 orientation-handoff
  order: number;   // 1-based，同 pipeline 内唯一
  next?: string;   // 可选单向前链
}
```

### Catalog 根

```ts
bundles?: Array<{
  id: string;
  title: string;
  description: string;
  skillIds: string[];   // 有序 = 管线顺序真源；必须 ∈ skills[]
}>
```

- `references[]` **仅**理论依赖  
- 热度仍按 **单 skill install**  

### Core API

| API | 行为 |
|-----|------|
| `searchCatalog` | **精确 tag** 过滤（任 tag 命中）；保留自由文本对 tags 加分 |
| `resolveBundle(id)` | → 有序 skillIds |
| `install` | 解析 `bundle` ∪ 显式 ids → 再 `expandWithDeps(references)` |

### 首个官方 bundle

```json
{
  "id": "orientation-handoff",
  "title": "Orientation handoff",
  "description": "After seeing structure or self-location: sort agency levels, form ownership, then close the run.",
  "skillIds": [
    "responsibility-scope",
    "responsibility-bridge",
    "analysis-closure"
  ]
}
```

- **用户安装序：** scope → bridge → closure  
- **内容写作序：** 1 closure 2 scope 3 bridge 4 triad 交叉链 5 catalog build  

---

## 6. CLI / MCP

| 支持 | 不做 |
|------|------|
| CLI `search --tag orientation-pipeline` | doctor / suggest |
| CLI `install --bundle=orientation-handoff` | pipeline 运行时二进制 |
| MCP search/list `tag?` | 第 7 工具 recommend/run |
| 卡片 `pipeline?` + tags | 强制安装完整性 / 执行图 |

**Agent 算法（写入 tool description）：**

```text
1. search/list tag=orientation-pipeline (或 resolve bundle)
2. list mode=installed
3. client: bundle.skillIds \ installed → missing by pipeline.order
4. get → install(skills: [...])
5. Analysis runs in the agent session — not via MCP
```

---

## 7. Web / Docs / i18n

| 项 | 要求 |
|----|------|
| Home / Docs | 「Orientation core（3）+ Handoff（3）」；组合在用户 Agent |
| Skills 目录 | triad featured 主行；handoff 第二区或 tag |
| AI install prompts | 可提 handoff ids / bundle；**勿**暗示 MCP 跑分析 |
| 文案 | zh/en UI；skill 正文随贡献者 |

---

## 8. 实现波次

| 波次 | 工作 |
|------|------|
| **W0** | 决策日志 D1（**已完成** · 知识库 02） |
| **W1** | Phase A 三场景正文补丁 + Docs 路径段 |
| **W2** | schema pipeline + bundles；catalog build 校验 |
| **W3** | core tag filter + resolveBundle + install |
| **W4** | 三 skill 正文 + triad 交叉链 |
| **W5** | CLI `--tag`/`--bundle`；MCP tag + card.pipeline |
| **W6** | `pnpm catalog:sync-web`；测试；npm 补丁发版 |
| **Defer** | recommend/doctor；Phase-2 refs；Web 专用 bundle 花活 |

W4 不得晚于「对外宣称 handoff 已官方交付」。

---

## 9. 验收

### 内容（D1）

- [ ] `skills/official/scenarios/{responsibility-bridge,responsibility-scope,analysis-closure}/SKILL.md`  
- [ ] frontmatter 过 schema；When / When-not / Steps / Output / Bias / Notes  
- [ ] 非重叠与交叉链接符合 §4.3–4.4  
- [ ] triad 含 Phase A 交接提示  

### PM 表面

- [ ] `search --tag orientation-pipeline`（或 MCP 等价）返回 handoff 三 skill  
- [ ] `install --bundle=orientation-handoff` 写入三目录（+ refs 除非 no-deps）  
- [ ] MCP **无** run/recommend/analyze  
- [ ] 卡片含 tags + 可选 pipeline  
- [ ] 离线 snapshot 与 web registry 一致  

### 产品诚实

- [ ] Docs：bundle **不运行**分析  
- [ ] 无「我们替你完成责任闭环」话术  
- [ ] 知识库 02 已记录 D1  

---

## 10. 开放问题

1. Bundle 安装序是否固定 scope→bridge→closure（可只改 docs）  
2. Handoff 进 Home 主栅格还是仅 pipeline 区  
3. （若曾走 D2）community 试用多久 promote official  

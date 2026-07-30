# 对标 Impeccable 与体验标准

## 对标对象

- 网站：https://impeccable.style/  
- CLI / 安装体验：`npx impeccable skills install`（及文档中的多 harness 安装叙事）  
- 定位参照：面向 AI coding agents 的**可安装技能产品** + **高完成度营销官网**

Openwisdom **对标的是成熟度与安装体验范式**，不是业务领域（Impeccable = 设计反 slop；Openwisdom = 社科分析与元认知）。

---

## Impeccable 值得借鉴的点

| 维度 | Impeccable 做法 | Openwisdom 应吸收 |
|------|-----------------|-------------------|
| 定位句 | 一句话讲清「给 agent 的设计词汇」 | 一句话讲清「社科 skills + 宏观分析 / 锚点 / 元认知」 |
| 安装路径 | 首页置顶 `npx … install`，多种安装并列说明 | CLI 一命令为主；GitHub / 网页下载为辅 |
| Harness 覆盖 | 多 logo、多 provider 路径、交互选择 | 同等「几乎所有主流 coding agent」承诺与交互安装 |
| 能力展示 | 命令语言、前后对比、可感知演示 | 三大场景 skill 的流程/输出示意（非必须 live LLM） |
| 文档成套 | Getting started、docs、changelog、FAQ | v1 至少：入门、skill 规范、FAQ、changelog 入口 |
| 信任 | 案例、引用、清晰 license | 开源徽章、official/community、贡献透明 |
| 视觉完成度 | 强排版、节奏、细节、非模板感 | 「艺术风格优秀」的硬标准 |

---

## Openwisdom 与 Impeccable 的关键差异

| | Impeccable | Openwisdom |
|--|------------|------------|
| 内容结构 | 偏「单一 skill 产品 + 多命令」 | **多 skill 目录** + 场景/reference 分层 + 社区增长 |
| 官网中枢 | 产品叙事与命令演示 | **叙事落地页 + Skills 目录双心智（决策 C）** |
| 社区 | 生态与插件，核心内容较中心化 | **official / community** 双轨，PR 贡献为一等公民 |
| 运行时 | 另有 detect 等不依赖 LLM 的 CLI 能力 | v1 CLI **仅包管理**，分析在用户 Agent 内 |
| 语言 | 以英文产品为主 | **站点中英**；内容语言随贡献者 |
| 主题气质 | 设计工具、反 AI slop、锋利营销 | 智慧、历史纵深、思辨；避免廉价「紫色渐变 AI 站」 |

---

## 网页体验标准（「成熟」的可操作定义）

### 骨架（IA）

1. 落地叙事页：价值 → 安装 → 场景能力 → 兼容 harness → 导入目录/贡献  
2. Skills 全目录：可筛、可搜  
3. 详情页：元数据 + 说明 + 安装/下载  
4. 贡献页、Docs、GitHub、语言切换常驻可达  
5. 404 / 空结果 / 无障碍基础态齐全  

### 功能

- 筛选：scenario | reference；学科；语言；official | community  
- 搜索：标题与摘要（标签加权更佳）  
- 安装命令复制、文件下载  
- 中英 UI 文案完整（勿中英混杂半截）  
- 与仓库内容一致的同步机制（避免官网与 GitHub 长期漂移）  

### 艺术风格

- 有统一的字体层级、间距尺度、色彩系统、组件状态  
- 首页有记忆点（并非堆功能列表）  
- 动效克制且有意义（滚动、焦点、微交互），不为动而动  
- 社科主题的视觉隐喻可原创（书页、坐标、锚点、河流/地层等方向仅作灵感，实现前再定设计系统）  
- **禁止**未审视的「AI SaaS 默认皮」：泛紫渐变、无处不在的 glow、空洞 hero 文案  

### 对标验收主观题

> 把官网和 impeccable.style 并排：信息密度与精致度是否同属「会认真做产品官网」的一档？  
> 若否，则「艺术风格优秀 / 网页成熟」未达标。

---

## CLI 体验标准（对齐 Impeccable 安装范式）

- 交互安装：检测 → 展示可选 agents → 用户多选 → 写入对应 skills 目录  
- 非交互：`--providers`、`--scope`、`-y` 等（具体 flag 实现时定）  
- 成功输出：装到了哪里、下一步在 Agent 里如何调用  
- 失败可诊断：权限、路径、未知 provider  
- 更新路径清晰，避免静默损坏用户已有 skills  

---

## 明确不对标 / 不照搬的部分

- Impeccable 的 live browser 设计迭代、Worlds/dice、Pro 订阅叙事  
- 设计 detector / hooks 反 slop 体系（除非未来另立项目）  
- 其视觉皮肤与文案语气的直接复制  
- 「单 skill 23 commands」的信息架构（我们是多 skill 图书馆 + 场景流程）  

---

## 参考链接

- https://impeccable.style/  
- https://www.npmjs.com/package/impeccable  
- 本地决策：`02-产品决策记录.md` 第 4、9、10 条  

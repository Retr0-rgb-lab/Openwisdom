import type { CatalogEntry } from "./types";

/**
 * Bootstrap catalog — Spec 15.
 * Labeled synthetic seed aligned with Home three scenarios.
 * Replace when skills/** + packages/catalog land. No fake install heat.
 */
export const BOOTSTRAP_CATALOG: CatalogEntry[] = [
  {
    id: "macro-scan",
    slug: "macro-scan",
    layer: "scenario",
    scope: "official",
    disciplines: ["political-science", "economics", "sociology"],
    language: "zh",
    title: {
      zh: "宏观扫描",
      en: "Macro Scan",
    },
    summary: {
      zh: "把一个局势、行业或系统拆成结构：行动者、激励、约束与趋势。",
      en: "Break a situation, an industry, or a system into structure: actors, incentives, constraints, and trajectories.",
    },
    tags: ["macro", "structure", "systems"],
    version: "0.1.0",
    updated: "2026-07-30",
    repoPath: "skills/official/scenarios/macro-scan",
    install: { cli: "npx openwisdom install macro-scan" },
    source: "bootstrap",
    provenance: "official",
    featuredRank: 1,
    shape: "circle",
    axis: { zh: "整体视角", en: "Whole" },
    when: {
      zh: "面对复杂局面，需要先看清全貌再做判断时。",
      en: "When a complex situation demands seeing the whole board before judging.",
    },
    steps: [
      {
        zh: "界定局势边界与时间尺度",
        en: "Bound the situation and time horizon",
      },
      {
        zh: "识别行动者、激励与约束",
        en: "Map actors, incentives, and constraints",
      },
      {
        zh: "输出可检验的结构与趋势图",
        en: "Ship a checkable structure and trajectory",
      },
    ],
    references: ["path-dependence", "collective-action"],
  },
  {
    id: "personal-anchor",
    slug: "personal-anchor",
    layer: "scenario",
    scope: "official",
    disciplines: ["history", "sociology"],
    language: "zh",
    title: {
      zh: "个人锚点",
      en: "Personal Anchor",
    },
    summary: {
      zh: "把个人处境放进历史与社会的坐标：你在哪条曲线上，脚下是哪一层。",
      en: "Place your situation on historical and social coordinates: which curve you are on, which stratum you stand on.",
    },
    tags: ["anchor", "history", "orientation"],
    version: "0.1.0",
    updated: "2026-07-30",
    repoPath: "skills/official/scenarios/personal-anchor",
    install: { cli: "npx openwisdom install personal-anchor" },
    source: "bootstrap",
    provenance: "official",
    featuredRank: 2,
    shape: "triangle",
    axis: { zh: "个体视角", en: "Individual" },
    when: {
      zh: "做长期选择——职业、城市、方向——想知道自己身处何处时。",
      en: "For long-horizon choices — career, city, direction — when you need to know where you stand.",
    },
    steps: [
      {
        zh: "写下当下的选择与约束",
        en: "Name the choice and its constraints",
      },
      {
        zh: "定位历史层与社会坐标",
        en: "Locate yourself in history and society",
      },
      {
        zh: "标出可动空间与路径依赖",
        en: "Mark room to move and path dependence",
      },
    ],
    references: ["social-stratification"],
  },
  {
    id: "metacognition-audit",
    slug: "metacognition-audit",
    layer: "scenario",
    scope: "official",
    disciplines: ["psychology"],
    language: "zh",
    title: {
      zh: "元认知体检",
      en: "Metacognition Audit",
    },
    summary: {
      zh: "给一次思考做体检：暴露偏见、盲点与证据缺口，而不是给结论抛光。",
      en: "A checkup for your thinking: expose biases, blind spots, and evidence gaps instead of polishing conclusions.",
    },
    tags: ["metacognition", "bias", "audit"],
    version: "0.1.0",
    updated: "2026-07-30",
    repoPath: "skills/official/scenarios/metacognition-audit",
    install: { cli: "npx openwisdom install metacognition-audit" },
    source: "bootstrap",
    provenance: "official",
    featuredRank: 3,
    shape: "square",
    axis: { zh: "结构视角", en: "Structure" },
    when: {
      zh: "重要结论形成之后、落地之前，想检验思考质量时。",
      en: "After a conclusion forms and before it ships, when thought quality matters.",
    },
    steps: [
      {
        zh: "复盘推理链条与证据",
        en: "Replay the reasoning chain and evidence",
      },
      {
        zh: "点名偏见与盲点",
        en: "Name biases and blind spots",
      },
      {
        zh: "补齐缺口后再定结论",
        en: "Close gaps before you commit",
      },
    ],
    references: ["confirmation-bias", "prospect-theory"],
  },
];

/**
 * UI overlay for official reference cards from machine registry.
 * Registry only has English slug `name` + long description — without this,
 * catalog titles render as "social-stratification" (long wrap) vs short zh titles.
 * Overlay keeps source: "catalog" via getCatalog() merge.
 */
export const REFERENCE_BOOTSTRAP: CatalogEntry[] = [
  {
    id: "social-stratification",
    slug: "social-stratification",
    layer: "reference",
    scope: "official",
    disciplines: ["sociology"],
    language: "zh",
    title: { zh: "社会分层", en: "Social Stratification" },
    summary: {
      zh: "教育、职业、财富、地位与网络上的结构位置——标定坐标时用，不做人品判决。",
      en: "Structural positions across education, occupation, wealth, status, and networks—for locating coordinates, not moral verdicts.",
    },
    tags: ["class", "status", "mobility", "inequality", "education"],
    version: "0.1.0",
    updated: "2026-07-30",
    repoPath: "skills/official/references/social-stratification",
    install: { cli: "npx openwisdom install social-stratification" },
    source: "bootstrap",
    provenance: "official",
    featuredRank: 20,
    when: {
      zh: "标定个人或群体的结构位置、默认可动空间时。",
      en: "When locating a person or group on structural coordinates and default scripts.",
    },
  },
  {
    id: "path-dependence",
    slug: "path-dependence",
    layer: "reference",
    scope: "official",
    disciplines: ["economics", "history"],
    language: "zh",
    title: { zh: "路径依赖", en: "Path Dependence" },
    summary: {
      zh: "早期选择与递增回报如何把系统锁进难逆转的轨迹。",
      en: "How early choices and increasing returns lock systems into costly-to-reverse trajectories.",
    },
    tags: ["history", "institutions", "lock-in", "increasing-returns"],
    version: "0.1.0",
    updated: "2026-07-30",
    repoPath: "skills/official/references/path-dependence",
    install: { cli: "npx openwisdom install path-dependence" },
    source: "bootstrap",
    provenance: "official",
    featuredRank: 21,
    when: {
      zh: "解释制度/技术/承诺为何难改写、锁定从何而来时。",
      en: "When explaining lock-in, sunk commitments, or why “better” options stay unused.",
    },
  },
  {
    id: "collective-action",
    slug: "collective-action",
    layer: "reference",
    scope: "official",
    disciplines: ["sociology", "political-science"],
    language: "zh",
    title: { zh: "集体行动", en: "Collective Action" },
    summary: {
      zh: "搭便车、选择性激励与群体如何组织（或失败）。",
      en: "Free-riding, selective incentives, and how groups organize—or fail to.",
    },
    tags: ["free-rider", "public-goods", "organization", "olson"],
    version: "0.1.0",
    updated: "2026-07-30",
    repoPath: "skills/official/references/collective-action",
    install: { cli: "npx openwisdom install collective-action" },
    source: "bootstrap",
    provenance: "official",
    featuredRank: 22,
    when: {
      zh: "识别谁受益、谁付代价、谁否决或搭便车时。",
      en: "When mapping who benefits, who pays, and who can veto or free-ride.",
    },
  },
  {
    id: "confirmation-bias",
    slug: "confirmation-bias",
    layer: "reference",
    scope: "official",
    disciplines: ["psychology"],
    language: "zh",
    title: { zh: "确认偏误", en: "Confirmation Bias" },
    summary: {
      zh: "寻找、解读与记忆证据时偏向既有结论——审计搜索策略用。",
      en: "Seeking and weighting evidence to favor a preferred conclusion—for auditing search strategy.",
    },
    tags: ["bias", "evidence", "motivated-reasoning", "audit"],
    version: "0.1.0",
    updated: "2026-07-30",
    repoPath: "skills/official/references/confirmation-bias",
    install: { cli: "npx openwisdom install confirmation-bias" },
    source: "bootstrap",
    provenance: "official",
    featuredRank: 23,
    when: {
      zh: "结论已「说得通」但尚未做反证或替代假设比较时。",
      en: "When a story coheres but has not faced disconfirmation or alternatives.",
    },
  },
  {
    id: "prospect-theory",
    slug: "prospect-theory",
    layer: "reference",
    scope: "official",
    disciplines: ["psychology", "economics"],
    language: "zh",
    title: { zh: "前景理论", en: "Prospect Theory" },
    summary: {
      zh: "参照点、损失厌恶与概率加权如何塑造风险下的选择。",
      en: "Reference points, loss aversion, and probability weighting under risk.",
    },
    tags: ["risk", "loss-aversion", "framing", "behavioral", "kahneman-tversky"],
    version: "0.1.0",
    updated: "2026-07-30",
    repoPath: "skills/official/references/prospect-theory",
    install: { cli: "npx openwisdom install prospect-theory" },
    source: "bootstrap",
    provenance: "official",
    featuredRank: 24,
    when: {
      zh: "审计框架效应、不对称风险态度或小概率被高估时。",
      en: "When auditing framing, asymmetric risk attitudes, or over-weighted small probabilities.",
    },
  },
];


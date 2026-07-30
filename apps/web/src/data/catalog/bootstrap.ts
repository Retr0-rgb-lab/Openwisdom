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


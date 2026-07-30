import type { CatalogEntry, DisciplineId, LocalizedString } from "./types";

/**
 * Retr0-rgb-lab/principle-skill — Ray Dalio Principles distilled into 10 skills.
 * https://github.com/Retr0-rgb-lab/principle-skill (MIT)
 * Same org as Openwisdom; cataloged as curated-external until monorepo skills/ lands.
 */

type SeedInput = {
  slug: string;
  layer: "scenario" | "reference";
  disciplines: DisciplineId[];
  language?: "zh" | "en";
  title: LocalizedString;
  summary: LocalizedString;
  tags: string[];
  path: string;
  featuredRank: number;
  when?: LocalizedString;
};

function principle(input: SeedInput): CatalogEntry {
  const base = "https://github.com/Retr0-rgb-lab/principle-skill";
  const externalUrl =
    input.path === "" ? base : `${base}/tree/main/${input.path}`;
  return {
    id: input.slug,
    slug: input.slug,
    layer: input.layer,
    scope: "community",
    provenance: "curated-external",
    disciplines: input.disciplines,
    language: input.language ?? "zh",
    title: input.title,
    summary: input.summary,
    tags: input.tags,
    version: "1.4.0",
    updated: "2026-07-11",
    repoPath: input.path || null,
    externalUrl,
    license: "MIT",
    author: "Retr0-rgb-lab",
    attribution: "Retr0-rgb-lab/principle-skill · 达利欧《原则》book2skill 蒸馏",
    contentAvailability: "external-only",
    installMode: "git-clone",
    install: { cli: `npx openwisdom install ${input.slug}` },
    source: "bootstrap",
    featuredRank: input.featuredRank,
    when: input.when,
  };
}

/** Pack hub + 10 atomic skills (README axes). */
export const PRINCIPLE_SEED: CatalogEntry[] = [
  principle({
    slug: "principle-skill-pack",
    layer: "scenario",
    path: "",
    featuredRank: 8,
    disciplines: [
      "economics",
      "political-science",
      "history",
      "psychology",
      "philosophy",
    ],
    title: {
      zh: "原则技能包（达利欧）",
      en: "Principles Skill Pack (Dalio)",
    },
    summary: {
      zh: "从《原则：应对变化中的世界秩序》蒸馏的 10 个可组合 skill：宏观定位 / 货币金融 / 地缘制度 / 决策保护。",
      en: "Ten composable skills distilled from Dalio’s Principles for Dealing with the Changing World Order: macro location, money, geopolity, decision guardrails.",
    },
    tags: ["dalio", "principles", "pack", "world-order", "book2skill"],
    when: {
      zh: "需要整套大周期/货币/地缘/决策工具链时，先从合集入口浏览。",
      en: "When you want the full cycle / money / geopolity / decision toolkit as one pack.",
    },
  }),

  // 轴 1 宏观定位
  principle({
    slug: "cycle-stage-detector",
    layer: "scenario",
    path: "cycle-stage-detector",
    featuredRank: 9,
    disciplines: ["economics", "history", "political-science"],
    title: { zh: "周期阶段检测器", en: "Cycle Stage Detector" },
    summary: {
      zh: "把国家/行业定位到 6 阶段大周期上——不预测，定位。",
      en: "Locate a country or industry on a six-stage big cycle — locate, don’t forecast.",
    },
    tags: ["big-cycle", "macro", "dalio", "periodization"],
    when: {
      zh: "「美国/中国到周期哪了」「X 国像历史上什么时候」。",
      en: "“Where is the US/China in the cycle?” “What historical period does X resemble?”",
    },
  }),
  principle({
    slug: "cycle-correlation-scenario",
    layer: "scenario",
    path: "cycle-correlation-scenario",
    featuredRank: 10,
    disciplines: ["economics", "history", "political-science"],
    title: { zh: "三周期交叉推演器", en: "Cycle Correlation Scenario" },
    summary: {
      zh: "分析货币/内部/外部周期耦合，生成 4 情景树。",
      en: "Couple money / internal / external cycles and generate a four-scenario tree.",
    },
    tags: ["big-cycle", "scenario-planning", "macro", "dalio"],
    when: {
      zh: "「三个周期叠加会怎样」「未来 10 年推演」。",
      en: "“What if three cycles stack?” “10-year scenario tree.”",
    },
  }),

  // 轴 2 货币金融
  principle({
    slug: "debt-risk-triple-ratio",
    layer: "scenario",
    path: "debt-risk-triple-ratio",
    featuredRank: 11,
    disciplines: ["economics"],
    title: { zh: "债务风险三维比率", en: "Debt Risk Triple Ratio" },
    summary: {
      zh: "用三维比率评估债务真实风险，而非单一负债率。",
      en: "Assess true debt risk with three ratios — not a single leverage number.",
    },
    tags: ["debt", "macro-finance", "dalio", "risk"],
    when: {
      zh: "「这笔债能不能借」「国债危险吗」。",
      en: "“Can this debt be carried?” “Is sovereign debt dangerous?”",
    },
  }),
  principle({
    slug: "currency-regime-classifier",
    layer: "scenario",
    path: "currency-regime-classifier",
    featuredRank: 12,
    disciplines: ["economics", "history"],
    title: { zh: "货币体系分类器", en: "Currency Regime Classifier" },
    summary: {
      zh: "判定货币属于硬/纸/法币三类哪一类及其历史含义。",
      en: "Classify a currency regime (hard / paper / fiat-linked) and its historical implications.",
    },
    tags: ["currency", "monetary-regime", "dalio", "history"],
    when: {
      zh: "「美元/人民币是什么货币体系」「会不会像魏玛」。",
      en: "“What regime is USD/CNY?” “Is this Weimar-like?”",
    },
  }),
  principle({
    slug: "currency-crisis-scanner",
    layer: "scenario",
    path: "currency-crisis-scanner",
    featuredRank: 13,
    disciplines: ["economics"],
    title: { zh: "货币危机信号扫描器", en: "Currency Crisis Scanner" },
    summary: {
      zh: "6 信号早期预警货币危机与贬值螺旋。",
      en: "Six early-warning signals for currency crisis and devaluation spirals.",
    },
    tags: ["currency-crisis", "macro-finance", "early-warning", "dalio"],
    when: {
      zh: "「货币贬值螺旋开始了吗」「央行印钞多危险」。",
      en: "“Has a devaluation spiral started?” “How risky is money printing?”",
    },
  }),
  principle({
    slug: "purchasing-power-defender",
    layer: "scenario",
    path: "purchasing-power-defender",
    featuredRank: 14,
    disciplines: ["economics"],
    title: { zh: "购买力防御器", en: "Purchasing Power Defender" },
    summary: {
      zh: "5 层防御方案应对通胀贬值，强调互不相关分散与防淘汰。",
      en: "Five-layer defense against inflation/devaluation — uncorrelated diversification and survival first.",
    },
    tags: ["inflation", "purchasing-power", "portfolio", "dalio"],
    when: {
      zh: "「钱缩水怎么办」「该买黄金吗」「世界末日组合」。",
      en: "“Money is shrinking.” “Gold?” “All-weather / worst-case portfolio.”",
    },
  }),

  // 轴 3 地缘制度
  principle({
    slug: "leader-cycle-fit",
    layer: "scenario",
    path: "leader-cycle-fit",
    featuredRank: 15,
    disciplines: ["political-science", "history"],
    title: { zh: "领导力-周期匹配度", en: "Leader–Cycle Fit" },
    summary: {
      zh: "评估国家制度能力是否匹配当前阶段（非领导人个人打分）。",
      en: "Assess whether institutional capacity fits the cycle stage — not personal leader scoring.",
    },
    tags: ["institutions", "leadership", "big-cycle", "dalio"],
    when: {
      zh: "「这个阶段需要什么样的领袖」「制度能力评估」。",
      en: "“What kind of leadership fits this stage?” “Institutional capacity check.”",
    },
  }),
  principle({
    slug: "redline-mapper",
    layer: "scenario",
    path: "redline-mapper",
    featuredRank: 16,
    disciplines: ["political-science"],
    title: { zh: "地缘底线映射器", en: "Redline Mapper" },
    summary: {
      zh: "三层利益 X/Y/Z 映射识别红线与可交换筹码。",
      en: "Map interests into X/Y/Z layers to identify red lines and tradeable chips.",
    },
    tags: ["geopolitics", "redlines", "bargaining", "dalio"],
    when: {
      zh: "「中美底线是啥」「可交换的筹码是什么」。",
      en: "“What are the red lines?” “What chips are tradeable?”",
    },
  }),
  principle({
    slug: "post-rival-purge-forecast",
    layer: "scenario",
    path: "post-rival-purge-forecast",
    featuredRank: 17,
    disciplines: ["political-science", "history"],
    title: { zh: "战后权力洗牌预测器", en: "Post-Rival Purge Forecast" },
    summary: {
      zh: "共同敌人倒下后的内部洗牌与外部介入推演。",
      en: "Internal realignment and external intervention after a common rival falls.",
    },
    tags: ["geopolitics", "alliances", "power-transition", "dalio"],
    when: {
      zh: "「共同敌人倒下后呢」「联盟会不会散」。",
      en: "“After the common enemy falls?” “Will the alliance hold?”",
    },
  }),

  // 轴 4 决策保护
  principle({
    slug: "worst-case-decision-guard",
    layer: "scenario",
    path: "worst-case-decision-guard",
    featuredRank: 18,
    disciplines: ["psychology", "philosophy", "economics"],
    title: { zh: "最坏情况决策保护器", en: "Worst-Case Decision Guard" },
    summary: {
      zh: "防淘汰四步法做高风险决策——活下来优先于赌高收益。",
      en: "Four-step anti-elimination guard for high-stakes decisions — survive before maximizing return.",
    },
    tags: ["decision-making", "risk", "premortem", "dalio", "principles"],
    when: {
      zh: "「最坏会怎样」「我不敢决定」「决策底线是什么」。",
      en: "“What’s the worst case?” “I can’t decide.” “What’s the floor?”",
    },
  }),
];

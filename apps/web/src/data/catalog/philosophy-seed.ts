import type { CatalogEntry, LocalizedString } from "./types";

/**
 * Philosophy discipline seeds — multi-agent scout (2026-07-30).
 * Platforms: GitHub (primary). 小红书/知乎: no standalone open SKILL.md packs
 * verified beyond links already on GitHub (e.g. zizek-skill).
 */

type SeedInput = {
  slug: string;
  layer: "scenario" | "reference";
  disciplines: CatalogEntry["disciplines"];
  language?: "zh" | "en";
  title: LocalizedString;
  summary: LocalizedString;
  tags: string[];
  externalUrl: string;
  license: string;
  author: string;
  attribution: string;
  featuredRank: number;
  when?: LocalizedString;
};

function ext(input: SeedInput): CatalogEntry {
  return {
    id: input.slug,
    slug: input.slug,
    layer: input.layer,
    scope: "community",
    provenance: "curated-external",
    disciplines: input.disciplines,
    language: input.language ?? "en",
    title: input.title,
    summary: input.summary,
    tags: input.tags,
    version: "0.1.0",
    updated: "2026-07-30",
    repoPath: null,
    externalUrl: input.externalUrl,
    license: input.license,
    author: input.author,
    attribution: input.attribution,
    contentAvailability: "external-only",
    installMode: "link-only",
    install: { cli: `npx openwisdom install ${input.slug}` },
    source: "bootstrap",
    featuredRank: input.featuredRank,
    when: input.when,
  };
}

export const PHILOSOPHY_SEED: CatalogEntry[] = [
  ext({
    slug: "zizek-skill",
    layer: "scenario",
    disciplines: ["philosophy", "sociology", "psychology"],
    language: "zh",
    featuredRank: 110,
    title: {
      zh: "齐泽克式分析",
      en: "Žižek-style Analysis",
    },
    summary: {
      zh: "追问前提、欲望与话语功能，揭示矛盾并留下更准确表述——非口音 cosplay。",
      en: "Interrogate presuppositions, desire, and discourse function; leave a sharper claim — not accent roleplay.",
    },
    tags: ["critical-theory", "ideology", "desire", "conceptual-analysis"],
    externalUrl: "https://github.com/JikunR/zizek-skill",
    license: "MIT",
    author: "JikunR",
    attribution: "JikunR/zizek-skill",
    when: {
      zh: "拆解看似自明的生活叙事、集体话语或自我安慰句时。",
      en: "When a self-evident life narrative or collective story needs its hidden frame exposed.",
    },
  }),
  ext({
    slug: "socratic-method-skill",
    layer: "scenario",
    disciplines: ["philosophy", "psychology", "education"],
    featuredRank: 111,
    title: {
      zh: "苏格拉底方法（助产式诘问）",
      en: "Socratic Method (Maieutic)",
    },
    summary: {
      zh: "六类问题引导自发现：澄清、假设、证据、视角、意涵、元问题。",
      en: "Six question types for discovery: clarification, assumption, evidence, perspective, implication, meta.",
    },
    tags: ["socratic", "dialectic", "epistemology", "pedagogy", "education"],
    externalUrl: "https://github.com/malkreide/socratic-method-skill",
    license: "MIT",
    author: "Hayal Oezkan",
    attribution: "malkreide/socratic-method-skill",
  }),
  ext({
    slug: "socratic-clarify",
    layer: "scenario",
    disciplines: ["philosophy"],
    featuredRank: 112,
    title: {
      zh: "苏格拉底澄清门",
      en: "Socratic Clarify Gate",
    },
    summary: {
      zh: "执行前用高杠杆问题压成可执行简报：目标、约束、成功标准与 go/no-go。",
      en: "Pre-execution clarification into objective, constraints, success criteria, and go/no-go.",
    },
    tags: ["socratic", "clarification", "requirements", "decision-gate"],
    externalUrl: "https://github.com/SwePalm/socratic-skill",
    license: "CC-BY-4.0",
    author: "Stefan Palm",
    attribution: "SwePalm/socratic-skill",
  }),
  ext({
    slug: "steelman-decisions",
    layer: "scenario",
    disciplines: ["philosophy"],
    featuredRank: 113,
    title: {
      zh: "钢人决策压力测试",
      en: "Steelman Decisions",
    },
    summary: {
      zh: "为 2–3 个最强替代方案做全强度论证，暴露盲点后再决定推进。",
      en: "Argue the strongest alternatives at full strength, name blind spots, then proceed or reconsider.",
    },
    tags: ["steelman", "argument-analysis", "anti-sycophancy"],
    externalUrl: "https://github.com/techiejd/claude-skill-steelman",
    license: "MIT",
    author: "techiejd",
    attribution: "techiejd/claude-skill-steelman",
  }),
  ext({
    slug: "stoic-skills",
    layer: "scenario",
    disciplines: ["philosophy", "psychology"],
    featuredRank: 114,
    title: {
      zh: "斯多葛实践技能包",
      en: "Stoic Practice Skills Pack",
    },
    summary: {
      zh: "控制二分、预演不幸、自愿不适、俯瞰视角、死之念、爱命运与认知重构。",
      en: "Dichotomy of control, premeditatio malorum, voluntary discomfort, view from above, memento mori, amor fati, reframing.",
    },
    tags: ["stoicism", "ethics", "moral-philosophy", "epictetus"],
    externalUrl: "https://github.com/neurofoo/agent-skills-stoicism",
    license: "MIT",
    author: "neurofoo",
    attribution: "neurofoo/agent-skills-stoicism",
  }),
  ext({
    slug: "dichotomy-of-control",
    layer: "reference",
    disciplines: ["philosophy", "psychology"],
    featuredRank: 115,
    title: {
      zh: "控制二分法",
      en: "Dichotomy of Control",
    },
    summary: {
      zh: "区分可控与不可控，降低焦虑与无力感——斯多葛伦理核心练习。",
      en: "Separate what is up to you from what is not — core Stoic ethical practice.",
    },
    tags: ["stoicism", "ethics", "control", "epictetus"],
    externalUrl:
      "https://github.com/neurofoo/agent-skills-stoicism/tree/main/skills/dichotomy-of-control",
    license: "MIT",
    author: "neurofoo",
    attribution: "neurofoo/agent-skills-stoicism",
  }),
  ext({
    slug: "the-fool",
    layer: "scenario",
    disciplines: ["philosophy"],
    featuredRank: 116,
    title: {
      zh: "弄臣批判推理",
      en: "The Fool (Critical Reasoning)",
    },
    summary: {
      zh: "先钢人再挑战：苏格拉底假设、黑格尔辩证、预演失败、红队与证伪。",
      en: "Steelman first, then challenge: Socratic assumptions, dialectic, pre-mortem, red team, falsification.",
    },
    tags: ["steelman", "dialectic", "falsification", "critical-thinking"],
    externalUrl:
      "https://github.com/jeffallan/claude-skills/tree/main/skills/the-fool",
    license: "MIT",
    author: "Jeff Allan",
    attribution: "jeffallan/claude-skills",
  }),
  ext({
    slug: "field-lab",
    layer: "scenario",
    disciplines: ["philosophy"],
    featuredRank: 117,
    title: {
      zh: "田野实验室（辩证仪器）",
      en: "Field Lab (Dialectic Instruments)",
    },
    summary: {
      zh: "术语扫描、对立信念辩证与敌意审计——把 AI 当观测仪器而非答案机。",
      en: "Term scan, opposing-belief dialectic, hostile audit — AI as instrument, not oracle.",
    },
    tags: ["dialectic", "hegel", "conceptual-analysis", "epistemology"],
    externalUrl: "https://github.com/KyleAMathews/field-lab",
    license: "MIT",
    author: "Kyle A. Mathews",
    attribution: "KyleAMathews/field-lab",
  }),
  ext({
    slug: "hegelion",
    layer: "scenario",
    disciplines: ["philosophy"],
    featuredRank: 118,
    title: {
      zh: "Hegelion 辩证推理",
      en: "Hegelion (Thesis–Antithesis–Synthesis)",
    },
    summary: {
      zh: "强制分离调用：立正题 → 独立攻击 → 综合；可选伦理/经验评议会。",
      en: "Forced multi-call dialectic: commit thesis, attack separately, synthesize; optional ethics council.",
    },
    tags: ["hegel", "dialectic", "moral-philosophy", "epistemology"],
    externalUrl: "https://github.com/Hmbown/Hegelion",
    license: "MIT",
    author: "Hmbown",
    attribution: "Hmbown/Hegelion",
  }),
  ext({
    slug: "qiushi-skill",
    layer: "scenario",
    disciplines: ["philosophy", "political-science", "history"],
    language: "zh",
    featuredRank: 119,
    title: {
      zh: "求是（唯物辩证与实践哲学）",
      en: "Qiushi (Dialectics & Practice Philosophy)",
    },
    summary: {
      zh: "实事求是与矛盾分析、实践认识论、调查研究等方法论（非宣传工具）。",
      en: "Seek-truth-from-facts, contradiction analysis, practice epistemology — methodology, not propaganda.",
    },
    tags: ["chinese-philosophy", "dialectics", "practice-philosophy", "epistemology"],
    externalUrl: "https://github.com/HughYau/qiushi-skill",
    license: "MIT",
    author: "HughYau",
    attribution: "HughYau/qiushi-skill",
  }),
  ext({
    slug: "s4h-ethics-council",
    layer: "scenario",
    disciplines: ["philosophy", "political-science"],
    featuredRank: 120,
    title: {
      zh: "伦理委员会（五框架）",
      en: "Ethics Council (Five Frameworks)",
    },
    summary: {
      zh: "功利、义务、德性、关怀、正义五套道德传统并行分析并合成裁决。",
      en: "Parallel utilitarian, deontological, virtue, care, and justice analyses with a chair verdict.",
    },
    tags: ["ethics", "moral-philosophy", "normative-ethics"],
    externalUrl:
      "https://github.com/human-avatar/skills-for-humanity/tree/main/skills/s4h-ethics-council",
    license: "MIT",
    author: "human-avatar",
    attribution: "human-avatar/skills-for-humanity",
  }),
  ext({
    slug: "s4h-logic-argument-validation",
    layer: "reference",
    disciplines: ["philosophy"],
    featuredRank: 121,
    title: {
      zh: "论证结构校验",
      en: "Logic / Argument Validation",
    },
    summary: {
      zh: "还原前提–结论结构，检验推理有效性与常见谬误。",
      en: "Reconstruct premises → conclusion; test inference; name common fallacies.",
    },
    tags: ["logic", "informal-logic", "fallacies", "argument-analysis"],
    externalUrl:
      "https://github.com/human-avatar/skills-for-humanity/tree/main/skills/s4h-logic-argument-validation",
    license: "MIT",
    author: "human-avatar",
    attribution: "human-avatar/skills-for-humanity",
  }),
  ext({
    slug: "s4h-epistemology-justification",
    layer: "reference",
    disciplines: ["philosophy"],
    featuredRank: 122,
    title: {
      zh: "认识论·辩护链",
      en: "Epistemic Justification",
    },
    summary: {
      zh: "追溯信念辩护（基础论/融贯论/可靠论），定位最弱环节。",
      en: "Trace justification (foundationalism / coherentism / reliabilism); find the weakest link.",
    },
    tags: ["epistemology", "justification", "belief"],
    externalUrl:
      "https://github.com/human-avatar/skills-for-humanity/tree/main/skills/s4h-epistemology-justification",
    license: "MIT",
    author: "human-avatar",
    attribution: "human-avatar/skills-for-humanity",
  }),
  ext({
    slug: "s4h-mindset-stoic",
    layer: "reference",
    disciplines: ["philosophy", "psychology"],
    featuredRank: 123,
    title: {
      zh: "斯多葛工具箱",
      en: "Stoic Mindset Toolkit",
    },
    summary: {
      zh: "控制二分、预演不幸、爱命运、向死而生等实务化斯多葛方法。",
      en: "Practical Stoic toolkit: dichotomy of control, premeditatio, amor fati, memento mori.",
    },
    tags: ["stoicism", "ethics", "mindset"],
    externalUrl:
      "https://github.com/human-avatar/skills-for-humanity/tree/main/skills/s4h-mindset-stoic",
    license: "MIT",
    author: "human-avatar",
    attribution: "human-avatar/skills-for-humanity",
  }),
  ext({
    slug: "adversaria-steelman",
    layer: "scenario",
    disciplines: ["philosophy", "psychology"],
    featuredRank: 124,
    title: {
      zh: "Adversaria 对抗论证图",
      en: "Adversaria Argument Graph",
    },
    summary: {
      zh: "钢人–熔炉–裁决三阶段与共享论证图，覆盖多种论辩传统。",
      en: "Steelman → crucible → verdict with a persistent argument graph across dissent traditions.",
    },
    tags: ["argument-mapping", "steelman", "dialectic", "debate"],
    externalUrl:
      "https://github.com/damionrashford/Adversaria/tree/main/skills/steelman",
    license: "MIT",
    author: "Damion Rashford",
    attribution: "damionrashford/Adversaria",
  }),
  ext({
    slug: "critical-thinking-logical-reasoning",
    layer: "scenario",
    disciplines: ["philosophy", "psychology"],
    featuredRank: 125,
    title: {
      zh: "批判性思维与逻辑推理",
      en: "Critical Thinking & Logical Reasoning",
    },
    summary: {
      zh: "八步书面论证审读：主张、证据、谬误、隐含前提与举证责任。",
      en: "Eight-step critique of written arguments: claims, evidence, fallacies, assumptions, burden of proof.",
    },
    tags: ["critical-thinking", "informal-logic", "fallacies"],
    externalUrl:
      "https://github.com/sammcj/agentic-coding/tree/main/Skills/critical-thinking-logical-reasoning",
    license: "Apache-2.0",
    author: "sammcj",
    attribution: "sammcj/agentic-coding",
  }),
  ext({
    slug: "clarity-gate",
    layer: "scenario",
    disciplines: ["philosophy"],
    featuredRank: 126,
    title: {
      zh: "清晰门（认识论语境标注）",
      en: "Clarity Gate (Epistemic Labels)",
    },
    summary: {
      zh: "入库前区分事实 / 假设 / 预测，降低自信幻觉。",
      en: "Label fact vs hypothesis vs projection before knowledge-base ingest — reduce confident illusion.",
    },
    tags: ["epistemology", "knowledge", "rag", "calibration"],
    externalUrl:
      "https://github.com/frmoretto/clarity-gate/tree/main/skills/clarity-gate",
    license: "CC-BY-4.0",
    author: "Francesco Marinoni Moretto",
    attribution: "frmoretto/clarity-gate",
  }),
  ext({
    slug: "balanced-dialog",
    layer: "scenario",
    disciplines: ["philosophy"],
    featuredRank: 127,
    title: {
      zh: "均衡对话（反谄媚）",
      en: "Balanced Dialog",
    },
    summary: {
      zh: "优点→严格挑战→扩展→精炼；含苏格拉底与钢人模式，强调可引用证据。",
      en: "Merits → challenge → expansion → refinement; Socratic and steelman modes; evidence over flattery.",
    },
    tags: ["steelman", "socratic", "anti-sycophancy", "argument-analysis"],
    externalUrl: "https://github.com/glebis/claude-skills/tree/main/balanced",
    license: "MIT",
    author: "Gleb Kalinin",
    attribution: "glebis/claude-skills",
  }),
  ext({
    slug: "first-principles-skill",
    layer: "scenario",
    disciplines: ["philosophy"],
    featuredRank: 128,
    title: {
      zh: "第一性原理技能",
      en: "First Principles Skill",
    },
    summary: {
      zh: "问题本质→挑战假设→基石事实→自下而上推理→校验（中英触发）。",
      en: "Essence → challenge assumptions → ground truths → reason upward → validate (EN/ZH triggers).",
    },
    tags: ["first-principles", "epistemology", "assumptions"],
    externalUrl: "https://github.com/awesome-skills/first-principles-skill",
    license: "MIT",
    author: "awesome-skills",
    attribution: "awesome-skills/first-principles-skill",
  }),
];

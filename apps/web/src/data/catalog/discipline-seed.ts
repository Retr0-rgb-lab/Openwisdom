import type { CatalogEntry, DisciplineId, LocalizedString } from "./types";

/**
 * Wave 2 curated seeds by discipline — multi-agent scout (2026-07-30).
 * Sources: GitHub SKILL.md ecosystems (AERS, research-copilot, Asgard, Kenny,
 * meleantonio, civic analytics, etc.). Xiaohongshu/Zhihu: no standalone open
 * skill packages verified; Chinese content points back to GitHub.
 * No fake heat. Prefer MIT/CC0/Apache; NC marked link-only in license field.
 */

type SeedInput = {
  slug: string;
  layer: "scenario" | "reference";
  disciplines: DisciplineId[];
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

/** Psychology-heavy (new; avoids duplicate existing thinking-* / socrates) */
const PSYCHOLOGY: CatalogEntry[] = [
  ext({
    slug: "decision-auditor",
    layer: "scenario",
    disciplines: ["psychology"],
    featuredRank: 50,
    title: { zh: "决策审计器", en: "Decision Auditor" },
    summary: {
      zh: "基于卡尼曼式偏差扫描、事前验尸与重框的决策审计工作流。",
      en: "Kahneman-style decision audit: bias scan, premortem, and reframing before you commit.",
    },
    tags: ["cognitive-bias", "decision-making", "premortem", "metacognition"],
    externalUrl:
      "https://github.com/huntsyea/thinking-skills/tree/main/skills/decision-auditor",
    license: "MIT",
    author: "huntsyea",
    attribution: "huntsyea/thinking-skills",
    when: {
      zh: "重大决策前需要系统检查偏见与乐观偏差时。",
      en: "Before high-stakes decisions when bias and optimism need a structured check.",
    },
  }),
  ext({
    slug: "elicitation",
    layer: "scenario",
    disciplines: ["psychology", "sociology"],
    featuredRank: 51,
    title: { zh: "叙事认同与动机引出", en: "Psychological Elicitation" },
    summary: {
      zh: "用生命故事、自我界定记忆、OARS/MI 与价值观框架做耐心对话式心理画像。",
      en: "Narrative identity, self-defining memories, OARS/MI and values-based elicitation through patient dialogue.",
    },
    tags: ["motivational-interviewing", "narrative-identity", "interview"],
    externalUrl: "https://github.com/tasteray/skills/tree/main/elicitation",
    license: "MIT",
    author: "tasteray",
    attribution: "tasteray/skills",
  }),
  ext({
    slug: "study-strategy-selector",
    layer: "scenario",
    disciplines: ["psychology"],
    featuredRank: 52,
    title: { zh: "学习策略选择器", en: "Study Strategy Selector" },
    summary: {
      zh: "按认知学习科学匹配检索练习、间隔与交错等高效用策略。",
      en: "Maps tasks to high-utility strategies (retrieval, spacing, interleaving) from learning science.",
    },
    tags: ["metacognition", "learning-science", "self-regulated-learning"],
    externalUrl:
      "https://github.com/GarethManning/education-agent-skills/tree/main/skills/self-regulated-learning/study-strategy-selector",
    license: "CC-BY-SA-4.0",
    author: "Gareth Manning",
    attribution: "GarethManning/education-agent-skills",
  }),
  ext({
    slug: "satori",
    layer: "scenario",
    disciplines: ["psychology"],
    featuredRank: 53,
    title: { zh: "Satori 内省伙伴", en: "Satori Wisdom Companion" },
    summary: {
      zh: "融合 MI/IFS/DBT 等的结构化反思对话；明确非治疗、不诊断。",
      en: "Reflective companion using MI/IFS/DBT-style scaffolds — not therapy, no diagnosis.",
    },
    tags: ["self-reflection", "motivational-interviewing", "metacognition"],
    externalUrl: "https://github.com/MetcalfSolutions/Satori",
    license: "Apache-2.0",
    author: "MetcalfSolutions",
    attribution: "MetcalfSolutions/Satori",
  }),
];

/** Sociology-heavy */
const SOCIOLOGY: CatalogEntry[] = [
  ext({
    slug: "thematic-analysis-braun-clarke",
    layer: "scenario",
    disciplines: ["sociology", "psychology"],
    featuredRank: 60,
    title: {
      zh: "主题分析（Braun & Clarke）",
      en: "Thematic Analysis (Braun & Clarke)",
    },
    summary: {
      zh: "六阶段主题分析：熟悉、编码、主题建构与审查、命名与报告。",
      en: "Six-phase thematic analysis: familiarization, coding, theme construction/review, naming, report.",
    },
    tags: ["thematic-analysis", "qualitative-coding", "braun-clarke"],
    externalUrl: "https://github.com/keemanxp/thematic-analysis-skill",
    license: "MIT",
    author: "Chuah Kee Man",
    attribution: "keemanxp/thematic-analysis-skill",
  }),
  ext({
    slug: "qualitative-research-full-pipeline",
    layer: "scenario",
    disciplines: ["sociology", "psychology", "political-science"],
    language: "zh",
    featuredRank: 61,
    title: {
      zh: "质性研究全流程",
      en: "Qualitative Research Full Pipeline",
    },
    summary: {
      zh: "范式、抽样、访谈、扎根/主题编码、信实度与 COREQ/SRQR 报告（中文为主）。",
      en: "Paradigm, sampling, interviews, grounded/thematic coding, trustworthiness, COREQ/SRQR (Chinese-first body).",
    },
    tags: ["qualitative-methods", "interview", "grounded-theory", "coreq"],
    externalUrl: "https://github.com/maydengximin-sketch/qualitative-research-skill",
    license: "MIT",
    author: "maydengximin-sketch",
    attribution: "maydengximin-sketch/qualitative-research-skill",
  }),
  ext({
    slug: "research-copilot-survey-design",
    layer: "scenario",
    disciplines: ["sociology", "psychology", "political-science", "economics"],
    featuredRank: 62,
    title: { zh: "问卷与量表设计", en: "Survey & Questionnaire Design" },
    summary: {
      zh: "题项措辞、量表、顺序效应、预试与社会赞许偏差规避。",
      en: "Item wording, scales, order effects, pilots, and social-desirability traps.",
    },
    tags: ["survey-methods", "questionnaire", "measurement"],
    externalUrl:
      "https://github.com/Marazii/research-co-pilot/tree/main/skills/survey-design",
    license: "MIT",
    author: "Maya Arazi",
    attribution: "Marazii/research-co-pilot",
  }),
  ext({
    slug: "research-copilot-qualitative-coding",
    layer: "scenario",
    disciplines: ["sociology", "psychology", "political-science"],
    featuredRank: 63,
    title: { zh: "质性编码与主题发展", en: "Qualitative Coding" },
    summary: {
      zh: "归纳/演绎编码、编码簿、备忘录、反例与评分者一致性。",
      en: "Inductive/deductive coding, codebooks, memos, disconfirming cases, IRR.",
    },
    tags: ["qualitative-coding", "codebook", "grounded-theory"],
    externalUrl:
      "https://github.com/Marazii/research-co-pilot/tree/main/skills/qualitative-coding",
    license: "MIT",
    author: "Maya Arazi",
    attribution: "Marazii/research-co-pilot",
  }),
  ext({
    slug: "research-copilot-methodology-advisor",
    layer: "scenario",
    disciplines: ["sociology", "psychology", "political-science", "economics"],
    featuredRank: 64,
    title: { zh: "研究设计顾问", en: "Methodology Advisor" },
    summary: {
      zh: "按问题匹配量化/质性/混合方法、抽样、效度威胁与民族志等传统。",
      en: "Match quant/qual/mixed designs, sampling, validity threats, ethnography and more.",
    },
    tags: ["research-design", "mixed-methods", "ethnography", "sampling"],
    externalUrl:
      "https://github.com/Marazii/research-co-pilot/tree/main/skills/methodology-advisor",
    license: "MIT",
    author: "Maya Arazi",
    attribution: "Marazii/research-co-pilot",
  }),
  ext({
    slug: "research-copilot-ethics-committee",
    layer: "scenario",
    disciplines: ["sociology", "psychology", "political-science"],
    featuredRank: 65,
    title: { zh: "伦理预审模拟", en: "Ethics / IRB Pre-Review" },
    summary: {
      zh: "IRB 视角预审知情同意、弱势群体、风险与数据最小化（非机构审批）。",
      en: "IRB-style stress test for consent, vulnerability, risk, data minimization — not institutional approval.",
    },
    tags: ["research-ethics", "irb", "informed-consent"],
    externalUrl:
      "https://github.com/Marazii/research-co-pilot/tree/main/skills/ethics-committee",
    license: "MIT",
    author: "Maya Arazi",
    attribution: "Marazii/research-co-pilot",
  }),
  ext({
    slug: "social-science-research-pipeline",
    layer: "scenario",
    disciplines: ["sociology", "economics", "political-science"],
    featuredRank: 66,
    title: {
      zh: "社科实证流水线",
      en: "Social Science Research Pipeline",
    },
    summary: {
      zh: "选题—文献—R/Python 分析—手稿与审稿门禁的社科论文插件流水线。",
      en: "Plugin pipeline: topic, lit, R/Python analysis, manuscript, multi-perspective review gates.",
    },
    tags: ["empirical-research", "replication", "manuscript"],
    externalUrl: "https://github.com/Felpix-Studios/social-science-research",
    license: "MIT",
    author: "Felpix-Studios",
    attribution: "Felpix-Studios/social-science-research",
  }),
];

/** History-heavy */
const HISTORY: CatalogEntry[] = [
  ext({
    slug: "history-research-guide",
    layer: "scenario",
    disciplines: ["history"],
    featuredRank: 70,
    title: { zh: "历史研究工作流", en: "History Research Guide" },
    summary: {
      zh: "史料内外批判、档案准备、数字档案与数字人文方法。",
      en: "External/internal source criticism, archives, digital collections, and digital-history methods.",
    },
    tags: ["primary-sources", "archives", "source-criticism", "digital-humanities"],
    externalUrl:
      "https://github.com/wentorai/research-plugins/tree/main/skills/domains/humanities/history-research-guide",
    license: "MIT",
    author: "wentorai",
    attribution: "wentorai/research-plugins",
  }),
  ext({
    slug: "hum-source-criticism",
    layer: "reference",
    disciplines: ["history", "sociology", "political-science"],
    featuredRank: 71,
    title: { zh: "史料与信源批判", en: "Source Criticism" },
    summary: {
      zh: "一/二/三手分类、内外批判、三角验证与假信息红旗。",
      en: "Primary/secondary/tertiary sources, external/internal criticism, triangulation, misinfo red flags.",
    },
    tags: ["source-criticism", "primary-sources", "fact-checking"],
    externalUrl:
      "https://github.com/asgard-ai-platform/skills/tree/main/hum-source-criticism",
    license: "MIT",
    author: "Asgard Inc.",
    attribution: "asgard-ai-platform/skills",
  }),
  ext({
    slug: "hum-historical-analogy",
    layer: "scenario",
    disciplines: ["history", "political-science"],
    featuredRank: 72,
    title: { zh: "历史类比评估", en: "Historical Analogy" },
    summary: {
      zh: "用结构相似性检验类比强度，警惕挑拣与现时主义。",
      en: "Structural vs surface similarity for historical analogies; traps include cherry-picking and presentism.",
    },
    tags: ["historical-analogy", "precedent", "comparative-history"],
    externalUrl:
      "https://github.com/asgard-ai-platform/skills/tree/main/hum-historical-analogy",
    license: "MIT",
    author: "Asgard Inc.",
    attribution: "asgard-ai-platform/skills",
  }),
  ext({
    slug: "grad-narrative",
    layer: "reference",
    disciplines: ["history", "sociology", "psychology"],
    featuredRank: 73,
    title: { zh: "叙事研究与口述史", en: "Narrative / Oral History Methods" },
    summary: {
      zh: "生命故事与口述史：叙事访谈、Labov 结构、身份定位与时间性。",
      en: "Life-story and oral history: generative interviews, Labov structure, identity positioning, temporality.",
    },
    tags: ["oral-history", "narrative-analysis", "life-story"],
    externalUrl:
      "https://github.com/asgard-ai-platform/skills/tree/main/grad-narrative",
    license: "MIT",
    author: "Asgard Inc.",
    attribution: "asgard-ai-platform/skills",
  }),
  ext({
    slug: "genealogy-research",
    layer: "scenario",
    disciplines: ["history"],
    featuredRank: 74,
    title: { zh: "族谱研究（GPS）", en: "Genealogy Research (GPS)" },
    summary: {
      zh: "Genealogical Proof Standard：多语史料、数据库与证据等级。",
      en: "Genealogical Proof Standard workflows: multi-language sources, databases, evidence levels.",
    },
    tags: ["genealogy", "gps", "archival-research"],
    externalUrl: "https://github.com/sliday/genealogy-research",
    license: "MIT",
    author: "sliday",
    attribution: "sliday/genealogy-research",
  }),
  ext({
    slug: "american-historical-review-skills",
    layer: "scenario",
    disciplines: ["history"],
    featuredRank: 75,
    title: {
      zh: "《美国历史评论》期刊技能包",
      en: "American Historical Review Skills",
    },
    summary: {
      zh: "面向 AHR 取向的史学写作与投稿流程技能合集（上游 monorepo）。",
      en: "Journal-oriented history writing and submission skill pack (upstream monorepo).",
    },
    tags: ["journal", "historiography", "academic-writing"],
    externalUrl:
      "https://github.com/brycewang-stanford/Awesome-Journal-Skills/tree/main/American-Historical-Review-Skills",
    license: "MIT",
    author: "brycewang-stanford",
    attribution: "brycewang-stanford/Awesome-Journal-Skills",
  }),
];

/** Political science */
const POLITICAL: CatalogEntry[] = [
  ext({
    slug: "civic-analytics-agent-workflow",
    layer: "scenario",
    disciplines: ["political-science", "economics"],
    featuredRank: 80,
    title: {
      zh: "城市政策分析五阶段",
      en: "Civic Analytics Agent Workflow",
    },
    summary: {
      zh: "开放市政数据的公平导向政策分析：框定—证据—沟通—对标—绩效。",
      en: "Equity-focused city policy workflow: frame → evidence → communicate → benchmark → performance.",
    },
    tags: ["public-policy", "civic-analytics", "policy-brief", "open-data"],
    externalUrl:
      "https://github.com/sgarcese/Civic-Analytics-Agent-Workflow-Claude-Skill",
    license: "MIT",
    author: "Santiago Garcés",
    attribution: "sgarcese/Civic-Analytics-Agent-Workflow-Claude-Skill",
  }),
  ext({
    slug: "literature-helper-polsci",
    layer: "scenario",
    disciplines: ["political-science"],
    featuredRank: 81,
    title: {
      zh: "政治学文献调研助手",
      en: "Literature Helper for Political Science",
    },
    summary: {
      zh: "可核验引用的政治学文献综述：理论/实证/方法支柱与注释书目。",
      en: "Citation-verified polsci literature surveys: theory/empirical/methods pillars.",
    },
    tags: ["literature-review", "citations", "research-methods"],
    externalUrl: "https://github.com/LIANJie-Jason/literature-helper-polsci",
    license: "MIT",
    author: "LIANJie-Jason",
    attribution: "LIANJie-Jason/literature-helper-polsci",
  }),
  ext({
    slug: "political-science-analysis-riksdag",
    layer: "reference",
    disciplines: ["political-science"],
    featuredRank: 82,
    title: {
      zh: "比较政治与政策分析框架",
      en: "Political Science Analysis Frameworks",
    },
    summary: {
      zh: "比较政治、政策周期与民主质量指标；多源核验、非党派取向。",
      en: "Comparative politics, policy cycle, democratic quality indicators; multi-source, non-partisan.",
    },
    tags: ["comparative-politics", "public-policy", "legislative-analysis"],
    externalUrl:
      "https://github.com/Hack23/riksdagsmonitor/tree/main/.github/skills/political-science-analysis",
    license: "Apache-2.0",
    author: "Hack23 AB",
    attribution: "Hack23/riksdagsmonitor",
  }),
  ext({
    slug: "apsa-style",
    layer: "reference",
    disciplines: ["political-science"],
    featuredRank: 83,
    title: { zh: "APSA 体例校对", en: "APSA Style Check" },
    summary: {
      zh: "对照 APSA Style Manual 检查数字、引用、缩写与中立用语。",
      en: "Check manuscripts against the APSA Style Manual (numbers, citations, abbreviations, neutral language).",
    },
    tags: ["APSA", "academic-writing", "style-guide"],
    externalUrl:
      "https://github.com/christopherkenny/skills/tree/main/skills/apsa-style",
    license: "MIT",
    author: "Christopher T. Kenny",
    attribution: "christopherkenny/skills",
  }),
  ext({
    slug: "assess-outline",
    layer: "scenario",
    disciplines: ["political-science", "sociology", "economics"],
    featuredRank: 84,
    title: { zh: "研究大纲评估", en: "Assess Research Outline" },
    summary: {
      zh: "评估论文大纲：问题、贡献、假设、数据、识别与稳健性结构。",
      en: "Assess paper outlines: RQ, contributions, hypotheses, data, identification, robustness.",
    },
    tags: ["research-design", "outline", "causal-inference"],
    externalUrl:
      "https://github.com/christopherkenny/skills/tree/main/skills/assess-outline",
    license: "MIT",
    author: "Christopher T. Kenny",
    attribution: "christopherkenny/skills",
  }),
  ext({
    slug: "ajps-journal-skills",
    layer: "scenario",
    disciplines: ["political-science"],
    featuredRank: 85,
    title: {
      zh: "AJPS 研究全流程技能包",
      en: "American Journal of Political Science Skills",
    },
    summary: {
      zh: "面向 AJPS 的选题—设计—分析—复现—投稿技能合集。",
      en: "AJPS-oriented pack: topic, design, analysis, replication package, submission.",
    },
    tags: ["journal", "replication", "APSA", "methodology"],
    externalUrl:
      "https://github.com/brycewang-stanford/Awesome-Journal-Skills/tree/main/American-Journal-of-Political-Science-Skills",
    license: "MIT",
    author: "brycewang-stanford",
    attribution: "brycewang-stanford/Awesome-Journal-Skills",
  }),
  ext({
    slug: "daymade-deep-research",
    layer: "scenario",
    disciplines: ["political-science", "economics"],
    featuredRank: 86,
    title: {
      zh: "深度研究与政策简报",
      en: "Deep Research / Policy Brief",
    },
    summary: {
      zh: "多阶段证据映射、来源治理与政策简报式报告（中英触发）。",
      en: "Multi-pass evidence maps, source governance, policy-brief style reports (zh/en triggers).",
    },
    tags: ["policy-analysis", "policy-brief", "deep-research", "citations"],
    externalUrl:
      "https://github.com/daymade/claude-code-skills/tree/main/deep-research",
    license: "MIT",
    author: "daymade",
    attribution: "daymade/claude-code-skills",
  }),
  ext({
    slug: "stakeholder-analysis-ba",
    layer: "scenario",
    disciplines: ["political-science", "sociology"],
    featuredRank: 87,
    title: {
      zh: "利益相关者分析",
      en: "Stakeholder Analysis",
    },
    summary: {
      zh: "权力—利益网格、RACI 与沟通计划（业务分析技能包，可迁移到政策）。",
      en: "Power–interest grid, RACI, and comms plans from a BA skill pack — portable to policy.",
    },
    tags: ["stakeholder", "power-interest", "institutional-analysis"],
    externalUrl: "https://github.com/45ck/business-analysis-skills",
    license: "MIT",
    author: "45ck",
    attribution: "45ck/business-analysis-skills",
  }),
];

/** Economics (additional) */
const ECONOMICS: CatalogEntry[] = [
  ext({
    slug: "econ-write",
    layer: "scenario",
    disciplines: ["economics"],
    featuredRank: 90,
    title: { zh: "经济学论文写作", en: "Econ Write" },
    summary: {
      zh: "综合多份经济学家写作指南：识别策略叙述、改写与投稿审计。",
      en: "Economist writing guides distilled: ID-strategy narrative, rewrite, submission audits.",
    },
    tags: ["academic-writing", "identification", "jmp"],
    externalUrl:
      "https://github.com/hanlulong/econ-writing-skill/tree/main/skills/econ-write",
    license: "MIT",
    author: "hanlulong",
    attribution: "hanlulong/econ-writing-skill",
  }),
  ext({
    slug: "causal-inference-mixtape",
    layer: "scenario",
    disciplines: ["economics", "political-science", "sociology"],
    featuredRank: 91,
    title: {
      zh: "因果推断 Mixtape",
      en: "Causal Inference Mixtape",
    },
    summary: {
      zh: "DiD/IV/RDD/合成控制等模板与稳健性（多语言实现）。",
      en: "DiD, IV, RDD, SCM templates and robustness patterns (multi-language).",
    },
    tags: ["causal-inference", "did", "iv", "rdd", "mixtape"],
    externalUrl: "https://github.com/Jill0099/causal-inference-mixtape",
    license: "MIT",
    author: "Jill0099",
    attribution: "Jill0099/causal-inference-mixtape",
  }),
  ext({
    slug: "working-with-data",
    layer: "scenario",
    disciplines: ["economics"],
    featuredRank: 92,
    title: { zh: "计量数据纪律", en: "Working With Data" },
    summary: {
      zh: "DIME 取向：分析单位、ID 契约、merge 基数、PII 与 raw 不可变。",
      en: "DIME-aligned data discipline: unit of analysis, IDs, merge checks, PII, immutable raw.",
    },
    tags: ["data-discipline", "dime", "reproducibility"],
    externalUrl:
      "https://github.com/JonasWeinert/EconAgentSkills/tree/main/_skills/data/working-with-data",
    license: "CC0-1.0",
    author: "Jonas Weinert",
    attribution: "JonasWeinert/EconAgentSkills",
  }),
  ext({
    slug: "python-panel-data",
    layer: "scenario",
    disciplines: ["economics"],
    featuredRank: 93,
    title: { zh: "Python 面板数据", en: "Python Panel Data" },
    summary: {
      zh: "linearmodels 面板 FE/RE、面板 DiD 与聚类出表。",
      en: "Panel FE/RE and DiD in Python via linearmodels with clustering.",
    },
    tags: ["python", "panel-data", "fixed-effects", "did"],
    externalUrl:
      "https://github.com/meleantonio/awesome-econ-ai-stuff/tree/main/_skills/analysis/python-panel-data",
    license: "CC0-1.0",
    author: "meleantonio",
    attribution: "meleantonio/awesome-econ-ai-stuff",
  }),
  ext({
    slug: "api-data-fetcher",
    layer: "scenario",
    disciplines: ["economics"],
    featuredRank: 94,
    title: { zh: "经济数据 API 拉取", en: "API Data Fetcher" },
    summary: {
      zh: "FRED / World Bank 等宏观指标拉取与可复现 Python 管线。",
      en: "Fetch FRED, World Bank (and related) series into reproducible Python pipelines.",
    },
    tags: ["fred", "world-bank", "macro-data", "api"],
    externalUrl:
      "https://github.com/meleantonio/awesome-econ-ai-stuff/tree/main/_skills/data/api-data-fetcher",
    license: "CC0-1.0",
    author: "meleantonio",
    attribution: "meleantonio/awesome-econ-ai-stuff",
  }),
  ext({
    slug: "causal-inference-guide",
    layer: "reference",
    disciplines: ["economics", "political-science", "sociology"],
    featuredRank: 95,
    title: { zh: "因果推断方法指南", en: "Causal Inference Guide" },
    summary: {
      zh: "DiD/IV/RDD/合成控制的方法说明与诊断清单。",
      en: "Method guide for DiD, IV, RDD, and synthetic control with diagnostics.",
    },
    tags: ["causal-inference", "econometrics", "methods"],
    externalUrl:
      "https://github.com/wentorai/research-plugins/tree/main/skills/analysis/econometrics/causal-inference-guide",
    license: "MIT",
    author: "wentorai",
    attribution: "wentorai/research-plugins",
  }),
  ext({
    slug: "american-sociological-review-skills",
    layer: "scenario",
    disciplines: ["sociology"],
    featuredRank: 67,
    title: {
      zh: "《美国社会学评论》技能包",
      en: "American Sociological Review Skills",
    },
    summary: {
      zh: "面向 ASR 取向的社会学研究与写作技能合集。",
      en: "ASR-oriented sociology research and writing skill pack.",
    },
    tags: ["journal", "sociology", "academic-writing"],
    externalUrl:
      "https://github.com/brycewang-stanford/Awesome-Journal-Skills/tree/main/American-Sociological-Review-Skills",
    license: "MIT",
    author: "brycewang-stanford",
    attribution: "brycewang-stanford/Awesome-Journal-Skills",
  }),
  /** Hub meta for discovery across disciplines */
  ext({
    slug: "aers-empirical-hub",
    layer: "scenario",
    disciplines: [
      "economics",
      "political-science",
      "sociology",
      "psychology",
      "history",
      "philosophy",
    ],
    featuredRank: 100,
    title: {
      zh: "AERS 实证社科技能枢纽",
      en: "AERS Empirical Social-Science Hub",
    },
    summary: {
      zh: "Stanford REAP×CoPaper 策展的多学科实证技能合集入口（子技能许可各异）。",
      en: "Stanford REAP×CoPaper curated hub of empirical social-science skill collections (child licenses vary).",
    },
    tags: ["hub", "empirical-research", "multi-discipline", "catalog"],
    externalUrl:
      "https://github.com/brycewang-stanford/Auto-Empirical-Research-Skills",
    license: "CC-BY-SA-4.0",
    author: "brycewang-stanford / CoPaper.AI",
    attribution: "brycewang-stanford/Auto-Empirical-Research-Skills",
  }),
];

export const DISCIPLINE_SEED: CatalogEntry[] = [
  ...PSYCHOLOGY,
  ...SOCIOLOGY,
  ...HISTORY,
  ...POLITICAL,
  ...ECONOMICS,
];

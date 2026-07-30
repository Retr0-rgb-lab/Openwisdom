import type { CatalogEntry, LocalizedString } from "./types";

/**
 * Chinese-History (YuanZHAO321) + sibling humanities skills.
 * Public source of truth: https://github.com/YuanZHAO321/Chinese-History
 * (史鉴 / 两司马之镜 · 以史记+通鉴做以史为鉴分析)
 *
 * 小红书「太一」身份无法在本环境公开交叉验证；目录只收录可验证的 GitHub 源，
 * attribution 写 GitHub 作者，不伪造小红书账号绑定。
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
    language: input.language ?? "zh",
    title: input.title,
    summary: input.summary,
    tags: input.tags,
    version: "0.1.0",
    updated: "2026-07-07",
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

const AUTHOR = "YuanZHAO321";
const BASE = "https://github.com/YuanZHAO321/Chinese-History";
const ATTR =
  "YuanZHAO321/Chinese-History · Apache-2.0 · 史鉴·两司马之镜（史记+通鉴）";

export const HISTORY_SEED: CatalogEntry[] = [
  ext({
    slug: "chinese-history-pack",
    layer: "scenario",
    disciplines: ["history", "political-science", "sociology"],
    title: {
      zh: "史鉴 · Chinese History（合集）",
      en: "Chinese History · Mirror of Dual Sima (pack)",
    },
    summary: {
      zh: "以《史记》《资治通鉴》为源的「以史为鉴」分析技能合集：成品双镜 skill + 单书存档 + 人镜/事镜/模式/考信 references。",
      en: "History-as-mirror skill pack from Shiji + Zizhi Tongjian: dual-mirror workflow, single-book archives, and reference libraries.",
    },
    tags: ["history", "shiji", "tongjian", "shijian", "chinese-history", "pack"],
    externalUrl: BASE,
    license: "Apache-2.0",
    author: AUTHOR,
    attribution: ATTR,
    featuredRank: 12,
    when: {
      zh: "需要用中国史籍做职场/组织/决策类比时，先从合集入口浏览。",
      en: "Start here when you want Chinese classic historiography as decision mirrors.",
    },
  }),
  ext({
    slug: "shiji-tongjian",
    layer: "scenario",
    disciplines: ["history", "political-science", "sociology"],
    title: {
      zh: "两司马之镜（史记+通鉴）",
      en: "Dual Sima Mirror (Shiji + Tongjian)",
    },
    summary: {
      zh: "史记之镜察人、通鉴之镜审时；一局两照、太史公曰+臣光曰双笔合断，并给可执行建议。内置全文与考信防伪引。",
      en: "Shiji for character arcs, Tongjian for timing; dual conclusions with actionable advice; built-in corpora and quote verification.",
    },
    tags: [
      "shiji",
      "tongjian",
      "historical-analogy",
      "decision",
      "shijian",
    ],
    externalUrl: `${BASE}/blob/main/SKILL.md`,
    license: "Apache-2.0",
    author: AUTHOR,
    attribution: ATTR,
    featuredRank: 13,
    when: {
      zh: "进退去留、用人识人、组织兴衰、变革阻力，或要做历史类比/史评时。",
      en: "Career moves, personnel judgment, org rise/fall, reform resistance, or historical analogy essays.",
    },
  }),
  ext({
    slug: "taishigong-mind",
    layer: "scenario",
    disciplines: ["history", "sociology"],
    title: {
      zh: "太史公之镜（《史记》单书存档）",
      en: "Taishigong Mirror (Shiji-only archive)",
    },
    summary: {
      zh: "合并前的《史记》单书版：观势→稽类→察人→通变→太史公曰。README 标明存档、默认用双镜成品。",
      en: "Pre-merge Shiji-only skill (archive). Prefer dual-mirror shiji-tongjian for install.",
    },
    tags: ["shiji", "sima-qian", "archive", "character"],
    externalUrl: `${BASE}/tree/main/taishigong-mind`,
    license: "Apache-2.0",
    author: AUTHOR,
    attribution: `${ATTR} · taishigong-mind archive`,
    featuredRank: 40,
    when: {
      zh: "只要人物弧线/性格命运类比、且明确要单用《史记》时。",
      en: "When you explicitly want Shiji-only character-arc mirrors.",
    },
  }),
  ext({
    slug: "tongjian-mind",
    layer: "scenario",
    disciplines: ["history", "political-science"],
    title: {
      zh: "臣光之鉴（《通鉴》单书存档）",
      en: "Chenguang Mirror (Tongjian-only archive)",
    },
    summary: {
      zh: "合并前的《资治通鉴》单书版：正名分→辨才德→稽兴衰→谨几微→臣光曰。偏组织治道与权力结构。",
      en: "Pre-merge Tongjian-only skill (archive): names/roles, talent–virtue, rise/fall, micro-signals, Chenguang verdict.",
    },
    tags: ["tongjian", "sima-guang", "archive", "governance"],
    externalUrl: `${BASE}/tree/main/tongjian-mind`,
    license: "Apache-2.0",
    author: AUTHOR,
    attribution: `${ATTR} · tongjian-mind archive`,
    featuredRank: 41,
    when: {
      zh: "团队治理、用人提拔、言路、功臣关系、组织由盛转衰等治道问题。",
      en: "Team governance, promotion, speech channels, meritorious-officer tension, org decay.",
    },
  }),
  ext({
    slug: "zhouli-trilogy",
    layer: "reference",
    disciplines: ["history", "political-science"],
    language: "zh",
    title: {
      zh: "三礼知识体系（周礼·仪礼·礼记）",
      en: "Three Ritual Classics (Zhouli · Yili · Liji)",
    },
    summary: {
      zh: "同作者：周代官制、五礼、宗法、仪节与礼学义理；先定位书再查 references，避免凭记忆编造礼制细节。",
      en: "Same author: Zhou bureaucracy, five rites, kinship ritual, procedures; locate the book then check refs—no invented ritual numbers.",
    },
    tags: ["zhouli", "ritual", "institutions", "classics"],
    externalUrl: "https://github.com/YuanZHAO321/ZhouLi",
    license: "Apache-2.0",
    author: AUTHOR,
    attribution: "YuanZHAO321/ZhouLi · Apache-2.0",
    featuredRank: 42,
    when: {
      zh: "查证周礼官制、冠婚丧祭仪节、礼学名言出处时。",
      en: "When verifying Zhouli offices, life-cycle rites, or classic ritual quotations.",
    },
  }),
  ext({
    slug: "academic-writing-yuanzhao",
    layer: "scenario",
    disciplines: ["history", "sociology", "political-science"],
    language: "zh",
    title: {
      zh: "学术写作（YuanZHAO321）",
      en: "Academic Writing (YuanZHAO321)",
    },
    summary: {
      zh: "同作者人文向学术写作 skill（Apache-2.0）；与史鉴包并列收录，便于中文社科写作场景发现。",
      en: "Sibling humanities academic-writing skill from the same author; listed for Chinese social-science writing discovery.",
    },
    tags: ["academic-writing", "chinese", "humanities"],
    externalUrl: "https://github.com/YuanZHAO321/Academic-Writing",
    license: "Apache-2.0",
    author: AUTHOR,
    attribution: "YuanZHAO321/Academic-Writing · Apache-2.0",
    featuredRank: 43,
    when: {
      zh: "中文人文/社科论文结构与表述需要 skill 约束时。",
      en: "When structuring Chinese humanities / social-science prose with a skill pack.",
    },
  }),
];

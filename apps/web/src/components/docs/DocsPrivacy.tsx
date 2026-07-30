import { getTranslations } from "next-intl/server";
import {
  DocsArticleHeader,
  DocsCode,
  DocsProseList,
  DocsSection,
} from "./DocsArticle";
import { DocsShell } from "./DocsShell";

/**
 * Privacy & telemetry — Spec 06 / 29 product copy, docs placement Spec 30.
 */
export async function DocsPrivacy() {
  const t = await getTranslations("pages.docs.privacy");
  const collectItems = t.raw("collectItems") as string[];
  const notCollectItems = t.raw("notCollectItems") as string[];
  const optOutItems = t.raw("optOutItems") as string[];
  const toc = [
    { id: "collect", label: t("collectHeading") },
    { id: "not-collect", label: t("notCollectHeading") },
    { id: "opt-out", label: t("optOutHeading") },
    { id: "endpoint", label: t("urlHeading") },
    { id: "heat", label: t("heatHeading") },
    { id: "copy", label: t("copyHeading") },
    { id: "purpose", label: t("purposeHeading") },
  ];

  return (
    <DocsShell toc={toc}>
      <DocsArticleHeader title={t("heading")} lede={t("lede")} />

      <DocsSection id="collect" title={t("collectHeading")}>
        <DocsProseList items={collectItems} />
      </DocsSection>

      <DocsSection id="not-collect" title={t("notCollectHeading")}>
        <DocsProseList items={notCollectItems} />
      </DocsSection>

      <DocsSection id="opt-out" title={t("optOutHeading")}>
        <DocsProseList items={optOutItems} />
        <p className="mt-3">{t("optOutEnvNote")}</p>
        <DocsCode>{t("optOutEnvExample")}</DocsCode>
      </DocsSection>

      <DocsSection id="endpoint" title={t("urlHeading")}>
        <p>{t("urlBody")}</p>
        <DocsCode>{t("urlExample")}</DocsCode>
        <p className="mt-2 text-xs">{t("urlHint")}</p>
      </DocsSection>

      <DocsSection id="heat" title={t("heatHeading")}>
        <p>{t("heatBody")}</p>
      </DocsSection>

      <DocsSection id="copy" title={t("copyHeading")}>
        <p>{t("copyBody")}</p>
      </DocsSection>

      <DocsSection id="purpose" title={t("purposeHeading")}>
        <p>{t("purposeBody")}</p>
      </DocsSection>
    </DocsShell>
  );
}

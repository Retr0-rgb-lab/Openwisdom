import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  DocsArticleHeader,
  DocsProseList,
  DocsSection,
} from "./DocsArticle";
import { DocsCallout } from "./DocsCallout";
import { DocsCopyAgentPrompt } from "./DocsCopyAgentPrompt";
import { DocsShell } from "./DocsShell";

export async function DocsAuthoring() {
  const t = await getTranslations("pages.docs.authoringPage");
  const tPrompt = await getTranslations("pages.docs.agentPrompt");
  const toc = [
    { id: "unit", label: t("toc.unit") },
    { id: "layers", label: t("toc.layers") },
    { id: "frontmatter", label: t("toc.frontmatter") },
    { id: "writing", label: t("toc.writing") },
    { id: "pr", label: t("toc.pr") },
    { id: "next", label: t("toc.next") },
  ];
  const unitBody = t.raw("unitBody") as string[];
  const frontmatterItems = t.raw("frontmatterItems") as string[];
  const scenarioTips = t.raw("scenarioTips") as string[];
  const referenceTips = t.raw("referenceTips") as string[];
  const prSteps = t.raw("prSteps") as string[];
  const nextItems = t.raw("nextItems") as { text: string; href: string }[];

  return (
    <DocsShell toc={toc}>
      <DocsArticleHeader
        title={t("title")}
        lede={t("lede")}
        actions={<DocsCopyAgentPrompt prompt={tPrompt("authoring")} />}
      />

      <DocsSection id="unit" title={t("unitHeading")}>
        {unitBody.map((para) => (
          <p key={para}>{para}</p>
        ))}
      </DocsSection>

      <DocsSection id="layers" title={t("layersHeading")}>
        <h3 className="font-medium text-ink">{t("scenarioTitle")}</h3>
        <p>{t("scenarioBody")}</p>
        <h3 className="mt-4 font-medium text-ink">{t("referenceTitle")}</h3>
        <p>{t("referenceBody")}</p>
      </DocsSection>

      <DocsSection id="frontmatter" title={t("frontmatterHeading")}>
        <p>{t("frontmatterIntro")}</p>
        <DocsProseList items={frontmatterItems} />
        <DocsCallout variant="neutral" className="mt-3">
          <p>{t("frontmatterNote")}</p>
        </DocsCallout>
      </DocsSection>

      <DocsSection id="writing" title={t("writingHeading")}>
        <h3 className="font-medium text-ink">{t("scenarioTitle")}</h3>
        <DocsProseList items={scenarioTips} />
        <h3 className="mt-4 font-medium text-ink">{t("referenceTitle")}</h3>
        <DocsProseList items={referenceTips} />
      </DocsSection>

      <DocsSection id="pr" title={t("prHeading")}>
        <ol className="list-decimal space-y-2 pl-5">
          {prSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <DocsCallout variant="warn" className="mt-3">
          <p>{t("prWarning")}</p>
        </DocsCallout>
      </DocsSection>

      <DocsSection id="next" title={t("nextHeading")}>
        <ul className="list-disc space-y-2 pl-5">
          {nextItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </DocsSection>
    </DocsShell>
  );
}

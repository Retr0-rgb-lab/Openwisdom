import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { INSTALL_COMMANDS } from "@/components/install/commands";
import {
  DocsArticleHeader,
  DocsCode,
  DocsProseList,
  DocsSection,
} from "./DocsArticle";
import { DocsCallout } from "./DocsCallout";
import { DocsCopyAgentPrompt } from "./DocsCopyAgentPrompt";
import { DocsShell } from "./DocsShell";

export async function DocsGettingStarted() {
  const t = await getTranslations("pages.docs.gettingStarted");
  const tPrompt = await getTranslations("pages.docs.agentPrompt");
  const toc = [
    { id: "boundary", label: t("toc.boundary") },
    { id: "install", label: t("toc.install") },
    { id: "first-skill", label: t("toc.firstSkill") },
    { id: "invoke", label: t("toc.invoke") },
    { id: "verify", label: t("toc.verify") },
    { id: "next", label: t("toc.next") },
  ];
  const verifyItems = t.raw("verifyItems") as string[];
  const nextItems = t.raw("nextItems") as { text: string; href: string }[];

  return (
    <DocsShell toc={toc}>
      <DocsArticleHeader
        title={t("title")}
        lede={t("lede")}
        actions={<DocsCopyAgentPrompt prompt={tPrompt("gettingStarted")} />}
      />

      <DocsCallout variant="info" title={t("boundaryTitle")}>
        <p>{t("boundaryBody")}</p>
      </DocsCallout>

      <DocsSection id="boundary" title={t("boundaryHeading")}>
        <p>{t("boundaryDetail")}</p>
      </DocsSection>

      <DocsSection id="install" title={t("installHeading")}>
        <p>
          {t("installBody")}{" "}
          <Link
            href="/install"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("installLink")}
          </Link>
        </p>
        <DocsCode>{INSTALL_COMMANDS.cli}</DocsCode>
        <p className="mt-2 text-xs text-ink-muted">{t("installNote")}</p>
      </DocsSection>

      <DocsSection id="first-skill" title={t("firstSkillHeading")}>
        <p>
          {t("firstSkillBody")}{" "}
          <Link
            href="/skills/macro-scan"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            macro-scan
          </Link>
        </p>
        <DocsCode>{t("firstSkillCommand")}</DocsCode>
      </DocsSection>

      <DocsSection id="invoke" title={t("invokeHeading")}>
        <p>{t("invokeBody")}</p>
        <DocsCallout variant="tip" title={t("invokeTipTitle")} className="mt-3">
          <p>{t("invokeTipBody")}</p>
        </DocsCallout>
      </DocsSection>

      <DocsSection id="verify" title={t("verifyHeading")}>
        <DocsProseList items={verifyItems} />
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

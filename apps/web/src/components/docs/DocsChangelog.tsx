import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { GITHUB_URL } from "@/components/site/constants";
import {
  DocsArticleHeader,
  DocsProseList,
  DocsSection,
} from "./DocsArticle";
import { DocsShell } from "./DocsShell";

/**
 * Changelog — capability waves, not fake semver; GitHub is the full truth.
 */
export async function DocsChangelog() {
  const t = await getTranslations("pages.docs.changelogPage");
  const currentItems = t.raw("currentItems") as string[];
  const toc = [
    { id: "current", label: t("toc.current") },
    { id: "history", label: t("toc.history") },
    { id: "source", label: t("toc.source") },
  ];

  return (
    <DocsShell toc={toc}>
      <DocsArticleHeader title={t("title")} lede={t("lede")} />

      <DocsSection id="current" title={t("currentHeading")}>
        <p className="text-xs text-ink-muted">{t("versionLabel")}</p>
        <DocsProseList items={currentItems} />
      </DocsSection>

      <DocsSection id="history" title={t("historyHeading")}>
        <p>{t("historyBody")}</p>
      </DocsSection>

      <DocsSection id="source" title={t("sourceHeading")}>
        <p>{t("sourceBody")}</p>
        <div className="mt-4 flex flex-col items-start gap-2">
          <Button
            variant="outline"
            render={
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" />
            }
          >
            {t("githubLabel")}
            <ArrowUpRight className="size-4" />
          </Button>
          <p className="text-xs text-ink-muted">{t("githubNote")}</p>
        </div>
      </DocsSection>
    </DocsShell>
  );
}

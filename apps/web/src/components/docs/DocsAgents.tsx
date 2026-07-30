import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  DocsArticleHeader,
  DocsProseList,
  DocsSection,
} from "./DocsArticle";
import { DocsCopyAgentPrompt } from "./DocsCopyAgentPrompt";
import { DocsShell } from "./DocsShell";

type TroubleshootItem = { q: string; a: string };
type NextItem = { text: string; href: string };

/**
 * Agents / harness path docs — path matrix, project vs global, troubleshooting.
 */
export async function DocsAgents() {
  const t = await getTranslations("pages.docs.agentsPage");
  const tPrompt = await getTranslations("pages.docs.agentPrompt");
  const toc = [
    { id: "what", label: t("toc.what") },
    { id: "matrix", label: t("toc.matrix") },
    { id: "scopes", label: t("toc.scopes") },
    { id: "troubleshoot", label: t("toc.troubleshoot") },
    { id: "next", label: t("toc.next") },
  ];
  const whatBody = t.raw("whatBody") as string[];
  const matrixHeaders = t.raw("matrixHeaders") as string[];
  const matrixRows = t.raw("matrixRows") as string[][];
  const scopesBody = t.raw("scopesBody") as string[];
  const troubleshootItems = t.raw("troubleshootItems") as TroubleshootItem[];
  const nextItems = t.raw("nextItems") as NextItem[];

  return (
    <DocsShell toc={toc}>
      <DocsArticleHeader
        title={t("title")}
        lede={t("lede")}
        actions={<DocsCopyAgentPrompt prompt={tPrompt("agents")} />}
      />

      <DocsSection id="what" title={t("whatHeading")}>
        <DocsProseList items={whatBody} />
      </DocsSection>

      <DocsSection id="matrix" title={t("matrixHeading")}>
        <p>{t("matrixIntro")}</p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface">
                {matrixHeaders.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-3 py-2 font-medium text-ink"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((row) => (
                <tr
                  key={row.join("|")}
                  className="border-b border-line last:border-b-0"
                >
                  {row.map((cell, i) => (
                    <td
                      key={`${row[0]}-${i}`}
                      className={
                        i === 0
                          ? "px-3 py-2 text-ink"
                          : "px-3 py-2 font-mono text-[0.8125rem] text-ink-muted"
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsSection id="scopes" title={t("scopesHeading")}>
        <DocsProseList items={scopesBody} />
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="font-serif text-base font-semibold text-ink md:text-lg">
              {t("projectTitle")}
            </h3>
            <p className="mt-2">{t("projectBody")}</p>
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-ink md:text-lg">
              {t("globalTitle")}
            </h3>
            <p className="mt-2">{t("globalBody")}</p>
          </div>
        </div>
      </DocsSection>

      <DocsSection id="troubleshoot" title={t("troubleshootHeading")}>
        <dl className="space-y-4">
          {troubleshootItems.map((item, i) => (
            <div
              key={item.q}
              id={`troubleshoot-${i + 1}`}
              className="scroll-mt-28 rounded-lg border border-line bg-surface px-4 py-4"
            >
              <dt className="font-medium text-ink">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
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

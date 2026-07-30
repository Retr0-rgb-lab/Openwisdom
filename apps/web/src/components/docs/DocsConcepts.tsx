import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  DocsArticleHeader,
  DocsProseList,
  DocsSection,
} from "./DocsArticle";
import { DocsCallout } from "./DocsCallout";
import { DocsShell } from "./DocsShell";

/**
 * Concepts — layers, provenance, runtime boundary, catalog discovery.
 * Copy keys: pages.docs.conceptsPage (fill pack).
 */
export async function DocsConcepts() {
  const t = await getTranslations("pages.docs.conceptsPage");
  const toc = [
    { id: "layers", label: t("toc.layers") },
    { id: "provenance", label: t("toc.provenance") },
    { id: "runtime", label: t("toc.runtime") },
    { id: "catalog", label: t("toc.catalog") },
    { id: "next", label: t("toc.next") },
  ];
  const layersBody = t.raw("layersBody") as string[];
  const layersTableHeaders = t.raw("layersTableHeaders") as string[];
  const layersTableRows = t.raw("layersTableRows") as string[][];
  const provenanceBody = t.raw("provenanceBody") as string[];
  const officialPoints = t.raw("officialPoints") as string[];
  const communityPoints = t.raw("communityPoints") as string[];
  const runtimeBody = t.raw("runtimeBody") as string[];
  const catalogBody = t.raw("catalogBody") as string[];
  const nextItems = t.raw("nextItems") as { text: string; href: string }[];

  return (
    <DocsShell toc={toc}>
      <DocsArticleHeader title={t("title")} lede={t("lede")} />

      <DocsSection id="layers" title={t("layersHeading")}>
        {layersBody.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[16rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                {layersTableHeaders.map((h) => (
                  <th
                    key={h}
                    className="px-0 py-2 pr-4 font-medium text-ink first:w-[8rem]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {layersTableRows.map((row) => (
                <tr key={row[0]} className="border-b border-line last:border-b-0">
                  {row.map((cell, i) => (
                    <td
                      key={`${row[0]}-${i}`}
                      className={
                        i === 0
                          ? "px-0 py-2.5 pr-4 font-medium text-ink align-top"
                          : "px-0 py-2.5 text-ink-muted align-top"
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

      <DocsSection id="provenance" title={t("provenanceHeading")}>
        {provenanceBody.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <div className="mt-4 space-y-5">
          <div>
            <p className="font-medium text-ink">{t("officialTitle")}</p>
            <div className="mt-2">
              <DocsProseList items={officialPoints} />
            </div>
          </div>
          <div>
            <p className="font-medium text-ink">{t("communityTitle")}</p>
            <div className="mt-2">
              <DocsProseList items={communityPoints} />
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection id="runtime" title={t("runtimeHeading")}>
        {runtimeBody.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <DocsCallout
          variant="info"
          title={t("runtimeCalloutTitle")}
          className="mt-3"
        >
          <p>{t("runtimeCalloutBody")}</p>
        </DocsCallout>
      </DocsSection>

      <DocsSection id="catalog" title={t("catalogHeading")}>
        {catalogBody.map((p) => (
          <p key={p}>{p}</p>
        ))}
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

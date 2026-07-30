import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { GITHUB_URL } from "@/components/site/constants";
import { Link } from "@/i18n/navigation";
import { DocsArticleHeader } from "./DocsArticle";
import { DocsCallout } from "./DocsCallout";
import { DocsShell } from "./DocsShell";
import type { DocsNavId } from "./nav";

const STUB_KEYS = [
  "concepts",
  "cli",
  "agents",
  "changelog",
] as const;

type StubKey = (typeof STUB_KEYS)[number];

export function isDocsStubKey(id: string): id is StubKey {
  return (STUB_KEYS as readonly string[]).includes(id);
}

/**
 * Honest stub page — no fake depth; deep links to real surfaces.
 */
export async function DocsStub({ pageId }: { pageId: DocsNavId | StubKey }) {
  if (!isDocsStubKey(pageId)) {
    throw new Error(`Invalid stub page: ${pageId}`);
  }
  const t = await getTranslations(`pages.docs.stubs.${pageId}`);
  const tNav = await getTranslations("pages.docs.nav");
  const links = t.raw("links") as {
    label: string;
    href: string;
    external?: boolean;
  }[];

  return (
    <DocsShell>
      <DocsArticleHeader title={t("title")} lede={t("lede")} />
      <DocsCallout variant="neutral" title={tNav("stubBadge")}>
        <p>{t("body")}</p>
      </DocsCallout>
      <div className="mt-6 flex flex-wrap gap-2">
        {links.map((link) =>
          link.external || link.href.startsWith("http") ? (
            <Button
              key={link.label}
              variant="outline"
              render={
                <a
                  href={link.href === "github" ? GITHUB_URL : link.href}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              {link.label}
              <ArrowUpRight className="size-4" />
            </Button>
          ) : (
            <Button
              key={link.label}
              variant="outline"
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ),
        )}
      </div>
    </DocsShell>
  );
}

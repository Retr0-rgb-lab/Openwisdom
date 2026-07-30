import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DocsArticleHeader } from "./DocsArticle";
import { DocsShell } from "./DocsShell";

type FaqItem = { q: string; a: string };

export async function DocsFaq() {
  const t = await getTranslations("pages.docs.faqPage");
  const items = t.raw("items") as FaqItem[];

  return (
    <DocsShell>
      <DocsArticleHeader title={t("title")} lede={t("lede")} />
      <dl className="space-y-4">
        {items.map((item, i) => (
          <div
            key={item.q}
            id={`faq-${i + 1}`}
            className="scroll-mt-28 rounded-lg border border-line bg-surface px-4 py-4"
          >
            <dt className="font-medium text-ink">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-sm text-ink-muted">
        {t("privacyHint")}{" "}
        <Link
          href="/docs/privacy"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("privacyLink")}
        </Link>
      </p>
    </DocsShell>
  );
}

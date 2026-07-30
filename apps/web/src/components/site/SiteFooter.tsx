import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "./BrandLogo";
import { GITHUB_ISSUES_URL, GITHUB_URL, LICENSE_URL } from "./constants";
import { LocaleSwitcher } from "./LocaleSwitcher";

// Five columns per specs/03 §3. Brand mark from repo logo.svg.
export function SiteFooter() {
  const t = useTranslations("shell");
  const siteName = t("meta.siteName");

  return (
    <footer className="border-t border-line bg-surface/95">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-serif text-sm font-semibold text-ink"
          >
            <BrandLogo size={28} className="size-7" />
            {siteName}
          </Link>
          <p className="hidden text-meta text-ink-muted sm:block">
            {t("footer.meta.slogan")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <FooterColumn title={t("footer.product.title")}>
            <FooterLink href="/">{t("footer.product.home")}</FooterLink>
            <FooterLink href="/skills">{t("footer.product.skills")}</FooterLink>
            <FooterLink href="/install">
              {t("footer.product.install")}
            </FooterLink>
          </FooterColumn>

          <FooterColumn title={t("footer.resources.title")}>
            <FooterLink href="/docs">{t("footer.resources.docs")}</FooterLink>
          </FooterColumn>

          <FooterColumn title={t("footer.community.title")}>
            <FooterExternalLink href={GITHUB_URL}>
              {t("footer.community.github")}
            </FooterExternalLink>
            <FooterLink href="/contribute">
              {t("footer.community.contribute")}
            </FooterLink>
            <FooterExternalLink href={GITHUB_ISSUES_URL}>
              {t("footer.community.issues")}
            </FooterExternalLink>
          </FooterColumn>

          <FooterColumn title={t("footer.legal.title")}>
            <FooterExternalLink href={LICENSE_URL}>
              {t("footer.legal.license")}
            </FooterExternalLink>
          </FooterColumn>

          <FooterColumn title={t("footer.meta.title")}>
            <LocaleSwitcher />
            <p className="max-w-48 text-meta text-ink-muted">
              {t("footer.meta.slogan")}
            </p>
          </FooterColumn>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <h2 className="text-meta font-medium tracking-wide text-ink-muted uppercase">
        {title}
      </h2>
      {children}
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-ink-muted transition-colors hover:text-ink"
    >
      {children}
    </Link>
  );
}

function FooterExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-sm text-ink-muted transition-colors hover:text-ink"
    >
      {children}
    </a>
  );
}

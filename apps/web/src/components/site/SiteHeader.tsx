"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import type { CatalogEntry } from "@/data/catalog/types";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { GITHUB_URL, NAV_ITEMS } from "./constants";
import { GithubMark } from "./GithubMark";
import { GlobalSearchTrigger } from "./GlobalSearch";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { BrandLogo } from "./BrandLogo";
import { MobileNav } from "./MobileNav";

// Brand chrome (specs/07 §6): logo.svg mark + wordmark + nav + search + utilities.
export function SiteHeader({
  catalogIndex,
}: {
  /** Slim server catalog for GlobalSearch — no client getCatalog. */
  catalogIndex: CatalogEntry[];
}) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const siteName = t("meta.siteName");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-6 md:gap-3">
        <Link
          href="/"
          className="flex min-h-10 shrink-0 items-center gap-2.5 font-serif text-base font-semibold text-ink"
        >
          <BrandLogo size={32} className="size-8" />
          <span className="hidden sm:inline">{siteName}</span>
        </Link>

        <NavigationMenu className="hidden shrink-0 lg:flex">
          {/* key forces remount when nav set changes (avoids stale CompositeList slots after HMR) */}
          <NavigationMenuList
            key={NAV_ITEMS.map((i) => i.href).join("|")}
            className="gap-0.5"
          >
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    render={<Link href={item.href} />}
                    className={cn(
                      "inline-flex min-h-10 items-center rounded-lg px-2.5 py-2 text-sm xl:px-3",
                      active
                        ? "bg-muted/60 font-medium text-ink"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {t(`nav.${item.key}`)}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="mx-1 min-w-0 flex-1 md:mx-2">
          <Suspense
            fallback={
              <div className="h-9 max-w-[22rem] rounded-full border border-line bg-field" />
            }
          >
            <GlobalSearchTrigger
              compact
              className="max-w-[22rem] md:ml-auto"
              catalogIndex={catalogIndex}
            />
          </Suspense>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            render={
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={t("nav.githubLabel")}
              />
            }
          >
            <GithubMark />
            <span className="sr-only">{t("nav.githubLabel")}</span>
          </Button>
          <Button
            variant="default"
            size="default"
            className="hidden h-10 px-3.5 sm:inline-flex"
            render={<Link href="/skills" />}
          >
            {t("nav.skills")}
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { GITHUB_URL, NAV_ITEMS } from "./constants";
import { DatumMark } from "./DatumMark";
import { GithubMark } from "./GithubMark";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav } from "./MobileNav";

export function SiteHeader() {
  const t = useTranslations("shell");
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-base font-semibold text-ink"
        >
          <DatumMark />
          {t("meta.siteName")}
        </Link>

        <NavigationMenu className="ml-2 hidden md:flex">
          <NavigationMenuList className="gap-1">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    render={<Link href={item.href} />}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5",
                      active
                        ? "bg-muted/60 font-medium text-ink"
                        : "text-ink-muted"
                    )}
                  >
                    {t(`nav.${item.key}`)}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
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
            size="sm"
            className="hidden sm:inline-flex"
            render={<Link href="/install" />}
          >
            {t("nav.install")}
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

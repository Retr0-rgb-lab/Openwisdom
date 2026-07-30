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
import { GithubMark } from "./GithubMark";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav } from "./MobileNav";

// Brand chrome (specs/07 §6): logo.svg + wordmark; Install = solid primary;
// touch targets ≥40px for icon/nav (specs/09).
export function SiteHeader() {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const siteName = t("meta.siteName");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-6 md:gap-4">
        <Link
          href="/"
          className="flex min-h-10 items-center gap-2.5 font-serif text-base font-semibold text-ink"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG from public/brand */}
          <img
            src="/brand/logo.svg"
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-md"
            decoding="async"
          />
          <span>{siteName}</span>
        </Link>

        <NavigationMenu className="ml-1 hidden md:flex">
          <NavigationMenuList className="gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    render={<Link href={item.href} />}
                    className={cn(
                      "inline-flex min-h-10 items-center rounded-lg px-3 py-2 text-sm",
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

        <div className="ml-auto flex items-center gap-1.5">
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

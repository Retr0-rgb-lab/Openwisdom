"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./constants";
import { DatumMark } from "./DatumMark";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function MobileNav() {
  const t = useTranslations("shell");
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-label={t("nav.openMenu")}
          />
        }
      >
        <Menu />
        <span className="sr-only">{t("nav.openMenu")}</span>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 gap-0 p-0">
        <SheetHeader className="border-b border-line">
          <SheetTitle className="flex items-center gap-2">
            <DatumMark />
            {t("nav.menuTitle")}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <SheetClose
                key={item.href}
                render={<Link href={item.href} />}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-muted font-medium text-ink"
                    : "text-ink-muted hover:bg-muted hover:text-ink"
                )}
              >
                {t(`nav.${item.key}`)}
              </SheetClose>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t border-line p-4">
          <SheetClose
            render={<Link href="/install" />}
            className={cn(buttonVariants(), "w-full")}
          >
            {t("nav.install")}
          </SheetClose>
          <LocaleSwitcher />
        </div>
      </SheetContent>
    </Sheet>
  );
}

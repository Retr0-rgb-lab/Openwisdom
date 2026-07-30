"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

export function LocaleSwitcher() {
  const t = useTranslations("shell");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === locale) return;
    // Client-side replace: keeps the current path and avoids a full page
    // reload or re-running hero animations (specs/04 §6).
    router.replace(pathname, { locale: next });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="default"
            className="h-10 gap-1.5 px-2.5"
            aria-label={t("localeSwitcher.label")}
          />
        }
      >
        <Languages />
        {locale === "zh"
          ? t("localeSwitcher.shortZh")
          : t("localeSwitcher.shortEn")}
        <ChevronDown className="opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((l) => (
          <DropdownMenuItem key={l} onClick={() => switchTo(l)}>
            {t(`localeSwitcher.${l}`)}
            {l === locale ? <Check className="ml-auto" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

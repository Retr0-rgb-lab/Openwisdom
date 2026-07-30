"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DOCS_NAV, isDocsNavActive } from "./nav";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("pages.docs.nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("sidebarLabel")} className="flex flex-col gap-0.5">
      {DOCS_NAV.map((item) => {
        const active = isDocsNavActive(pathname, item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors duration-150",
              active
                ? "bg-surface-muted font-medium text-primary"
                : "text-ink-muted hover:bg-surface-muted hover:text-ink",
            )}
          >
            <span>{t(item.labelKey)}</span>
            {item.status === "stub" ? (
              <span className="text-[0.65rem] font-medium tracking-wide text-ink-muted/80 uppercase">
                {t("stubBadge")}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

/** Desktop sticky sidebar + mobile sheet trigger. */
export function DocsSidebar() {
  const t = useTranslations("pages.docs.nav");
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-6 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="inline-flex h-8 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted">
            <Menu className="size-4" />
            {t("menu")}
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100%,18rem)] bg-surface">
            <SheetHeader>
              <SheetTitle className="font-serif text-base">
                {t("title")}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4 px-1">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden w-56 shrink-0 lg:block xl:w-60">
        <div className="sticky top-24">
          <p className="mb-3 px-2.5 text-meta font-medium tracking-wide text-ink-muted uppercase">
            {t("title")}
          </p>
          <NavList />
        </div>
      </aside>
    </>
  );
}

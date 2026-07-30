"use client";

import { Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const sizeClass = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
} as const;

/**
 * Notion-calm heading anchor: visible on heading group hover/focus.
 */
export function DocsHeadingLink({
  id,
  size = "md",
}: {
  id: string;
  size?: "sm" | "md" | "lg";
}) {
  const t = useTranslations("pages.docs.nav");

  return (
    <a
      href={`#${id}`}
      aria-label={t("linkToSection")}
      className={cn(
        "inline-flex shrink-0 self-center text-ink-muted opacity-0 transition-opacity duration-150",
        "hover:text-primary focus-visible:text-primary focus-visible:opacity-100",
        "group-hover:opacity-100 group-focus-within:opacity-100",
      )}
    >
      <Link2 className={sizeClass[size]} aria-hidden />
    </a>
  );
}

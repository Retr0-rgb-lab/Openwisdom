import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function BootstrapBanner({ className }: { className?: string }) {
  const t = useTranslations("skills.bootstrap");

  return (
    <aside
      className={cn(
        "rounded-lg border border-line bg-surface-muted/80 px-4 py-3 md:px-5 md:py-3.5",
        className,
      )}
      role="note"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="border-line bg-surface font-normal text-ink-muted"
        >
          {t("title")}
        </Badge>
      </div>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-muted">
        {t("body")}
      </p>
    </aside>
  );
}

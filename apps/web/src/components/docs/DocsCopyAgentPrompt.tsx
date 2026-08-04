"use client";

import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

/**
 * One-click copy of an agent-oriented LLM prompt for docs pages.
 * Toast feedback via sonner (project Toaster already mounted in layout).
 */
export function DocsCopyAgentPrompt({
  prompt,
  className,
}: {
  prompt: string;
  className?: string;
}) {
  const t = useTranslations("pages.docs.agentPrompt");

  async function onCopy() {
    const ok = await copyText(prompt);
    if (ok) {
      toast.success(t("copied"));
    } else {
      toast.error(t("failed"));
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onCopy}
      aria-label={t("button")}
      className={cn(
        "border-line bg-surface text-sm text-ink-muted shadow-none",
        "hover:bg-surface-muted hover:text-ink",
        className,
      )}
    >
      <Copy className="size-3.5" aria-hidden />
      <span className="hidden sm:inline">{t("button")}</span>
    </Button>
  );
}

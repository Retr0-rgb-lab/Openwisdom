"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

/**
 * Quiet docs code block with one-click copy (Read mode — no Magnet/ClickSpark).
 * Multi-line strings are copied as-is.
 */
export function DocsCodeBlock({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const t = useTranslations("pages.docs.code");
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const ok = await copyText(code);
    if (ok) {
      setCopied(true);
      toast.success(t("copied"));
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error(t("failed"));
    }
  }

  return (
    <div
      className={cn(
        "relative mt-2 rounded-lg border border-line bg-field",
        className,
      )}
    >
      <pre className="overflow-x-auto whitespace-pre-wrap px-3 py-2 pr-12 font-mono text-[0.8125rem] text-ink">
        <code>{code}</code>
      </pre>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onCopy}
        aria-label={copied ? t("copied") : t("copy")}
        className="absolute top-1.5 right-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink"
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden />
        ) : (
          <Copy className="size-3.5" aria-hidden />
        )}
      </Button>
    </div>
  );
}

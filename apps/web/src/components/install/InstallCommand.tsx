"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClickSpark } from "@/components/bits/ClickSpark";
import { cn } from "@/lib/utils";

const CLI_COMMAND = "npx openwisdom install";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

/**
 * CLI install object.
 * `emphasis` — bolder/colorize: primary ring + stronger code well (Hero peak).
 */
export function InstallCommand({
  className,
  emphasis = false,
}: {
  className?: string;
  emphasis?: boolean;
}) {
  const t = useTranslations("home.install");
  const [copied, setCopied] = useState(false);

  return (
    <Card
      className={cn(
        "border-line bg-surface shadow-[0_2px_8px_-2px_rgb(15_23_36/0.08)]",
        emphasis && "ring-1 ring-primary/25 border-primary/30",
        className,
      )}
    >
      <CardContent
        className={cn(
          "flex flex-col gap-3",
          emphasis ? "p-5 md:p-6" : "p-4 md:p-5",
        )}
      >
        <p
          role="status"
          className="border-l border-line pl-3 font-mono text-xs leading-relaxed text-ink-muted"
        >
          {t("cliStatus")}
        </p>
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-3.5",
            emphasis
              ? "border-primary/20 bg-primary/[0.04]"
              : "border-line bg-field/90",
          )}
        >
          <code
            className={cn(
              "flex-1 overflow-x-auto font-mono whitespace-nowrap text-ink",
              emphasis ? "text-[0.9375rem] font-medium" : "text-sm",
            )}
          >
            {CLI_COMMAND}
          </code>
          <ClickSpark active={copied}>
            <Button
              variant={emphasis ? "default" : "ghost"}
              size="sm"
              className={cn(
                "shrink-0 transition-colors duration-200",
                emphasis && "bg-primary text-primary-foreground hover:bg-primary-pressed",
              )}
              onClick={async () => {
                const ok = await copyText(CLI_COMMAND);
                if (ok) {
                  setCopied(true);
                  toast.success(t("copied"));
                  window.setTimeout(() => setCopied(false), 2000);
                } else {
                  toast.error(t("copyFailed"));
                }
              }}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              <span className="sr-only">{t("copied")}</span>
            </Button>
          </ClickSpark>
          <span aria-live="polite" className="sr-only">
            {copied ? t("copied") : ""}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted">{t("cliNote")}</p>
      </CardContent>
    </Card>
  );
}

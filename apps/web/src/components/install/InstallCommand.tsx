"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClickSpark } from "@/components/bits/ClickSpark";
import { Magnet } from "@/components/bits/Magnet";
import { TextType } from "@/components/bits/TextType";
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
 * CLI install object (A+B).
 * emphasis: primary ring · TextType once · code sweep · Magnet copy · ClickSpark
 * Opaque Atlas Plate: solid surface + line-strong fallback + contact shadow
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
  const [sweep, setSweep] = useState(false);

  useEffect(() => {
    if (!emphasis) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setTimeout(() => setSweep(true), 700);
    return () => window.clearTimeout(id);
  }, [emphasis]);

  const copyBtn = (
    <ClickSpark active={copied}>
      <Button
        variant={emphasis ? "default" : "ghost"}
        size="sm"
        className={cn(
          "shrink-0 transition-transform duration-150 active:scale-[0.96]",
          emphasis &&
            "bg-primary text-primary-foreground hover:bg-primary-pressed",
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
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        <span className="sr-only">{t("copied")}</span>
      </Button>
    </ClickSpark>
  );

  return (
    <Card
      className={cn(
        // Opaque Atlas Plate — solid surface + line-strong + contact shadow
        "border-line-strong bg-surface",
        "shadow-[0_1px_0_rgb(15_23_36/0.04),0_4px_14px_-2px_rgb(15_23_36/0.08)]",
        emphasis && "border-primary/30 ring-1 ring-primary/25",
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
            "relative flex items-center gap-2 overflow-hidden rounded-lg border px-4 py-3.5",
            emphasis
              ? "border-primary/20 bg-surface-muted"
              : "border-line bg-field",
          )}
        >
          {/* one-shot sweep — ow-custom CSS */}
          {sweep ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary/12 to-transparent motion-reduce:hidden"
              style={{
                animation:
                  "ow-code-sweep 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
            />
          ) : null}
          <code
            className={cn(
              "relative z-[1] flex-1 overflow-x-auto font-mono whitespace-nowrap text-ink",
              emphasis ? "text-[0.9375rem] font-medium" : "text-sm",
            )}
          >
            {emphasis ? (
              <TextType text={CLI_COMMAND} speed={26} delay={200} />
            ) : (
              CLI_COMMAND
            )}
          </code>
          <span className="relative z-[1]">
            {emphasis ? (
              <Magnet magnetStrength={7} padding={40}>
                {copyBtn}
              </Magnet>
            ) : (
              copyBtn
            )}
          </span>
          <span aria-live="polite" className="sr-only">
            {copied ? t("copied") : ""}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted">{t("cliNote")}</p>
      </CardContent>
      <style>{`
        @keyframes ow-code-sweep {
          from { transform: translateX(-120%); opacity: 0; }
          25% { opacity: 1; }
          to { transform: translateX(320%); opacity: 0; }
        }
      `}</style>
    </Card>
  );
}

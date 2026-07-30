"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ClickSpark } from "@/components/bits/ClickSpark";
import { Magnet } from "@/components/bits/Magnet";
import { TextType } from "@/components/bits/TextType";
import {
  INSTALL_COMMANDS,
  type InstallSurface,
} from "@/components/install/commands";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export { INSTALL_COMMANDS, type InstallSurface };

type CopyTarget = "command" | "prompt";

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

function CopyControl({
  active,
  onClick,
  label,
  showLabel,
  primary,
  magnet,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  showLabel: boolean;
  primary?: boolean;
  magnet?: boolean;
}) {
  const btn = (
    <ClickSpark active={active}>
      <Button
        type="button"
        variant={primary ? "default" : "ghost"}
        size="sm"
        className={cn(
          "shrink-0 gap-1.5 transition-transform duration-150 active:scale-[0.96]",
          primary && "bg-primary text-primary-foreground hover:bg-primary-pressed",
        )}
        onClick={onClick}
      >
        {active ? <Check className="size-4" /> : <Copy className="size-4" />}
        <span className={showLabel ? "text-xs sm:text-sm" : "sr-only"}>
          {label}
        </span>
      </Button>
    </ClickSpark>
  );

  if (magnet) {
    return (
      <Magnet magnetStrength={7} padding={40}>
        {btn}
      </Magnet>
    );
  }
  return btn;
}

/**
 * Install object (Hero + Final CTA).
 * Tabs: CLI | MCP — command + AI install prompt (copy → paste into agent).
 */
export function InstallCommand({
  className,
  emphasis = false,
  defaultSurface = "cli",
}: {
  className?: string;
  emphasis?: boolean;
  defaultSurface?: InstallSurface;
}) {
  const t = useTranslations("home.install");
  const [surface, setSurface] = useState<InstallSurface>(defaultSurface);
  const [copied, setCopied] = useState<CopyTarget | null>(null);

  const command = INSTALL_COMMANDS[surface];
  const prompt = surface === "cli" ? t("cliPrompt") : t("mcpPrompt");

  async function onCopy(target: CopyTarget) {
    const text = target === "command" ? command : prompt;
    const ok = await copyText(text);
    if (ok) {
      setCopied(target);
      toast.success(target === "prompt" ? t("promptCopied") : t("copied"));
      window.setTimeout(() => setCopied(null), 2000);
    } else {
      toast.error(t("copyFailed"));
    }
  }

  const promptCopyLabel =
    copied === "prompt" ? t("promptCopiedShort") : t("copyPrompt");

  return (
    <Card
      className={cn(
        "border-line-strong bg-surface",
        "shadow-[0_1px_0_rgb(15_23_36/0.04),0_4px_14px_-2px_rgb(15_23_36/0.08)]",
        emphasis && "border-primary/30 ring-1 ring-primary/25",
        className,
      )}
    >
      <CardContent
        className={cn(
          "flex flex-col gap-3.5",
          emphasis ? "p-5 md:p-6" : "p-4 md:p-5",
        )}
      >
        <Tabs
          value={surface}
          onValueChange={(v) => {
            if (v === "cli" || v === "mcp") {
              setSurface(v);
              setCopied(null);
            }
          }}
          className="gap-0"
        >
          <TabsList
            variant="line"
            className="h-auto w-full justify-start gap-0 border-b border-line pb-0"
            aria-label={t("surfacesLabel")}
          >
            <TabsTrigger
              value="cli"
              className="min-h-9 flex-none rounded-none px-3 text-sm data-active:text-ink"
            >
              {t("tabCli")}
            </TabsTrigger>
            <TabsTrigger
              value="mcp"
              className="min-h-9 flex-none rounded-none px-3 text-sm data-active:text-ink"
            >
              {t("tabMcp")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Terminal command */}
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-[0.7rem] tracking-wide text-ink-muted">
            {t("commandLabel")}
          </p>
          <div
            className={cn(
              "relative flex items-center gap-2 overflow-hidden rounded-lg border px-4 py-3",
              emphasis
                ? "border-primary/20 bg-surface-muted"
                : "border-line bg-field",
            )}
          >
            {emphasis ? (
              <span
                key={`sweep-${surface}`}
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
                <TextType
                  key={surface}
                  text={command}
                  speed={26}
                  delay={surface === "cli" ? 200 : 80}
                />
              ) : (
                command
              )}
            </code>
            <span className="relative z-[1]">
              <CopyControl
                active={copied === "command"}
                onClick={() => onCopy("command")}
                label={t("copied")}
                showLabel={false}
              />
            </span>
          </div>
        </div>

        {/* AI install prompt — primary path for agents */}
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-[0.7rem] tracking-wide text-ink-muted">
            {t("promptLabel")}
          </p>
          <div
            className={cn(
              "flex flex-col gap-2 rounded-lg border px-3.5 py-3 sm:flex-row sm:items-start sm:gap-3",
              emphasis ? "border-primary/25 bg-field" : "border-line bg-field",
            )}
          >
            <p className="min-w-0 flex-1 text-left text-sm leading-relaxed text-ink">
              {prompt}
            </p>
            <div className="shrink-0 self-end sm:self-start">
              <CopyControl
                active={copied === "prompt"}
                onClick={() => onCopy("prompt")}
                label={promptCopyLabel}
                showLabel
                primary={emphasis}
                magnet={emphasis}
              />
            </div>
          </div>
          <p className="text-sm leading-relaxed text-ink-muted">
            {surface === "cli" ? t("cliNote") : t("mcpNote")}
          </p>
        </div>

        <span aria-live="polite" className="sr-only">
          {copied === "prompt"
            ? t("promptCopied")
            : copied === "command"
              ? t("copied")
              : ""}
        </span>
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

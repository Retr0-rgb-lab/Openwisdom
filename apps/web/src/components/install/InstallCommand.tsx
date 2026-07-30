"use client";

import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GITHUB_URL } from "@/components/site/constants";
import { cn } from "@/lib/utils";

const CLI_COMMAND = "npx openwisdom install";
const CLONE_COMMAND = `git clone ${GITHUB_URL}.git`;

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts
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

function CodeRow({ command, copiedLabel }: { command: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-field px-4 py-3">
      <code className="flex-1 overflow-x-auto font-mono text-sm whitespace-nowrap text-ink">
        {command}
      </code>
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0"
        onClick={async () => {
          const ok = await copyText(command);
          if (ok) {
            setCopied(true);
            toast.success(copiedLabel);
            window.setTimeout(() => setCopied(false), 2000);
          }
        }}
      >
        {copied ? (
          <Check className="size-4 text-insight" />
        ) : (
          <Copy className="size-4" />
        )}
        <span className="sr-only">{copiedLabel}</span>
      </Button>
      {/* Screen-reader announcement of copy success */}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </div>
  );
}

// Install object (specs/03 §4.1, specs/04 §3): the primary "object" on Home.
// CLI first; GitHub and manual as secondary paths. Copy feedback via Sonner —
// no confetti, no fake terminal typing.
export function InstallCommand({ className }: { className?: string }) {
  const t = useTranslations("home.install");

  return (
    <Card className={cn("border-line shadow-none", className)}>
      <CardContent className="p-4 md:p-5">
        <Tabs defaultValue="cli">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="cli">{t("tabs.cli")}</TabsTrigger>
            <TabsTrigger value="github">{t("tabs.github")}</TabsTrigger>
            <TabsTrigger value="manual">{t("tabs.manual")}</TabsTrigger>
          </TabsList>
          <TabsContent value="cli" className="mt-4 flex flex-col gap-3">
            <CodeRow command={CLI_COMMAND} copiedLabel={t("copied")} />
            <p className="text-sm leading-relaxed text-ink-muted">{t("cliNote")}</p>
          </TabsContent>
          <TabsContent value="github" className="mt-4 flex flex-col gap-3">
            <p className="text-sm leading-relaxed text-ink-muted">{t("githubNote")}</p>
            <div>
              <Button
                variant="outline"
                className="border-line"
                render={<a href={GITHUB_URL} target="_blank" rel="noreferrer" />}
              >
                {t("githubCta")}
                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="manual" className="mt-4 flex flex-col gap-3">
            <p className="text-sm leading-relaxed text-ink-muted">{t("manualNote")}</p>
            <CodeRow command={CLONE_COMMAND} copiedLabel={t("copied")} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

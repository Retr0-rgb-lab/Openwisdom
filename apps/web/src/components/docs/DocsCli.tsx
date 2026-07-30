import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { INSTALL_COMMANDS } from "@/components/install/commands";
import {
  DocsArticleHeader,
  DocsCode,
  DocsSection,
} from "./DocsArticle";
import { DocsCallout } from "./DocsCallout";
import { DocsCopyAgentPrompt } from "./DocsCopyAgentPrompt";
import { DocsShell } from "./DocsShell";

type CommandItem = { name: string; desc: string; example: string };
type FlagItem = { flag: string; desc: string };
type McpToolItem = { name: string; desc: string };
type NextItem = { text: string; href: string };

/**
 * CLI & MCP package-manager docs — dual surface, no LLM.
 * Specs 17–20 / 22–24; status copy stays honest until npm publish.
 */
export async function DocsCli() {
  const t = await getTranslations("pages.docs.cliPage");
  const tPrompt = await getTranslations("pages.docs.agentPrompt");
  const toc = [
    { id: "status", label: t("toc.status") },
    { id: "cli", label: t("toc.cli") },
    { id: "commands", label: t("toc.commands") },
    { id: "flags", label: t("toc.flags") },
    { id: "mcp", label: t("toc.mcp") },
    { id: "telemetry", label: t("toc.telemetry") },
    { id: "next", label: t("toc.next") },
  ];
  const cliBody = t.raw("cliBody") as string[];
  const commands = t.raw("commands") as CommandItem[];
  const flags = t.raw("flags") as FlagItem[];
  const mcpBody = t.raw("mcpBody") as string[];
  const mcpTools = t.raw("mcpTools") as McpToolItem[];
  const nextItems = t.raw("nextItems") as NextItem[];

  return (
    <DocsShell toc={toc}>
      <DocsArticleHeader
        title={t("title")}
        lede={t("lede")}
        actions={<DocsCopyAgentPrompt prompt={tPrompt("cli")} />}
      />

      <DocsSection id="status" title={t("statusHeading")}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-line bg-field font-normal text-ink-muted"
          >
            {t("statusBadge")}
          </Badge>
        </div>
        <DocsCallout variant="neutral" className="mt-3">
          <p>{t("statusBody")}</p>
        </DocsCallout>
      </DocsSection>

      <DocsSection id="cli" title={t("cliHeading")}>
        {cliBody.map((para) => (
          <p key={para}>{para}</p>
        ))}
        <DocsCode>{t("cliInstallExample")}</DocsCode>
      </DocsSection>

      <DocsSection id="commands" title={t("commandsHeading")}>
        <ul className="space-y-5">
          {commands.map((cmd) => (
            <li key={cmd.name}>
              <p className="font-mono text-sm font-medium text-ink">{cmd.name}</p>
              <p className="mt-1">{cmd.desc}</p>
              <DocsCode>{cmd.example}</DocsCode>
            </li>
          ))}
        </ul>
      </DocsSection>

      <DocsSection id="flags" title={t("flagsHeading")}>
        <dl className="space-y-3">
          {flags.map((item) => (
            <div
              key={item.flag}
              className="grid gap-1 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-4"
            >
              <dt className="font-mono text-[0.8125rem] font-medium text-ink">
                {item.flag}
              </dt>
              <dd>{item.desc}</dd>
            </div>
          ))}
        </dl>
      </DocsSection>

      <DocsSection id="mcp" title={t("mcpHeading")}>
        {mcpBody.map((para) => (
          <p key={para}>{para}</p>
        ))}
        <p className="mt-2">{t("mcpEntryNote")}</p>
        <DocsCode>{INSTALL_COMMANDS.mcp}</DocsCode>
        <p className="mt-2 text-xs">{t("mcpDevNote")}</p>
        <DocsCode>{t("mcpDevExample")}</DocsCode>

        <h3 className="mt-4 font-serif text-base font-semibold text-ink md:text-lg">
          {t("mcpToolsHeading")}
        </h3>
        <ul className="mt-2 space-y-3">
          {mcpTools.map((tool) => (
            <li key={tool.name}>
              <p className="font-mono text-sm font-medium text-ink">{tool.name}</p>
              <p className="mt-0.5">{tool.desc}</p>
            </li>
          ))}
        </ul>

        <h3 className="mt-6 font-serif text-base font-semibold text-ink md:text-lg">
          {t("mcpConfigHeading")}
        </h3>
        <p className="mt-2">{t("mcpConfigNote")}</p>
        <DocsCode>{t("mcpConfigExample")}</DocsCode>
      </DocsSection>

      <DocsSection id="telemetry" title={t("telemetryHeading")}>
        <p>
          {t("telemetryBody")}{" "}
          <Link
            href={t("privacyHref")}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("privacyLink")}
          </Link>
        </p>
      </DocsSection>

      <DocsSection id="next" title={t("nextHeading")}>
        <ul className="list-disc space-y-2 pl-5">
          {nextItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </DocsSection>
    </DocsShell>
  );
}

"use client";

import { Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  getCatalog,
  pickLocalized,
  queryCatalog,
  type CatalogEntry,
} from "@/data/catalog";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const JUMP_LINKS = [
  { href: "/skills" as const, key: "skills" },
  { href: "/install" as const, key: "install" },
  { href: "/docs" as const, key: "docs" },
  { href: "/contribute" as const, key: "contribute" },
] as const;

type Row =
  | { kind: "skill"; entry: CatalogEntry }
  | { kind: "jump"; href: (typeof JUMP_LINKS)[number]["href"]; key: string }
  | { kind: "search-catalog"; q: string };

function isMacPlatform() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
}

export function GlobalSearchTrigger({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const t = useTranslations("shell.search");
  const [open, setOpen] = useState(false);
  const mac = useMemo(() => isMacPlatform(), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group inline-flex h-9 min-w-0 items-center gap-2 rounded-full border border-line bg-field px-3 text-sm text-ink-muted transition-colors",
          "hover:border-line hover:bg-surface hover:text-ink",
          "focus-visible:border-primary/40 focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none",
          compact ? "w-9 justify-center px-0 sm:w-auto sm:px-3" : "w-full max-w-[22rem]",
          className,
        )}
        aria-label={t("openAria")}
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-left",
            compact && "hidden sm:inline",
          )}
        >
          {t("placeholder")}
        </span>
        <KbdGroup className={cn("shrink-0", compact ? "hidden md:inline-flex" : "hidden md:inline-flex")}>
          {mac ? (
            <Kbd>⌘K</Kbd>
          ) : (
            <>
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </>
          )}
        </KbdGroup>
      </button>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}

function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("shell");
  const tSearch = useTranslations("shell.search");
  const tSkills = useTranslations("skills");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  // Prefill from catalog URL when opening
  useEffect(() => {
    if (!open) return;
    const urlQ = searchParams.get("q") ?? "";
    if (pathname.startsWith("/skills") && urlQ) {
      setQ(urlQ);
    } else {
      setQ("");
    }
    setActive(0);
    const id = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(id);
  }, [open, pathname, searchParams]);

  const skillHits = useMemo(() => {
    return queryCatalog({ q, sort: "featured" }, locale).slice(0, 8);
  }, [q, locale]);

  const featured = useMemo(() => {
    return getCatalog()
      .filter((e) => e.scope === "official" && e.layer === "scenario")
      .slice(0, 3);
  }, []);

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    const skills = q.trim() ? skillHits : featured;
    for (const entry of skills) {
      out.push({ kind: "skill", entry });
    }
    for (const jump of JUMP_LINKS) {
      out.push({ kind: "jump", href: jump.href, key: jump.key });
    }
    if (q.trim()) {
      out.push({ kind: "search-catalog", q: q.trim() });
    }
    return out;
  }, [q, skillHits, featured]);

  useEffect(() => {
    setActive(0);
  }, [q]);

  const goCatalogSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(
        pathname.startsWith("/skills") ? searchParams.toString() : "",
      );
      if (query) params.set("q", query);
      else params.delete("q");
      const qs = params.toString();
      router.push((`/skills${qs ? `?${qs}` : ""}`) as "/skills");
      onOpenChange(false);
    },
    [onOpenChange, pathname, router, searchParams],
  );

  const activate = useCallback(
    (row: Row) => {
      if (row.kind === "skill") {
        router.push(`/skills/${row.entry.slug}`);
        onOpenChange(false);
        return;
      }
      if (row.kind === "jump") {
        router.push(row.href);
        onOpenChange(false);
        return;
      }
      goCatalogSearch(row.q);
    },
    [goCatalogSearch, onOpenChange, router],
  );

  function onKeyDown(e: ReactKeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(rows.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const row = rows[active];
      if (row) activate(row);
      else if (q.trim()) goCatalogSearch(q.trim());
    }
  }

  const skillCount = q.trim() ? skillHits.length : featured.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0"
        onKeyDown={onKeyDown}
      >
        <DialogTitle className="sr-only">{tSearch("dialogTitle")}</DialogTitle>
        <DialogDescription className="sr-only">
          {tSearch("dialogDescription")}
        </DialogDescription>

        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search className="size-4 shrink-0 text-ink-muted" aria-hidden />
          <Input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tSearch("placeholder")}
            className="h-12 border-0 bg-transparent shadow-none focus-visible:ring-0"
            autoComplete="off"
            spellCheck={false}
          />
          <Kbd className="shrink-0">Esc</Kbd>
        </div>

        <div className="max-h-[min(70vh,28rem)] overflow-y-auto p-2">
          {skillCount > 0 ? (
            <div className="mb-1 px-2 py-1.5 text-[0.7rem] font-semibold tracking-wide text-structure uppercase">
              {tSearch("groupSkills")}
            </div>
          ) : null}

          {rows.map((row, i) => {
            if (row.kind === "skill") {
              const title = pickLocalized(row.entry.title, locale);
              const summary = pickLocalized(row.entry.summary, locale);
              return (
                <button
                  key={`skill-${row.entry.slug}`}
                  type="button"
                  className={cn(
                    "flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                    i === active
                      ? "bg-primary/8 text-ink"
                      : "text-ink hover:bg-field",
                  )}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => activate(row)}
                >
                  <span className="flex items-center gap-2">
                    <span className="rounded border border-line bg-field px-1.5 py-0.5 text-[0.65rem] text-ink-muted">
                      {tSkills(`layer.${row.entry.layer}`)}
                    </span>
                    <span className="font-medium">{title}</span>
                    <span className="ml-auto font-mono text-[0.7rem] text-ink-muted">
                      {row.entry.slug}
                    </span>
                  </span>
                  <span className="line-clamp-1 text-xs text-ink-muted">
                    {summary}
                  </span>
                </button>
              );
            }

            if (row.kind === "jump") {
              // Jump group header once
              const isFirstJump =
                rows.findIndex((r) => r.kind === "jump") === i;
              return (
                <div key={`jump-${row.key}`}>
                  {isFirstJump ? (
                    <div className="mt-2 mb-1 px-2 py-1.5 text-[0.7rem] font-semibold tracking-wide text-structure uppercase">
                      {tSearch("groupJump")}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      i === active
                        ? "bg-primary/8 text-ink"
                        : "text-ink-muted hover:bg-field hover:text-ink",
                    )}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => activate(row)}
                  >
                    {t(`nav.${row.key}`)}
                  </button>
                </div>
              );
            }

            return (
              <button
                key="search-catalog"
                type="button"
                className={cn(
                  "mt-1 flex w-full items-center justify-between rounded-lg border border-dashed border-line px-3 py-2.5 text-left text-sm transition-colors",
                  i === active
                    ? "border-primary/40 bg-primary/8 text-ink"
                    : "text-ink-muted hover:bg-field hover:text-ink",
                )}
                onMouseEnter={() => setActive(i)}
                onClick={() => activate(row)}
              >
                <span>
                  {tSearch("searchCatalog", { q: row.q })}
                </span>
                <Kbd>↵</Kbd>
              </button>
            );
          })}

          {q.trim() && skillHits.length === 0 ? (
            <p className="px-3 py-4 text-sm text-ink-muted">
              {tSearch("noSkills")}
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Suspense boundary helper for header (useSearchParams). */
export function GlobalSearchTriggerSafe(
  props: React.ComponentProps<typeof GlobalSearchTrigger>,
) {
  return <GlobalSearchTrigger {...props} />;
}

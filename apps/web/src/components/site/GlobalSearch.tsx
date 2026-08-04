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
  attachHeat,
  getCatalog,
  pickLocalized,
  queryCatalog,
  type CatalogEntry,
} from "@/data/catalog";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { StatsResponse } from "@/lib/heat/types";
import { cn } from "@/lib/utils";

function parseStatsResponse(data: unknown): StatsResponse | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (obj.schemaVersion !== 1) return null;
  if (!obj.skills || typeof obj.skills !== "object" || Array.isArray(obj.skills)) {
    return null;
  }
  return data as StatsResponse;
}

const JUMP_LINKS = [
  { href: "/skills" as const, key: "skills" },
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

/** SSR-safe: always start with Ctrl so server HTML matches first client paint. */
function useIsMac() {
  const [mac, setMac] = useState(false);
  useEffect(() => {
    setMac(isMacPlatform());
  }, []);
  return mac;
}

/** Prefill palette query from catalog URL (Spec 16: /skills?q=…). */
function prefillFromCatalogUrl(
  pathname: string,
  searchParams: { get: (key: string) => string | null },
) {
  const urlQ = searchParams.get("q") ?? "";
  if (pathname.startsWith("/skills") && urlQ) return urlQ;
  return "";
}

export function GlobalSearchTrigger({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const t = useTranslations("shell.search");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  /** Bumps on each open so CommandPalette remounts with fresh seedQ. */
  const [paletteEpoch, setPaletteEpoch] = useState(0);
  const [seedQ, setSeedQ] = useState("");
  const mac = useIsMac();

  const openPalette = useCallback(() => {
    setSeedQ(prefillFromCatalogUrl(pathname, searchParams));
    setPaletteEpoch((n) => n + 1);
    setOpen(true);
  }, [pathname, searchParams]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setSeedQ(prefillFromCatalogUrl(pathname, searchParams));
        setPaletteEpoch((n) => n + 1);
      }
      setOpen(next);
    },
    [pathname, searchParams],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) {
          setOpen(false);
        } else {
          openPalette();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openPalette]);

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
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
      <CommandPalette
        key={paletteEpoch}
        open={open}
        onOpenChange={handleOpenChange}
        seedQ={seedQ}
      />
    </>
  );
}

function CommandPalette({
  open,
  onOpenChange,
  seedQ,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seedQ: string;
}) {
  const t = useTranslations("shell");
  const tSearch = useTranslations("shell.search");
  const tSkills = useTranslations("skills");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState(seedQ);
  const [active, setActive] = useState(0);
  /** Heat side-channel; fail-open null (SPE 37 G4). */
  const [stats, setStats] = useState<StatsResponse | null>(null);

  // Focus input when dialog opens (DOM only — no setState).
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(id);
  }, [open]);

  // Same attachHeat path as list/detail — client fetch, never throw
  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats", { headers: { accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        if (!cancelled) setStats(parseStatsResponse(data));
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const catalog = useMemo(
    () => attachHeat(getCatalog(), stats),
    [stats],
  );

  const skillHits = useMemo(() => {
    return queryCatalog({ q, sort: "featured" }, locale, catalog).slice(0, 8);
  }, [q, locale, catalog]);

  const featured = useMemo(() => {
    return catalog
      .filter((e) => e.scope === "official" && e.layer === "scenario")
      .slice(0, 3);
  }, [catalog]);

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

  // Keep highlight index in range when result list shrinks
  useEffect(() => {
    setActive((i) => {
      if (rows.length === 0) return 0;
      return Math.min(i, rows.length - 1);
    });
  }, [rows.length]);

  // Arrow-key navigation must keep active option visible in the scrollport
  useEffect(() => {
    if (!open || rows.length === 0) return;
    const option = document.getElementById(`gs-opt-${active}`);
    if (!option) return;
    // Prefer scrolling only the listbox (not the whole page / dialog)
    const list = listRef.current;
    if (list && list.contains(option)) {
      const listRect = list.getBoundingClientRect();
      const optRect = option.getBoundingClientRect();
      if (optRect.top < listRect.top) {
        list.scrollTop -= listRect.top - optRect.top;
      } else if (optRect.bottom > listRect.bottom) {
        list.scrollTop += optRect.bottom - listRect.bottom;
      }
      return;
    }
    option.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active, open, rows]);

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
  const listboxId = "gs-listbox";
  const activeOptionId =
    rows.length > 0 ? `gs-opt-${active}` : undefined;

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
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            placeholder={tSearch("placeholder")}
            className="h-12 border-0 bg-transparent shadow-none focus-visible:ring-0"
            autoComplete="off"
            spellCheck={false}
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            aria-autocomplete="list"
          />
          <Kbd className="shrink-0">Esc</Kbd>
        </div>

        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={tSearch("dialogTitle")}
          className="max-h-[min(70vh,28rem)] overflow-y-auto p-2"
        >
          {skillCount > 0 ? (
            <div
              className="mb-1 px-2 py-1.5 text-[0.7rem] font-semibold tracking-wide text-structure uppercase"
              role="presentation"
            >
              {tSearch("groupSkills")}
            </div>
          ) : null}

          {rows.map((row, i) => {
            const optionId = `gs-opt-${i}`;
            const selected = i === active;

            if (row.kind === "skill") {
              const title = pickLocalized(row.entry.title, locale);
              const summary = pickLocalized(row.entry.summary, locale);
              return (
                <button
                  key={`skill-${row.entry.slug}`}
                  id={optionId}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    "flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                    selected
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
                <div key={`jump-${row.key}`} role="presentation">
                  {isFirstJump ? (
                    <div
                      className="mt-2 mb-1 px-2 py-1.5 text-[0.7rem] font-semibold tracking-wide text-structure uppercase"
                      role="presentation"
                    >
                      {tSearch("groupJump")}
                    </div>
                  ) : null}
                  <button
                    id={optionId}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={cn(
                      "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      selected
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
                id={optionId}
                type="button"
                role="option"
                aria-selected={selected}
                className={cn(
                  "mt-1 flex w-full items-center justify-between rounded-lg border border-dashed border-line px-3 py-2.5 text-left text-sm transition-colors",
                  selected
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
            <p className="px-3 py-4 text-sm text-ink-muted" role="status">
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

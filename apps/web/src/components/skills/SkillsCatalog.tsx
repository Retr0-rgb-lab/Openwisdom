"use client";

import { ChevronDown, Filter, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Stagger, StaggerItem } from "@/components/bits/Stagger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  catalogHasHeat,
  DISCIPLINE_IDS,
  getCatalog,
  parseDisciplineParam,
  parseLangParam,
  parseLayerParam,
  parseSortParam,
  parseSourceParam,
  queryCatalog,
  type CatalogQuery,
  type ContentLang,
  type DisciplineId,
  type SkillLayer,
  type SkillScope,
  type SortKey,
} from "@/data/catalog";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { BootstrapBanner } from "./BootstrapBanner";
import { DISCIPLINE_CSS } from "./disciplineStyles";
import { SkillCard } from "./SkillCard";
import { SkillsEmpty } from "./SkillsEmpty";

function buildQueryString(q: CatalogQuery): string {
  const params = new URLSearchParams();
  if (q.q?.trim()) params.set("q", q.q.trim());
  if (q.layer) params.set("layer", q.layer);
  if (q.source) params.set("source", q.source);
  if (q.disciplines?.length) {
    params.set("discipline", q.disciplines.join(","));
  }
  if (q.lang) params.set("lang", q.lang);
  if (q.sort && q.sort !== "featured") params.set("sort", q.sort);
  const s = params.toString();
  return s ? `?${s}` : "";
}

/** Compact chip — sticky toolbar density (not min-h-9 stacks). */
function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-[0.8125rem] transition-colors",
        "focus-visible:border-primary/40 focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none",
        active
          ? "border-primary/40 bg-primary/8 font-medium text-primary"
          : "border-line bg-surface text-ink-muted hover:bg-field hover:text-ink",
        className,
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

/**
 * Full filter form — only inside Sheet (not sticky-embedded).
 * Vertical sections are fine here because the sheet scrolls.
 */
function FiltersPanel({
  query,
  setQuery,
  showPopular,
}: {
  query: CatalogQuery;
  setQuery: (next: Partial<CatalogQuery>) => void;
  showPopular: boolean;
}) {
  const t = useTranslations("skills");

  function toggleDiscipline(id: DisciplineId) {
    const current = query.disciplines ?? [];
    const next = current.includes(id)
      ? current.filter((d) => d !== id)
      : [...current, id];
    setQuery({ disciplines: next });
  }

  function toggleSource(source: SkillScope) {
    setQuery({ source: query.source === source ? "" : source });
  }

  function toggleLang(lang: ContentLang) {
    setQuery({ lang: query.lang === lang ? "" : lang });
  }

  function setLayer(layer: SkillLayer | "") {
    setQuery({ layer });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-structure">
          {t("filters.layer")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip active={!query.layer} onClick={() => setLayer("")}>
            {t("filters.layerAll")}
          </Chip>
          <Chip
            active={query.layer === "scenario"}
            onClick={() => setLayer("scenario")}
          >
            {t("layer.scenario")}
          </Chip>
          <Chip
            active={query.layer === "reference"}
            onClick={() => setLayer("reference")}
          >
            {t("layer.reference")}
          </Chip>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-structure">
          {t("filters.source")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip
            active={query.source === "official"}
            onClick={() => toggleSource("official")}
          >
            {t("scope.official")}
          </Chip>
          <Chip
            active={query.source === "community"}
            onClick={() => toggleSource("community")}
          >
            {t("scope.community")}
          </Chip>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-structure">
          {t("filters.discipline")}
        </p>
        <div className="flex flex-wrap gap-2">
          {DISCIPLINE_IDS.map((id) => {
            const active = query.disciplines?.includes(id);
            return (
              <Chip key={id} active={active} onClick={() => toggleDiscipline(id)}>
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: DISCIPLINE_CSS[id] }}
                  aria-hidden
                />
                {t(`disciplines.${id}`)}
              </Chip>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-structure">
          {t("filters.language")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip active={query.lang === "zh"} onClick={() => toggleLang("zh")}>
            zh
          </Chip>
          <Chip active={query.lang === "en"} onClick={() => toggleLang("en")}>
            en
          </Chip>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-structure">
          {t("filters.sort")}
        </p>
        <div className="flex flex-wrap gap-2">
          {(["featured", "name", "updated"] as SortKey[]).map((key) => (
            <Chip
              key={key}
              active={(query.sort ?? "featured") === key}
              onClick={() => setQuery({ sort: key })}
            >
              {t(`sort.${key}`)}
            </Chip>
          ))}
          {showPopular ? (
            <Chip
              active={query.sort === "popular"}
              onClick={() => setQuery({ sort: "popular" })}
            >
              {t("sort.popular")}
            </Chip>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact sticky toolbar — single row (wraps once max on narrow md).
 * Does NOT embed FiltersPanel / FiltersBody. Spec 16 layout fix.
 */
function SkillsToolbar({
  query,
  setQuery,
  showPopular,
  activeFilterCount,
  onClear,
}: {
  query: CatalogQuery;
  setQuery: (next: Partial<CatalogQuery>) => void;
  showPopular: boolean;
  activeFilterCount: number;
  onClear: () => void;
}) {
  const t = useTranslations("skills");
  const sortKey = (query.sort ?? "featured") as SortKey;
  const sortOptions: SortKey[] = showPopular
    ? ["featured", "name", "updated", "popular"]
    : ["featured", "name", "updated"];

  // Sheet badge: language only (disciplines are first-class on bar)
  const sheetExtraCount = query.lang ? 1 : 0;

  function toggleDiscipline(id: DisciplineId) {
    const current = query.disciplines ?? [];
    const next = current.includes(id)
      ? current.filter((d) => d !== id)
      : [...current, id];
    setQuery({ disciplines: next });
  }

  return (
    <div
      data-skills-toolbar="compact"
      className="toolbar-compact mx-auto flex max-w-6xl max-h-14 flex-nowrap items-center gap-x-2 overflow-x-auto px-6 py-2.5 [scrollbar-width:thin]"
    >
      {/* Layer — primary facet, always visible */}
      <div
        className="flex shrink-0 items-center gap-1"
        role="group"
        aria-label={t("filters.layer")}
      >
        <Chip
          active={!query.layer}
          onClick={() => setQuery({ layer: "" })}
        >
          {t("filters.layerAll")}
        </Chip>
        <Chip
          active={query.layer === "scenario"}
          onClick={() => setQuery({ layer: "scenario" })}
        >
          {t("layer.scenario")}
        </Chip>
        <Chip
          active={query.layer === "reference"}
          onClick={() => setQuery({ layer: "reference" })}
        >
          {t("layer.reference")}
        </Chip>
      </div>

      <span className="hidden h-4 w-px shrink-0 bg-line sm:block" aria-hidden />

      {/* Disciplines — first-class product facet (Openwisdom atlas) */}
      <div
        className="flex shrink-0 items-center gap-1"
        role="group"
        aria-label={t("filters.discipline")}
      >
        <span className="hidden shrink-0 text-[0.7rem] font-semibold tracking-wide text-structure sm:inline">
          {t("filters.discipline")}
        </span>
        {DISCIPLINE_IDS.map((id) => {
          const active = query.disciplines?.includes(id);
          return (
            <Chip key={id} active={active} onClick={() => toggleDiscipline(id)}>
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: DISCIPLINE_CSS[id] }}
                aria-hidden
              />
              <span className="max-w-[4.5rem] truncate sm:max-w-none">
                {t(`disciplines.${id}`)}
              </span>
            </Chip>
          );
        })}
      </div>

      <span className="hidden h-4 w-px shrink-0 bg-line md:block" aria-hidden />

      {/* Source */}
      <div
        className="flex shrink-0 items-center gap-1"
        role="group"
        aria-label={t("filters.source")}
      >
        <Chip
          active={query.source === "official"}
          onClick={() =>
            setQuery({
              source: query.source === "official" ? "" : "official",
            })
          }
        >
          {t("scope.official")}
        </Chip>
        <Chip
          active={query.source === "community"}
          onClick={() =>
            setQuery({
              source: query.source === "community" ? "" : "community",
            })
          }
        >
          {t("scope.community")}
        </Chip>
      </div>

      <span className="hidden h-4 w-px shrink-0 bg-line md:block" aria-hidden />

      {/* Sort dropdown — one control, not 3 chips */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="h-8 shrink-0 gap-1 px-2.5 text-[0.8125rem]"
            />
          }
        >
          {t("filters.sort")}: {t(`sort.${sortKey}`)}
          <ChevronDown className="size-3.5 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          {sortOptions.map((key) => (
            <DropdownMenuItem
              key={key}
              onClick={() => setQuery({ sort: key })}
              className={cn(sortKey === key && "bg-primary/8 font-medium")}
            >
              {t(`sort.${key}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* More → Sheet (full form + language) */}
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="h-8 shrink-0 gap-1.5 px-2.5 text-[0.8125rem]"
            />
          }
        >
          <Filter className="size-3.5" />
          {t("filters.more")}
          {sheetExtraCount > 0 ? (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 justify-center px-1.5 text-[0.7rem]"
            >
              {sheetExtraCount}
            </Badge>
          ) : null}
        </SheetTrigger>
        <SheetContent side="right" className="w-full max-w-sm overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("filters.openFilters")}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            <FiltersPanel
              query={query}
              setQuery={setQuery}
              showPopular={showPopular}
            />
            <div className="mt-6 flex gap-2">
              {activeFilterCount > 0 ? (
                <Button type="button" variant="ghost" onClick={onClear}>
                  {t("filters.clearAll")}
                </Button>
              ) : null}
              <SheetClose
                render={<Button className="flex-1" variant="default" />}
              >
                {t("filters.done")}
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {activeFilterCount > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 gap-1 px-2 text-[0.8125rem]"
          onClick={onClear}
        >
          <X className="size-3.5" />
          {t("filters.clearAll")}
        </Button>
      ) : null}

      {query.q?.trim() ? (
        <Badge
          variant="outline"
          className="h-7 max-w-[10rem] shrink-0 truncate border-primary/30 bg-primary/8 font-normal text-primary"
        >
          q: {query.q.trim()}
        </Badge>
      ) : null}
    </div>
  );
}

export function SkillsCatalog() {
  const t = useTranslations("skills");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const query: CatalogQuery = useMemo(() => {
    return {
      q: searchParams.get("q") ?? "",
      layer: parseLayerParam(searchParams.get("layer") ?? undefined),
      source: parseSourceParam(searchParams.get("source") ?? undefined),
      disciplines: parseDisciplineParam(
        searchParams.get("discipline") ?? undefined,
      ),
      lang: parseLangParam(searchParams.get("lang") ?? undefined),
      sort: parseSortParam(searchParams.get("sort") ?? undefined),
    };
  }, [searchParams]);

  const catalog = getCatalog();
  const showPopular = catalogHasHeat(catalog);
  const showBootstrap = catalog.some((e) => e.source === "bootstrap");

  const results = useMemo(
    () => queryCatalog(query, locale),
    [query, locale],
  );

  const featured = useMemo(
    () =>
      queryCatalog(
        { sort: "featured", layer: "scenario", source: "official" },
        locale,
      ).slice(0, 3),
    [locale],
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (query.q?.trim()) n += 1;
    if (query.layer) n += 1;
    if (query.source) n += 1;
    if (query.lang) n += 1;
    if (query.disciplines?.length) n += query.disciplines.length;
    if (query.sort && query.sort !== "featured") n += 1;
    return n;
  }, [query]);

  const hardFiltersActive = Boolean(
    query.q?.trim() ||
      query.layer ||
      query.source ||
      query.lang ||
      (query.disciplines?.length ?? 0) > 0,
  );

  const pushQuery = useCallback(
    (next: CatalogQuery) => {
      const qs = buildQueryString(next);
      startTransition(() => {
        router.replace((`${pathname}${qs}` || "/skills") as "/skills", {
          scroll: false,
        });
      });
    },
    [pathname, router],
  );

  const setQuery = useCallback(
    (partial: Partial<CatalogQuery>) => {
      pushQuery({ ...query, ...partial });
    },
    [pushQuery, query],
  );

  const clearAll = useCallback(() => {
    pushQuery({ sort: "featured" });
  }, [pushQuery]);

  const communityOnly = query.source === "community" && results.length === 0;

  const countLabel =
    results.length === 1
      ? t("intro.resultCountOne")
      : t("intro.resultCount", { count: results.length });

  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-8 md:py-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.8125rem] font-semibold tracking-[-0.01em] text-structure">
                {t("intro.eyebrow")}
              </p>
              <h1 className="mt-2 font-serif text-[2rem] leading-[1.12] font-semibold tracking-[-0.025em] text-ink md:text-[2.35rem]">
                {t("intro.title")}
              </h1>
              <p className="mt-2 max-w-[42rem] text-sm leading-[1.65] text-ink-muted md:text-base">
                {t("intro.lede")}
              </p>
            </div>
            <p className="shrink-0 text-sm tabular-nums text-ink-muted">
              {countLabel}
            </p>
          </div>

          {showBootstrap ? <BootstrapBanner className="mt-5" /> : null}
        </div>
      </section>

      {/* Compact sticky toolbar — max ~56px, no stacked filter form */}
      <div className="sticky top-14 z-30 border-b border-line bg-field/95 backdrop-blur-sm supports-[backdrop-filter]:bg-field/90">
        <SkillsToolbar
          query={query}
          setQuery={setQuery}
          showPopular={showPopular}
          activeFilterCount={activeFilterCount}
          onClear={clearAll}
        />
      </div>

      {!hardFiltersActive && featured.length > 0 ? (
        <section className="border-b border-line bg-surface-muted/40">
          <div className="mx-auto max-w-6xl px-6 py-6 md:py-8">
            <div className="mb-4">
              <h2 className="font-serif text-lg font-semibold tracking-[-0.02em] text-ink md:text-xl">
                {t("featured.title")}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                {t("featured.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {featured.map((entry) => (
                <a
                  key={entry.slug}
                  href={`#skill-${entry.slug}`}
                  className="inline-flex min-h-9 items-center rounded-md border border-line bg-surface px-3 py-1.5 font-mono text-xs text-ink-muted transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {entry.slug}
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-8 md:py-10">
          {results.length === 0 ? (
            <SkillsEmpty
              communityOnly={communityOnly}
              featured={featured}
              onClear={clearAll}
            />
          ) : (
            <Stagger
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              stagger={0.06}
            >
              {results.map((entry) => (
                <StaggerItem key={entry.slug} className="h-full min-h-0">
                  <div
                    id={`skill-${entry.slug}`}
                    className="h-full scroll-mt-28"
                  >
                    <SkillCard entry={entry} />
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>
    </div>
  );
}

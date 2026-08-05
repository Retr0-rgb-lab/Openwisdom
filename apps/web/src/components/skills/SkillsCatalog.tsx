"use client";

import { ChevronDown, Filter, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { MagicBentoGrid } from "@/components/bits/MagicBento";
import { Stagger, StaggerItem } from "@/components/bits/Stagger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
  filterCatalog,
  parseDisciplineParam,
  parseLangParam,
  parseLayerParam,
  parseSortParam,
  sortCatalog,
  type CatalogEntry,
  type CatalogQuery,
  type ContentLang,
  type DisciplineId,
  type SkillLayer,
  type SortKey,
} from "@/data/catalog";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { DISCIPLINE_CSS } from "./disciplineStyles";
import { SkillCard } from "./SkillCard";
import { SkillsEmpty } from "./SkillsEmpty";

const EXPLORE_PREVIEW = 12;

function buildQueryString(q: CatalogQuery): string {
  const params = new URLSearchParams();
  if (q.q?.trim()) params.set("q", q.q.trim());
  if (q.layer) params.set("layer", q.layer);
  // `source` intentionally omitted — one library, no Official/Community/Curated facet
  if (q.disciplines?.length) {
    params.set("discipline", q.disciplines.join(","));
  }
  if (q.lang) params.set("lang", q.lang);
  if (q.sort && q.sort !== "featured") params.set("sort", q.sort);
  const s = params.toString();
  return s ? `?${s}` : "";
}

/** Recommended scenario workflows (editorial rank), not a separate product line. */
function isFeaturedScenario(entry: CatalogEntry): boolean {
  if (entry.layer !== "scenario") return false;
  const rank = entry.featuredRank ?? Number.POSITIVE_INFINITY;
  return rank <= 20;
}

/** Pack hubs: slug *-pack, principle-skill-pack, or top featured with pack tag. */
function isFeaturedPack(entry: CatalogEntry): boolean {
  if (entry.slug.endsWith("-pack")) return true;
  if (entry.id === "principle-skill-pack") return true;
  const rank = entry.featuredRank ?? Number.POSITIVE_INFINITY;
  return rank <= 10 && entry.tags.includes("pack");
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

function SkillGrid({ entries }: { entries: CatalogEntry[] }) {
  return (
    <MagicBentoGrid className="w-full" enableSpotlight spotlightRadius={300}>
      {/*
        items-start: same row tops align even when card body heights differ.
        Uniform gap-6 for row/column rhythm (content size must not shift baseline).
      */}
      <Stagger
        className="grid auto-rows-auto grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3"
        stagger={0.06}
      >
        {entries.map((entry) => (
          <StaggerItem key={entry.slug} className="min-h-0 w-full self-start">
            <div id={`skill-${entry.slug}`} className="w-full scroll-mt-28">
              <SkillCard entry={entry} />
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </MagicBentoGrid>
  );
}

function CatalogSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b border-line", className)}>
      <div className="mx-auto max-w-6xl px-6 py-8 md:py-10">
        <h2 className="mb-5 font-serif text-lg font-semibold tracking-[-0.02em] text-ink md:text-xl">
          {title}
        </h2>
        {children}
      </div>
    </section>
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
 * Disciplines collapsed into multi-select dropdown (chips remain in Sheet).
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

  // Sheet badge: language only (disciplines live in bar dropdown)
  const sheetExtraCount = query.lang ? 1 : 0;
  const disciplineCount = query.disciplines?.length ?? 0;

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

      {/* Discipline multi-select — replaces 6 chips on bar */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 shrink-0 gap-1 px-2.5 text-[0.8125rem]",
                disciplineCount > 0 &&
                  "border-primary/40 bg-primary/8 font-medium text-primary",
              )}
            />
          }
        >
          {t("sections.disciplineMenu")}
          {disciplineCount > 0 ? (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 justify-center px-1.5 text-[0.7rem]"
            >
              {disciplineCount}
            </Badge>
          ) : null}
          <ChevronDown className="size-3.5 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-48">
          {DISCIPLINE_IDS.map((id) => {
            const checked = query.disciplines?.includes(id) ?? false;
            return (
              <DropdownMenuCheckboxItem
                key={id}
                checked={checked}
                onCheckedChange={() => toggleDiscipline(id)}
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: DISCIPLINE_CSS[id] }}
                  aria-hidden
                />
                {t(`disciplines.${id}`)}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

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

      {/* More → Sheet (full form + language + discipline chips) */}
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

/**
 * Skills catalog Operate surface.
 * `entries` must be heat-merged (or static) on the server (Spec 29).
 * Without heat, do not invent installs* zeros. Never import getCatalog here.
 */
export function SkillsCatalog({
  entries,
}: {
  /** Pre-merged catalog (static + optional heat) from Server Component. */
  entries: CatalogEntry[];
}) {
  const t = useTranslations("skills");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [exploreExpanded, setExploreExpanded] = useState(false);

  const query: CatalogQuery = useMemo(() => {
    return {
      q: searchParams.get("q") ?? "",
      layer: parseLayerParam(searchParams.get("layer") ?? undefined),
      disciplines: parseDisciplineParam(
        searchParams.get("discipline") ?? undefined,
      ),
      lang: parseLangParam(searchParams.get("lang") ?? undefined),
      sort: parseSortParam(searchParams.get("sort") ?? undefined),
    };
  }, [searchParams]);

  const catalog = entries;
  const showPopular = catalogHasHeat(catalog);

  const results = useMemo(
    () =>
      sortCatalog(
        filterCatalog(catalog, query),
        query.sort ?? "featured",
        locale,
      ),
    [catalog, query, locale],
  );

  /** Empty-state recommended scenarios strip. */
  const featured = useMemo(
    () =>
      sortCatalog(
        filterCatalog(catalog, {
          sort: "featured",
          layer: "scenario",
        }),
        "featured",
        locale,
      ).slice(0, 3),
    [catalog, locale],
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (query.q?.trim()) n += 1;
    if (query.layer) n += 1;
    if (query.lang) n += 1;
    if (query.disciplines?.length) n += query.disciplines.length;
    if (query.sort && query.sort !== "featured") n += 1;
    return n;
  }, [query]);

  const hardFiltersActive = Boolean(
    query.q?.trim() ||
      query.layer ||
      query.lang ||
      (query.disciplines?.length ?? 0) > 0,
  );

  /** Distill layout: recommended scenarios → packs → rest of one library. */
  const catalogSections = useMemo(() => {
    if (hardFiltersActive) {
      return {
        featured: [] as CatalogEntry[],
        packs: [] as CatalogEntry[],
        explore: [] as CatalogEntry[],
      };
    }

    const featuredScenarios = results.filter(isFeaturedScenario);
    const featuredSlugs = new Set(featuredScenarios.map((e) => e.slug));
    const packs = results.filter(
      (e) => isFeaturedPack(e) && !featuredSlugs.has(e.slug),
    );
    const packSlugs = new Set(packs.map((e) => e.slug));
    const explore = results.filter(
      (e) => !featuredSlugs.has(e.slug) && !packSlugs.has(e.slug),
    );
    return { featured: featuredScenarios, packs, explore };
  }, [hardFiltersActive, results]);

  const exploreVisible = useMemo(() => {
    if (exploreExpanded) return catalogSections.explore;
    return catalogSections.explore.slice(0, EXPLORE_PREVIEW);
  }, [exploreExpanded, catalogSections.explore]);

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
    setExploreExpanded(false);
    pushQuery({ sort: "featured" });
  }, [pushQuery]);

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

      {results.length === 0 ? (
        <section className="border-b border-line">
          <div className="mx-auto max-w-6xl px-6 py-8 md:py-10">
            <SkillsEmpty featured={featured} onClear={clearAll} />
          </div>
        </section>
      ) : hardFiltersActive ? (
        <section className="border-b border-line">
          <div className="mx-auto max-w-6xl px-6 py-8 md:py-10">
            <SkillGrid entries={results} />
          </div>
        </section>
      ) : (
        <>
          {catalogSections.featured.length > 0 ? (
            <CatalogSection
              title={t("sections.featuredTitle")}
              className="bg-surface-muted"
            >
              <SkillGrid entries={catalogSections.featured} />
            </CatalogSection>
          ) : null}

          {catalogSections.packs.length > 0 ? (
            <CatalogSection title={t("sections.packsTitle")}>
              <SkillGrid entries={catalogSections.packs} />
            </CatalogSection>
          ) : null}

          {catalogSections.explore.length > 0 ? (
            <CatalogSection title={t("sections.exploreTitle")}>
              <SkillGrid entries={exploreVisible} />
              {!exploreExpanded &&
              catalogSections.explore.length > EXPLORE_PREVIEW ? (
                <div className="mt-6 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 px-4 text-[0.8125rem]"
                    onClick={() => setExploreExpanded(true)}
                  >
                    {t("sections.showAll")}
                    <span className="tabular-nums text-ink-muted">
                      ({catalogSections.explore.length})
                    </span>
                  </Button>
                </div>
              ) : null}
            </CatalogSection>
          ) : null}
        </>
      )}

      {showPopular ? (
        <div className="border-b border-line">
          <p className="mx-auto max-w-6xl px-6 py-4 text-xs text-ink-muted">
            {t("heat.note")}
          </p>
        </div>
      ) : null}
    </div>
  );
}

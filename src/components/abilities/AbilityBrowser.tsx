"use client";

import {
  AbilityRow,
  AbilityRowSkeleton,
} from "@components/abilities/AbilityRow";
import { ControlDeck } from "@components/home/ControlDeck";
import { FilterMenu } from "@components/home/FilterMenu";
import { VirtualGrid, type VirtualTier } from "@components/common/VirtualGrid";
import { AbilityData, AbilityQueryResult } from "@interfaces/ability";
import { genShortLabel } from "@constant/pokemonMeta";
import { useResourceBrowser } from "@hooks/useResourceBrowser";

type AbilityBrowserProps = {
  initial: AbilityQueryResult;
};

// Mirrors the catalogue's Tailwind grid (grid-cols-1 · md:cols-2 · xl:cols-3,
// gap-x-10). Rows carry their own hairline divider, so vertical gap is 0.
const ROW_TIERS: VirtualTier[] = [
  { min: 0, columns: 1, colGap: 40, rowGap: 0 },
  { min: 768, columns: 2, colGap: 40, rowGap: 0 },
  { min: 1280, columns: 3, colGap: 40, rowGap: 0 },
];

export function AbilityBrowser({ initial }: AbilityBrowserProps) {
  const {
    query,
    setQuery,
    sort,
    setSort,
    filters,
    setFilters,
    rows,
    resultCount,
    isLast,
    isEmpty,
    isLoading,
    isAppending,
    onIntersect,
  } = useResourceBrowser<AbilityData>({
    initial,
    endpoint: "/api/ability",
    snapshotKey: "abilities",
  });

  const gens = (filters.gens ?? []).map(Number);
  const hasFilters = gens.length > 0;
  const setGens = (next: number[]) =>
    setFilters({ ...filters, gens: next.map(String) });

  const activeFilters = gens.map((g) => ({
    key: `gen-${g}`,
    label: genShortLabel(g),
    onRemove: () => setGens(gens.filter((v) => v !== g)),
  }));

  const scrollToTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const clearFilter = () => {
    scrollToTop();
    setFilters({});
  }

  return (
    <>
      <ControlDeck
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        resultCount={resultCount}
        isLoading={isLoading}
        placeholder="Search abilities…"
        filterSlot={
          <FilterMenu
            gens={gens}
            onGensChange={setGens}
            clearFilter={clearFilter}
          />
        }
        activeFilters={activeFilters}
        onClearFilters={clearFilter}
      />

      {!isEmpty && (
        <div
          className={`transition-opacity duration-200 ${
            isLoading ? "pointer-events-none opacity-40" : ""
          }`}
        >
          <VirtualGrid<AbilityData>
            items={rows}
            getKey={(ability) => ability.name}
            renderItem={(ability) => <AbilityRow ability={ability} />}
            renderSkeleton={(i) => <AbilityRowSkeleton key={i} />}
            tiers={ROW_TIERS}
            estimateRowHeight={110}
            fallbackClassName="grid grid-cols-1 gap-x-10 md:grid-cols-2 xl:grid-cols-3"
            resetKey={`${sort}|${query}|${gens.join(",")}`}
            hasMore={!isLast}
            isAppending={isAppending}
            onEndReached={() => onIntersect(true)}
            endLabel="End of content"
          />
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-muted-foreground">
            {query
              ? `No abilities match "${query}".`
              : hasFilters
                ? "No abilities in those generations."
                : "Nothing to show."}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setFilters({})}
              className="text-sm font-medium text-primary underline-offset-2 outline-none transition-colors hover:underline focus-visible:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </>
  );
}

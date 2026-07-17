"use client";

import {
  AbilityRow,
  AbilityRowSkeleton,
} from "@components/abilities/AbilityRow";
import { ControlDeck } from "@components/home/ControlDeck";
import { FilterMenu } from "@components/home/FilterMenu";
import { VirtualScroll } from "@components/common/VirtualScroll";
import { AbilityData, AbilityQueryResult } from "@interfaces/ability";
import { genShortLabel } from "@constant/pokemonMeta";
import { useResourceBrowser } from "@hooks/useResourceBrowser";

type AbilityBrowserProps = {
  initial: AbilityQueryResult;
};

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

      <div
        className={`grid grid-cols-1 gap-x-10 transition-opacity duration-200 md:grid-cols-2 xl:grid-cols-3 ${
          isLoading ? "pointer-events-none opacity-40" : ""
        }`}
      >
        {rows.map((ability) => (
          <AbilityRow key={ability.name} ability={ability} />
        ))}
        {isAppending && <AbilityRowSkeleton />}
      </div>

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

      <VirtualScroll intersectCallback={onIntersect} isLast={isLast} />
    </>
  );
}

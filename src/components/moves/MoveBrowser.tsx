"use client";

import { MoveTile, MoveTileSkeleton } from "@components/moves/MoveTile";
import { ControlDeck } from "@components/home/ControlDeck";
import { FilterMenu } from "@components/home/FilterMenu";
import { Button } from "@components/ui/button";
import { VirtualGrid, type VirtualTier } from "@components/common/VirtualGrid";
import { MoveData, MoveQueryResult } from "@interfaces/move";
import { genShortLabel } from "@constant/pokemonMeta";
import { damageClassLabel } from "@constant/moveMeta";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useMoveStore } from "@store/moveStore";

type MoveBrowserProps = {
  initial: MoveQueryResult;
};

// Mirrors the card grid (grid-cols-2 · md:cols-3 · xl:cols-4, gap-4).
const CARD_TIERS: VirtualTier[] = [
  { min: 0, columns: 2, colGap: 16, rowGap: 16 },
  { min: 768, columns: 3, colGap: 16, rowGap: 16 },
  { min: 1280, columns: 4, colGap: 16, rowGap: 16 },
];

export function MoveBrowser({ initial }: MoveBrowserProps) {
  // One-time seed from the SSR result (not an effect); idempotent on remount.
  useState(() => useMoveStore.getState().init(initial));

  const {
    query,
    sort,
    filters,
    results,
    total,
    hasMore,
    status,
    setQuery,
    setSort,
    setFilters,
    loadMore,
  } = useMoveStore(
    useShallow((s) => ({
      query: s.query,
      sort: s.sort,
      filters: s.filters,
      results: s.results,
      total: s.total,
      hasMore: s.hasMore,
      status: s.status,
      setQuery: s.setQuery,
      setSort: s.setSort,
      setFilters: s.setFilters,
      loadMore: s.loadMore,
    })),
  );

  const resultCount = total;
  const isLoading = status === "loading";
  const isAppending = status === "appending";
  const isLast = !hasMore;
  const isEmpty = results.length === 0;

  const types = filters.types ?? [];
  const classes = filters.classes ?? [];
  const gens = (filters.gens ?? []).map(Number);
  const hasFilters = types.length + classes.length + gens.length > 0;

  const setTypes = (next: string[]) => setFilters({ ...filters, types: next });
  const setClasses = (next: string[]) =>
    setFilters({ ...filters, classes: next });
  const setGens = (next: number[]) =>
    setFilters({ ...filters, gens: next.map(String) });

  const activeFilters = [
    ...types.map((t) => ({
      key: `type-${t}`,
      label: t,
      onRemove: () => setTypes(types.filter((v) => v !== t)),
    })),
    ...classes.map((c) => ({
      key: `class-${c}`,
      label: damageClassLabel(c),
      onRemove: () => setClasses(classes.filter((v) => v !== c)),
    })),
    ...gens.map((g) => ({
      key: `gen-${g}`,
      label: genShortLabel(g),
      onRemove: () => setGens(gens.filter((v) => v !== g)),
    })),
  ];

  const scrollToTop = () => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const clearFilter = () => {
    scrollToTop();
    setFilters({});
  };

  const handleSort = (next: typeof sort) => {
    if (next === sort) return;
    setSort(next);
    scrollToTop();
  };

  return (
    <>
      <ControlDeck
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={handleSort}
        resultCount={resultCount}
        isLoading={isLoading}
        placeholder="Search moves…"
        filterSlot={
          <FilterMenu
            types={types}
            onTypesChange={setTypes}
            classes={classes}
            onClassesChange={setClasses}
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
          <VirtualGrid<MoveData>
            items={results}
            getKey={(move) => move.name}
            renderItem={(move) => <MoveTile move={move} />}
            renderSkeleton={(i) => <MoveTileSkeleton key={i} />}
            tiers={CARD_TIERS}
            estimateRowHeight={168}
            fallbackClassName="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
            resetKey={`${sort}|${query}|${types.join(",")}|${classes.join(",")}|${gens.join(",")}`}
            hasMore={!isLast}
            isAppending={isAppending}
            onEndReached={() => loadMore()}
            endLabel="End of content"
          />
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-muted-foreground">
            {query
              ? `No moves match "${query}".`
              : hasFilters
                ? "No moves match those filters."
                : "Nothing to show."}
          </p>
          {hasFilters && (
            <Button type="button" variant="link" onClick={() => setFilters({})}>
              Clear filters
            </Button>
          )}
        </div>
      )}
    </>
  );
}

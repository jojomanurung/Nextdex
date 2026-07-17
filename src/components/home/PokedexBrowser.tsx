"use client";

import { PokemonTile, PokemonTileSkeleton } from "@components/home/PokemonTile";
import { ControlDeck } from "@components/home/ControlDeck";
import { FilterMenu } from "@components/home/FilterMenu";
import { VirtualScroll } from "@components/common/VirtualScroll";
import { PokemonData, PokemonQueryResult } from "@interfaces/pokemon";
import { genShortLabel } from "@constant/pokemonMeta";
import { useResourceBrowser } from "@hooks/useResourceBrowser";

type PokedexBrowserProps = {
  initial: PokemonQueryResult;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function PokedexBrowser({ initial }: PokedexBrowserProps) {
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
  } = useResourceBrowser<PokemonData>({
    initial,
    endpoint: "/api/pokemon",
    snapshotKey: "pokemon",
  });

  const types = filters.types ?? [];
  const gens = (filters.gens ?? []).map(Number);
  const hasFilters = types.length > 0 || gens.length > 0;

  const setTypes = (next: string[]) => setFilters({ ...filters, types: next });
  const setGens = (next: number[]) =>
    setFilters({ ...filters, gens: next.map(String) });

  const activeFilters = [
    ...types.map((t) => ({
      key: `type-${t}`,
      label: capitalize(t),
      onRemove: () => setTypes(types.filter((v) => v !== t)),
    })),
    ...gens.map((g) => ({
      key: `gen-${g}`,
      label: genShortLabel(g),
      onRemove: () => setGens(gens.filter((v) => v !== g)),
    })),
  ];

  const scrollToTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const clearFilter = () => {
    scrollToTop();
    setFilters({});
  };

  return (
    <>
      <ControlDeck
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        resultCount={resultCount}
        isLoading={isLoading}
        filterSlot={
          <FilterMenu
            types={types}
            onTypesChange={setTypes}
            gens={gens}
            onGensChange={setGens}
            clearFilter={clearFilter}
          />
        }
        activeFilters={activeFilters}
        onClearFilters={clearFilter}
      />

      <div
        className={`grid grid-cols-2 gap-x-4 gap-y-10 transition-opacity duration-200 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-y-14 xl:grid-cols-5 ${
          isLoading ? "pointer-events-none opacity-40" : ""
        }`}
      >
        {rows.map((pokemon) => (
          <PokemonTile key={pokemon.name} pokemon={pokemon} />
        ))}
        {isAppending &&
          Array.from({ length: 5 }).map((_, i) => (
            <PokemonTileSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {isEmpty && (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <p className="font-display text-lg text-foreground">No Pokémon found</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {query
              ? `Nothing matches “${query}”. Try another name or number.`
              : hasFilters
                ? "No Pokémon match these filters."
                : "Nothing to show."}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setFilters({})}
              className="mt-1 text-sm font-medium text-primary underline-offset-2 outline-none transition-colors hover:underline focus-visible:underline"
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

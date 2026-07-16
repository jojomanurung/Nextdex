"use client";

import { PokemonTile, PokemonTileSkeleton } from "@components/home/PokemonTile";
import { ControlDeck } from "@components/home/ControlDeck";
import { VirtualScroll } from "@components/common/VirtualScroll";
import { ScrollToTop } from "@components/common/ScrollToTop";
import { PokemonData, PokemonQueryResult } from "@interfaces/pokemon";
import { useResourceBrowser } from "@hooks/useResourceBrowser";

type PokedexBrowserProps = {
  initial: PokemonQueryResult;
};

export function PokedexBrowser({ initial }: PokedexBrowserProps) {
  const {
    query,
    setQuery,
    sort,
    setSort,
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

  return (
    <>
      <ControlDeck
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        resultCount={resultCount}
        isLoading={isLoading}
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
              : "Nothing to show."}
          </p>
        </div>
      )}

      <ScrollToTop threshold={1000} />

      <VirtualScroll intersectCallback={onIntersect} isLast={isLast} />
    </>
  );
}

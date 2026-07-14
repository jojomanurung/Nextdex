"use client";

import {
  PokemonRow,
  PokemonRowSkeleton,
} from "@components/home/PokemonRow";
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
        className={`flex flex-col gap-3 transition-opacity duration-200 ${
          isLoading ? "pointer-events-none opacity-40" : ""
        }`}
      >
        {rows.map((pokemon) => (
          <PokemonRow key={pokemon.name} pokemon={pokemon} />
        ))}
        {isAppending && <PokemonRowSkeleton />}
      </div>

      {isEmpty && (
        <p className="py-8 text-center text-ink-muted">
          {query ? `No Pokémon match “${query}”.` : "Nothing to show."}
        </p>
      )}

      <ScrollToTop threshold={1000} />

      <VirtualScroll intersectCallback={onIntersect} isLast={isLast} />
    </>
  );
}

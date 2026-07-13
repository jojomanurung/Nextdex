"use client";

import { PokemonRow } from "@dex/components/home/PokemonRow";
import { ControlDeck } from "@dex/components/home/ControlDeck";
import { VirtualScroll } from "@dex/components/common/VirtualScroll";
import { ScrollToTop } from "@dex/components/common/ScrollToTop";
import { PokemonQueryResult } from "@dex/lib/pokemon";
import { usePokedexBrowser } from "@dex/hooks/usePokedexBrowser";

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
    onIntersect,
  } = usePokedexBrowser({ initial });

  return (
    <>
      <ControlDeck
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        resultCount={resultCount}
      />

      <div className="flex flex-col gap-3">
        {rows.map((pokemon) => (
          <PokemonRow key={pokemon.name} pokemon={pokemon} />
        ))}
      </div>

      {isEmpty && (
        <p className="py-8 text-center text-zinc-500">
          {query ? `No Pokémon match “${query}”.` : "Nothing to show."}
        </p>
      )}

      <ScrollToTop threshold={1000} />

      <VirtualScroll intersectCallback={onIntersect} isLast={isLast} />
    </>
  );
}

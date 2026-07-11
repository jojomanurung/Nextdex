"use client";

import {
  PokemonRow,
  PokemonRowSkeleton,
} from "@dex/components/home/PokemonRow";
import { ControlDeck } from "@dex/components/home/ControlDeck";
import { VirtualScroll } from "@dex/components/common/VirtualScroll";
import { ScrollToTop } from "@dex/components/common/ScrollToTop";
import { PokemonData } from "@dex/interfaces/pokemon";
import { PokemonIndexEntry } from "@dex/lib/pokemon";
import { usePokedexBrowser } from "@dex/hooks/usePokedexBrowser";

type PokedexBrowserProps = {
  results: PokemonData[];
  index: PokemonIndexEntry[];
};

// Client shell for the home page. Owns all interactive list behavior — search,
// sort, and lazy-loaded infinite scroll — via usePokedexBrowser, so the page
// itself stays a Server Component that just fetches the seed data + full index
// and hands them down as props.
export function PokedexBrowser({ results, index }: PokedexBrowserProps) {
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
  } = usePokedexBrowser({ results, index });

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
        {rows.map((row) =>
          row.data ? (
            <PokemonRow key={row.name} pokemon={row.data} />
          ) : (
            <PokemonRowSkeleton key={row.name} id={row.id} name={row.name} />
          ),
        )}
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

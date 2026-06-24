import { GetStaticProps } from "next";
import {
  PokemonRow,
  PokemonRowSkeleton,
} from "@dex/components/home/PokemonRow";
import { ControlDeck } from "@dex/components/home/ControlDeck";
import { VirtualScroll } from "@dex/components/common/VirtualScroll";
import { PokemonData } from "@dex/interfaces/pokemon";
import {
  getPokemonList,
  getPokemonIndex,
  PokemonIndexEntry,
} from "@dex/lib/pokemon";
import { usePokedexBrowser, PAGE_LIMIT } from "@dex/hooks/usePokedexBrowser";
import { ScrollToTop } from "@dex/components/common/ScrollToTop";

type HomeProps = {
  results: PokemonData[];
  index: PokemonIndexEntry[];
};

export default function Home({ results, index }: HomeProps) {
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
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
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
    </div>
  );
}

// Statically generate the first page + the full search/sort index, revalidated
// with ISR. Row details beyond the first page are fetched client-side on scroll.
export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  try {
    const [data, index] = await Promise.all([
      getPokemonList(0, PAGE_LIMIT),
      getPokemonIndex(),
    ]);
    return { props: { results: data.results, index }, revalidate: 60 };
  } catch (error) {
    return { notFound: true };
  }
};

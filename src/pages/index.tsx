import { useCallback, useEffect, useState } from "react";
import { GetStaticProps } from "next";
import { PokemonCard } from "@dex/components/PokemonCard";
import { VirtualScroll } from "@dex/components/VirtualScroll";
import { PokemonData } from "@dex/interfaces/pokemon";
import { usePokemonList } from "@dex/context/PokemonListContext";
import { getPokemonList } from "@dex/lib/pokemon";

type HomeProps = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonData[];
};

const PAGE_LIMIT = 12;

export default function Home({ results }: HomeProps) {
  const { pokemons, setPokemons, page, setPage, isLast, setIsLast } =
    usePokemonList();
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // First visit: seed the cache from the SSR results. On return navigation the
  // cache is already populated, so we keep the previously loaded list instead
  // of resetting to the first page.
  const isSeeded = pokemons.length > 0;
  useEffect(() => {
    if (!isSeeded) {
      setPokemons(results);
      setPage(PAGE_LIMIT);
    }
  }, [isSeeded, results, setPokemons, setPage]);

  // Fall back to SSR results for the very first paint, before the seeding
  // effect runs, to avoid a flash of an empty list.
  const displayPokemons = isSeeded ? pokemons : results;

  const fetchPokemon = useCallback(async () => {
    const resp = await fetch(`/api/pokemon?offset=${page}&limit=${PAGE_LIMIT}`);

    if (!resp.ok) {
      setIsLoading(false);
      return;
    }

    const { data } = await resp.json();
    const newPokeList = [...pokemons, ...data.results];

    setPage((prev) => prev + PAGE_LIMIT);
    setPokemons(newPokeList);
    setIsLast(newPokeList.length === data.count);
    setIsLoading(false);
  }, [page, pokemons]);

  useEffect(() => {
    // Only fetch on a fresh intersection, and never while a request is in
    // flight or once the full list is loaded.
    if (!isIntersecting || isLoading || isLast) return;
    setIsIntersecting(false); // consume the trigger so the next fetchPokemon
    // identity can't re-fire this for the same view
    setIsLoading(true);
    fetchPokemon();
  }, [fetchPokemon, isIntersecting, isLoading, isLast]);

  return (
    <div className="grid grid-flow-row gap-2">
      <div className="justify-self-center">
        <h1 className="">Nextdex</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:mx-7">
        {displayPokemons.map((item) => (
          <PokemonCard key={item.id} pokemon={item} />
        ))}
      </div>
      <VirtualScroll
        intersectCallback={setIsIntersecting}
        isLoading={isLoading}
        isLast={isLast}
      />
    </div>
  );
}

// Statically generate the first page and revalidate it with ISR. Further pages
// are fetched client-side via /api/pokemon as the user scrolls.
export const getStaticProps: GetStaticProps = async () => {
  try {
    const data = await getPokemonList(0, PAGE_LIMIT);
    return { props: data, revalidate: 60 };
  } catch (error) {
    return { notFound: true };
  }
};

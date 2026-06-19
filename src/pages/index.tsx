import { useCallback, useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Image from "next/image";
import Card from "@dex/components/Card";
import Type from "@dex/components/Type";
import VirtualScroll from "@dex/components/VirtualScroll";
import { PokemonData } from "@dex/interfaces/pokemon";
import { usePokemonList } from "@dex/context/PokemonListContext";

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

  const formatPokemonId = (id: number) => {
    if (id < 10) return `#00${id}`;
    else if (id >= 10 && id <= 99) return `#0${id}`;
    else return `#${id}`;
  };

  useEffect(() => {
    // if VirtualScroll is not in view then don't call following functions
    if (!isIntersecting) return;
    setIsLoading(true);
    fetchPokemon();
  }, [fetchPokemon, isIntersecting]);

  return (
    <div className="grid grid-flow-row gap-2">
      <div className="justify-self-center">
        <h1 className="">Nextdex</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:mx-7">
        {displayPokemons.map((item, index) => (
          <Link key={index} href={`detail/${item.name}`}>
            <Card types={item.types}>
              <div className="flex justify-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={0}
                  height={0}
                  sizes="100%"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="/images/placeholder.png"
                  className="w-1/2 md:w-auto h-auto"
                />
              </div>
              <div className="flex items-center justify-center flex-col gap-2">
                <h1 className="m-0 text-center text-base md:text-2xl">
                  {formatPokemonId(item.id)}
                </h1>
                <h2 className="text-base md:text-2xl text-center">
                  {item.name.toUpperCase()}
                </h2>
                <div className="flex justify-center item-center gap-2">
                  {item.types.map((type, index) => (
                    <Type key={index} type={type}></Type>
                  ))}
                </div>
              </div>
            </Card>
          </Link>
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

// To pre-render the page on each request from server
export const getServerSideProps: GetServerSideProps = async () => {
  const resp = await fetch(
    `http://localhost:3000/api/pokemon?offset=0&limit=${PAGE_LIMIT}`,
    {
      next: { revalidate: 60 }, // ISR (optional)
    },
  );

  if (!resp.ok) {
    return {
      notFound: true,
    };
  }

  const { data } = await resp.json();
  return { props: data };
};

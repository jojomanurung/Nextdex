import { Pokemon, PokemonClient } from "pokenode-ts";
import { useCallback, useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Card from "@dex/components/Card";
import VirtualScroll from "@dex/components/VirtualScroll";

type HomeProps = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
};

const PAGE_LIMIT = 12;

export default function Home({ results }: HomeProps) {
  const [pokemons, setPokemons] = useState(results);
  const [page, setPage] = useState(PAGE_LIMIT);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLast, setIsLast] = useState(false);

  const fetchPokemon = useCallback(async () => {
    const api = new PokemonClient();

    const response = await api
      .listPokemons(page, PAGE_LIMIT)
      .then(async (next) => {
        const promises = next.results.map((result) =>
          api.getPokemonByName(result.name)
        );
        const pokeList = await Promise.all(promises);
        const newPokeList = [...pokemons, ...pokeList];
        const temp = { ...next, results: newPokeList };
        return temp;
      });

    setPage((prev) => prev + PAGE_LIMIT);
    setPokemons(response.results);
    setIsLast(response.results.length === response.count);
    setIsLoading(false);
  }, [page, pokemons]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-7">
        {pokemons.map((item, index) => (
          <Link key={index} href={`detail/${item.name}`}>
            <Card {...item} />
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
  const api = new PokemonClient();

  let data = await api
    .listPokemons(0, PAGE_LIMIT)
    .then(async (next) => {
      const promises = next.results.map((result) =>
        api.getPokemonByName(result.name)
      );
      const pokeList = await Promise.all(promises);
      return { ...next, results: pokeList };
    })
    .catch((err) => err);

  if (data.code === "ERR_BAD_REQUEST") {
    return {
      notFound: true,
    };
  }

  return { props: data };
};

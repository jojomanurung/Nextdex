import Card from "@dex/components/Card";

import { MainClient, Pokemon, PokemonClient } from "pokenode-ts";
import { useEffect, useRef, useState } from "react";

export type HomeProps = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
};

const PAGE_LIMIT = 9;

export default function Home({ results }: HomeProps) {
  const containerRef = useRef(null);
  const [loadedPokemons, setLoadedPokemons] = useState(results);
  const [offset, setOffset] = useState(PAGE_LIMIT);
  const [isLoading, setIsLoading] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isLast, setIsLast] = useState(false);

  const handleScroll = () => {
    if (containerRef.current && typeof window !== "undefined") {
      const container = containerRef.current as any;
      const { bottom } = container.getBoundingClientRect();
      const { innerHeight } = window;
      setIsInView(() => bottom <= innerHeight);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLast]);

  const loadMorePokemons = async (offset: number) => {
    setIsLoading(true);
    setOffset((prev) => prev + PAGE_LIMIT);
    const newPokemons = await fetchTickets(offset);
    const newLoadedPokemons = [...loadedPokemons, ...newPokemons.results];
    setLoadedPokemons(newLoadedPokemons);
    setIsLast(newLoadedPokemons.length >= newPokemons.count);
    setIsLoading(false);
  };

  const fetchTickets = async (offset: number) => {
    const api = new PokemonClient();

    const results = await api.listPokemons(offset, PAGE_LIMIT).then(async (next) => {
      const promises = next.results.map((result) =>
        api.getPokemonByName(result.name)
      );
      const pokeList = await Promise.all(promises);
      const response = { ...next, results: pokeList };
      return response;
    });
    return results;
  };

  useEffect(() => {
    if (isInView) {
      loadMorePokemons(offset);
    }
  }, [isInView]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-center">
        <h1 className="">Nextdex</h1>
      </div>
      <div className="border-4 border-solid border-red-500/75 rounded-xl lg:mx-10 xl:mx-20 2xl:mx-36 3xl:mx-40">
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 p-10"
          ref={containerRef}
        >
          {loadedPokemons.map((item, index) => (
            <Card key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// This gets called on every request
export async function getServerSideProps() {
  const api = new MainClient();

  let data = await api.pokemon.listPokemons(0, PAGE_LIMIT).then(async (next) => {
    const promises = next.results.map((result) =>
      api.pokemon.getPokemonByName(result.name)
    );
    const pokeList = await Promise.all(promises);
    return { ...next, results: pokeList };
  });

  return { props: { ...data } };
}

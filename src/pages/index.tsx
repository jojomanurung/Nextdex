import { useCallback, useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Image from "next/image";
import Card from "@dex/components/Card";
import Type from "@dex/components/Type";
import VirtualScroll from "@dex/components/VirtualScroll";
import { PokemonData, ResponsePokemonList } from "@dex/interfaces/pokemon";

type HomeProps = {
  results: PokemonData[];
};

const PAGE_LIMIT = 12;

export default function Home({ results }: HomeProps) {
  const [pokemons, setPokemons] = useState(results);
  const [page, setPage] = useState(PAGE_LIMIT);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLast, setIsLast] = useState(false);

  const fetchPokemon = useCallback(async () => {
    const resp = await fetch(
      `http://localhost:3000/api/pokemons?page=${page}&pageLimit=${PAGE_LIMIT}`,
      {
        next: { revalidate: 60 }, // ISR (optional)
      },
    );

    const { data } = (await resp.json()) as ResponsePokemonList;

    if (!data) {
      setIsIntersecting(false);
      setIsLoading(false);
      return;
    }

    const newPokemonList = [...pokemons, ...data.pokemons];
    setPage((prev) => prev + PAGE_LIMIT);
    setPokemons(newPokemonList);
    setIsLast(newPokemonList.length === data?.count);
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
        {pokemons.map((item, index) => (
          <Link key={index} href={`detail/${item.name}`}>
            <Card types={item?.types}>
              <div className="flex justify-center">
                <Image
                  src={item.image}
                  alt={item?.name}
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
                  {formatPokemonId(item?.id)}
                </h1>
                <h2 className="text-base md:text-2xl text-center">
                  {item?.name.toUpperCase()}
                </h2>
                <div className="flex justify-center item-center gap-2">
                  {item?.types.map((type) => (
                    <Type key={type} type={type}></Type>
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
    `http://localhost:3000/api/pokemons?page=${0}&pageLimit=${PAGE_LIMIT}`,
    {
      next: { revalidate: 60 }, // ISR (optional)
    },
  );

  if (!resp.ok) {
    return {
      notFound: true,
    };
  }

  const { data } = (await resp.json()) as ResponsePokemonList;

  return { props: { results: data?.pokemons } };
};

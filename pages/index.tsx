import Card from "@dex/components/Card";
import { Loader } from "@dex/components/Loader";
import { InfiniteScroll } from "@dex/hooks/InfiniteScroll";

import { MainClient, Pokemon } from "pokenode-ts";

export type HomeProps = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
};

const PAGE_LIMIT = 9;

export default function Home({ results }: HomeProps) {
  const {
    isLoading,
    loadMoreCallback,
    hasDynamicPokemon,
    dynamicPokemon,
    isLastPage,
  } = InfiniteScroll(results);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="flex justify-center">
        <h1 className="">Nextdex</h1>
      </div>
      <div className="lg:mx-20 py-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hasDynamicPokemon
            ? dynamicPokemon.map((item, index) => (
                <Card key={index} {...item} />
              ))
            : results.map((item, index) => <Card key={index} {...item} />)}
        </div>
        <Loader
          isLastPage={isLastPage}
          isLoading={isLoading}
          loadMoreCallback={loadMoreCallback}
        />
      </div>
    </div>
  );
}

// This gets called on every request
export async function getServerSideProps() {
  const api = new MainClient();

  let data = await api.pokemon
    .listPokemons(0, PAGE_LIMIT)
    .then(async (next) => {
      const promises = next.results.map((result) =>
        api.pokemon.getPokemonByName(result.name)
      );
      const pokeList = await Promise.all(promises);
      return { ...next, results: pokeList };
    });

  return { props: { ...data } };
}

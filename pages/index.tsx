import Card from "@dex/components/Card";

import { MainClient, Pokemon } from "pokenode-ts";

const db = [
  {
    id: 1,
    name: "Bulbasaur",
    img: "bulbasaur",
    type: ["grass", "poison"],
  },
  {
    id: 6,
    name: "Charizard",
    img: "charizard",
    type: ["fire", "fly"],
  },
  {
    id: 9,
    name: "Blastoise",
    img: "blastoise",
    type: ["water"],
  },
];

export default function Home({ data }: any) {
  console.log("page", data);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-center">
        <h1 className="">Nextdex</h1>
      </div>
      <div className="border-4 border-solid border-red-500/75 rounded-xl mx-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-10">
          {data.results.map((item: Pokemon, index: any) => (
            <Card
              key={index}
              id={item.id}
              name={item.name}
              types={item.types}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// This gets called on every request
export async function getServerSideProps() {
  const api = new MainClient();

  let fetch = await api.pokemon.listPokemons(0, 10);
  const test = await fetch.results.map(async (val) => {
    const data = await api.pokemon.getPokemonByName(val.name);
    return data;
  });

  const results = await Promise.all(test);

  const data = {
    count: fetch.count,
    next: fetch.next,
    previous: fetch.previous,
    results: results,
  };

  console.log(data);

  return { props: { data } };
}

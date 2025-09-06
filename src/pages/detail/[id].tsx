import Card from "@dex/components/Card";
import Type from "@dex/components/Type";
import { GetServerSideProps } from "next";
import { Pokemon, PokemonClient, PokemonType } from "pokenode-ts";
import { useState } from "react";

export default function Id(data: Pokemon) {
  const [pokemon, setPokemon] = useState(data);

  return (
    <div className="flex gap-1 justify-center items-center">
      <Card {...pokemon}>
        <div>
          <h2>Type</h2>
          <div className="flex justify-center item-center gap-2">
            {pokemon?.types.map((type: PokemonType, index: any) => (
              <Type key={index} type={type.type.name}></Type>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// To pre-render the page on each request from server
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (query) {
    const id = query.id as string;
    const api = new PokemonClient();

    let data = await api.getPokemonByName(id).catch((err) => err);

    if (data.code === "ERR_BAD_REQUEST") {
      return {
        notFound: true,
      };
    }

    return { props: data };
  } else {
    return {
      notFound: true,
    };
  }
};

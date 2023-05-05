import { GetServerSideProps } from "next";
import { Pokemon, PokemonClient } from "pokenode-ts";
import { useState } from "react";

export default function Id(data: Pokemon) {
  const [pokemon, setPokemon] = useState(data);

  return (
    <div className="min-h-full flex gap-1 justify-center items-center">
      <div>
        <p>Pokemon Name : {pokemon.name.toUpperCase()}</p>
      </div>
      <div>
        <p>Pokemon id : {pokemon.id}</p>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params!.id as any;
  const api = new PokemonClient();

  let data = await api.getPokemonById(id).catch((err) => err);

  if (data.code === "ERR_BAD_REQUEST") {
    return {
      notFound: true,
    };
  }

  return { props: { ...data } };
};

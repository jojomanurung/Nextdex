import Card from "@dex/components/Card";
import { GetServerSideProps } from "next";
import { Pokemon, PokemonClient } from "pokenode-ts";
import { useState } from "react";

export default function Id(data: Pokemon) {
  const [pokemon, setPokemon] = useState(data);

  return (
    <div className="flex gap-1 justify-center items-center">
      <Card {...pokemon} />
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

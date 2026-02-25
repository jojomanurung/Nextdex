// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
  ResponsePokemonData,
  ResponsePokemonList,
} from "@dex/interfaces/pokemon";
import type { NextApiRequest, NextApiResponse } from "next";
import { PokemonClient } from "pokenode-ts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponsePokemonList>,
) {
  const { page = 0, pageLimit = 12 } = req.query;
  try {
    const api = new PokemonClient();
    const data = await api
      .listPokemons(Number(page), Number(pageLimit))
      .then(async (next) => {
        const promises = next.results.map((result) =>
          fetch(`http://localhost:3000/api/pokemon/${result.name}`, {
            next: { revalidate: 60 }, // ISR (optional)
          }).then((resp) => resp.json() as ResponsePokemonData),
        );
        const pokeList = await Promise.all(promises);
        const data = pokeList.map((result) => result.data!);
        return { pokemons: data, count: next.count };
      });

    res.status(200).send({ data: data, message: "success" });
  } catch (error) {
    res.status(500).send({ error: "failed to fetch data" });
  }
}

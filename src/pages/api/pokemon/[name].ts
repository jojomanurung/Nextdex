import type { NextApiRequest, NextApiResponse } from "next";
import { getPokemon } from "@dex/lib/pokemon";
import { PokemonData } from "@dex/interfaces/pokemon";

type ResponseData = {
  data?: PokemonData;
  error?: string;
};

// Single-Pokémon detail by name, used by the home page to lazily load rows the
// user scrolls to (the search/sort index only carries id + name).
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const { name } = req.query;

  try {
    const data = await getPokemon(name as string);
    res.status(200).send({ data });
  } catch (error) {
    res.status(404).send({ error: "not found" });
  }
}

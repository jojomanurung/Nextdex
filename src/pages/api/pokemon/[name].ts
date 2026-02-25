// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PokemonData } from "@dex/interfaces/pokemon";
import type { NextApiRequest, NextApiResponse } from "next";
import { PokemonClient } from "pokenode-ts";

type ResponseData = {
  data?: PokemonData;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const { name } = req.query;
  try {
    const api = new PokemonClient();
    let data = await api.getPokemonByName(name as string);

    const pokemon = {
      id: data.id,
      name: data.name,
      image: data.sprites.other?.["official-artwork"].front_default ?? "",
      types: data.types.map((t) => t.type.name),
      stats: data.stats.map((s) => ({
        name: s.stat.name,
        value: s.base_stat,
      })),
      height: data.height,
      weight: data.weight,
    };
    res.status(200).send({ data: pokemon, message: "success" });
  } catch (error) {
    res.status(500).send({ error: "failed to fetch data" });
  }
}

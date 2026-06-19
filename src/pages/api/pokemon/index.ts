// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PokemonData } from "@dex/interfaces/pokemon";
import type { NextApiRequest, NextApiResponse } from "next";
import { PokemonClient } from "pokenode-ts";

type ListData = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonData[];
};

type ResponseData = {
  data?: ListData;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const { offset, limit } = req.query;
  const offsetNum = offset ? parseInt(offset as string, 10) : 0;
  const limitNum = limit ? parseInt(limit as string, 10) : 12;

  try {
    const api = new PokemonClient();
    const list = await api.listPokemons(offsetNum, limitNum);
    const pokeList = await Promise.all(
      list.results.map((result) => api.getPokemonByName(result.name)),
    );

    const results: PokemonData[] = pokeList.map((data) => ({
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
    }));

    res.status(200).send({
      data: {
        count: list.count,
        next: list.next,
        previous: list.previous,
        results,
      },
      message: "success",
    });
  } catch (error) {
    res.status(500).send({ error: "failed to fetch data" });
  }
}

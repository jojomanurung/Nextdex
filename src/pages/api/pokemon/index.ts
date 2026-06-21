// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getPokemonList, PokemonListResult } from "@dex/lib/pokemon";

type ResponseData = {
  data?: PokemonListResult;
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
    const data = await getPokemonList(offsetNum, limitNum);
    res.status(200).send({ data, message: "success" });
  } catch (error) {
    res.status(500).send({ error: "failed to fetch data" });
  }
}

import { PokemonData, ResponsePokemonData } from "@dex/interfaces/pokemon";

export async function getPokemon(name: string): Promise<PokemonData> {
  const resp = await fetch(`http://localhost:3000/api/pokemon/${name}`, {
    next: { revalidate: 60 }, // ISR (optional)
  });

  if (!resp.ok) {
    throw new Error("Failed to fetch Pokémon");
  }

  const { data } = await resp.json() as ResponsePokemonData;

  return data;
}

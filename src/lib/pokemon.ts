import { Pokemon, PokemonClient } from "pokenode-ts";
import { PokemonData } from "@dex/interfaces/pokemon";

// One client reused across all requests (instead of `new PokemonClient()` per
// handler call). pokenode-ts caches upstream PokeAPI responses, so repeat
// lookups — same detail page, same list offset — skip the network entirely.
const client = new PokemonClient({
  cacheOptions: { maxAge: 1000 * 60 * 60 }, // 1h
});

function mapPokemon(data: Pokemon): PokemonData {
  return {
    id: data.id,
    name: data.name,
    image: data.sprites.other?.["official-artwork"].front_default ?? "",
    types: data.types.map((t) => t.type.name),
    stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    height: data.height,
    weight: data.weight,
  };
}

export async function getPokemon(name: string): Promise<PokemonData> {
  return mapPokemon(await client.getPokemonByName(name));
}

export type PokemonListResult = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonData[];
};

export async function getPokemonList(
  offset: number,
  limit: number,
): Promise<PokemonListResult> {
  const list = await client.listPokemons(offset, limit);
  const results = await Promise.all(list.results.map((r) => getPokemon(r.name)));
  return {
    count: list.count,
    next: list.next,
    previous: list.previous,
    results,
  };
}

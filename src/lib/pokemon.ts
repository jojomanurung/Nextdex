import { Pokemon, PokemonClient } from "pokenode-ts";
import { PokemonData } from "@dex/interfaces/pokemon";

// One client reused across all requests (instead of `new PokemonClient()` per
// handler call). pokenode-ts caches upstream PokeAPI responses, so repeat
// lookups — same detail page, same list offset — skip the network entirely.
const client = new PokemonClient({
  cacheOptions: { ttl: 1000 * 60 * 60 }, // 1h
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

export type PokemonIndexEntry = { id: number; name: string };

// PokeAPI assigns alternate forms (mega, gmax, regional) ids >= this; the
// national dex sits below it. Used both as the request limit (well above the
// ~1300 real entries, so one request covers everything) and the filter ceiling.
const FORM_ID_START = 10000;

// Lightweight full-dex index (id + name only) for client-side search/sort. One
// request, no per-Pokémon detail calls. Entries whose URL has no parseable id
// yield NaN and are dropped by the filter. Cached upstream by the shared client.
export async function getPokemonIndex(): Promise<PokemonIndexEntry[]> {
  const list = await client.listPokemons(0, FORM_ID_START);
  return list.results
    .map((r) => ({
      id: Number(r.url.match(/\/pokemon\/(\d+)\/?$/)?.[1]),
      name: r.name,
    }))
    .filter((entry) => entry.id > 0 && entry.id < FORM_ID_START);
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

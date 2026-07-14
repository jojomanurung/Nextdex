import { Pokemon, PokemonClient } from "pokenode-ts";
import {
  PokemonData,
  PokemonIndexEntry,
  PokemonQuery,
  PokemonQueryResult,
} from "@interfaces/pokemon";
import { dexNo } from "@constant/pokemonMeta";
import { PAGE_LIMIT } from "@constant/pagination";
import { SortKey, SORT_COMPARATORS } from "@constant/sort";

// Single shared client: pokenode-ts caches PokeAPI responses on it, so one
// instance keeps that cache unified. pokemonDetail.ts imports this same one.
export const client = new PokemonClient({
  cacheOptions: { ttl: 1000 * 60 * 60 }, // 1h
});

// Official artwork from an id alone (this host is whitelisted in next.config.js)
// — no per-sprite detail fetch.
export function artworkUrl(id: number, isShiny = false): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShiny ? "shiny/" : ""}${id}.png`;
}

export function mapPokemon(data: Pokemon): PokemonData {
  return {
    id: data.id,
    name: data.name,
    image: artworkUrl(data.id),
    types: data.types.map((t) => t.type.name),
    stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    height: data.height,
    weight: data.weight,
  };
}

export async function getPokemon(name: string): Promise<PokemonData> {
  return mapPokemon(await client.getPokemonByName(name));
}

// Alternate forms (mega, gmax, regional) get ids >= this; the national dex sits
// below. Also the list request limit — one call covers the whole dex.
const FORM_ID_START = 10000;

// Full-dex index (id + name only) in one request, no per-Pokémon fetches. Backs
// list search/sort/pagination and the detail pager. Unparseable urls give NaN
// and drop out.
export async function getPokemonIndex(): Promise<PokemonIndexEntry[]> {
  const list = await client.listPokemons(0, FORM_ID_START);
  return list.results
    .map((r) => ({
      id: Number(r.url.match(/\/pokemon\/(\d+)\/?$/)?.[1]),
      name: r.name,
    }))
    .filter((entry) => entry.id > 0 && entry.id < FORM_ID_START);
}

function matchesQuery(entry: PokemonIndexEntry, query: string): boolean {
  return entry.name.includes(query) || dexNo(entry.id).includes(query);
}

// Filter + sort the index, then resolve one page of details in parallel.
export async function queryPokemon({
  query = "",
  sort = "number",
  offset = 0,
  limit = PAGE_LIMIT,
}: PokemonQuery = {}): Promise<PokemonQueryResult> {
  const index = await getPokemonIndex();
  const q = query.trim().toLowerCase();
  const matches = (q ? index.filter((e) => matchesQuery(e, q)) : index)
    .slice()
    .sort(SORT_COMPARATORS[sort]);

  const page = matches.slice(offset, offset + limit);
  const results = await Promise.all(page.map((e) => getPokemon(e.name)));

  return {
    results,
    total: matches.length,
    hasMore: offset + page.length < matches.length,
  };
}

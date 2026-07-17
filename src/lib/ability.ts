import { Ability, GameClient } from "pokenode-ts";
import {
  AbilityData,
  AbilityIndexEntry,
  AbilityQuery,
  AbilityQueryResult,
} from "@interfaces/ability";
import { client } from "@lib/pokemon";
import { cleanText, englishOf } from "@lib/text";
import { generationFromName } from "@constant/pokemonMeta";
import { PAGE_LIMIT } from "@constant/pagination";
import { SORT_COMPARATORS } from "@constant/sort";

// Special / non-main-series abilities get ids >= this; the 313 real abilities
// sit below. Also the list request limit — one call covers them all.
const SPECIAL_ID_START = 10000;

export function mapAbility(data: Ability): AbilityData {
  const effect = englishOf(data.effect_entries);
  return {
    id: data.id,
    name: data.name,
    generation: generationFromName(data.generation.name),
    effect: cleanText(effect?.short_effect ?? effect?.effect ?? ""),
  };
}

export async function getAbility(name: string): Promise<AbilityData> {
  return mapAbility(await client.getAbilityByName(name));
}

// Full ability index (id + name) in one request. Unparseable urls give NaN and
// drop out; special entries (id >= 10000) are excluded.
export async function getAbilityIndex(): Promise<AbilityIndexEntry[]> {
  const list = await client.listAbilities(0, SPECIAL_ID_START);
  return list.results
    .map((r) => ({
      id: Number(r.url.match(/\/ability\/(\d+)\/?$/)?.[1]),
      name: r.name,
    }))
    .filter((entry) => entry.id > 0 && entry.id < SPECIAL_ID_START);
}

function matchesQuery(entry: AbilityIndexEntry, query: string): boolean {
  return (
    entry.name.includes(query) ||
    entry.name.replace(/-/g, " ").includes(query) ||
    String(entry.id).includes(query)
  );
}

// Generation is a separate PokeAPI group; the ability list needs it only for
// the generation filter, so it keeps its own cached client (mirrors
// pokemonDetail's EvolutionClient).
const gameClient = new GameClient({ cacheOptions: { ttl: 1000 * 60 * 60 } });

// Names of every ability introduced in a generation, from /generation/{n} — one
// cached request per generation. Backs the OR generation filter; ability ids
// don't map to generation the way the national-dex id does.
async function generationAbilityNames(gen: number): Promise<Set<string>> {
  const data = await gameClient.getGenerationById(gen);
  return new Set(data.abilities.map((a) => a.name));
}

// Filter + sort the index, then resolve one page of details in parallel. Facets
// compose — AND across, OR within: name/number query and generation (membership
// via /generation).
export async function queryAbilities({
  query = "",
  sort = "number",
  offset = 0,
  limit = PAGE_LIMIT,
  gens = [],
}: AbilityQuery = {}): Promise<AbilityQueryResult> {
  const index = await getAbilityIndex();
  const q = query.trim().toLowerCase();

  let genNames: Set<string> | null = null;
  if (gens.length) {
    const sets = await Promise.all(gens.map(generationAbilityNames));
    genNames = new Set<string>();
    for (const set of sets) for (const name of set) genNames.add(name);
  }

  const matches = index
    .filter((e) => {
      if (q && !matchesQuery(e, q)) return false;
      if (genNames && !genNames.has(e.name)) return false;
      return true;
    })
    .sort(SORT_COMPARATORS[sort]);

  const page = matches.slice(offset, offset + limit);
  const results = await Promise.all(page.map((e) => getAbility(e.name)));

  return {
    results,
    total: matches.length,
    hasMore: offset + page.length < matches.length,
  };
}

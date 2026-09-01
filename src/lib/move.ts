import { GameClient, Move, MoveClient } from "pokenode-ts";
import {
  MoveData,
  MoveIndexEntry,
  MoveQuery,
  MoveQueryResult,
} from "@interfaces/move";
import { client } from "@lib/pokemon";
import { cleanText, englishOf } from "@lib/text";
import { generationFromName } from "@constant/pokemonMeta";
import { PAGE_LIMIT } from "@constant/pagination";
import { SORT_COMPARATORS } from "@constant/sort";

// Special / non-main-series moves get ids >= this; the ~900 real moves sit
// below. Also the list request limit — one call covers them all.
const SPECIAL_ID_START = 10000;

// Moves + damage classes are their own PokeAPI group; the shared PokemonClient
// (client) still serves /type. Generation lives on GameClient (like abilities).
const moveClient = new MoveClient({ cacheOptions: { ttl: 1000 * 60 * 60 } });
const gameClient = new GameClient({ cacheOptions: { ttl: 1000 * 60 * 60 } });

// In-game effect text embeds $effect_chance; substitute the move's real chance.
function interpolate(text: string, chance: number | null): string {
  return chance == null ? text : text.replace(/\$effect_chance/g, String(chance));
}

export function mapMove(data: Move): MoveData {
  const effect = englishOf(data.effect_entries);
  return {
    id: data.id,
    name: data.name,
    type: data.type?.name ?? "",
    damageClass: data.damage_class?.name ?? "",
    generation: generationFromName(data.generation.name),
    power: data.power,
    accuracy: data.accuracy,
    pp: data.pp,
    priority: data.priority,
    shortEffect: cleanText(
      interpolate(effect?.short_effect ?? "", data.effect_chance),
    ),
  };
}

export async function getMove(name: string): Promise<MoveData> {
  return mapMove(await moveClient.getMoveByName(name));
}

// Full move index (id + name) in one request. Unparseable urls give NaN and
// drop out; special entries (id >= 10000) are excluded.
export async function getMoveIndex(): Promise<MoveIndexEntry[]> {
  const list = await moveClient.listMoves(0, SPECIAL_ID_START);
  return list.results
    .map((r) => ({
      id: Number(r.url.match(/\/move\/(\d+)\/?$/)?.[1]),
      name: r.name,
    }))
    .filter((entry) => entry.id > 0 && entry.id < SPECIAL_ID_START);
}

function matchesQuery(entry: MoveIndexEntry, query: string): boolean {
  return (
    entry.name.includes(query) ||
    entry.name.replace(/-/g, " ").includes(query) ||
    String(entry.id).includes(query)
  );
}

// Each facet returns the full member-name list for one value, from its
// aggregate endpoint — one cached request per selected value, no all-moves
// crawl. Backs the OR-within-a-group filters.
async function typeMoveNames(type: string): Promise<Set<string>> {
  const data = await client.getTypeByName(type);
  return new Set(data.moves.map((m) => m.name));
}

async function classMoveNames(damageClass: string): Promise<Set<string>> {
  const data = await moveClient.getMoveDamageClassByName(damageClass);
  return new Set(data.moves.map((m) => m.name));
}

async function generationMoveNames(gen: number): Promise<Set<string>> {
  const data = await gameClient.getGenerationById(gen);
  return new Set(data.moves.map((m) => m.name));
}

// Union the member sets of every selected value in a facet group (OR within);
// null when the group is inactive, so the filter skips it entirely.
async function facetUnion<T>(
  values: T[],
  resolve: (value: T) => Promise<Set<string>>,
): Promise<Set<string> | null> {
  if (!values.length) return null;
  const sets = await Promise.all(values.map(resolve));
  const union = new Set<string>();
  for (const set of sets) for (const name of set) union.add(name);
  return union;
}

// Filter + sort the index, then resolve one page of details in parallel. Facets
// compose — AND across groups, OR within: name/number query, type, damage
// class, and generation (all membership via their aggregate endpoints).
export async function queryMoves({
  query = "",
  sort = "number",
  offset = 0,
  limit = PAGE_LIMIT,
  types = [],
  classes = [],
  gens = [],
}: MoveQuery = {}): Promise<MoveQueryResult> {
  const index = await getMoveIndex();
  const q = query.trim().toLowerCase();

  const [typeNames, classNames, genNames] = await Promise.all([
    facetUnion(types, typeMoveNames),
    facetUnion(classes, classMoveNames),
    facetUnion(gens, generationMoveNames),
  ]);

  const matches = index
    .filter((e) => {
      if (q && !matchesQuery(e, q)) return false;
      if (typeNames && !typeNames.has(e.name)) return false;
      if (classNames && !classNames.has(e.name)) return false;
      if (genNames && !genNames.has(e.name)) return false;
      return true;
    })
    .sort(SORT_COMPARATORS[sort]);

  const page = matches.slice(offset, offset + limit);
  const results = await Promise.all(page.map((e) => getMove(e.name)));

  return {
    results,
    total: matches.length,
    hasMore: offset + page.length < matches.length,
  };
}

export { moveClient };

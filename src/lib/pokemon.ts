import {
  ChainLink,
  EvolutionClient,
  EvolutionDetail,
  Pokemon,
  PokemonClient,
  Type,
} from "pokenode-ts";
import {
  AbilityInfo,
  EvolutionStage,
  FlavorEntry,
  PokemonData,
  PokemonDetailData,
  TypeMatchup,
} from "@dex/interfaces/pokemon";
import {
  genderRatioLabel,
  generationLabel,
  versionGeneration,
} from "@dex/constant/pokemonMeta";

// One client reused across all requests (instead of `new PokemonClient()` per
// handler call). pokenode-ts caches upstream PokeAPI responses, so repeat
// lookups — same detail page, same list offset — skip the network entirely.
const client = new PokemonClient({
  cacheOptions: { ttl: 1000 * 60 * 60 }, // 1h
});

// Evolution chains live on a separate PokeAPI group; same cache policy.
const evolutionClient = new EvolutionClient({
  cacheOptions: { ttl: 1000 * 60 * 60 }, // 1h
});

function mapPokemon(data: Pokemon): PokemonData {
  return {
    id: data.id,
    name: data.name,
    image: data.sprites.other?.home.front_default ?? "",
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

// --- Detail page aggregation -------------------------------------------------
// getPokemonDetail composes the species, evolution-chain, ability, and type
// endpoints into one PokemonDetailData. It is deliberately separate from the
// lean getPokemon above: the list lazy-loads rows through getPokemon, so that
// path must not pay for these extra fetches. This one only runs in the detail
// page's getStaticProps (ISR), where the cost is paid once per build/revalidate.

// PokeAPI flavor/effect text is wrapped with hard newlines and form-feeds for
// the in-game text boxes; collapse all whitespace for web display.
function cleanText(text: string): string {
  return (
    text
      // Older games hyphenate a word across an in-game line break with a soft
      // hyphen (U+00AD) + line break (e.g. "pleas" + U+00AD + newline + "ant").
      // Strip those so the word rejoins ("pleasant") instead of gaining a space.
      .replace(/­[\n\f\r]?/g, "")
      // Remaining hard line/page breaks sit between words → spaces.
      .replace(/[\n\f\r]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function prettify(name: string): string {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function englishOf<T extends { language: { name: string } }>(
  entries: T[],
): T | undefined {
  return entries.find((e) => e.language.name === "en");
}

function idFromUrl(url: string, segment: string): number {
  return Number(url.match(new RegExp(`/${segment}/(\\d+)/?$`))?.[1]);
}

// Canonical official-artwork URL (same host the API itself returns, already
// whitelisted in next.config.js). Lets evolution stages reuse the species id
// straight from the chain instead of a detail fetch per stage.
function artworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

// Human-readable label for how a Pokémon reaches an evolution stage. Covers the
// common triggers and stacks modifiers (held item, time of day…); falls back to
// the raw trigger name so an exotic condition still shows something.
function evoConditionLabel(detail?: EvolutionDetail): string | null {
  if (!detail) return null;
  const parts: string[] = [];

  if (detail.min_level != null) parts.push(`Lv. ${detail.min_level}`);
  else if (detail.item) parts.push(prettify(detail.item.name));
  else if (detail.trigger?.name === "trade")
    parts.push(
      detail.trade_species
        ? `Trade w/ ${prettify(detail.trade_species.name)}`
        : "Trade",
    );
  else if (detail.min_happiness != null) parts.push("High Friendship");
  else if (detail.min_affection != null) parts.push("High Affection");
  else if (detail.min_beauty != null) parts.push("Max Beauty");
  else if (detail.known_move)
    parts.push(`Knows ${prettify(detail.known_move.name)}`);
  else if (detail.known_move_type)
    parts.push(`Knows ${prettify(detail.known_move_type.name)} move`);
  else if (detail.location) parts.push(`At ${prettify(detail.location.name)}`);

  if (detail.held_item) parts.push(`holding ${prettify(detail.held_item.name)}`);
  if (detail.time_of_day) parts.push(`(${detail.time_of_day})`);
  if (detail.needs_overworld_rain) parts.push("in rain");
  if (detail.gender === 1) parts.push("(♀)");
  if (detail.gender === 2) parts.push("(♂)");
  if (detail.turn_upside_down) parts.push("upside-down");

  if (parts.length === 0)
    return detail.trigger ? prettify(detail.trigger.name) : "Special";
  return parts.join(" ");
}

// Depth-first flatten of the evolution tree into ordered stages. `stage` records
// the depth so branched lines (e.g. Eevee) render as one column per stage.
function flattenChain(
  link: ChainLink,
  stage = 0,
  acc: EvolutionStage[] = [],
): EvolutionStage[] {
  const id = idFromUrl(link.species.url, "pokemon-species");
  acc.push({
    id,
    name: link.species.name,
    image: artworkUrl(id),
    stage,
    condition: stage === 0 ? null : evoConditionLabel(link.evolution_details[0]),
  });
  link.evolves_to.forEach((next) => flattenChain(next, stage + 1, acc));
  return acc;
}

// Defensive type chart: how much damage this Pokémon takes from each attacking
// type, as the product of its (one or two) defending types' relations. Neutral
// (1×) matchups are dropped; result is sorted most-effective first.
function computeMatchups(types: Type[]): TypeMatchup[] {
  const mult: Record<string, number> = {};
  const apply = (names: { name: string }[], factor: number) =>
    names.forEach((n) => {
      mult[n.name] = (mult[n.name] ?? 1) * factor;
    });

  types.forEach((t) => {
    apply(t.damage_relations.double_damage_from, 2);
    apply(t.damage_relations.half_damage_from, 0.5);
    apply(t.damage_relations.no_damage_from, 0);
  });

  return Object.entries(mult)
    .filter(([, m]) => m !== 1)
    .map(([type, multiplier]) => ({ type, multiplier }))
    .sort((a, b) => b.multiplier - a.multiplier);
}

export async function getPokemonDetail(
  name: string,
): Promise<PokemonDetailData> {
  const pokemon = await client.getPokemonByName(name);
  const base = mapPokemon(pokemon);

  // species, type relations, and ability effects are independent → fan out.
  const [species, typeData, abilities] = await Promise.all([
    client.getPokemonSpeciesByName(pokemon.species.name),
    Promise.all(pokemon.types.map((t) => client.getTypeByName(t.type.name))),
    Promise.all(
      pokemon.abilities.map(async (a): Promise<AbilityInfo> => {
        const ability = await client.getAbilityByName(a.ability.name);
        const effect = englishOf(ability.effect_entries);
        return {
          name: a.ability.name,
          isHidden: a.is_hidden,
          effect: cleanText(effect?.short_effect ?? effect?.effect ?? ""),
        };
      }),
    ),
  ]);

  // Evolution chain depends on the species (it carries the chain URL).
  const chain = await evolutionClient.getEvolutionChainById(
    idFromUrl(species.evolution_chain.url, "evolution-chain"),
  );

  // pokenode-ts under-types species flavor entries as FlavorText (no `version`),
  // but the API includes one — widen so we can group entries by generation,
  // keeping one representative (the last seen) per generation, newest first.
  type SpeciesFlavor = {
    flavor_text: string;
    language: { name: string };
    version: { name: string } | null;
  };
  const byGen = new Map<number, FlavorEntry>();
  for (const entry of species.flavor_text_entries as unknown as SpeciesFlavor[]) {
    if (entry.language.name !== "en") continue;
    const gen = versionGeneration(entry.version?.name ?? "");
    if (gen === 0) continue;
    byGen.set(gen, {
      generation: gen,
      generationLabel: generationLabel(gen),
      version: prettify(entry.version?.name ?? ""),
      text: cleanText(entry.flavor_text),
    });
  }
  const flavorEntries = [...byGen.values()].sort(
    (a, b) => b.generation - a.generation,
  );

  return {
    ...base,
    shinyImage: pokemon.sprites.other?.home.front_shiny ?? "",
    abilities,
    evolution: flattenChain(chain.chain),
    matchups: computeMatchups(typeData),
    species: {
      genus: englishOf(species.genera)?.genus ?? "",
      flavorEntries,
      habitat: species.habitat?.name ?? null,
      captureRate: species.capture_rate,
      baseHappiness: species.base_happiness,
      genderRatio: genderRatioLabel(species.gender_rate),
      eggGroups: species.egg_groups.map((g) => g.name),
      growthRate: species.growth_rate.name,
      isLegendary: species.is_legendary,
      isMythical: species.is_mythical,
      isBaby: species.is_baby,
    },
  };
}

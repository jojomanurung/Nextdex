import { ChainLink, EvolutionClient, EvolutionDetail, Type } from "pokenode-ts";
import {
  AbilityInfo,
  EvolutionStage,
  FlavorEntry,
  PokemonDetailData,
  PokemonNeighbors,
  TypeMatchup,
} from "@interfaces/pokemon";
import {
  genderRatioLabel,
  generationLabel,
  versionGeneration,
} from "@constant/pokemonMeta";
import {
  artworkUrl,
  client,
  getPokemonIndex,
  mapPokemon,
} from "@lib/pokemon";
import { cleanText, englishOf, idFromUrl, prettify } from "@lib/text";

// Detail-page aggregation, kept out of lib/pokemon.ts so the list path (which
// lazy-loads rows via getPokemon) never pays for these extra fetches.

// Evolution chains are a separate PokeAPI group; detail-only, so it lives here.
const evolutionClient = new EvolutionClient({
  cacheOptions: { ttl: 1000 * 60 * 60 }, // 1h
});

// Prev/next dex entries for the pager. The dex is contiguous, so id ± 1 works;
// a missing neighbor (either end of the dex) is null.
export async function getPokemonNeighbors(
  id: number,
): Promise<PokemonNeighbors> {
  const index = await getPokemonIndex();
  const byId = new Map(index.map((entry) => [entry.id, entry]));
  return {
    prev: byId.get(id - 1) ?? null,
    next: byId.get(id + 1) ?? null,
  };
}

// Human-readable "how it evolves" label, falling back to the raw trigger so an
// exotic condition still shows something.
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

  if (detail.held_item)
    parts.push(`holding ${prettify(detail.held_item.name)}`);
  if (detail.time_of_day) parts.push(`(${detail.time_of_day})`);
  if (detail.needs_overworld_rain) parts.push("in rain");
  if (detail.gender === 1) parts.push("(♀)");
  if (detail.gender === 2) parts.push("(♂)");
  if (detail.turn_upside_down) parts.push("upside-down");

  if (parts.length === 0)
    return detail.trigger ? prettify(detail.trigger.name) : "Special";
  return parts.join(" ");
}

// Flatten the evolution tree depth-first; `stage` (the depth) lets branched
// lines like Eevee render one column per stage.
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
    condition:
      stage === 0 ? null : evoConditionLabel(link.evolution_details[0]),
  });
  link.evolves_to.forEach((next) => flattenChain(next, stage + 1, acc));
  return acc;
}

// Defensive multipliers: the product of each defending type's relations.
// Neutral (1×) matchups drop out; sorted most-effective first.
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

  // species, type relations, and abilities are independent → fan out.
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

  // Evolution chain depends on the species, which carries the chain URL.
  const chain = await evolutionClient.getEvolutionChainById(
    idFromUrl(species.evolution_chain.url, "evolution-chain"),
  );

  // pokenode-ts omits `version` from flavor entries though the API sends it;
  // widen so we can group by generation — last entry per gen wins, newest first.
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
    shinyImage: artworkUrl(base.id, true) ?? "",
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

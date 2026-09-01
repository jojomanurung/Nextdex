import { TypeRelations } from "pokenode-ts";
import { MoveDetailData, MoveLearner } from "@interfaces/move";
import { FlavorEntry, TypeMatchup } from "@interfaces/pokemon";
import { artworkUrl, client } from "@lib/pokemon";
import { cleanText, englishOf, idFromUrl } from "@lib/text";
import { mapMove, moveClient } from "@lib/move";
import {
  generationLabel,
  versionGroupGeneration,
} from "@constant/pokemonMeta";

// Drop alternate-form learners (mega/gmax/regional), same threshold as the dex.
const FORM_ID_START = 10000;

// Offensive effectiveness from the move type's damage relations, sorted
// most-effective first (2× → ½× → 0×). The counterpart to the Pokémon page's
// defensive matchups.
function offensiveMatchups(relations: TypeRelations): TypeMatchup[] {
  const push = (names: { name: string }[], multiplier: number) =>
    names.map((n) => ({ type: n.name, multiplier }));

  return [
    ...push(relations.double_damage_to, 2),
    ...push(relations.half_damage_to, 0.5),
    ...push(relations.no_damage_to, 0),
  ].sort((a, b) => b.multiplier - a.multiplier);
}

export async function getMoveDetail(name: string): Promise<MoveDetailData> {
  const move = await moveClient.getMoveByName(name);
  const base = mapMove(move);
  const effect = englishOf(move.effect_entries);
  const meta = move.meta;

  // Damaging moves get an offensive type table; status moves deal no damage.
  const matchups =
    base.type && base.damageClass !== "status"
      ? offensiveMatchups(
          (await client.getTypeByName(base.type)).damage_relations,
        )
      : [];

  const interpolate = (text: string) =>
    move.effect_chance == null
      ? text
      : text.replace(/\$effect_chance/g, String(move.effect_chance));

  // One representative flavor entry per generation (newest first). Move flavor
  // carries a version_group, not a version — map through versionGroupGeneration.
  const byGen = new Map<number, FlavorEntry>();
  for (const entry of move.flavor_text_entries) {
    if (entry.language.name !== "en") continue;
    const gen = versionGroupGeneration(entry.version_group.name);
    if (gen === 0) continue;
    byGen.set(gen, {
      generation: gen,
      generationLabel: generationLabel(gen),
      version: entry.version_group.name
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      text: cleanText(entry.flavor_text),
    });
  }
  const flavorEntries = [...byGen.values()].sort(
    (a, b) => b.generation - a.generation,
  );

  const learners: MoveLearner[] = move.learned_by_pokemon
    .map((p) => {
      const id = idFromUrl(p.url, "pokemon");
      return { id, name: p.name, image: artworkUrl(id) };
    })
    .filter((p) => p.id > 0 && p.id < FORM_ID_START)
    .sort((a, b) => a.id - b.id);

  return {
    ...base,
    effect: cleanText(interpolate(effect?.effect ?? effect?.short_effect ?? "")),
    effectChance: move.effect_chance,
    target: move.target?.name ?? "",
    ailment: meta?.ailment?.name ?? "",
    category: meta?.category?.name ?? "",
    critRate: meta?.crit_rate ?? 0,
    drain: meta?.drain ?? 0,
    healing: meta?.healing ?? 0,
    minHits: meta?.min_hits ?? null,
    maxHits: meta?.max_hits ?? null,
    minTurns: meta?.min_turns ?? null,
    maxTurns: meta?.max_turns ?? null,
    ailmentChance: meta?.ailment_chance ?? 0,
    flinchChance: meta?.flinch_chance ?? 0,
    statChance: meta?.stat_chance ?? 0,
    flavorEntries,
    learners,
    matchups,
  };
}

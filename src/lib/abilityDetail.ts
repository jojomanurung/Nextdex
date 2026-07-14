import { AbilityDetailData, AbilityPokemonRef } from "@interfaces/ability";
import { artworkUrl, client } from "@lib/pokemon";
import { cleanText, englishOf, idFromUrl } from "@lib/text";
import { mapAbility } from "@lib/ability";

// Drop alternate-form pokemon entries (mega/gmax/regional), same threshold as
// the Pokémon dex index.
const FORM_ID_START = 10000;

export async function getAbilityDetail(
  name: string,
): Promise<AbilityDetailData> {
  const ability = await client.getAbilityByName(name);
  const base = mapAbility(ability);
  const effect = englishOf(ability.effect_entries);

  const pokemon: AbilityPokemonRef[] = ability.pokemon
    .map((p) => {
      const id = idFromUrl(p.pokemon.url, "pokemon");
      return {
        id,
        name: p.pokemon.name,
        image: artworkUrl(id),
        isHidden: p.is_hidden,
      };
    })
    .filter((p) => p.id > 0 && p.id < FORM_ID_START)
    .sort((a, b) => a.id - b.id);

  return {
    ...base,
    description: cleanText(effect?.effect ?? effect?.short_effect ?? ""),
    pokemon,
  };
}

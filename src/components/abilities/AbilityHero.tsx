import { AbilityDetailData } from "@interfaces/ability";
import { genShortLabel } from "@constant/pokemonMeta";

// The definition hero: the ability name as a reference headword, its effect as
// the lead statement, and its generation + reach as meta. Abilities carry no
// artwork, so typography does the work — a left-aligned reference entry.
export function AbilityHero({ ability }: { ability: AbilityDetailData }) {
  const displayName = ability.name.replace(/-/g, " ");

  return (
    <header className="pt-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {genShortLabel(ability.generation)} · {ability.pokemon.length} Pokémon
      </p>
      <h1 className="mt-2 text-balance font-display text-4xl font-bold capitalize leading-[1.02] tracking-[-0.01em] text-foreground sm:text-6xl">
        {displayName}
      </h1>
      {ability.description && (
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-foreground/90 sm:text-xl">
          {ability.description}
        </p>
      )}
    </header>
  );
}

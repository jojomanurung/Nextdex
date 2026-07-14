import { AbilityData } from "@interfaces/ability";
import { genShortLabel } from "@constant/pokemonMeta";

export function AbilityHero({ ability }: { ability: AbilityData }) {
  return (
    <header className="pt-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-muted">
        Ability
      </p>
      <h1 className="mt-2 text-4xl font-black capitalize tracking-tight sm:text-5xl">
        {ability.name.replace(/-/g, " ")}
      </h1>
      <p className="mt-3 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
        {genShortLabel(ability.generation)}
      </p>
    </header>
  );
}

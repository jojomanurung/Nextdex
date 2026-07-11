import { useState } from "react";
import Image from "next/image";
import { Type } from "@dex/components/common/Type";
import { PokemonDetailData } from "@dex/interfaces/pokemon";
import { dexNo, genLabel } from "@dex/constant/pokemonMeta";

type DetailHeroProps = {
  pokemon: PokemonDetailData;
};

// Oversized hero for the immersive detail page: artwork, a shiny toggle (when
// art exists), name/dex/genus/generation, type chips, and rarity badges.
export function DetailHero({ pokemon }: DetailHeroProps) {
  const [shiny, setShiny] = useState(false);
  const hasShiny = Boolean(pokemon.shinyImage);
  const src = shiny && hasShiny ? pokemon.shinyImage : pokemon.image;

  const badges = [
    pokemon.species.isBaby && "Baby",
    pokemon.species.isLegendary && "Legendary",
    pokemon.species.isMythical && "Mythical",
  ].filter(Boolean) as string[];

  return (
    <section className="relative flex flex-col items-center gap-3 pt-1 text-center">
      <div className="relative h-48 w-48 sm:h-60 sm:w-60">
        <Image
          src={src}
          alt={pokemon.name}
          fill
          sizes="320px"
          priority
          className="object-contain drop-shadow-2xl"
          placeholder="blur"
          blurDataURL="/images/placeholder.png"
        />
        {hasShiny && (
          <button
            type="button"
            onClick={() => setShiny((s) => !s)}
            aria-pressed={shiny}
            title="Toggle shiny artwork"
            className={`absolute right-1 top-1 rounded-full border px-3 py-1 text-sm backdrop-blur-xs transition ${
              shiny
                ? "border-amber-300/70 bg-amber-300/20 text-amber-200"
                : "border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            ✦ Shiny
          </button>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium tracking-[0.3em] text-zinc-500">
          #{dexNo(pokemon.id)}
        </p>
        <h1 className="text-3xl font-bold capitalize tracking-tight sm:text-5xl">
          {pokemon.name}
        </h1>
        {pokemon.species.genus && (
          <p className="text-zinc-400">{pokemon.species.genus}</p>
        )}
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          {genLabel(pokemon.id)}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {pokemon.types.map((type) => (
          <Type key={type} type={type} />
        ))}
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-amber-200"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

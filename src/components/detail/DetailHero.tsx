"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import { Ruler, Sparkles, Weight } from "lucide-react";
import { Type } from "@components/common/Type";
import { Badge } from "@components/ui/badge";
import { Toggle } from "@components/ui/toggle";
import { PokemonDetailData } from "@interfaces/pokemon";
import { dexNo, genLabel } from "@constant/pokemonMeta";

type DetailHeroProps = {
  pokemon: PokemonDetailData;
};

// The specimen: the detail page's left rail (pinned on desktop, the hero on
// mobile). Artwork with a shiny toggle, identity, type chips, rarity badges,
// and the headline vitals.
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
    <section className="flex flex-col items-center gap-5 text-center">
      <div className="relative h-52 w-52 sm:h-56 sm:w-56">
        <Image
          src={src}
          alt={pokemon.name}
          fill
          sizes="256px"
          priority
          className="object-contain drop-shadow-2xl"
          placeholder="blur"
          blurDataURL="/images/placeholder.png"
        />
        {hasShiny && (
          <Toggle
            size="sm"
            pressed={shiny}
            onPressedChange={(pressed) => setShiny(pressed)}
            aria-label="Toggle shiny artwork"
            title="Toggle shiny artwork"
            className="absolute right-0 top-0 gap-1.5 rounded-full border border-border bg-background px-3 text-xs text-muted-foreground aria-pressed:border-amber-400/60 aria-pressed:bg-amber-400/20 aria-pressed:text-amber-700 dark:aria-pressed:text-amber-200"
          >
            <Sparkles className="size-3.5" />
            Shiny
          </Toggle>
        )}
      </div>

      <div className="space-y-1">
        <p className="font-mono text-xs font-medium tracking-[0.3em] tabular-nums text-muted-foreground">
          #{dexNo(pokemon.id)}
        </p>
        <h1 className="font-display text-3xl font-bold capitalize tracking-[-0.01em] sm:text-4xl">
          {pokemon.name}
        </h1>
        {pokemon.species.genus && (
          <p className="text-sm text-muted-foreground">{pokemon.species.genus}</p>
        )}
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {genLabel(pokemon.id)}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {pokemon.types.map((type) => (
          <Type key={type} type={type} />
        ))}
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {badges.map((badge) => (
            <Badge
              key={badge}
              variant="outline"
              className="border-amber-400/50 bg-amber-400/15 uppercase tracking-wide text-amber-700 dark:text-amber-200"
            >
              {badge}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-1 flex items-center justify-center gap-10">
        <Vital
          icon={<Ruler className="size-4" />}
          label="Height"
          value={`${pokemon.height / 10} m`}
        />
        <Vital
          icon={<Weight className="size-4" />}
          label="Weight"
          value={`${pokemon.weight / 10} kg`}
        />
      </div>
    </section>
  );
}

function Vital({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span aria-hidden className="text-muted-foreground">
        {icon}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-sm font-medium tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

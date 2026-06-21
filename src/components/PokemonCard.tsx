import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@dex/components/Card";
import { Type } from "@dex/components/Type";
import { PokemonData } from "@dex/interfaces/pokemon";

type PokemonCardProps = {
  pokemon: PokemonData;
};

function PokemonCardComponent({ pokemon }: PokemonCardProps) {
  return (
    <Link href={`detail/${pokemon.name}`}>
      <Card types={pokemon.types}>
        <div className="flex justify-center">
          <Image
            src={pokemon.image}
            alt={pokemon.name}
            width={0}
            height={0}
            sizes="100%"
            loading="lazy"
            placeholder="blur"
            blurDataURL="/images/placeholder.png"
            className="w-1/2 md:w-auto h-auto"
          />
        </div>
        <div className="flex items-center justify-center flex-col gap-2">
          <h1 className="m-0 text-center text-sm md:text-base">
            #{pokemon.id.toString().padStart(3, "0")}
          </h1>
          <h2 className="text-sm md:text-base text-center">
            {pokemon.name.toUpperCase()}
          </h2>
          <div className="flex justify-center item-center gap-2">
            {pokemon.types.map((type) => (
              <Type key={type} type={type} />
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Memoized: the `pokemon` object reference is stable across page appends, so
// already-rendered cards skip re-rendering when the next 12 are added.
export const PokemonCard = memo(PokemonCardComponent);

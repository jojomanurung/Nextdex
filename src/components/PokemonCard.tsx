import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@dex/components/Card";
import { Type } from "@dex/components/Type";
import { PokemonData } from "@dex/interfaces/pokemon";
import { PokemonTypes } from "@dex/constant/PokemonTypes";

type PokemonCardProps = {
  pokemon: PokemonData;
};

// National-dex id ranges → generation + origin region (upper bound inclusive).
const GENERATIONS = [
  { max: 151, label: "Gen I · Kanto" },
  { max: 251, label: "Gen II · Johto" },
  { max: 386, label: "Gen III · Hoenn" },
  { max: 493, label: "Gen IV · Sinnoh" },
  { max: 649, label: "Gen V · Unova" },
  { max: 721, label: "Gen VI · Kalos" },
  { max: 809, label: "Gen VII · Alola" },
  { max: 905, label: "Gen VIII · Galar" },
  { max: 1025, label: "Gen IX · Paldea" },
];

function genLabel(id: number): string {
  return GENERATIONS.find((g) => id <= g.max)?.label ?? "Unknown";
}

function PokemonCardComponent({ pokemon }: PokemonCardProps) {
  // Primary-type color drives the glow halo + ghost number. `find` (vs the
  // throwing `filter` elsewhere) tolerates an unknown type.
  const typeColor =
    PokemonTypes.find((t) => t.name === pokemon.types[0])?.color ?? "#ffffff";
  const dexNo = pokemon.id.toString().padStart(3, "0");

  return (
    <Link
      href={`detail/${pokemon.name}`}
      className="group block transition-transform duration-300 hover:-translate-y-1"
    >
      <Card>
        {/* Oversized ghost dex number — a typographic flourish behind the content */}
        <span
          aria-hidden
          className="pointer-events-none select-none absolute top-1 right-4 z-0 text-6xl md:text-7xl font-black leading-none opacity-[0.08] transition-opacity duration-300 group-hover:opacity-[0.16]"
          style={{ color: typeColor }}
        >
          {dexNo}
        </span>

        {/* Mobile: horizontal hero strip. md+: vertical, centered. */}
        <div className="relative z-10 flex items-center gap-4 md:flex-col md:gap-3">
          <div className="relative shrink-0 w-28 h-28 md:w-40 md:h-40">
            {/* type-colored glow halo behind the artwork */}
            <div
              aria-hidden
              className="absolute inset-2 rounded-full blur-2xl opacity-50 transition-opacity duration-300 group-hover:opacity-80"
              style={{ backgroundColor: typeColor }}
            />
            <Image
              src={pokemon.image}
              alt={pokemon.name}
              width={0}
              height={0}
              sizes="100%"
              loading="lazy"
              placeholder="blur"
              blurDataURL="/images/placeholder.png"
              className="relative w-full h-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="flex min-w-0 flex-col gap-1.5 md:items-center">
            <span className="text-xs font-medium tracking-[0.2em] text-zinc-400">
              #{dexNo}
            </span>
            <h2 className="truncate text-2xl md:text-xl font-semibold capitalize tracking-tight">
              {pokemon.name}
            </h2>
            <p className="text-xs text-zinc-400">{genLabel(pokemon.id)}</p>
            <div className="flex flex-wrap gap-2 pt-1 md:justify-center">
              {pokemon.types.map((type) => (
                <Type key={type} type={type} variant="frosted" />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Memoized: the `pokemon` object reference is stable across page appends, so
// already-rendered cards skip re-rendering when the next 12 are added.
export const PokemonCard = memo(PokemonCardComponent);

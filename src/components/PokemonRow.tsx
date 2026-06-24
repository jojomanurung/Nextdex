import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Type } from "@dex/components/Type";
import { PokemonData } from "@dex/interfaces/pokemon";
import { primaryTypeColor } from "@dex/constant/PokemonTypes";
import { genLabel, dexNo } from "@dex/constant/pokemonMeta";

type PokemonRowProps = {
  pokemon: PokemonData;
};

// A single glass "entry capsule" in the Nextdex device readout: sprite on a
// type-colored glow, dex number, name, generation, and type chips.
function PokemonRowComponent({ pokemon }: PokemonRowProps) {
  const typeColor = primaryTypeColor(pokemon.types);
  const dex = dexNo(pokemon.id);

  return (
    <Link
      href={`detail/${pokemon.name}`}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/5 bg-slate-50/5 px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-slate-50/10"
    >
      {/* Ghost dex number watermark — bleeds off the right edge at every size
          (the type chips sit centered, so they no longer clash with it). */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 z-0 -translate-y-1/2 text-7xl font-black leading-none opacity-[0.05] transition-opacity duration-300 group-hover:opacity-[0.10]"
        style={{ color: typeColor }}
      >
        {dex}
      </span>

      {/* Sprite on glow halo */}
      <div
        aria-hidden
        className="absolute inset-x-4 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-20 rounded-full opacity-50 blur-xl transition-opacity duration-300 group-hover:opacity-70"
        style={{ backgroundColor: typeColor }}
      />
      <div className="relative z-10 h-16 w-16 shrink-0 md:h-20 md:w-20 lg:h-24 lg:w-24">
        <Image
          src={pokemon.image}
          alt={pokemon.name}
          width={0}
          height={0}
          sizes="96px"
          loading="lazy"
          placeholder="blur"
          blurDataURL="/images/placeholder.png"
          className="relative h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Number · name · generation */}
      <div className="z-10 flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-xs font-medium tracking-[0.2em] text-zinc-500">
          #{dex}
        </span>
        <h2 className="truncate text-lg font-semibold capitalize tracking-tight">
          {pokemon.name}
        </h2>
        <p className="text-xs text-zinc-400">{genLabel(pokemon.id)}</p>
      </div>

      {/* Type chips — centered in the card (hidden on small screens) */}
      <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 gap-2 sm:flex">
        {pokemon.types.map((type) => (
          <Type key={type} type={type} variant="frosted" />
        ))}
      </div>
    </Link>
  );
}

export const PokemonRow = memo(PokemonRowComponent);

// Shown in a row's place while its details load. Mirrors PokemonRow's layout:
// the id/name/gen are already known from the index; the sprite, type chips, and
// ghost number are pending placeholders.
export function PokemonRowSkeleton({ id, name }: { id: number; name: string }) {
  return (
    <div className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/5 bg-slate-50/5 px-4 py-3 backdrop-blur-sm">
      {/* Ghost number (untinted until the type is known) */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-7xl font-black leading-none text-white/[0.04]"
      >
        {dexNo(id)}
      </span>

      {/* Sprite placeholder */}
      <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-white/10 md:h-20 md:w-20 lg:h-24 lg:w-24" />

      {/* Number · name · generation (known from the index) */}
      <div className="z-10 flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-xs font-medium tracking-[0.2em] text-zinc-500">
          #{dexNo(id)}
        </span>
        <h2 className="truncate text-lg font-semibold capitalize tracking-tight text-zinc-400">
          {name}
        </h2>
        <p className="text-xs text-zinc-600">{genLabel(id)}</p>
      </div>

      {/* Type chip placeholders — centered, matching PokemonRow */}
      <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 gap-2 sm:flex">
        <div className="h-[26px] w-16 animate-pulse rounded-lg bg-white/10" />
        <div className="h-[26px] w-16 animate-pulse rounded-lg bg-white/10" />
      </div>
    </div>
  );
}

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Type } from "@components/common/Type";
import { PokemonData } from "@interfaces/pokemon";
import { primaryTypeColor } from "@constant/pokemonTypes";
import { genLabel, dexNo } from "@constant/pokemonMeta";

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
      href={`pokemon/${pokemon.name}`}
      className="group relative flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-50/5 px-4 py-3 backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-slate-50/10"
    >
      {/* Ghost dex number watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 z-0 -translate-y-1/2 text-7xl font-black leading-none opacity-[0.05] transition-opacity duration-300 group-hover:opacity-[0.10]"
        style={{ color: typeColor }}
      >
        {dex}
      </span>

      {/* Sprite on glow halo — centered behind the sprite.*/}
      <div
        aria-hidden
        className="absolute left-4 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full opacity-50 blur-lg transition-opacity duration-300 group-hover:opacity-70 md:h-20 md:w-20 lg:h-24 lg:w-24"
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
        <span className="text-xs font-medium tracking-[0.2em] text-ink-muted">
          #{dex}
        </span>
        <h2 className="truncate text-lg font-semibold capitalize tracking-tight">
          {pokemon.name}
        </h2>
        <p className="text-xs text-ink-muted">{genLabel(pokemon.id)}</p>
      </div>

      {/* Type chips — centered in the card (hidden on small screens) */}
      <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 gap-2 sm:flex">
        {pokemon.types.map((type) => (
          <Type key={type} type={type} />
        ))}
      </div>
    </Link>
  );
}

export const PokemonRow = memo(PokemonRowComponent);

// Placeholder row. id/name are passed when a specific entry is pending; the
// append spinner at the list foot omits them and everything shimmers.
export function PokemonRowSkeleton({
  id,
  name,
}: {
  id?: number;
  name?: string;
}) {
  const dex = id != null ? dexNo(id) : null;

  return (
    <div className="group relative flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-50/5 px-4 py-3 backdrop-blur-xs">
      {dex && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-7xl font-black leading-none text-white/4"
        >
          {dex}
        </span>
      )}

      <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-white/10 md:h-20 md:w-20 lg:h-24 lg:w-24" />

      <div className="z-10 flex min-w-0 flex-1 flex-col gap-1">
        {dex ? (
          <span className="text-xs font-medium tracking-[0.2em] text-ink-muted">
            #{dex}
          </span>
        ) : (
          <span className="h-3 w-10 animate-pulse rounded bg-white/10" />
        )}
        {name ? (
          <h2 className="truncate text-lg font-semibold capitalize tracking-tight text-ink-muted">
            {name}
          </h2>
        ) : (
          <span className="h-5 w-32 animate-pulse rounded bg-white/10" />
        )}
        {id != null ? (
          <p className="text-xs text-ink-muted">{genLabel(id)}</p>
        ) : (
          <span className="h-3 w-20 animate-pulse rounded bg-white/10" />
        )}
      </div>

      <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 gap-2 sm:flex">
        <div className="h-[26px] w-16 animate-pulse rounded-lg bg-white/10" />
        <div className="h-[26px] w-16 animate-pulse rounded-lg bg-white/10" />
      </div>
    </div>
  );
}

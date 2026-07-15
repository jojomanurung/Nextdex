import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Type } from "@components/common/Type";
import { PokemonData } from "@interfaces/pokemon";
import { primaryTypeColor } from "@constant/pokemonTypes";
import { dexNo } from "@constant/pokemonMeta";

// A single "product" in the collection gallery: the artwork is the hero,
// floating on the page surface (no card box). A hover/focus spotlight lifts it
// off the shelf. Label reads like a product tag — dex # as an SKU (mono),
// name in the display face, type chips.
function PokemonTileComponent({ pokemon }: { pokemon: PokemonData }) {
  const dex = dexNo(pokemon.id);
  const typeColor = primaryTypeColor(pokemon.types);

  return (
    <Link
      href={`pokemon/${pokemon.name}`}
      className="group relative flex flex-col items-center gap-3 rounded-2xl px-2 pt-5 pb-4 outline-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* Type-colored spotlight — the specimen's element, only on hover/focus.
          Restrained: absent at rest, a touch stronger in dark where it reads. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-5 -z-10 aspect-square rounded-full opacity-0 blur-2xl transition-all duration-300 ease-out group-hover:scale-105 group-hover:opacity-55 group-focus-visible:scale-105 group-focus-visible:opacity-55 dark:group-hover:opacity-75 dark:group-focus-visible:opacity-75 motion-reduce:transition-none"
        style={{
          background: `radial-gradient(circle at center, ${typeColor} 0%, transparent 66%)`,
        }}
      />

      <div className="relative aspect-square w-full max-w-[176px]">
        <Image
          src={pokemon.image}
          alt={`${pokemon.name} artwork`}
          fill
          sizes="(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 200px"
          loading="lazy"
          placeholder="blur"
          blurDataURL="/images/placeholder.png"
          className="object-contain drop-shadow-[0_6px_16px_rgb(0_0_0/0.18)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <div className="flex w-full flex-col items-center gap-1.5 text-center">
        <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
          NO.&nbsp;{dex}
        </span>
        <h2 className="font-display text-lg font-semibold capitalize leading-none tracking-tight text-foreground transition-colors group-hover:text-primary">
          {pokemon.name}
        </h2>
        <div className="mt-1 flex flex-wrap justify-center gap-1.5">
          {pokemon.types.map((type) => (
            <Type key={type} type={type} />
          ))}
        </div>
      </div>
    </Link>
  );
}

export const PokemonTile = memo(PokemonTileComponent);

// Shimmer placeholder while a page appends.
export function PokemonTileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 px-2 pt-5 pb-4">
      <div className="aspect-square w-full max-w-[176px] animate-pulse rounded-2xl bg-muted" />
      <div className="flex w-full flex-col items-center gap-2">
        <div className="h-2.5 w-12 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-1 h-4 w-16 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

import { memo } from "react";
import Link from "next/link";
import { AbilityData } from "@interfaces/ability";
import { genShortLabel } from "@constant/pokemonMeta";

type AbilityRowProps = { ability: AbilityData };

// A glass "entry capsule" for an ability: a first-letter monogram (abilities
// have no artwork), name, generation, a two-line effect summary, and a faint
// ghost id watermark — mirroring the Pokémon row's shape.
function AbilityRowComponent({ ability }: AbilityRowProps) {
  const displayName = ability.name.replace(/-/g, " ");

  return (
    <Link
      href={`abilities/${ability.name}`}
      className="group relative flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-50/5 px-4 py-3 backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-slate-50/10"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 z-0 -translate-y-1/2 text-7xl font-black leading-none text-white/5 transition-colors duration-300 group-hover:text-white/10"
      >
        {ability.id}
      </span>

      <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl font-black uppercase text-white/70 md:h-20 md:w-20">
        {displayName.charAt(0)}
      </div>

      <div className="z-10 flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-xs font-medium tracking-[0.2em] text-zinc-500">
          {genShortLabel(ability.generation)}
        </span>
        <h2 className="truncate text-lg font-semibold capitalize tracking-tight">
          {displayName}
        </h2>
        <p className="line-clamp-2 text-xs text-zinc-400">{ability.effect}</p>
      </div>
    </Link>
  );
}

export const AbilityRow = memo(AbilityRowComponent);

// Placeholder row. id/name are labelled when a specific entry is pending; the
// append spinner at the list foot omits them and everything shimmers.
export function AbilityRowSkeleton({
  id,
  name,
}: {
  id?: number;
  name?: string;
}) {
  return (
    <div className="group relative flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-50/5 px-4 py-3 backdrop-blur-xs">
      {id != null && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-7xl font-black leading-none text-white/4"
        >
          {id}
        </span>
      )}

      <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-white/10 md:h-20 md:w-20" />

      <div className="z-10 flex min-w-0 flex-1 flex-col gap-1">
        <span className="h-3 w-14 animate-pulse rounded bg-white/10" />
        {name ? (
          <h2 className="truncate text-lg font-semibold capitalize tracking-tight text-zinc-400">
            {name.replace(/-/g, " ")}
          </h2>
        ) : (
          <span className="h-5 w-32 animate-pulse rounded bg-white/10" />
        )}
        <span className="h-3 w-full max-w-md animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

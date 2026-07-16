import { memo } from "react";
import Link from "next/link";
import { AbilityData } from "@interfaces/ability";
import { genShortLabel } from "@constant/pokemonMeta";

type AbilityRowProps = { ability: AbilityData };

function AbilityRowComponent({ ability }: AbilityRowProps) {
  const displayName = ability.name.replace(/-/g, " ");

  return (
    <Link
      href={`/abilities/${ability.name}`}
      className="group block border-b border-border py-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <h2 className="font-display text-[2rem] font-bold capitalize leading-[0.95] tracking-[-0.01em] text-foreground transition-colors group-hover:text-primary">
        {displayName}
      </h2>
      <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] tabular-nums text-muted-foreground">
        No.&nbsp;{String(ability.id).padStart(3, "0")} · {genShortLabel(ability.generation)}
      </span>
      <p className="mt-1 line-clamp-1 max-w-prose text-sm text-muted-foreground">
        {ability.effect}
      </p>
    </Link>
  );
}

export const AbilityRow = memo(AbilityRowComponent);

// Placeholder matching the entry shape. The name is labelled when a specific
// entry is pending; the append spinner at the list foot omits it and shimmers.
export function AbilityRowSkeleton({
  name,
}: {
  id?: number;
  name?: string;
}) {
  return (
    <div className="block border-b border-border py-5">
      {name ? (
        <h2 className="font-display text-[2rem] font-bold capitalize leading-[0.95] tracking-[-0.01em] text-muted-foreground">
          {name.replace(/-/g, " ")}
        </h2>
      ) : (
        <span className="block h-8 w-52 animate-pulse rounded bg-muted" />
      )}
      <span className="mt-1.5 block h-3 w-32 animate-pulse rounded bg-muted" />
      <span className="mt-2 block h-3 w-full max-w-prose animate-pulse rounded bg-muted" />
    </div>
  );
}

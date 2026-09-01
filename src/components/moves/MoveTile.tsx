import { memo } from "react";
import Link from "next/link";
import { Type } from "@components/common/Type";
import { MoveData } from "@interfaces/move";
import { primaryTypeColor } from "@constant/pokemonTypes";
import { dexNo } from "@constant/pokemonMeta";
import { damageClass } from "@constant/moveMeta";

function stat(value: number | null): string {
  return value == null ? "—" : String(value);
}

function MoveTileComponent({ move }: { move: MoveData }) {
  const dex = dexNo(move.id);
  const typeColor = primaryTypeColor([move.type]);
  const cls = damageClass(move.damageClass);
  const Icon = cls?.icon;

  return (
    <Link
      href={`/moves/${move.name}`}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 outline-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* Type-colored aura — the move's element, only on hover/focus. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 opacity-0 blur-2xl transition-opacity duration-300 ease-out group-hover:opacity-40 group-focus-visible:opacity-40 dark:group-hover:opacity-55 dark:group-focus-visible:opacity-55 motion-reduce:transition-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${typeColor} 0%, transparent 60%)`,
        }}
      />

      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
          NO.&nbsp;{dex}
        </span>
        {cls && (
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
            style={{
              color: cls.color,
              borderColor: `${cls.color}59`,
              backgroundColor: `${cls.color}14`,
            }}
          >
            {Icon && <Icon aria-hidden className="size-3" />}
            {cls.label}
          </span>
        )}
      </div>

      <h2 className="font-display text-xl font-semibold capitalize leading-tight tracking-normal text-foreground transition-colors group-hover:text-primary">
        {move.name.replace(/-/g, " ")}
      </h2>

      <div className="mt-auto flex items-center justify-between gap-2">
        {move.type ? <Type type={move.type} /> : <span />}
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {stat(move.power)}&nbsp;·&nbsp;{stat(move.accuracy)}&nbsp;·&nbsp;
          {stat(move.pp)}
        </span>
      </div>
    </Link>
  );
}

export const MoveTile = memo(MoveTileComponent);

// Shimmer placeholder while a page appends.
export function MoveTileSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="h-2.5 w-12 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="h-6 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-2 flex items-center justify-between">
        <div className="h-4 w-16 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

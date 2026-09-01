import { Type } from "@components/common/Type";
import { MoveDetailData } from "@interfaces/move";
import { dexNo, genShortLabel } from "@constant/pokemonMeta";
import { damageClass } from "@constant/moveMeta";

function Vital({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="font-display text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

function stat(value: number | null): string {
  return value == null ? "—" : String(value);
}

// The move dossier hero: dex + generation meta, the name as a Clash headword,
// its type / damage class / priority, and the effect as the lead statement,
// over a quick vitals row (Power / Accuracy / PP).
export function MoveHero({ move }: { move: MoveDetailData }) {
  const displayName = move.name.replace(/-/g, " ");
  const cls = damageClass(move.damageClass);
  const Icon = cls?.icon;

  return (
    <header className="pt-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        NO.&nbsp;{dexNo(move.id)} · {genShortLabel(move.generation)}
      </p>
      <h1 className="mt-2 text-balance font-display text-4xl font-bold capitalize leading-[1.02] tracking-[-0.01em] text-foreground sm:text-6xl">
        {displayName}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {move.type && <Type type={move.type} />}
        {cls && (
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide"
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
        {move.priority !== 0 && (
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
            Priority {move.priority > 0 ? `+${move.priority}` : move.priority}
          </span>
        )}
      </div>

      {move.shortEffect && (
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-foreground/90 sm:text-xl">
          {move.shortEffect}
        </p>
      )}

      <div className="mt-6 flex gap-10">
        <Vital label="Power" value={stat(move.power)} />
        <Vital label="Accuracy" value={move.accuracy == null ? "—" : `${move.accuracy}`} />
        <Vital label="PP" value={stat(move.pp)} />
      </div>
    </header>
  );
}

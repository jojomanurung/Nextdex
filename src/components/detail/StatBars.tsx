import { PokemonStat } from "@interfaces/pokemon";

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

// The true byte cap is 255 (Blissey's HP), but scaling the *bar* to it leaves
// ordinary Pokémon looking empty. 150 reads as "elite": most stats then fill a
// satisfying chunk, and the rare 150+ stat simply maxes the meter — its exact
// value + tier color still convey the real strength. Retune here for more/less
// fullness (lower = fuller bars, but more high stats peg out).
const STAT_MAX = 150;
const SEGMENTS = 20;

// Tier color for a base-stat amount: red → amber → green → blue. Used for each
// segment (by the level it represents) and for the stat's value label.
function tierColor(value: number): string {
  if (value <= 50) return "#fb7185"; // weak
  if (value <= 80) return "#fbbf24"; // below average
  if (value <= 110) return "#34d399"; // good
  return "#38bdf8"; // excellent
}

const EMPTY = "rgba(255,255,255,0.08)";

export function StatBars({ stats }: { stats: PokemonStat[] }) {
  const total = stats.reduce((sum, stat) => sum + stat.value, 0);

  return (
    <div className="space-y-3">
      {stats.map((stat) => {
        const filled = Math.round((stat.value / STAT_MAX) * SEGMENTS);
        return (
          <div key={stat.name} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-xs font-medium text-ink-muted">
              {STAT_LABELS[stat.name] ?? stat.name}
            </span>

            <div className="flex flex-1 gap-0.5">
              {Array.from({ length: SEGMENTS }, (_, i) => (
                <span
                  key={i}
                  className="h-2.5 flex-1 rounded-[2px] transition-colors"
                  style={{
                    backgroundColor:
                      i < filled
                        ? tierColor(((i + 1) / SEGMENTS) * STAT_MAX)
                        : EMPTY,
                  }}
                />
              ))}
            </div>

            <span
              className="w-9 shrink-0 text-right text-sm font-semibold tabular-nums"
              style={{ color: tierColor(stat.value) }}
            >
              {stat.value}
            </span>
          </div>
        );
      })}

      <div className="flex items-center justify-between border-t border-white/10 pt-2 text-sm">
        <span className="font-semibold">Total</span>
        <span className="font-bold tabular-nums">{total}</span>
      </div>
    </div>
  );
}

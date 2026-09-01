import { MoveDetailData } from "@interfaces/move";
import { primaryTypeColor } from "@constant/pokemonTypes";

const SEGMENTS = 20;

// The three battle metrics live on different scales, so each meter fills against
// its own cap: power tops out around 180, accuracy at 100 (a percentage), pp
// around 40. A null value (e.g. status moves have no power) reads as "—".
const METRICS: { label: string; key: "power" | "accuracy" | "pp"; max: number }[] =
  [
    { label: "Power", key: "power", max: 180 },
    { label: "Accuracy", key: "accuracy", max: 100 },
    { label: "PP", key: "pp", max: 40 },
  ];

export function MoveStats({ move }: { move: MoveDetailData }) {
  const barColor = primaryTypeColor([move.type]);

  return (
    <div className="space-y-3">
      {METRICS.map(({ label, key, max }) => {
        const value = move[key];
        const filled =
          value == null
            ? 0
            : Math.min(Math.round((value / max) * SEGMENTS), SEGMENTS);

        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">
              {label}
            </span>

            <div aria-hidden className="flex flex-1 gap-0.5">
              {Array.from({ length: SEGMENTS }, (_, i) => {
                const isFilled = i < filled;
                return (
                  <span
                    key={i}
                    className={`h-2.5 flex-1 rounded-[2px] ${
                      isFilled ? "" : "bg-foreground/15"
                    }`}
                    style={isFilled ? { backgroundColor: barColor } : undefined}
                  />
                );
              })}
            </div>

            <span className="w-9 shrink-0 text-right font-mono text-sm font-semibold tabular-nums text-foreground">
              {value == null ? "—" : value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

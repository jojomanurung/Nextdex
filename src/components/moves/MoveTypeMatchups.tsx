import { Type } from "@components/common/Type";
import { TypeMatchup } from "@interfaces/pokemon";

const MULT_LABEL: Record<number, string> = {
  2: "2×",
  0.5: "½×",
  0: "0×",
};

function Group({ title, items }: { title: string; items: TypeMatchup[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((matchup) => (
          <div key={matchup.type} className="flex items-center gap-1.5">
            <Type type={matchup.type} />
            <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
              {MULT_LABEL[matchup.multiplier] ?? `${matchup.multiplier}×`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Offensive matchups grouped by effect — the damage this move deals against
// each defending type. offensiveMatchups already sorts by multiplier.
export function MoveTypeMatchups({ matchups }: { matchups: TypeMatchup[] }) {
  return (
    <div className="space-y-4">
      <Group
        title="Super effective against"
        items={matchups.filter((m) => m.multiplier > 1)}
      />
      <Group
        title="Not very effective against"
        items={matchups.filter((m) => m.multiplier < 1 && m.multiplier > 0)}
      />
      <Group
        title="No effect on"
        items={matchups.filter((m) => m.multiplier === 0)}
      />
    </div>
  );
}

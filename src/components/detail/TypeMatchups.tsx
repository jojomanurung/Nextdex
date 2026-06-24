import { Type } from "@dex/components/common/Type";
import { TypeMatchup } from "@dex/interfaces/pokemon";

const MULT_LABEL: Record<number, string> = {
  4: "4×",
  2: "2×",
  0.5: "½×",
  0.25: "¼×",
  0: "0×",
};

function Group({ title, items }: { title: string; items: TypeMatchup[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((matchup) => (
          <div key={matchup.type} className="flex items-center gap-1.5">
            <Type type={matchup.type} />
            <span className="text-xs font-semibold tabular-nums text-zinc-300">
              {MULT_LABEL[matchup.multiplier] ?? `${matchup.multiplier}×`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Defensive matchups grouped by effect. computeMatchups already sorts by
// multiplier, so each group lands most-significant first.
export function TypeMatchups({ matchups }: { matchups: TypeMatchup[] }) {
  return (
    <div className="space-y-4">
      <Group title="Weak to" items={matchups.filter((m) => m.multiplier > 1)} />
      <Group
        title="Resists"
        items={matchups.filter((m) => m.multiplier < 1 && m.multiplier > 0)}
      />
      <Group
        title="Immune to"
        items={matchups.filter((m) => m.multiplier === 0)}
      />
    </div>
  );
}

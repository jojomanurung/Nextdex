import { ReactNode } from "react";
import { MoveDetailData } from "@interfaces/move";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium capitalize text-foreground">
        {children}
      </dd>
    </div>
  );
}

const clean = (s: string) => s.replace(/-/g, " ");

function range(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  if (min === max) return String(min);
  return `${min ?? "?"}–${max ?? "?"}`;
}

// The move's battle metadata as a two-column definition grid. Rows that are
// zero/absent (no ailment, no drain, single hit…) are dropped, so a plain
// damaging move shows only what's meaningful.
export function MoveMetaPanel({ move }: { move: MoveDetailData }) {
  const rows: { label: string; value: ReactNode }[] = [];

  if (move.category) rows.push({ label: "Category", value: clean(move.category) });
  if (move.target) rows.push({ label: "Target", value: clean(move.target) });

  if (move.ailment && move.ailment !== "none") {
    rows.push({
      label: "Ailment",
      value: (
        <span>
          {clean(move.ailment)}
          {move.ailmentChance > 0 && (
            <span className="ml-1 font-mono text-muted-foreground">
              ({move.ailmentChance}%)
            </span>
          )}
        </span>
      ),
    });
  }

  const hits = range(move.minHits, move.maxHits);
  if (hits) rows.push({ label: "Hits", value: hits });

  const turns = range(move.minTurns, move.maxTurns);
  if (turns) rows.push({ label: "Turns", value: turns });

  if (move.critRate > 0)
    rows.push({ label: "Crit rate", value: `+${move.critRate}` });

  if (move.drain > 0)
    rows.push({ label: "Drain", value: `Heals ${move.drain}% of damage` });
  if (move.drain < 0)
    rows.push({ label: "Recoil", value: `${Math.abs(move.drain)}% of damage` });

  if (move.healing > 0)
    rows.push({ label: "Healing", value: `${move.healing}% of max HP` });

  if (move.flinchChance > 0)
    rows.push({ label: "Flinch chance", value: `${move.flinchChance}%` });

  if (move.statChance > 0)
    rows.push({ label: "Stat change chance", value: `${move.statChance}%` });

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No additional battle details.
      </p>
    );
  }

  return (
    <dl className="grid gap-x-8 sm:grid-cols-2">
      {rows.map((row) => (
        <Row key={row.label} label={row.label}>
          {row.value}
        </Row>
      ))}
    </dl>
  );
}

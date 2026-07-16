import { ReactNode } from "react";
import { SpeciesMeta } from "@interfaces/pokemon";
import { pct255 } from "@constant/pokemonMeta";
import { PokedexEntries } from "@components/detail/PokedexEntries";

type AboutPanelProps = {
  species: SpeciesMeta;
};

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

// Pokédex entry (flavor text) + the species metadata grid.
export function AboutPanel({ species }: AboutPanelProps) {
  return (
    <div className="space-y-5">
      <PokedexEntries entries={species.flavorEntries} />

      <dl className="grid gap-x-8 sm:grid-cols-2">
        {species.habitat && (
          <Row label="Habitat">{species.habitat.replace(/-/g, " ")}</Row>
        )}
        <Row label="Growth rate">{species.growthRate.replace(/-/g, " ")}</Row>
        <Row label="Catch rate">
          {species.captureRate}{" "}
          <span className="text-muted-foreground">
            ({pct255(species.captureRate)}%)
          </span>
        </Row>
        <Row label="Base happiness">
          {species.baseHappiness}{" "}
          <span className="text-muted-foreground">
            ({pct255(species.baseHappiness)}%)
          </span>
        </Row>
        <Row label="Gender">
          <span className="normal-case">{species.genderRatio}</span>
        </Row>
        <Row label="Egg groups">
          {species.eggGroups.map((g) => g.replace(/-/g, " ")).join(", ") || "—"}
        </Row>
      </dl>
    </div>
  );
}
